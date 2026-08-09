import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSession, QuizSessionSchema } from './schemas/quiz-session.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import {
  Participant,
  ParticipantSchema,
} from '../participants/schemas/participant.schema';
import { Answer, AnswerSchema } from '../answers/schemas/answer.schema';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizSession.name, schema: QuizSessionSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Participant.name, schema: ParticipantSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
    LeaderboardModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
