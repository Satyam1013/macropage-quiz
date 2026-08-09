import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type ParticipantGoal = 'grow_customers' | 'grow_revenue' | 'other';

export type ParticipantDocument = Participant & Document;

@Schema({ timestamps: false, collection: 'participants' })
export class Participant {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'QuizSession', required: true, index: true })
  sessionId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  whatsappNumber: string;

  @Prop({ required: true, unique: true, index: true })
  sessionToken: string;

  @Prop({ trim: true })
  businessName?: string;

  @Prop({ trim: true })
  businessCategory?: string;

  @Prop({ enum: ['grow_customers', 'grow_revenue', 'other'] })
  goal?: ParticipantGoal;

  @Prop({ trim: true })
  goalOther?: string;

  @Prop({ required: true, default: () => new Date() })
  registeredAt: Date;

  @Prop()
  onboardingCompletedAt?: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
ParticipantSchema.index({ sessionId: 1, whatsappNumber: 1 });
