import {
  QuestionDimension,
  QuestionType,
  OptionKey,
} from './schemas/question.schema';

export interface SeedQuestion {
  text: string;
  order: number;
  timeLimitSeconds: number;
  type: QuestionType;
  dimension?: QuestionDimension;
  options: { key: OptionKey; text: string; points: number }[];
}

// The mindset bank: 3 question variants per dimension, so each participant
// can be handed a randomized set (one random question per dimension) instead
// of everyone seeing the identical 5 questions. See QuestionsService.
export const MINDSET_QUESTIONS: SeedQuestion[] = [
  // digital_readiness
  {
    text: 'How do you currently track your daily sales and customer udhaar (credit)?',
    order: 1,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'digital_readiness',
    options: [
      { key: 'A', text: 'Paper register / memory', points: 0 },
      { key: 'B', text: 'Excel sheet', points: 1 },
      { key: 'C', text: 'A dedicated app', points: 3 },
      { key: 'D', text: "I don't track it closely", points: 0 },
    ],
  },
  {
    text: 'A customer asks if they can pay you via UPI instead of cash. You:',
    order: 2,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'digital_readiness',
    options: [
      { key: 'A', text: 'Say no, cash only', points: 0 },
      {
        key: 'B',
        text: 'Say yes, you already have a QR code ready',
        points: 3,
      },
      {
        key: 'C',
        text: 'Say yes, but it takes a while to find/set up a QR code',
        points: 1,
      },
      {
        key: 'D',
        text: "Say yes, but ask them to pay a family member's account instead",
        points: 1,
      },
    ],
  },
  {
    text: 'Someone asks if your shop is on Google Maps or has any online presence. You:',
    order: 3,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'digital_readiness',
    options: [
      { key: 'A', text: "No, and haven't thought about it", points: 0 },
      { key: 'B', text: "No, but you're planning to soon", points: 1 },
      { key: 'C', text: 'Yes, but you never check or update it', points: 1 },
      {
        key: 'D',
        text: 'Yes, and you actively use it to attract new customers',
        points: 3,
      },
    ],
  },

  // growth_mindset
  {
    text: 'Your best month ever just happened. What is your very next move?',
    order: 4,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'growth_mindset',
    options: [
      { key: 'A', text: 'Enjoy it, I earned it', points: 0 },
      { key: 'B', text: 'Figure out exactly what worked', points: 2 },
      { key: 'C', text: 'Reinvest immediately in stock/staff', points: 2 },
      { key: 'D', text: 'Set a bigger target for next month', points: 3 },
    ],
  },
  {
    text: "You've hit your monthly sales target with a week still left. What now?",
    order: 5,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'growth_mindset',
    options: [
      { key: 'A', text: "Relax, you've done enough this month", points: 0 },
      {
        key: 'B',
        text: "Keep going, try to beat last month's best too",
        points: 3,
      },
      { key: 'C', text: 'Take a short break, resume normal pace', points: 1 },
      {
        key: 'D',
        text: 'Analyze what worked and repeat it for next month',
        points: 2,
      },
    ],
  },
  {
    text: 'A younger competitor is growing fast using new marketing tricks. Your first thought?',
    order: 6,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'growth_mindset',
    options: [
      { key: 'A', text: "They'll fade out eventually", points: 0 },
      {
        key: 'B',
        text: "Learn what they're doing and try it yourself",
        points: 3,
      },
      {
        key: 'C',
        text: 'Ignore them, focus on your loyal customers',
        points: 1,
      },
      {
        key: 'D',
        text: 'Complain to other shop owners about unfair competition',
        points: 0,
      },
    ],
  },

  // customer_relationship
  {
    text: 'A regular customer has not visited in 2 months. What do you do first?',
    order: 7,
    timeLimitSeconds: 20,
    type: 'mindset',
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
    text: 'A customer complains publicly on social media about your service. What do you do?',
    order: 8,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'customer_relationship',
    options: [
      { key: 'A', text: "Ignore it, it'll blow over", points: 0 },
      { key: 'B', text: 'Respond politely, offer to make it right', points: 3 },
      { key: 'C', text: 'Delete or hide the comment', points: 1 },
      { key: 'D', text: 'Argue back publicly to defend yourself', points: 0 },
    ],
  },
  {
    text: 'Your busiest regular customer asks for a small favor outside your usual policy. What do you do?',
    order: 9,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'customer_relationship',
    options: [
      { key: 'A', text: 'Say no, policy is policy for everyone', points: 1 },
      {
        key: 'B',
        text: 'Bend the rule quietly for them, no big deal',
        points: 2,
      },
      {
        key: 'C',
        text: 'Explain your policy warmly and offer an alternative that works for both',
        points: 3,
      },
      {
        key: 'D',
        text: 'Say yes immediately every time to keep them happy',
        points: 1,
      },
    ],
  },

  // strategic_thinking
  {
    text: 'A competitor opens two streets away with lower prices. Your reaction?',
    order: 10,
    timeLimitSeconds: 20,
    type: 'mindset',
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
    text: 'Your best-selling product suddenly stops being popular. What is your first move?',
    order: 11,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'strategic_thinking',
    options: [
      { key: 'A', text: 'Discount it heavily to clear stock', points: 1 },
      { key: 'B', text: 'Stop stocking it immediately', points: 0 },
      {
        key: 'C',
        text: 'Ask customers directly why they stopped buying it',
        points: 3,
      },
      { key: 'D', text: 'Wait and see if demand comes back', points: 0 },
    ],
  },
  {
    text: 'You get an unexpected chance to supply a big new client, but it means changing how you operate. Do you:',
    order: 12,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'strategic_thinking',
    options: [
      {
        key: 'A',
        text: "Decline, too risky to change what's working",
        points: 0,
      },
      {
        key: 'B',
        text: 'Take it and figure out logistics as you go',
        points: 2,
      },
      {
        key: 'C',
        text: 'Study exactly what it will take, then decide with a clear plan',
        points: 3,
      },
      { key: 'D', text: 'Take it only if a friend advises you to', points: 1 },
    ],
  },

  // investment_discipline
  {
    text: 'You have ₹20,000 of unplanned extra profit this month. Where does it go?',
    order: 13,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'investment_discipline',
    options: [
      { key: 'A', text: 'Save it', points: 1 },
      { key: 'B', text: 'Marketing / advertising', points: 2 },
      { key: 'C', text: 'New tech or tools for the business', points: 3 },
      { key: 'D', text: 'More inventory', points: 1 },
    ],
  },
  {
    text: 'A supplier offers a bulk discount if you order 3x your usual stock right now. Do you:',
    order: 14,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'investment_discipline',
    options: [
      { key: 'A', text: 'Buy it all immediately to save money', points: 1 },
      {
        key: 'B',
        text: 'Calculate if you can actually sell it before deciding',
        points: 3,
      },
      {
        key: 'C',
        text: 'Ignore the offer, stick to usual order size',
        points: 1,
      },
      {
        key: 'D',
        text: 'Borrow money so you can afford the bulk order',
        points: 0,
      },
    ],
  },
  {
    text: "You're deciding between renovating your shop and buying a new tech tool for your business. You:",
    order: 15,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'investment_discipline',
    options: [
      {
        key: 'A',
        text: 'Always pick the tech tool without checking impact',
        points: 1,
      },
      { key: 'B', text: 'Always pick renovation, it looks nicer', points: 0 },
      {
        key: 'C',
        text: 'Compare which one actually grows revenue more, then decide',
        points: 3,
      },
      { key: 'D', text: 'Flip a coin, both seem fine', points: 0 },
    ],
  },
];
