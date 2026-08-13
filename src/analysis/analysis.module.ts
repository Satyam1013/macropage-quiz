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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalysisReport.name, schema: AnalysisReportSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    ParticipantsModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, TemplateReportService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
