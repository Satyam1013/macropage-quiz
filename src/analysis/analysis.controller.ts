import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { SessionTokenGuard } from '../participants/guards/session-token.guard';
import { CurrentParticipant } from '../participants/decorators/current-participant.decorator';
import type { ParticipantDocument } from '../participants/schemas/participant.schema';

@Controller('participants')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @UseGuards(SessionTokenGuard)
  @Post(':id/analysis')
  generate(
    @Param('id') id: string,
    @CurrentParticipant() participant: ParticipantDocument,
  ) {
    if (participant._id.toString() !== id) {
      throw new ForbiddenException('Session token does not match participant');
    }
    return this.analysisService.generateOrGetCached(participant);
  }

  @Get(':id/analysis')
  getExisting(@Param('id') id: string) {
    return this.analysisService.getExisting(id);
  }
}
