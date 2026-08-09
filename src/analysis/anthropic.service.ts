import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ReportPromptInput {
  name: string;
  businessName?: string;
  businessCategory?: string;
  goal: string;
  goalOther?: string;
  archetypeName: string;
  archetypeDescription: string;
  techScore: number;
  dimensionScores: {
    growthMindset: number;
    customerRelationship: number;
    strategicThinking: number;
    investmentDiscipline: number;
    digitalReadiness: number;
  };
}

export interface GeneratedReportJson {
  headline: string;
  businessSnapshot: string;
  mindsetProfile: string;
  goalRoadmap: string[];
  techRecommendation: string;
}

const REPORT_JSON_SHAPE = `{
  "headline": string,           // one punchy line about them
  "businessSnapshot": string,   // 2-3 sentences reflecting their business + goal back to them
  "mindsetProfile": string,     // 2-3 sentences on their archetype
  "goalRoadmap": string[],      // 3-4 concrete next steps tied to their stated goal
  "techRecommendation": string  // 2-3 sentences, soft pitch for MACROPAGE services
}`;

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
    this.model = this.configService.get<string>(
      'ANTHROPIC_MODEL',
      'claude-sonnet-5',
    );
  }

  private buildPrompt(input: ReportPromptInput): string {
    const goalText =
      input.goal === 'other' ? input.goalOther || 'other' : input.goal;

    return `You are analyzing a small-business owner's mindset quiz results for a live event ("Analyze My Business").

Business: ${input.businessName || 'Unnamed business'} (${input.businessCategory || 'category not given'})
Owner's stated goal: ${goalText}
Mindset archetype: ${input.archetypeName} — ${input.archetypeDescription}
Overall tech-readiness score: ${input.techScore}/100
Dimension scores (0-100): growth mindset ${input.dimensionScores.growthMindset}, customer relationship ${input.dimensionScores.customerRelationship}, strategic thinking ${input.dimensionScores.strategicThinking}, investment discipline ${input.dimensionScores.investmentDiscipline}, digital readiness ${input.dimensionScores.digitalReadiness}.

Write a short "Analyze My Business" report for ${input.name}. Tone: warm, specific, a little bit "wow, an AI really gets my business" — not generic. Keep the total output well under 300 words.

Respond with STRICT JSON only, no markdown fences, no commentary, matching exactly this shape:
${REPORT_JSON_SHAPE}`;
  }

  async generateReportJson(
    input: ReportPromptInput,
  ): Promise<{ parsed: GeneratedReportJson; raw: string }> {
    const prompt = this.buildPrompt(input);

    const attempt = async (extra?: string): Promise<{ parsed: GeneratedReportJson; raw: string }> => {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: extra ? `${prompt}\n\n${extra}` : prompt },
        ],
      });

      const raw = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      const parsed = this.parseJson(raw);
      return { parsed, raw };
    };

    try {
      return await attempt();
    } catch (err) {
      this.logger.warn(
        `First analysis generation attempt failed, retrying once: ${(err as Error).message}`,
      );
      return attempt(
        'Your previous response was not valid JSON matching the required shape. Respond again with ONLY valid strict JSON, nothing else.',
      );
    }
  }

  private parseJson(raw: string): GeneratedReportJson {
    const cleaned = raw
      .trim()
      .replace(/^```(json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned) as Partial<GeneratedReportJson>;

    if (
      !parsed.headline ||
      !parsed.businessSnapshot ||
      !parsed.mindsetProfile ||
      !Array.isArray(parsed.goalRoadmap) ||
      !parsed.techRecommendation
    ) {
      throw new Error('Model response missing required reportJson fields');
    }

    return parsed as GeneratedReportJson;
  }
}
