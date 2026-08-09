import { Module } from '@nestjs/common';
import { QuizGateway } from './quiz.gateway';
import { SessionsModule } from '../sessions/sessions.module';
import { QuestionsModule } from '../questions/questions.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [SessionsModule, QuestionsModule, LeaderboardModule],
  providers: [QuizGateway],
})
export class QuizGatewayModule {}
