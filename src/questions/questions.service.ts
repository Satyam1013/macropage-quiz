import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { MINDSET_QUESTIONS } from './seed-questions';
import { TRIVIA_QUESTIONS } from './seed-trivia-questions';
import type { ParticipantDocument } from '../participants/schemas/participant.schema';
import { DIMENSION_ORDER } from '../analysis/archetypes';

export interface SanitizedQuestion {
  id: string;
  text: string;
  textHi?: string;
  order: number;
  timeLimitSeconds: number;
  type: string;
  dimension?: string;
  options: { key: string; text: string; textHi?: string }[];
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  /**
   * Seeds the mindset question bank (3 variants per dimension) once.
   * Idempotent: if any mindset questions already exist, returns them as-is.
   */
  async seedMindsetBank(): Promise<QuestionDocument[]> {
    const existing = await this.questionModel.find({ type: 'mindset' }).exec();
    if (existing.length > 0) return existing;
    return this.questionModel.insertMany(MINDSET_QUESTIONS);
  }

  async getMindsetBank(): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({ type: 'mindset' })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Seeds the 50-question trivia bank once. Idempotent: if any trivia
   * questions already exist, returns them as-is instead of inserting again.
   */
  async seedTriviaBank(): Promise<QuestionDocument[]> {
    const existing = await this.questionModel.find({ type: 'trivia' }).exec();
    if (existing.length > 0) return existing;
    return this.questionModel.insertMany(TRIVIA_QUESTIONS);
  }

  async getTriviaBank(): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({ type: 'trivia' })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Picks one random question per dimension from the mindset bank via
   * Mongo's $sample, so each participant gets a different specific question
   * per dimension while every dimension is still guaranteed coverage (the
   * business analysis needs exactly one answer per dimension to work).
   */
  private async assignRandomMindsetSet(): Promise<Types.ObjectId[]> {
    const ids: Types.ObjectId[] = [];
    for (const dimension of DIMENSION_ORDER) {
      const sample = await this.questionModel.aggregate<{
        _id: Types.ObjectId;
      }>([
        { $match: { type: 'mindset', dimension } },
        { $sample: { size: 1 } },
      ]);
      if (sample[0]) ids.push(sample[0]._id);
    }
    return ids;
  }

  /**
   * Returns this participant's personal mindset question set, assigning it
   * (once, randomly) on first call and reusing it on every call after.
   */
  async getOrAssignParticipantMindsetIds(
    participant: ParticipantDocument,
  ): Promise<Types.ObjectId[]> {
    if (participant.assignedQuestionIds?.length) {
      return participant.assignedQuestionIds;
    }
    const assigned = await this.assignRandomMindsetSet();
    participant.assignedQuestionIds = assigned;
    await participant.save();
    return assigned;
  }

  async findById(id: string | Types.ObjectId): Promise<QuestionDocument> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async findByIds(ids: Types.ObjectId[]): Promise<QuestionDocument[]> {
    return this.questionModel.find({ _id: { $in: ids } }).exec();
  }

  sanitize(question: QuestionDocument): SanitizedQuestion {
    return {
      id: question._id.toString(),
      text: question.text,
      textHi: question.textHi,
      order: question.order,
      timeLimitSeconds: question.timeLimitSeconds,
      type: question.type,
      dimension: question.dimension,
      options: question.options.map((o) => ({
        key: o.key,
        text: o.text,
        textHi: o.textHi,
      })),
    };
  }
}
