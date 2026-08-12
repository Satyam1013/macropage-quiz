import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type QuizSessionStatus =
  'draft' | 'registration_open' | 'in_progress' | 'ended';

export type QuizSessionDocument = QuizSession & Document;

@Schema({ timestamps: true, collection: 'quiz_sessions' })
export class QuizSession {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    required: true,
    enum: ['draft', 'registration_open', 'in_progress', 'ended'],
    default: 'draft',
  })
  status: QuizSessionStatus;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Question', default: [] })
  questionIds: Types.ObjectId[];

  @Prop()
  startedAt?: Date;

  @Prop()
  endedAt?: Date;
}

export const QuizSessionSchema = SchemaFactory.createForClass(QuizSession);
