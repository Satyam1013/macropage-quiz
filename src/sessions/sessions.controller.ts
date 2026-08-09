import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/open-registration')
  @HttpCode(HttpStatus.OK)
  openRegistration(@Param('id') id: string) {
    return this.sessionsService.openRegistration(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  start(@Param('id') id: string) {
    return this.sessionsService.start(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/next-question')
  @HttpCode(HttpStatus.OK)
  nextQuestion(@Param('id') id: string) {
    return this.sessionsService.nextQuestion(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  end(@Param('id') id: string) {
    return this.sessionsService.end(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/leaderboard')
  leaderboard(@Param('id') id: string) {
    return this.sessionsService.getLeaderboard(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/participants')
  participants(@Param('id') id: string) {
    return this.sessionsService.getParticipants(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/export.csv')
  async exportCsv(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.sessionsService.exportCsv(id);
    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      `attachment; filename="session-${id}-participants.csv"`,
    );
    res.send(csv);
  }

  @Get(':id/state')
  getState(@Param('id') id: string, @Query('participantId') participantId?: string) {
    return this.sessionsService.getState(id, participantId);
  }
}
