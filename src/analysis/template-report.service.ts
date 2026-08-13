import { Injectable } from '@nestjs/common';
import { GeneratedReportJson, ReportPromptInput } from './anthropic.service';

function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

const HEADLINES: Record<string, string[]> = {
  'The Growth Chaser': [
    'Built to chase the next milestone.',
    'Momentum is your default setting.',
  ],
  'The Relationship Builder': [
    'Your relationships are the real growth engine.',
    'People remember how you made them feel — and it shows.',
  ],
  'The Data-Driven Grower': [
    'You play the long game, and it is paying off.',
    'Sharp eyes on the market, sharper moves.',
  ],
  'The Bold Investor': [
    'Bold bets, backed by conviction.',
    'You do not wait for certainty to act.',
  ],
  'The Digital Native': [
    'Already thinking digital-first — ahead of the curve.',
    'Tech-native, and it shows in how you run things.',
  ],
};

const DIMENSION_LABELS: Record<
  keyof ReportPromptInput['dimensionScores'],
  string
> = {
  growthMindset: 'Growth Mindset',
  customerRelationship: 'Customer Relationship',
  strategicThinking: 'Strategic Thinking',
  investmentDiscipline: 'Investment Discipline',
  digitalReadiness: 'Digital Readiness',
};

const GOAL_ROADMAPS: Record<
  'grow_customers' | 'grow_revenue' | 'other',
  (businessLabel: string, goalOther?: string) => string[]
> = {
  grow_customers: (businessLabel) => [
    `Nail down exactly who your best customers are, then find five more people at ${businessLabel} who look just like them this month.`,
    'Ask your last 10 happy customers for a referral or review — word of mouth converts faster than any ad.',
    'Pick one channel (WhatsApp, Instagram, or local community groups) and post there consistently for 30 days before judging results.',
    'Set up a simple way to bring customers back — a WhatsApp broadcast list or a loyalty note turns one-time buyers into regulars.',
  ],
  grow_revenue: (businessLabel) => [
    `Look at ${businessLabel}'s top products or services by margin, not volume — double down on what actually pays the bills.`,
    'Test a small price increase or a bundled offer with your next 10 customers and track what happens.',
    'Cut or renegotiate your single biggest recurring expense this month — even a 10% trim compounds fast.',
    'Build one upsell into your existing sales conversation — an add-on, a bigger size, a maintenance plan.',
  ],
  other: (businessLabel, goalOther) => [
    `Write down the one metric that would tell you "${goalOther ?? 'your goal'}" is working — you can't hit a target you haven't defined.`,
    `Block two hours this week to work only on that, at ${businessLabel}, no daily firefighting allowed.`,
    'Find one other business owner doing something similar and ask how they approached it.',
    'Set a 30-day checkpoint so you course-correct early instead of at the end of the quarter.',
  ],
};

const TECH_RECOMMENDATIONS = {
  low: [
    "Your digital presence has real room to grow — even a simple website or WhatsApp catalog would put you ahead of competitors still running everything by word of mouth. That's exactly the kind of foundational build MACROPAGE specializes in.",
    "There's a lot of low-hanging fruit on the digital side — a basic online presence alone would set you apart right now. Building that foundation is precisely where MACROPAGE comes in.",
  ],
  mid: [
    "You're using digital tools, but there's a gap between what you have and what's actually converting. A tighter website or a proper booking/ordering flow — the kind of thing MACROPAGE builds — could close that gap fast.",
    'You have the basics in place, but the experience likely leaks customers somewhere. Sharpening that flow is exactly the kind of work MACROPAGE does.',
  ],
  high: [
    "You're already digital-first, which puts you ahead of most small businesses. The next unlock is usually a sharper, faster, more conversion-focused version of what you've already built — which is where a team like MACROPAGE comes in.",
    "You're clearly comfortable online already. From here it's about optimization, not foundation-building — the kind of refinement MACROPAGE specializes in.",
  ],
};

function techTier(score: number): keyof typeof TECH_RECOMMENDATIONS {
  if (score < 40) return 'low';
  if (score < 70) return 'mid';
  return 'high';
}

function goalKey(goal: string): keyof typeof GOAL_ROADMAPS {
  return goal === 'grow_customers' || goal === 'grow_revenue' ? goal : 'other';
}

function goalText(goal: string, goalOther?: string): string {
  if (goal === 'grow_customers') return 'grow your customer base';
  if (goal === 'grow_revenue') return 'grow your revenue';
  return goalOther ? `focus on ${goalOther}` : 'grow the business';
}

@Injectable()
export class TemplateReportService {
  generateReportJson(input: ReportPromptInput): {
    parsed: GeneratedReportJson;
    raw: string;
  } {
    const businessLabel = input.businessName || 'your business';
    const categorySuffix = input.businessCategory
      ? ` (${input.businessCategory})`
      : '';

    const topDimensionKey = (
      Object.keys(input.dimensionScores) as Array<
        keyof ReportPromptInput['dimensionScores']
      >
    ).reduce((best, key) =>
      input.dimensionScores[key] > input.dimensionScores[best] ? key : best,
    );
    const topLabel = DIMENSION_LABELS[topDimensionKey];
    const topScore = input.dimensionScores[topDimensionKey];

    const headline = pick(
      HEADLINES[input.archetypeName] ?? [`${input.archetypeName}.`],
    );

    const businessSnapshot = `${input.name}, here's the read on ${businessLabel}${categorySuffix}: you're aiming to ${goalText(input.goal, input.goalOther)}, and your overall tech-readiness score of ${input.techScore}/100 ${input.techScore < 40 ? 'shows real upside in tightening up the digital side of things' : input.techScore < 70 ? 'shows a decent foundation with a clear next step' : 'shows you are already ahead of most small businesses on the digital front'}.`;

    const mindsetProfile = `${input.archetypeName} — ${input.archetypeDescription} That instinct shows up clearest in your ${topLabel} score of ${topScore}/100, which is likely to shape how ${businessLabel} grows from here.`;

    const goalRoadmap = GOAL_ROADMAPS[goalKey(input.goal)](
      businessLabel,
      input.goalOther,
    );

    const techRecommendation = pick(
      TECH_RECOMMENDATIONS[techTier(input.techScore)],
    );

    const parsed: GeneratedReportJson = {
      headline,
      businessSnapshot,
      mindsetProfile,
      goalRoadmap,
      techRecommendation,
    };

    return { parsed, raw: JSON.stringify(parsed) };
  }
}
