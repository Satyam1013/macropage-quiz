import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { DEFAULT_QUESTIONS } from './seed-questions';

export interface SanitizedQuestion {
  id: string;
  text: string;
  order: number;
  timeLimitSeconds: number;
  dimension: string;
  options: { key: string; text: string }[];
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async seedDefaultQuestions(): Promise<Types.ObjectId[]> {
    const created = await this.questionModel.insertMany(DEFAULT_QUESTIONS);
    return created.map((doc) => doc._id);
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
      order: question.order,
      timeLimitSeconds: question.timeLimitSeconds,
      dimension: question.dimension,
      options: question.options.map((o) => ({ key: o.key, text: o.text })),
    };
  }
}
