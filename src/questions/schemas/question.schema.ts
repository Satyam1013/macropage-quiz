import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDimension =
  | 'growth_mindset'
  | 'customer_relationship'
  | 'strategic_thinking'
  | 'investment_discipline'
  | 'digital_readiness';

export type QuestionType = 'mindset' | 'trivia';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type QuestionDocument = Question & Document;

@Schema({ _id: false })
export class QuestionOption {
  @Prop({ required: true, enum: ['A', 'B', 'C', 'D'] })
  key: OptionKey;

  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: true, min: 0, max: 3 })
  points: number;
}

export const QuestionOptionSchema =
  SchemaFactory.createForClass(QuestionOption);

@Schema({ timestamps: true, collection: 'questions' })
export class Question {
  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true, default: 20 })
  timeLimitSeconds: number;

  @Prop({ required: true, enum: ['mindset', 'trivia'], default: 'mindset' })
  type: QuestionType;

  @Prop({
    enum: [
      'growth_mindset',
      'customer_relationship',
      'strategic_thinking',
      'investment_discipline',
      'digital_readiness',
    ],
  })
  dimension?: QuestionDimension;

  @Prop({ type: [QuestionOptionSchema], required: true })
  options: QuestionOption[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
