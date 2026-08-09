import { QuestionDimension } from '../questions/schemas/question.schema';

export const ARCHETYPES: Record<
  QuestionDimension,
  { name: string; description: string }
> = {
  growth_mindset: {
    name: 'The Growth Chaser',
    description:
      'Always chasing the next milestone, driven by ambition and momentum.',
  },
  customer_relationship: {
    name: 'The Relationship Builder',
    description:
      'Builds the business through genuine relationships and a personal touch.',
  },
  strategic_thinking: {
    name: 'The Data-Driven Grower',
    description:
      'Watches the market closely and adapts with a clear-eyed strategy.',
  },
  investment_discipline: {
    name: 'The Bold Investor',
    description: "Isn't afraid to bet on the business when opportunity knocks.",
  },
  digital_readiness: {
    name: 'The Digital Native',
    description:
      'Already thinking digital-first, using tools to run the business smarter.',
  },
};

// Weighted average for the overall tech score — digital readiness counts most,
// since the report is used as a soft pitch for MACROPAGE's digital services.
export const TECH_SCORE_WEIGHTS: Record<QuestionDimension, number> = {
  digital_readiness: 0.4,
  growth_mindset: 0.15,
  customer_relationship: 0.15,
  strategic_thinking: 0.15,
  investment_discipline: 0.15,
};

export const DIMENSION_ORDER: QuestionDimension[] = [
  'growth_mindset',
  'customer_relationship',
  'strategic_thinking',
  'investment_discipline',
  'digital_readiness',
];
