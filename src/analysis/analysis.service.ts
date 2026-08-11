import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AnalysisReport,
  AnalysisReportDocument,
} from './schemas/analysis-report.schema';
import { Answer, AnswerDocument } from '../answers/schemas/answer.schema';
import {
  Question,
  QuestionDocument,
} from '../questions/schemas/question.schema';
import { ParticipantDocument } from '../participants/schemas/participant.schema';
import { AnthropicService } from './anthropic.service';
import { ARCHETYPES, DIMENSION_ORDER, TECH_SCORE_WEIGHTS } from './archetypes';
import { QuestionDimension } from '../questions/schemas/question.schema';

const MAX_POINTS_PER_QUESTION = 3;

@Injectable()
export class AnalysisService {
  constructor(
    @InjectModel(AnalysisReport.name)
    private readonly analysisReportModel: Model<AnalysisReportDocument>,
    @InjectModel(Answer.name)
    private readonly answerModel: Model<AnswerDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
    private readonly anthropicService: AnthropicService,
  ) {}

  async getExisting(participantId: string): Promise<AnalysisReportDocument> {
    const report = await this.analysisReportModel
      .findOne({ participantId })
      .exec();
    if (!report)
      throw new NotFoundException('No analysis report generated yet');
    return report;
  }

  async generateOrGetCached(
    participant: ParticipantDocument,
  ): Promise<AnalysisReportDocument> {
    const existing = await this.analysisReportModel
      .findOne({ participantId: participant._id })
      .exec();
    if (existing) return existing;

    const answers = await this.answerModel
      .find({ participantId: participant._id })
      .exec();
    const questions = await this.questionModel
      .find({ _id: { $in: answers.map((a) => a.questionId) } })
      .exec();
    const questionById = new Map(questions.map((q) => [q._id.toString(), q]));

    const pointsByDimension = new Map<QuestionDimension, number>();
    for (const answer of answers) {
      const question = questionById.get(answer.questionId.toString());
      if (!question) continue;
      pointsByDimension.set(question.dimension, answer.pointsAwarded);
    }

    const dimensionScoreOf = (dimension: QuestionDimension) => {
      const points = pointsByDimension.get(dimension) ?? 0;
      return Math.round((points / MAX_POINTS_PER_QUESTION) * 100);
    };

    const dimensionScores = {
      growthMindset: dimensionScoreOf('growth_mindset'),
      customerRelationship: dimensionScoreOf('customer_relationship'),
      strategicThinking: dimensionScoreOf('strategic_thinking'),
      investmentDiscipline: dimensionScoreOf('investment_discipline'),
      digitalReadiness: dimensionScoreOf('digital_readiness'),
    };

    const techScore = Math.round(
      DIMENSION_ORDER.reduce(
        (sum, dimension) =>
          sum + dimensionScoreOf(dimension) * TECH_SCORE_WEIGHTS[dimension],
        0,
      ),
    );

    const topDimension = DIMENSION_ORDER.reduce((best, dimension) =>
      dimensionScoreOf(dimension) > dimensionScoreOf(best) ? dimension : best,
    );
    const archetype = ARCHETYPES[topDimension];

    const { parsed, raw } = await this.anthropicService.generateReportJson({
      name: participant.name,
      businessName: participant.businessName,
      businessCategory: participant.businessCategory,
      goal: participant.goal ?? 'other',
      goalOther: participant.goalOther,
      archetypeName: archetype.name,
      archetypeDescription: archetype.description,
      techScore,
      dimensionScores,
    });

    return this.analysisReportModel.create({
      participantId: participant._id,
      sessionId: participant.sessionId,
      generatedAt: new Date(),
      techScore,
      archetype: archetype.name,
      dimensionScores,
      reportJson: parsed,
      rawModelResponse: raw,
    });
  }
}
