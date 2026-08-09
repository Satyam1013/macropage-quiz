import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuizSession, QuizSessionDocument } from './schemas/quiz-session.schema';
import { Question, QuestionDocument } from '../questions/schemas/question.schema';
import {
  Participant,
  ParticipantDocument,
} from '../participants/schemas/participant.schema';
import { Answer, AnswerDocument } from '../answers/schemas/answer.schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { DEFAULT_QUESTIONS } from '../questions/seed-questions';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

export const SESSION_STATE_CHANGED_EVENT = 'session.state-changed';

export interface SessionStateChangedPayload {
  sessionId: string;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(QuizSession.name)
    private readonly sessionModel: Model<QuizSessionDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Participant.name)
    private readonly participantModel: Model<ParticipantDocument>,
    @InjectModel(Answer.name)
    private readonly answerModel: Model<AnswerDocument>,
    private readonly leaderboardService: LeaderboardService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string): Promise<QuizSessionDocument> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) throw new NotFoundException('Quiz session not found');
    return session;
  }

  async create(dto: CreateSessionDto): Promise<QuizSessionDocument> {
    let questionIds: Types.ObjectId[] = [];
    if (dto.autoSeedQuestions !== false) {
      const created = await this.questionModel.insertMany(DEFAULT_QUESTIONS);
      questionIds = created.map((doc) => doc._id as Types.ObjectId);
    }

    return this.sessionModel.create({
      title: dto.title,
      status: 'draft',
      currentQuestionIndex: -1,
      questionIds,
    });
  }

  async openRegistration(id: string): Promise<QuizSessionDocument> {
    const session = await this.findById(id);
    if (session.status !== 'draft') {
      throw new BadRequestException(
        `Cannot open registration from status "${session.status}"`,
      );
    }
    session.status = 'registration_open';
    await session.save();
    this.emitStateChanged(id);
    return session;
  }

  async start(id: string): Promise<QuizSessionDocument> {
    const session = await this.findById(id);
    if (session.status !== 'registration_open') {
      throw new BadRequestException(
        `Cannot start quiz from status "${session.status}"`,
      );
    }
    if (session.questionIds.length === 0) {
      throw new BadRequestException('Session has no questions configured');
    }
    session.status = 'in_progress';
    session.currentQuestionIndex = 0;
    session.startedAt = new Date();
    await session.save();
    this.emitStateChanged(id);
    return session;
  }

  async nextQuestion(id: string): Promise<QuizSessionDocument> {
    const session = await this.findById(id);
    if (session.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot advance question from status "${session.status}"`,
      );
    }
    if (session.currentQuestionIndex >= session.questionIds.length - 1) {
      throw new BadRequestException(
        'Already on the final question — call /end instead',
      );
    }
    session.currentQuestionIndex += 1;
    await session.save();
    this.emitStateChanged(id);
    return session;
  }

  async end(id: string): Promise<QuizSessionDocument> {
    const session = await this.findById(id);
    if (session.status !== 'in_progress') {
      throw new BadRequestException(`Cannot end quiz from status "${session.status}"`);
    }
    session.status = 'ended';
    session.endedAt = new Date();
    await session.save();
    this.emitStateChanged(id);
    return session;
  }

  private emitStateChanged(sessionId: string) {
    this.eventEmitter.emit(SESSION_STATE_CHANGED_EVENT, {
      sessionId,
    } as SessionStateChangedPayload);
  }

  async getCurrentQuestionDoc(session: QuizSessionDocument): Promise<QuestionDocument | null> {
    if (session.currentQuestionIndex < 0) return null;
    const questionId = session.questionIds[session.currentQuestionIndex];
    if (!questionId) return null;
    return this.questionModel.findById(questionId).exec();
  }

  async getState(sessionId: string, participantId?: string) {
    const session = await this.findById(sessionId);
    let hasAnsweredCurrentQuestion: boolean | null = null;

    if (participantId && session.currentQuestionIndex >= 0) {
      const questionId = session.questionIds[session.currentQuestionIndex];
      const existing = await this.answerModel
        .findOne({ participantId, questionId })
        .exec();
      hasAnsweredCurrentQuestion = !!existing;
    }

    return {
      sessionId: session._id.toString(),
      title: session.title,
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.questionIds.length,
      hasAnsweredCurrentQuestion,
    };
  }

  async getLeaderboard(sessionId: string) {
    await this.findById(sessionId);
    return this.leaderboardService.getFullRankedList(sessionId);
  }

  async getParticipants(sessionId: string): Promise<ParticipantDocument[]> {
    await this.findById(sessionId);
    return this.participantModel.find({ sessionId }).exec();
  }

  async exportCsv(sessionId: string): Promise<string> {
    const participants = await this.getParticipants(sessionId);
    const ranked = await this.leaderboardService.getFullRankedList(sessionId);
    const scoreByParticipant = new Map(
      ranked.map((entry) => [entry.participantId, entry]),
    );

    const header = [
      'Name',
      'WhatsApp Number',
      'Business Name',
      'Business Category',
      'Goal',
      'Goal (Other)',
      'Score',
      'Rank',
      'Registered At',
    ];

    const escape = (value: string | number | undefined) => {
      const str = value === undefined || value === null ? '' : String(value);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const rows = participants.map((p) => {
      const entry = scoreByParticipant.get(p._id.toString());
      return [
        escape(p.name),
        escape(p.whatsappNumber),
        escape(p.businessName),
        escape(p.businessCategory),
        escape(p.goal),
        escape(p.goalOther),
        escape(entry?.score ?? 0),
        escape(entry?.rank ?? ''),
        escape(p.registeredAt?.toISOString()),
      ].join(',');
    });

    return [header.join(','), ...rows].join('\n');
  }
}
