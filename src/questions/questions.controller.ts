import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionTokenGuard } from '../participants/guards/session-token.guard';
import { CurrentParticipant } from '../participants/decorators/current-participant.decorator';
import type { ParticipantDocument } from '../participants/schemas/participant.schema';
import { SessionsService } from '../sessions/sessions.service';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly questionsService: QuestionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('mindset/seed')
  @HttpCode(HttpStatus.OK)
  async seedMindsetBank() {
    const questions = await this.questionsService.seedMindsetBank();
    return questions.map((q) => this.questionsService.sanitize(q));
  }

  @UseGuards(JwtAuthGuard)
  @Get('mindset/bank')
  async getMindsetBank() {
    const questions = await this.questionsService.getMindsetBank();
    return questions.map((q) => this.questionsService.sanitize(q));
  }

  @UseGuards(JwtAuthGuard)
  @Post('trivia/seed')
  @HttpCode(HttpStatus.OK)
  async seedTriviaBank() {
    const questions = await this.questionsService.seedTriviaBank();
    return questions.map((q) => this.questionsService.sanitize(q));
  }

  @UseGuards(JwtAuthGuard)
  @Get('trivia/bank')
  async getTriviaBank() {
    const questions = await this.questionsService.getTriviaBank();
    return questions.map((q) => ({
      ...this.questionsService.sanitize(q),
      // Admin-only listing — include which key is correct so the bank is pickable.
      correctKey: q.options.find((o) => o.points > 0)?.key ?? null,
    }));
  }

  // Personalized: 5 randomly-assigned mindset questions (one per dimension,
  // fixed once assigned) + this session's shared trivia questions, if any.
  @UseGuards(SessionTokenGuard)
  @Get(':sessionId')
  async getAll(
    @Param('sessionId') sessionId: string,
    @CurrentParticipant() participant: ParticipantDocument,
  ) {
    if (participant.sessionId.toString() !== sessionId) {
      throw new ForbiddenException('Session token does not match this session');
    }

    const session = await this.sessionsService.findById(sessionId);
    if (session.status !== 'in_progress' && session.status !== 'ended') {
      throw new BadRequestException('Quiz has not started yet');
    }

    const mindsetIds =
      await this.questionsService.getOrAssignParticipantMindsetIds(participant);
    const orderedIds = [...mindsetIds, ...session.questionIds];
    const questions = await this.questionsService.findByIds(orderedIds);
    const byId = new Map(questions.map((q) => [q._id.toString(), q]));

    return orderedIds
      .map((id) => byId.get(id.toString()))
      .filter((q) => !!q)
      .map((q) => this.questionsService.sanitize(q));
  }
}
