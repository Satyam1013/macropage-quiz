import { Injectable } from '@nestjs/common';
import { GeneratedReportJson, ReportPromptInput } from './anthropic.service';

// Index-paired with HEADLINES_HI — keep both arrays the same length per key.
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

const HEADLINES_HI: Record<string, string[]> = {
  'The Growth Chaser': [
    'अगला मुकाम पाने के लिए बने हो।',
    'रफ़्तार आपकी फितरत में है।',
  ],
  'The Relationship Builder': [
    'आपके रिश्ते ही असली ग्रोथ इंजन हैं।',
    'लोग याद रखते हैं आपने उन्हें कैसा महसूस कराया — और यह साफ झलकता है।',
  ],
  'The Data-Driven Grower': [
    'आप लंबी सोच के साथ खेलते हैं, और यह काम आ रहा है।',
    'बाज़ार पर पैनी नज़र, और उससे भी पैने कदम।',
  ],
  'The Bold Investor': [
    'बड़े दांव, पूरे यकीन के साथ।',
    'आप यकीन के इंतज़ार में रुकते नहीं।',
  ],
  'The Digital Native': [
    'पहले से डिजिटल-फर्स्ट सोच रहे हैं — सबसे आगे।',
    'तकनीक आपकी फितरत में है, और यह आपके काम करने के तरीके में झलकता है।',
  ],
};

