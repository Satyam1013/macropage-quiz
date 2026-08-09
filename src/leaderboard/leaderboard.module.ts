import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from '../answers/schemas/answer.schema';
import {
  Participant,
  ParticipantSchema,
} from '../participants/schemas/participant.schema';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Answer.name, schema: AnswerSchema },
      { name: Participant.name, schema: ParticipantSchema },
    ]),
  ],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
