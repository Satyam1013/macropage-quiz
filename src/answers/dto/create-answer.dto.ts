import { IsIn, IsInt, IsMongoId, Min } from 'class-validator';
import type { OptionKey } from '../../questions/schemas/question.schema';

export class CreateAnswerDto {
  @IsMongoId()
  questionId: string;

  @IsIn(['A', 'B', 'C', 'D'])
  selectedKey: OptionKey;

  @IsInt()
  @Min(0)
  timeTakenMs: number;
}
