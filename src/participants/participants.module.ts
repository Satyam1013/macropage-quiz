import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Participant, ParticipantSchema } from './schemas/participant.schema';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { SessionTokenGuard } from './guards/session-token.guard';
import { SessionsModule } from '../sessions/sessions.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Participant.name, schema: ParticipantSchema }]),
    SessionsModule,
    LeaderboardModule,
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService, SessionTokenGuard],
  exports: [ParticipantsService, SessionTokenGuard, MongooseModule],
})
export class ParticipantsModule {}
