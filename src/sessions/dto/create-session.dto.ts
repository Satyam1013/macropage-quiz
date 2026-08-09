import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsBoolean()
  autoSeedQuestions?: boolean = true;
}
