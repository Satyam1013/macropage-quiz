import { IsMongoId, IsString, Matches, MinLength } from 'class-validator';

export class RegisterParticipantDto {
  @IsMongoId()
  sessionId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @Matches(/^[6-9]\d{9}$/, {
    message: 'whatsappNumber must be a valid 10-digit Indian mobile number',
  })
  whatsappNumber: string;
}
