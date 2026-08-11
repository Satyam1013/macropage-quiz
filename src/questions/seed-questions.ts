import { QuestionDimension, OptionKey } from './schemas/question.schema';

export interface SeedQuestion {
  text: string;
  order: number;
  timeLimitSeconds: number;
  dimension: QuestionDimension;
  options: { key: OptionKey; text: string; points: number }[];
}

export const DEFAULT_QUESTIONS: SeedQuestion[] = [
  {
    text: 'How do you currently track your daily sales and customer udhaar (credit)?',
    order: 1,
    timeLimitSeconds: 20,
    dimension: 'digital_readiness',
    options: [
      { key: 'A', text: 'Paper register / memory', points: 0 },
      { key: 'B', text: 'Excel sheet', points: 1 },
      { key: 'C', text: 'A dedicated app', points: 3 },
      { key: 'D', text: "I don't track it closely", points: 0 },
    ],
  },
  {
    text: 'Your best month ever just happened. What is your very next move?',
    order: 2,
    timeLimitSeconds: 20,
    dimension: 'growth_mindset',
    options: [
      { key: 'A', text: 'Enjoy it, I earned it', points: 0 },
      { key: 'B', text: 'Figure out exactly what worked', points: 2 },
      { key: 'C', text: 'Reinvest immediately in stock/staff', points: 2 },
      { key: 'D', text: 'Set a bigger target for next month', points: 3 },
    ],
  },
  {
    text: 'A regular customer has not visited in 2 months. What do you do first?',
    order: 3,
    timeLimitSeconds: 20,
    dimension: 'customer_relationship',
    options: [
      {
        key: 'A',
        text: "Wait, they'll come back if they need something",
        points: 0,
      },
      { key: 'B', text: 'Message them personally to check in', points: 3 },
      { key: 'C', text: 'Analyze what changed in your offering', points: 2 },
      { key: 'D', text: 'Launch a discount to win them back', points: 1 },
    ],
  },
  {
    text: 'A competitor opens two streets away with lower prices. Your reaction?',
    order: 4,
    timeLimitSeconds: 20,
    dimension: 'strategic_thinking',
    options: [
      { key: 'A', text: 'Match their price immediately', points: 1 },
      { key: 'B', text: 'Do nothing, my customers are loyal', points: 0 },
      { key: 'C', text: 'Double down on service/experience', points: 2 },
      {
        key: 'D',
        text: "Study what they're doing differently and adjust",
        points: 3,
      },
    ],
  },
  {
    text: 'You have ₹20,000 of unplanned extra profit this month. Where does it go?',
    order: 5,
    timeLimitSeconds: 20,
    dimension: 'investment_discipline',
    options: [
      { key: 'A', text: 'Save it', points: 1 },
      { key: 'B', text: 'Marketing / advertising', points: 2 },
      { key: 'C', text: 'New tech or tools for the business', points: 3 },
      { key: 'D', text: 'More inventory', points: 1 },
    ],
  },
];