// Hindi archetype name + description, keyed by the English archetype name
// (archetypes.ts only defines English; this is the display-Hindi companion).
const ARCHETYPE_HI: Record<string, { name: string; description: string }> = {
  'The Growth Chaser': {
    name: 'ग्रोथ चेज़र',
    description:
      'हमेशा अगले मुकाम के पीछे, महत्वाकांक्षा और मोमेंटम से प्रेरित।',
  },
  'The Relationship Builder': {
    name: 'रिलेशनशिप बिल्डर',
    description: 'असली रिश्तों और निजी टच के साथ बिज़नेस बनाता है।',
  },
  'The Data-Driven Grower': {
    name: 'डेटा-ड्रिवन ग्रोअर',
    description:
      'बाज़ार पर बारीकी से नज़र रखता है और साफ रणनीति के साथ ढलता है।',
  },
  'The Bold Investor': {
    name: 'बोल्ड इन्वेस्टर',
    description: 'मौका मिलते ही बिज़नेस पर दांव लगाने से नहीं डरता।',
  },
  'The Digital Native': {
    name: 'डिजिटल नेटिव',
    description:
      'पहले से डिजिटल-फर्स्ट सोचता है, बिज़नेस को समझदारी से चलाने के लिए टूल्स इस्तेमाल करता है।',
  },
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

const DIMENSION_LABELS_HI: Record<
  keyof ReportPromptInput['dimensionScores'],
  string
> = {
  growthMindset: 'ग्रोथ माइंडसेट',
  customerRelationship: 'कस्टमर रिलेशनशिप',
  strategicThinking: 'स्ट्रैटेजिक थिंकिंग',
  investmentDiscipline: 'इन्वेस्टमेंट डिसिप्लिन',
  digitalReadiness: 'डिजिटल रेडीनेस',
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

const GOAL_ROADMAPS_HI: Record<
  'grow_customers' | 'grow_revenue' | 'other',
  (businessLabel: string, goalOther?: string) => string[]
> = {
  grow_customers: (businessLabel) => [
    `${businessLabel} के सबसे अच्छे ग्राहक कौन हैं ये तय करो, फिर इस महीने वैसे ही 5 और लोग ढूंढो।`,
    'अपने पिछले 10 खुश ग्राहकों से रेफरल या रिव्यू मांगो — वर्ड-ऑफ-माउथ किसी भी विज्ञापन से तेज़ काम करता है।',
    'एक चैनल चुनो (WhatsApp, Instagram, या लोकल कम्युनिटी ग्रुप्स) और नतीजे जांचने से पहले 30 दिन तक लगातार पोस्ट करो।',
    'ग्राहकों को वापस लाने का आसान तरीका बनाओ — WhatsApp ब्रॉडकास्ट लिस्ट या लॉयल्टी नोट, एक बार के खरीदार को नियमित ग्राहक बना देता है।',
  ],
  grow_revenue: (businessLabel) => [
    `${businessLabel} के टॉप प्रोडक्ट्स/सर्विसेज़ को मार्जिन के हिसाब से देखो, वॉल्यूम के नहीं — जो असल में मुनाफा देता है उस पर ज़ोर दो।`,
    'अपने अगले 10 ग्राहकों पर थोड़ी सी कीमत बढ़ोतरी या बंडल ऑफर टेस्ट करो और नतीजे ट्रैक करो।',
    'इस महीने अपना सबसे बड़ा नियमित खर्च कम करो या दोबारा बातचीत करो — 10% की कटौती भी असर दिखाती है।',
    'अपनी मौजूदा सेल्स बातचीत में एक अपसेल जोड़ो — कोई ऐड-ऑन, बड़ा साइज़, या मेंटेनेंस प्लान।',
  ],
  other: (businessLabel, goalOther) => [
    `लिख लो कि कौन सा एक मेट्रिक बताएगा कि "${goalOther ?? 'आपका लक्ष्य'}" काम कर रहा है — बिना तय किए लक्ष्य हासिल नहीं होता।`,
    `${businessLabel} में इस हफ़्ते सिर्फ इसी पर काम करने के लिए दो घंटे निकालो, रोज़ की भाग-दौड़ को बीच में मत आने दो।`,
    'ऐसा कोई और बिज़नेस ओनर ढूंढो जो कुछ ऐसा ही कर रहा है और पूछो उन्होंने इसे कैसे अप्रोच किया।',
    'एक 30-दिन का चेकपॉइंट तय करो ताकि तिमाही के आखिर में नहीं, जल्दी सुधार कर सको।',
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

const TECH_RECOMMENDATIONS_HI = {
  low: [
    'आपकी डिजिटल मौजूदगी में बढ़ने की काफी गुंजाइश है — एक साधारण वेबसाइट या WhatsApp कैटलॉग भी आपको उन प्रतिस्पर्धियों से आगे कर देगा जो अभी भी सिर्फ ज़ुबानी प्रचार पर चल रहे हैं। यही वो बुनियादी काम है जिसमें MACROPAGE माहिर है।',
    'डिजिटल तरफ अभी बहुत कुछ आसानी से बेहतर हो सकता है — सिर्फ एक बुनियादी ऑनलाइन मौजूदगी ही आपको अभी अलग खड़ा कर देगी। यही नींव बनाना ठीक वही काम है जो MACROPAGE करता है।',
  ],
  mid: [
    'आप डिजिटल टूल्स इस्तेमाल कर रहे हैं, पर जो आपके पास है और जो असल में कन्वर्ट हो रहा है, उसमें फासला है। एक बेहतर वेबसाइट या सही बुकिंग/ऑर्डरिंग फ्लो — जैसा MACROPAGE बनाता है — यह फासला जल्दी पाट सकता है।',
    'आपके पास बुनियादी चीज़ें हैं, पर अनुभव में कहीं न कहीं ग्राहक छूट रहे हैं। उस फ्लो को सुधारना ठीक वही काम है जो MACROPAGE करता है।',
  ],
  high: [
    'आप पहले से ही डिजिटल-फर्स्ट हैं, जो आपको ज़्यादातर छोटे बिज़नेस से आगे रखता है। अगला कदम आमतौर पर वही है जो आपने पहले बनाया है उसका और तेज़, ज़्यादा शार्प, ज़्यादा कन्वर्ज़न-फोकस्ड वर्ज़न — यहीं MACROPAGE जैसी टीम काम आती है।',
    'आप पहले से ही ऑनलाइन सहज हैं। यहां से बात नींव बनाने की नहीं, ऑप्टिमाइज़ेशन की है — वह बारीकी जो MACROPAGE में खास है।',
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

function goalTextHi(goal: string, goalOther?: string): string {
  if (goal === 'grow_customers') return 'अपने ग्राहकों की संख्या बढ़ाना';
  if (goal === 'grow_revenue') return 'अपना रेवेन्यू बढ़ाना';
  return goalOther ? `${goalOther} पर फोकस करना` : 'बिज़नेस को बढ़ाना';
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
    const topLabelHi = DIMENSION_LABELS_HI[topDimensionKey];
    const topScore = input.dimensionScores[topDimensionKey];

    const headlineOptions = HEADLINES[input.archetypeName] ?? [
      `${input.archetypeName}.`,
    ];
    const headlineOptionsHi = HEADLINES_HI[input.archetypeName] ?? [
      input.archetypeName,
    ];
    const headlineIndex = Math.floor(Math.random() * headlineOptions.length);
    const headline = headlineOptions[headlineIndex];
    const headlineHi = headlineOptionsHi[headlineIndex] ?? headlineOptionsHi[0];

    const techQualifier =
      input.techScore < 40
        ? 'shows real upside in tightening up the digital side of things'
        : input.techScore < 70
          ? 'shows a decent foundation with a clear next step'
          : 'shows you are already ahead of most small businesses on the digital front';
    const techQualifierHi =
      input.techScore < 40
        ? 'डिजिटल पक्ष को मज़बूत करने में असली गुंजाइश दिखाता है'
        : input.techScore < 70
          ? 'एक ठीक-ठाक बुनियाद के साथ अगला साफ कदम दिखाता है'
          : 'दिखाता है कि आप ज़्यादातर छोटे बिज़नेस से डिजिटल मोर्चे पर पहले से आगे हैं';

    const businessSnapshot = `${input.name}, here's the read on ${businessLabel}${categorySuffix}: you're aiming to ${goalText(input.goal, input.goalOther)}, and your overall tech-readiness score of ${input.techScore}/100 ${techQualifier}.`;
    const businessSnapshotHi = `${input.name}, ${businessLabel}${categorySuffix} के बारे में यह समझ है: आपका लक्ष्य ${goalTextHi(input.goal, input.goalOther)} है, और आपका कुल टेक-रेडीनेस स्कोर ${input.techScore}/100 ${techQualifierHi}।`;

    const mindsetProfile = `${input.archetypeName} — ${input.archetypeDescription} That instinct shows up clearest in your ${topLabel} score of ${topScore}/100, which is likely to shape how ${businessLabel} grows from here.`;
    const archetypeHi = ARCHETYPE_HI[input.archetypeName] ?? {
      name: input.archetypeName,
      description: input.archetypeDescription,
    };
    const mindsetProfileHi = `${archetypeHi.name} — ${archetypeHi.description} यह झलक साफ आपके ${topLabelHi} स्कोर ${topScore}/100 में दिखती है, जो आगे ${businessLabel} के बढ़ने की दिशा तय कर सकता है।`;

    const goalRoadmap = GOAL_ROADMAPS[goalKey(input.goal)](
      businessLabel,
      input.goalOther,
    );
    const goalRoadmapHi = GOAL_ROADMAPS_HI[goalKey(input.goal)](
      businessLabel,
      input.goalOther,
    );

    const tier = techTier(input.techScore);
    const techIndex = Math.floor(
      Math.random() * TECH_RECOMMENDATIONS[tier].length,
    );
    const techRecommendation = TECH_RECOMMENDATIONS[tier][techIndex];
    const techRecommendationHi = TECH_RECOMMENDATIONS_HI[tier][techIndex];

    const parsed: GeneratedReportJson = {
      headline,
      headlineHi,
      businessSnapshot,
      businessSnapshotHi,
      mindsetProfile,
      mindsetProfileHi,
      goalRoadmap,
      goalRoadmapHi,
      techRecommendation,
      techRecommendationHi,
    };

    return { parsed, raw: JSON.stringify(parsed) };
  }
}
