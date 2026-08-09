import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { SessionTokenGuard } from '../participants/guards/session-token.guard';
import { CurrentParticipant } from '../participants/decorators/current-participant.decorator';
import type { ParticipantDocument } from '../participants/schemas/participant.schema';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @UseGuards(SessionTokenGuard)
  @Post()
  create(
    @CurrentParticipant() participant: ParticipantDocument,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.answersService.create(participant, dto);
  }
}
