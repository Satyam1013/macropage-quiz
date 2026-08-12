import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  QuizSession,
  QuizSessionDocument,
} from './schemas/quiz-session.schema';
import {
  Question,
  QuestionDocument,
} from '../questions/schemas/question.schema';
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

  async findAll(): Promise<QuizSessionDocument[]> {
    return this.sessionModel.find().sort({ createdAt: -1 }).exec();
  }

  async create(dto: CreateSessionDto): Promise<QuizSessionDocument> {
    let questionIds: Types.ObjectId[] = [];
    if (dto.autoSeedQuestions !== false) {
      const created = await this.questionModel.insertMany(DEFAULT_QUESTIONS);
      questionIds = created.map((doc) => doc._id);
    }

    return this.sessionModel.create({
      title: dto.title,
      status: 'draft',
      questionIds,
    });
  }

  async start(id: string): Promise<QuizSessionDocument> {
    const session = await this.findById(id);
    if (session.status !== 'draft') {
      throw new BadRequestException(
        `Cannot start quiz from status "${session.status}"`,
      );
    }
    if (session.questionIds.length === 0) {
      throw new BadRequestException('Session has no questions configured');
    }
    session.status = 'in_progress';
    session.startedAt = new Date();
    await session.save();
    this.emitStateChanged(id);
    return session;
  }

  async end(id: string): Promise<QuizSessionDocument> {
    const session = await this.findById(id);
    if (session.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot end quiz from status "${session.status}"`,
      );
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
    });
  }

  async getAllQuestionDocs(
    session: QuizSessionDocument,
  ): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({ _id: { $in: session.questionIds } })
      .sort({ order: 1 })
      .exec();
  }

  async getState(sessionId: string, participantId?: string) {
    const session = await this.findById(sessionId);
    let answeredQuestionIds: string[] | null = null;

    if (participantId && session.status !== 'draft') {
      const answers = await this.answerModel
        .find({ participantId, sessionId: session._id })
        .select('questionId')
        .exec();
      answeredQuestionIds = answers.map((a) => a.questionId.toString());
    }

    return {
      sessionId: session._id.toString(),
      title: session.title,
      status: session.status,
      totalQuestions: session.questionIds.length,
      answeredQuestionIds,
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
