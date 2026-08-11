import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import type { OptionKey } from '../../questions/schemas/question.schema';

export type AnswerDocument = Answer & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'answers',
})
export class Answer {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Participant',
    required: true,
    index: true,
  })
  participantId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Question',
    required: true,
    index: true,
  })
  questionId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'QuizSession',
    required: true,
    index: true,
  })
  sessionId: Types.ObjectId;

  @Prop({ required: true, enum: ['A', 'B', 'C', 'D'] })
  selectedKey: OptionKey;

  @Prop({ required: true })
  pointsAwarded: number;

  @Prop({ required: true })
  answeredAtMs: number;

  @Prop({ required: true })
  timeTakenMs: number;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
AnswerSchema.index({ participantId: 1, questionId: 1 }, { unique: true });
