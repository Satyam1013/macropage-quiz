import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export enum ParticipantGoalEnum {
  GROW_CUSTOMERS = 'grow_customers',
  GROW_REVENUE = 'grow_revenue',
  OTHER = 'other',
}

export class OnboardingDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessCategory?: string;

  @IsEnum(ParticipantGoalEnum)
  goal: ParticipantGoalEnum;

  @ValidateIf((dto: OnboardingDto) => dto.goal === ParticipantGoalEnum.OTHER)
  @IsString()
  @MinLength(1)
  goalOther?: string;
}
