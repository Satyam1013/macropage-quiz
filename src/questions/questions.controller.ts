import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService } from '../sessions/sessions.service';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly questionsService: QuestionsService,
  ) {}

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

  @Get(':sessionId')
  async getAll(@Param('sessionId') sessionId: string) {
    const session = await this.sessionsService.findById(sessionId);
    if (session.status === 'draft') {
      throw new BadRequestException('Quiz has not started yet');
    }
    const questions = await this.sessionsService.getAllQuestionDocs(session);
    return questions.map((q) => this.questionsService.sanitize(q));
  }
}
