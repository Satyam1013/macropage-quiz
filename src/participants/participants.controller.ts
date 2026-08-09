import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ParticipantsService } from './participants.service';
import { RegisterParticipantDto } from './dto/register-participant.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import { SessionTokenGuard } from './guards/session-token.guard';
import { CurrentParticipant } from './decorators/current-participant.decorator';
import type { ParticipantDocument } from './schemas/participant.schema';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Throttle({ default: { limit: 5, ttl: 10_000 } })
  @Post('register')
  register(@Body() dto: RegisterParticipantDto) {
    return this.participantsService.register(dto);
  }

  @UseGuards(SessionTokenGuard)
  @Patch(':id/onboarding')
  completeOnboarding(
    @Param('id') id: string,
    @Body() dto: OnboardingDto,
    @CurrentParticipant() participant: ParticipantDocument,
  ) {
    if (participant._id.toString() !== id) {
      throw new ForbiddenException('Session token does not match participant');
    }
    return this.participantsService.completeOnboarding(participant, dto);
  }

  @Get(':id/rank')
  getRank(@Param('id') id: string) {
    return this.participantsService.getRank(id);
  }
}
