import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type AnalysisReportDocument = AnalysisReport & Document;

@Schema({ _id: false })
export class DimensionScores {
  @Prop({ required: true, min: 0, max: 100 })
  growthMindset: number;

  @Prop({ required: true, min: 0, max: 100 })
  customerRelationship: number;

  @Prop({ required: true, min: 0, max: 100 })
  strategicThinking: number;

  @Prop({ required: true, min: 0, max: 100 })
  investmentDiscipline: number;

  @Prop({ required: true, min: 0, max: 100 })
  digitalReadiness: number;
}
export const DimensionScoresSchema =
  SchemaFactory.createForClass(DimensionScores);

@Schema({ _id: false })
export class ReportJson {
  @Prop({ required: true })
  headline: string;

  @Prop()
  headlineHi?: string;

  @Prop({ required: true })
  businessSnapshot: string;

  @Prop()
  businessSnapshotHi?: string;

  @Prop({ required: true })
  mindsetProfile: string;

  @Prop()
  mindsetProfileHi?: string;

  @Prop({ type: [String], required: true })
  goalRoadmap: string[];

  @Prop({ type: [String] })
  goalRoadmapHi?: string[];

  @Prop({ required: true })
  techRecommendation: string;

  @Prop()
  techRecommendationHi?: string;
}
export const ReportJsonSchema = SchemaFactory.createForClass(ReportJson);

@Schema({ timestamps: false, collection: 'analysis_reports' })
export class AnalysisReport {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Participant',
    required: true,
    unique: true,
    index: true,
  })
  participantId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'QuizSession',
    required: true,
    index: true,
  })
  sessionId: Types.ObjectId;

  @Prop({ required: true, default: () => new Date() })
  generatedAt: Date;

  @Prop({ required: true, min: 0, max: 100 })
  techScore: number;

  @Prop({ required: true })
  archetype: string;

  @Prop({ type: DimensionScoresSchema, required: true })
  dimensionScores: DimensionScores;

  @Prop({ type: ReportJsonSchema, required: true })
  reportJson: ReportJson;

  @Prop()
  rawModelResponse?: string;
}

export const AnalysisReportSchema =
  SchemaFactory.createForClass(AnalysisReport);
