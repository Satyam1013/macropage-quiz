import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface QuizResultMessageInput {
  whatsappNumber: string;
  name: string;
  businessName?: string;
  rank: number;
  totalParticipants: number;
  techScore: number;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendQuizResult(input: QuizResultMessageInput): Promise<void> {
    const baseUrl = this.configService.get<string>('WHATSAPP_API_BASE_URL');
    const apiKey = this.configService.get<string>('API_ANALYSE_QUIZ_KEY');
    const templateName = this.configService.get<string>(
      'TEMPLATE_NAME_ANALYSE',
    );

    if (!baseUrl || !apiKey || !templateName) {
      this.logger.warn(
        'WhatsApp result messaging is not configured — skipping send',
      );
      return;
    }

    const phone = `+91${input.whatsappNumber}`;
    const templateVars: Record<string, string> = {
      '1': input.name,
      '2': input.businessName || input.name,
      '3': String(input.rank),
      '4': String(input.totalParticipants),
      '5': `${input.techScore}/100`,
    };

    try {
      // macropage-connect exposes its public API behind Nest's global
      // `/api/v1` prefix. `WHATSAPP_API_BASE_URL` is the host root.
      const response = await fetch(`${baseUrl}/api/v1/public/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          phone,
          name: input.name,
          templateName,
          templateVars,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(
          `WhatsApp send failed for ${phone}: ${response.status} ${body}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `WhatsApp send error for ${phone}: ${(err as Error).message}`,
      );
    }
  }
}
