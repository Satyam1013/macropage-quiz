import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly questionsService: QuestionsService,
  ) {}

  @Get(':sessionId/current')
  async getCurrent(@Param('sessionId') sessionId: string) {
    const session = await this.sessionsService.findById(sessionId);
    const question = await this.sessionsService.getCurrentQuestionDoc(session);
    if (!question) {
      throw new NotFoundException('No active question for this session');
    }
    return {
      ...this.questionsService.sanitize(question),
      index: session.currentQuestionIndex,
      totalQuestions: session.questionIds.length,
    };
  }
}
