import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import {
  Participant,
  ParticipantDocument,
} from '../schemas/participant.schema';

export interface RequestWithParticipant extends Request {
  participant: ParticipantDocument;
}

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<ParticipantDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithParticipant>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing session token');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const participant = await this.participantModel.findOne({
      sessionToken: token,
    });
    if (!participant) {
      throw new UnauthorizedException('Invalid session token');
    }

    request.participant = participant;
    return true;
  }
}
