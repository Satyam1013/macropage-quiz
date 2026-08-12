import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @MinLength(3)
  title: string;

  // Explicit pick of trivia bank question ids, in display order. Takes
  // priority over triviaCount if both are given.
  @IsOptional()
  @IsMongoId({ each: true })
  triviaQuestionIds?: string[];

  // Randomly sample this many questions from the trivia bank instead of
  // hand-picking ids. Ignored if triviaQuestionIds is provided.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  triviaCount?: number;
}
