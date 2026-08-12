import { Module } from '@nestjs/common';
import { QuizGateway } from './quiz.gateway';
import { SessionsModule } from '../sessions/sessions.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [SessionsModule, LeaderboardModule],
  providers: [QuizGateway],
})
export class QuizGatewayModule {}
