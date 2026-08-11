import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SessionsService,
  SESSION_STATE_CHANGED_EVENT,
} from '../sessions/sessions.service';
import type { SessionStateChangedPayload } from '../sessions/sessions.service';
import { QuestionsService } from '../questions/questions.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { ANSWER_CREATED_EVENT } from '../answers/answers.service';
import type { AnswerCreatedPayload } from '../answers/answers.service';

interface JoinPayload {
  sessionId: string;
  participantId?: string;
  role: 'participant' | 'display' | 'admin';
}

const LEADERBOARD_DEBOUNCE_MS = 1000;
const LEADERBOARD_TOP_N = 10;

@WebSocketGateway({
  namespace: 'quiz',
  cors: { origin: true, credentials: true },
})
export class QuizGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);
  private readonly pendingLeaderboardTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly questionsService: QuestionsService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinPayload,
  ) {
    await client.join(data.sessionId);
    if (data.role === 'display') {
      await client.join(this.displayRoom(data.sessionId));
    }

    const state = await this.sessionsService.getState(
      data.sessionId,
      data.participantId,
    );
    client.emit('session:state', state);

    if (state.status === 'in_progress' || state.status === 'ended') {
      await this.emitAllQuestions(client, data.sessionId);
    }
  }

  @OnEvent(SESSION_STATE_CHANGED_EVENT)
  async handleSessionStateChanged(payload: SessionStateChangedPayload) {
    const state = await this.sessionsService.getState(payload.sessionId);
    this.server.to(payload.sessionId).emit('session:state', state);

    if (state.status === 'in_progress') {
      await this.emitAllQuestions(
        this.server.to(payload.sessionId),
        payload.sessionId,
      );
    }

    if (state.status === 'ended') {
      this.server.to(payload.sessionId).emit('quiz:ended', {});
      await this.broadcastLeaderboard(payload.sessionId);
    }
  }

  @OnEvent(ANSWER_CREATED_EVENT)
  handleAnswerCreated(payload: AnswerCreatedPayload) {
    this.scheduleLeaderboardBroadcast(payload.sessionId);
  }

  private async emitAllQuestions(
    target: { emit: (event: string, payload: unknown) => unknown },
    sessionId: string,
  ) {
    const session = await this.sessionsService.findById(sessionId);
    const questions = await this.sessionsService.getAllQuestionDocs(session);
    if (questions.length === 0) return;

    target.emit('questions:all', {
      questions: questions.map((q) => this.questionsService.sanitize(q)),
      totalQuestions: questions.length,
      serverTimestamp: Date.now(),
    });
  }

  private scheduleLeaderboardBroadcast(sessionId: string) {
    if (this.pendingLeaderboardTimers.has(sessionId)) return;
    const timer = setTimeout(() => {
      this.pendingLeaderboardTimers.delete(sessionId);
      this.broadcastLeaderboard(sessionId).catch((err) =>
        this.logger.error(`Failed to broadcast leaderboard: ${err}`),
      );
    }, LEADERBOARD_DEBOUNCE_MS);
    this.pendingLeaderboardTimers.set(sessionId, timer);
  }

  private async broadcastLeaderboard(sessionId: string) {
    const { top, totalAnswered } =
      await this.leaderboardService.computeLeaderboard(
        sessionId,
        LEADERBOARD_TOP_N,
      );
    this.server
      .to(sessionId)
      .emit('leaderboard:update', { top, totalAnswered });
  }

  private displayRoom(sessionId: string) {
    return `${sessionId}:display`;
  }
}
