import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { Participant, ParticipantDocument } from './schemas/participant.schema';
import { RegisterParticipantDto } from './dto/register-participant.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import { SessionsService } from '../sessions/sessions.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<ParticipantDocument>,
    private readonly sessionsService: SessionsService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async register(dto: RegisterParticipantDto) {
    const session = await this.sessionsService.findById(dto.sessionId);
    if (session.status !== 'registration_open') {
      throw new BadRequestException(
        'Registration is not currently open for this session',
      );
    }

    const sessionToken = randomBytes(24).toString('hex');
    const participant = await this.participantModel.create({
      sessionId: session._id,
      name: dto.name,
      whatsappNumber: dto.whatsappNumber,
      sessionToken,
      registeredAt: new Date(),
    });

    return {
      participantId: participant._id.toString(),
      sessionToken,
    };
  }

  async findById(id: string): Promise<ParticipantDocument> {
    const participant = await this.participantModel.findById(id).exec();
    if (!participant) throw new NotFoundException('Participant not found');
    return participant;
  }

  async completeOnboarding(
    participant: ParticipantDocument,
    dto: OnboardingDto,
  ): Promise<ParticipantDocument> {
    participant.businessName = dto.businessName;
    participant.businessCategory = dto.businessCategory;
    participant.goal = dto.goal;
    participant.goalOther = dto.goal === 'other' ? dto.goalOther : undefined;
    participant.onboardingCompletedAt = new Date();
    await participant.save();
    return participant;
  }

  async getRank(participantId: string) {
    const participant = await this.findById(participantId);
    return this.leaderboardService.getParticipantRank(
      participant.sessionId.toString(),
      participantId,
    );
  }
}
