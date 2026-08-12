import { SeedQuestion } from './seed-questions';

const TRIVIA_TIME_LIMIT_SECONDS = 10;
const CORRECT_POINTS = 3;

function trivia(
  order: number,
  text: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): SeedQuestion {
  const keys = ['A', 'B', 'C', 'D'] as const;
  return {
    text,
    order,
    timeLimitSeconds: TRIVIA_TIME_LIMIT_SECONDS,
    type: 'trivia',
    options: options.map((text, i) => ({
      key: keys[i],
      text,
      points: i === correctIndex ? CORRECT_POINTS : 0,
    })),
  };
}

export const TRIVIA_QUESTIONS: SeedQuestion[] = [
  // Set A — Guess the Founder's App
  trivia(
    1,
    'Nikhil Kamath earns his fortune mainly through this app:',
    ['PhonePe', 'Kite (Zerodha)', 'Paytm', 'Groww'],
    1,
  ),
  trivia(
    2,
    "Vijay Shekhar Sharma built India's mobile-wallet-to-super-app story with:",
    ['PhonePe', 'Paytm', 'Mobikwik', 'Freecharge'],
    1,
  ),
  trivia(
    3,
    'Ritesh Agarwal turned budget hotels into a tech brand with:',
    ['MakeMyTrip', 'OYO', 'Airbnb India', 'Treebo'],
    1,
  ),
  trivia(
    4,
    'Falguni Nayar left investment banking to build:',
    ['Myntra', 'Nykaa', 'Purplle', 'Ajio'],
    1,
  ),
  trivia(
    5,
    'Deepinder Goyal turned a menu-scanning idea into:',
    ['Swiggy', 'Zomato', 'EatSure', 'FoodPanda'],
    1,
  ),
  trivia(
    6,
    'Bhavish Aggarwal disrupted city travel in India with:',
    ['Uber', 'Ola', 'Rapido', 'Meru'],
    1,
  ),
  trivia(
    7,
    'Kunal Shah turned "pay your credit card bill on time" into a brand:',
    ['Slice', 'CRED', 'LazyPay', 'OneCard'],
    1,
  ),
  trivia(
    8,
    "Sameer Nigam built one of India's most-used UPI apps:",
    ['Google Pay', 'PhonePe', 'Amazon Pay', 'BHIM'],
    1,
  ),
  trivia(
    9,
    'Sridhar Vembu quietly built a global SaaS company from Tamil Nadu:',
    ['Freshworks', 'Zoho', 'Chargebee', 'Postman'],
    1,
  ),
  trivia(
    10,
    'Peyush Bansal made eyewear shopping digital-first with:',
    ['Titan Eye+', 'Lenskart', 'Specsmakers', 'GKB Opticals'],
    1,
  ),

  // Set B — Myth or Fact (Tech Adoption Lessons)
  trivia(
    11,
    "DMart's own app, DMart Ready, currently:",
    [
      'Earns more than its stores',
      'Is still running at a loss',
      'Was shut down',
      "Is DMart's #1 revenue driver",
    ],
    1,
  ),
  trivia(
    12,
    'Zerodha became one of the most profitable brokers in India without ever:',
    [
      'Hiring engineers',
      'Raising outside funding',
      'Charging any fee',
      'Opening an office',
    ],
    1,
  ),
  trivia(
    13,
    'Khatabook mainly replaced this for kirana shop owners:',
    [
      'Their shop signage',
      'Paper ledgers (bahi-khata)',
      'Their cash counter',
      'Their supplier contacts',
    ],
    1,
  ),
  trivia(
    14,
    'What made Zerodha different from traditional brokers?',
    [
      'Free stocks for life',
      'A flat, low fee instead of % commission',
      'Phone-call-only trading',
      'Only for big investors',
    ],
    1,
  ),
  trivia(
    15,
    "Meesho's early growth engine, before big ad budgets, was:",
    [
      'TV commercials',
      'WhatsApp & social selling by home resellers',
      'Newspaper ads',
      'Mall kiosks',
    ],
    1,
  ),
  trivia(
    16,
    'A UPI transaction mostly costs the customer:',
    ['A flat ₹10 fee', 'Nothing', '2% of the amount', 'A monthly fee'],
    1,
  ),
  trivia(
    17,
    'GST digitization pushed many wholesalers toward:',
    [
      'Better shop interiors',
      'Digital, compliant billing',
      'Bigger warehouses',
      'Franchise models',
    ],
    1,
  ),
  trivia(
    18,
    'The real reason small shops adopt apps like Khatabook is:',
    [
      'It looks modern',
      'It saves hours & reduces payment delays',
      "It's legally required",
      'Competitors forced them',
    ],
    1,
  ),
  trivia(
    19,
    '"Digital-first" mainly means a business:',
    [
      'Only ever sells online',
      'Builds its processes around tech from day one',
      'Has an Instagram page',
      'Uses computers instead of paper',
    ],
    1,
  ),
  trivia(
    20,
    'The biggest risk of skipping digital payments today is:',
    [
      "Losing UPI-only customers who won't carry cash",
      'Nothing, cash still works everywhere',
      'Extra tax',
      'Losing your shop licence',
    ],
    0,
  ),

  // Set C — Company & App Milestones
  trivia(
    21,
    'Zerodha\'s app "Kite" helped the company cross this yearly revenue mark:',
    ['₹900 crore', '₹9,000+ crore', '₹90 crore', '₹90,000 crore'],
    1,
  ),
  trivia(
    22,
    'Meesho, a 2015 WhatsApp reselling idea, is now:',
    [
      'Still a tiny startup',
      "Listed on India's stock exchanges (NSE & BSE)",
      'Shut down',
      'Only a B2B app',
    ],
    1,
  ),
  trivia(
    23,
    'Khatabook, the digital ledger app for kirana stores, has crossed:',
    [
      '5,000 downloads',
      '50 million+ downloads',
      '5 lakh downloads',
      '5 crore paid users',
    ],
    1,
  ),
  trivia(
    24,
    "India's UPI system now processes billions of transactions:",
    ['Every year', 'Every single month', 'Every decade', 'Only on festivals'],
    1,
  ),
  trivia(
    25,
    'Which Indian-origin SaaS company serves global customers from India?',
    ['Zoho', 'Only Silicon Valley firms do this', 'Reliance Jio', 'DMart'],
    0,
  ),
  trivia(
    26,
    'boAt became a top audio/wearable brand by focusing early on:',
    [
      'TV-only ads',
      'D2C online sales + social media',
      'Mall stores only',
      'Government tenders',
    ],
    1,
  ),
  trivia(
    27,
    'CRED built its business by rewarding users for:',
    [
      'Opening a bank account',
      'Paying credit card bills on time',
      'Watching ads',
      'Referring 10 friends',
    ],
    1,
  ),
  trivia(
    28,
    'Physics Wallah went from free YouTube videos to:',
    [
      'A shut-down channel',
      'A billion-dollar ed-tech company',
      'A TV channel only',
      'A print-only publisher',
    ],
    1,
  ),
  trivia(
    29,
    'Razorpay grew by solving online payments specifically for:',
    [
      'Only large enterprises',
      'Startups & small businesses banks ignored',
      'Government offices',
      'International tourists',
    ],
    1,
  ),
  trivia(
    30,
    'Urban Company turned unorganized home services into:',
    [
      'A pamphlet business',
      'A rated, on-demand booking app',
      'A government scheme',
      'A franchise-only model',
    ],
    1,
  ),

  // Set D — Traditional Business → Digital Transformation
  trivia(
    31,
    'A tailor taking orders & measurements via WhatsApp is:',
    [
      'Doing nothing new',
      'Digitizing customer intake',
      'Losing customers',
      'Breaking a rule',
    ],
    1,
  ),
  trivia(
    32,
    'A kirana store adding a QR code at the counter mainly solves for:',
    [
      'Decoration',
      'Faster, cashless checkout',
      'Free advertising',
      'Tax evasion',
    ],
    1,
  ),
  trivia(
    33,
    'A manufacturer using WhatsApp Business + Google listing improves:',
    [
      'Factory floor space',
      'Customer discovery & communication',
      'Raw material cost',
      'Nothing measurable',
    ],
    1,
  ),
  trivia(
    34,
    'A wholesaler switching to GST-compliant digital billing usually gains:',
    [
      'Lower quality stock',
      'Access to bigger, compliant buyers',
      'More paperwork only',
      'No real benefit',
    ],
    1,
  ),
  trivia(
    35,
    'A shop using Google Maps + reviews instead of only walk-ins is:',
    [
      'Wasting time',
      'Expanding how new customers find them',
      'Risking reputation',
      'Breaking a rule',
    ],
    1,
  ),
  trivia(
    36,
    'A small business taking orders via Instagram/WhatsApp is really:',
    [
      'Doing nothing serious',
      'Turning a social page into a sales channel',
      'Just posting photos',
      'Copying big brands for no reason',
    ],
    1,
  ),
  trivia(
    37,
    'Why do many small businesses hesitate to adopt tech, even when it helps?',
    [
      "It's always too expensive",
      'Fear of the unknown / "too complicated for me"',
      "It's illegal without a licence",
      "Tech doesn't actually help small business",
    ],
    1,
  ),
  trivia(
    38,
    'A shop using a digital ledger app instead of paper mainly gains:',
    [
      'A nicer-looking register',
      'Faster collections, fewer errors, reminders',
      'Free products',
      'No real change',
    ],
    1,
  ),
  trivia(
    39,
    'What usually happens to a business that resists digital payments as customers shift to UPI?',
    [
      'Nothing changes',
      'It slowly loses digital-first customers',
      'It automatically gets more customers',
      'The government shuts it down',
    ],
    1,
  ),
  trivia(
    40,
    "The real lesson from Kodak's downfall was:",
    [
      'Cameras became unpopular',
      "They had the tech but didn't commit to adopting it",
      'Film photography became illegal',
      'They ran out of money suddenly',
    ],
    1,
  ),

  // Set E — General Tech & Digital India Awareness
  trivia(
    41,
    'UPI stands for:',
    [
      'Universal Payment Interface',
      'Unified Payments Interface',
      'United Public Investment',
      'Unique Personal ID',
    ],
    1,
  ),
  trivia(
    42,
    "India's UPI system is built and run by:",
    [
      'A private US company',
      'NPCI (National Payments Corporation of India)',
      'A state government',
      'A private bank alone',
    ],
    1,
  ),
  trivia(
    43,
    '"Digital India" as a national push mainly aims to:',
    [
      'Ban cash completely',
      'Bring government services & the economy online for everyone',
      'Only help big cities',
      'Replace all shops with apps',
    ],
    1,
  ),
  trivia(
    44,
    'Aadhaar-based digital identity mainly helps businesses by:',
    [
      'Enabling faster, paperless verification',
      "Nothing, it's only for individuals",
      'Increasing paperwork',
      'Replacing GST',
    ],
    0,
  ),
  trivia(
    45,
    'A QR code on a shop counter works because it:',
    [
      'Needs special hardware',
      'Links straight to a payment app on any smartphone',
      'Only works with one bank',
      "Needs internet only on the customer's side",
    ],
    1,
  ),
  trivia(
    46,
    'E-commerce in India grew fastest after:',
    [
      'Smartphones & cheap data became widely available',
      'Newspapers increased ads',
      'Shops started closing early',
      'Nothing changed',
    ],
    0,
  ),
  trivia(
    47,
    '"Google My Business" listing mainly helps with:',
    [
      'Filing taxes',
      'Being found by nearby customers searching online',
      'Paying employees',
      'Managing inventory',
    ],
    1,
  ),
  trivia(
    48,
    'WhatsApp Business (different from regular WhatsApp) gives small businesses:',
    [
      'Free Instagram ads',
      'Catalogs, auto-replies & business profiles',
      'A physical store',
      'Free delivery staff',
    ],
    1,
  ),
  trivia(
    49,
    'Cloud-based business tools mainly help small businesses by:',
    [
      'Needing a huge upfront computer setup',
      'Letting them access data from anywhere, anytime',
      'Working only in one shop',
      'Making data less safe',
    ],
    1,
  ),
  trivia(
    50,
    'The single biggest reason small businesses are told to "go digital" today is:',
    [
      "It's mandatory now",
      'Customers themselves have already gone digital first',
      'Government forces it',
      'It has no real business impact',
    ],
    1,
  ),
];
