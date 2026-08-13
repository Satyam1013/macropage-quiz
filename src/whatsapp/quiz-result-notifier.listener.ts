import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  SESSION_STATE_CHANGED_EVENT,
  SessionsService,
} from '../sessions/sessions.service';
import type { SessionStateChangedPayload } from '../sessions/sessions.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { AnalysisService } from '../analysis/analysis.service';
import { WhatsappService } from './whatsapp.service';

@Injectable()
export class QuizResultNotifier {
  private readonly logger = new Logger(QuizResultNotifier.name);

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly leaderboardService: LeaderboardService,
    private readonly analysisService: AnalysisService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @OnEvent(SESSION_STATE_CHANGED_EVENT)
  async handleSessionStateChanged(
    payload: SessionStateChangedPayload,
  ): Promise<void> {
    const session = await this.sessionsService.findById(payload.sessionId);
    if (session.status !== 'ended') return;

    const [participants, ranked] = await Promise.all([
      this.sessionsService.getParticipants(payload.sessionId),
      this.leaderboardService.getFullRankedList(payload.sessionId),
    ]);
    const rankByParticipant = new Map(
      ranked.map((entry) => [entry.participantId, entry.rank]),
    );
    const totalParticipants = ranked.length;

    for (const participant of participants) {
      const participantId = participant._id.toString();
      const rank = rankByParticipant.get(participantId);
      if (!rank) continue; // never answered anything — nothing to report

      try {
        const report =
          await this.analysisService.generateOrGetCached(participant);
        await this.whatsappService.sendQuizResult({
          whatsappNumber: participant.whatsappNumber,
          name: participant.name,
          businessName: participant.businessName,
          rank,
          totalParticipants,
          techScore: report.techScore,
        });
      } catch (err) {
        this.logger.warn(
          `Failed to send quiz result to participant ${participantId}: ${(err as Error).message}`,
        );
      }
    }
  }
}
