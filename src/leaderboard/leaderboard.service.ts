import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from '../answers/schemas/answer.schema';
import {
  Participant,
  ParticipantDocument,
} from '../participants/schemas/participant.schema';

export interface LeaderboardEntry {
  participantId: string;
  name: string;
  businessName?: string;
  score: number;
  rank: number;
}

export interface LeaderboardResult {
  top: LeaderboardEntry[];
  totalAnswered: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(Answer.name)
    private readonly answerModel: Model<AnswerDocument>,
    @InjectModel(Participant.name)
    private readonly participantModel: Model<ParticipantDocument>,
  ) {}

  /**
   * Aggregates each participant's total score and earliest-last-answer timestamp
   * (used as a tie-breaker so the participant who finished first ranks higher).
   */
  private async aggregateScores(sessionId: Types.ObjectId | string) {
    return this.answerModel.aggregate<{
      _id: Types.ObjectId;
      score: number;
      lastAnsweredAtMs: number;
      answeredCount: number;
    }>([
      { $match: { sessionId: new Types.ObjectId(sessionId) } },
      {
        $group: {
          _id: '$participantId',
          score: { $sum: '$pointsAwarded' },
          lastAnsweredAtMs: { $max: '$answeredAtMs' },
          answeredCount: { $sum: 1 },
        },
      },
    ]);
  }

  async computeLeaderboard(
    sessionId: Types.ObjectId | string,
    limit = 20,
  ): Promise<LeaderboardResult> {
    const aggregated = await this.aggregateScores(sessionId);

    aggregated.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.lastAnsweredAtMs - b.lastAnsweredAtMs;
    });

    const totalAnswered = aggregated.length;
    const topSlice = aggregated.slice(0, limit);
    const participantIds = topSlice.map((entry) => entry._id);
    const participants = await this.participantModel
      .find({ _id: { $in: participantIds } })
      .select('name businessName')
      .exec();
    const participantsById = new Map(
      participants.map((p) => [p._id.toString(), p]),
    );

    const top: LeaderboardEntry[] = topSlice.map((entry, index) => {
      const participant = participantsById.get(entry._id.toString());
      return {
        participantId: entry._id.toString(),
        name: participant?.name ?? 'Unknown',
        businessName: participant?.businessName,
        score: entry.score,
        rank: index + 1,
      };
    });

    return { top, totalAnswered };
  }

  async getFullRankedList(
    sessionId: Types.ObjectId | string,
  ): Promise<LeaderboardEntry[]> {
    const { top } = await this.computeLeaderboard(
      sessionId,
      Number.MAX_SAFE_INTEGER,
    );
    return top;
  }

  async getParticipantRank(
    sessionId: Types.ObjectId | string,
    participantId: string,
  ): Promise<{ rank: number | null; score: number }> {
    const aggregated = await this.aggregateScores(sessionId);
    aggregated.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.lastAnsweredAtMs - b.lastAnsweredAtMs;
    });

    const index = aggregated.findIndex(
      (entry) => entry._id.toString() === participantId,
    );
    if (index === -1) return { rank: null, score: 0 };
    return { rank: index + 1, score: aggregated[index].score };
  }
}
