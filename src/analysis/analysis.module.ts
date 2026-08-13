import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AnalysisReport,
  AnalysisReportSchema,
} from './schemas/analysis-report.schema';
import { Answer, AnswerSchema } from '../answers/schemas/answer.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TemplateReportService } from './template-report.service';
import { ParticipantsModule } from '../participants/participants.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalysisReport.name, schema: AnalysisReportSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    ParticipantsModule,
    LeaderboardModule,
    WhatsappModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, TemplateReportService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
