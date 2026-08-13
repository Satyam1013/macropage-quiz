import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { WhatsappService } from './whatsapp.service';
import { QuizResultNotifier } from './quiz-result-notifier.listener';

@Module({
  imports: [SessionsModule, LeaderboardModule, AnalysisModule],
  providers: [WhatsappService, QuizResultNotifier],
  exports: [WhatsappService],
})
export class WhatsappModule {}
