import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Answer, AnswerDocument } from './schemas/answer.schema';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { ParticipantDocument } from '../participants/schemas/participant.schema';
import { SessionsService } from '../sessions/sessions.service';
import { QuestionsService } from '../questions/questions.service';

export const ANSWER_CREATED_EVENT = 'answer.created';

export interface AnswerCreatedPayload {
  sessionId: string;
}

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(Answer.name)
    private readonly answerModel: Model<AnswerDocument>,
    private readonly sessionsService: SessionsService,
    private readonly questionsService: QuestionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(participant: ParticipantDocument, dto: CreateAnswerDto) {
    const session = await this.sessionsService.findById(
      participant.sessionId.toString(),
    );

    if (session.status !== 'in_progress') {
      throw new BadRequestException('This session is not currently in progress');
    }

    const currentQuestionId =
      session.questionIds[session.currentQuestionIndex]?.toString();
    if (!currentQuestionId || currentQuestionId !== dto.questionId) {
      throw new BadRequestException('This is not the current active question');
    }

    const question = await this.questionsService.findById(dto.questionId);
    const option = question.options.find((o) => o.key === dto.selectedKey);
    if (!option) {
      throw new BadRequestException('Invalid option selected');
    }

    try {
      await this.answerModel.create({
        participantId: participant._id,
        questionId: question._id,
        sessionId: session._id,
        selectedKey: dto.selectedKey,
        pointsAwarded: option.points,
        answeredAtMs: Date.now(),
        timeTakenMs: dto.timeTakenMs,
      });
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException('You already answered this question');
      }
      throw err;
    }

    this.eventEmitter.emit(ANSWER_CREATED_EVENT, {
      sessionId: session._id.toString(),
    } as AnswerCreatedPayload);

    return { success: true };
  }
}
