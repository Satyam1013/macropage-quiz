import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithParticipant } from '../guards/session-token.guard';

export const CurrentParticipant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithParticipant>();
    return request.participant;
  },
);
