import {
  QuestionDimension,
  QuestionType,
  OptionKey,
} from './schemas/question.schema';

export interface SeedQuestion {
  text: string;
  textHi?: string;
  order: number;
  timeLimitSeconds: number;
  type: QuestionType;
  dimension?: QuestionDimension;
  options: {
    key: OptionKey;
    text: string;
    textHi?: string;
    points: number;
  }[];
}

// The mindset bank: 3 question variants per dimension, so each participant
// can be handed a randomized set (one random question per dimension) instead
// of everyone seeing the identical 5 questions. See QuestionsService.
export const MINDSET_QUESTIONS: SeedQuestion[] = [
  // digital_readiness
  {
    text: 'How do you currently track your daily sales and customer udhaar (credit)?',
    textHi:
      'आप अपनी रोज़ की बिक्री और ग्राहकों का उधार अभी कैसे रिकॉर्ड करते हैं?',
    order: 1,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'digital_readiness',
    options: [
      {
        key: 'A',
        text: 'Paper register / memory',
        textHi: 'कागज़ के रजिस्टर में / याद से',
        points: 0,
      },
      {
        key: 'B',
        text: 'Excel sheet',
        textHi: 'एक्सेल शीट में',
        points: 1,
      },
      {
        key: 'C',
        text: 'A dedicated app',
        textHi: 'किसी खास ऐप में',
        points: 3,
      },
      {
        key: 'D',
        text: "I don't track it closely",
        textHi: 'मैं इसे बारीकी से ट्रैक नहीं करता',
        points: 0,
      },
    ],
  },
  {
    text: 'A customer asks if they can pay you via UPI instead of cash. You:',
    textHi:
      'एक ग्राहक पूछता है कि क्या वह कैश की जगह UPI से पेमेंट कर सकता है। आप:',
    order: 2,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'digital_readiness',
    options: [
      {
        key: 'A',
        text: 'Say no, cash only',
        textHi: 'मना कर देते हैं, सिर्फ कैश लेते हैं',
        points: 0,
      },
      {
        key: 'B',
        text: 'Say yes, you already have a QR code ready',
        textHi: 'हाँ कहते हैं, आपके पास पहले से QR कोड तैयार है',
        points: 3,
      },
      {
        key: 'C',
        text: 'Say yes, but it takes a while to find/set up a QR code',
        textHi: 'हाँ कहते हैं, पर QR कोड ढूँढने/सेट करने में समय लगता है',
        points: 1,
      },
      {
        key: 'D',
        text: "Say yes, but ask them to pay a family member's account instead",
        textHi:
          'हाँ कहते हैं, पर परिवार के किसी सदस्य के अकाउंट में पेमेंट करने को कहते हैं',
        points: 1,
      },
    ],
  },
  {
    text: 'Someone asks if your shop is on Google Maps or has any online presence. You:',
    textHi:
      'कोई पूछता है कि क्या आपकी दुकान Google Maps पर है या उसकी कोई ऑनलाइन मौजूदगी है। आप:',
    order: 3,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'digital_readiness',
    options: [
      {
        key: 'A',
        text: "No, and haven't thought about it",
        textHi: 'नहीं, और इसके बारे में सोचा भी नहीं',
        points: 0,
      },
      {
        key: 'B',
        text: "No, but you're planning to soon",
        textHi: 'नहीं, पर जल्द करने की सोच रहे हैं',
        points: 1,
      },
      {
        key: 'C',
        text: 'Yes, but you never check or update it',
        textHi: 'हाँ, पर उसे कभी चेक या अपडेट नहीं करते',
        points: 1,
      },
      {
        key: 'D',
        text: 'Yes, and you actively use it to attract new customers',
        textHi: 'हाँ, और नए ग्राहक लाने के लिए सक्रिय रूप से इस्तेमाल करते हैं',
        points: 3,
      },
    ],
  },

  // growth_mindset
  {
    text: 'Your best month ever just happened. What is your very next move?',
    textHi:
      'अभी-अभी आपका अब तक का सबसे बेहतरीन महीना गुज़रा है। आपका अगला कदम क्या होगा?',
    order: 4,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'growth_mindset',
    options: [
      {
        key: 'A',
        text: 'Enjoy it, I earned it',
        textHi: 'इसे एन्जॉय करता/करती हूँ, यह मेरी मेहनत का फल है',
        points: 0,
      },
      {
        key: 'B',
        text: 'Figure out exactly what worked',
        textHi: 'बारीकी से समझता/समझती हूँ कि क्या काम आया',
        points: 2,
      },
      {
        key: 'C',
        text: 'Reinvest immediately in stock/staff',
        textHi: 'तुरंत स्टॉक/स्टाफ में फिर से निवेश करता/करती हूँ',
        points: 2,
      },
      {
        key: 'D',
        text: 'Set a bigger target for next month',
        textHi: 'अगले महीने के लिए और बड़ा लक्ष्य तय करता/करती हूँ',
        points: 3,
      },
    ],
  },
  {
    text: "You've hit your monthly sales target with a week still left. What now?",
    textHi:
      'एक हफ़्ता बाकी रहते ही आपने अपना महीने का सेल्स टारगेट पूरा कर लिया। अब क्या?',
    order: 5,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'growth_mindset',
    options: [
      {
        key: 'A',
        text: "Relax, you've done enough this month",
        textHi: 'आराम करते हैं, इस महीने काफी काम हो चुका',
        points: 0,
      },
      {
        key: 'B',
        text: "Keep going, try to beat last month's best too",
        textHi:
          'आगे बढ़ते रहते हैं, पिछले महीने के रिकॉर्ड को भी तोड़ने की कोशिश करते हैं',
        points: 3,
      },
      {
        key: 'C',
        text: 'Take a short break, resume normal pace',
        textHi: 'थोड़ा ब्रेक लेते हैं, फिर सामान्य रफ़्तार से चलते हैं',
        points: 1,
      },
      {
        key: 'D',
        text: 'Analyze what worked and repeat it for next month',
        textHi: 'समझते हैं क्या काम आया और अगले महीने भी वही दोहराते हैं',
        points: 2,
      },
    ],
  },
  {
    text: 'A younger competitor is growing fast using new marketing tricks. Your first thought?',
    textHi:
      'एक नया, कम उम्र का प्रतिस्पर्धी नई मार्केटिंग तरकीबों से तेज़ी से आगे बढ़ रहा है। आपका पहला विचार?',
    order: 6,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'growth_mindset',
    options: [
      {
        key: 'A',
        text: "They'll fade out eventually",
        textHi: 'एक दिन वे खुद ही पीछे रह जाएँगे',
        points: 0,
      },
      {
        key: 'B',
        text: "Learn what they're doing and try it yourself",
        textHi: 'समझते हैं वे क्या कर रहे हैं और खुद भी आज़माते हैं',
        points: 3,
      },
      {
        key: 'C',
        text: 'Ignore them, focus on your loyal customers',
        textHi:
          'उन्हें नज़रअंदाज़ करते हैं, अपने पुराने वफादार ग्राहकों पर फोकस करते हैं',
        points: 1,
      },
      {
        key: 'D',
        text: 'Complain to other shop owners about unfair competition',
        textHi: 'दूसरे दुकानदारों से इस अनुचित प्रतिस्पर्धा की शिकायत करते हैं',
        points: 0,
      },
    ],
  },

  // customer_relationship
  {
    text: 'A regular customer has not visited in 2 months. What do you do first?',
    textHi:
      'एक नियमित ग्राहक पिछले 2 महीनों से नहीं आया है। सबसे पहले आप क्या करते हैं?',
    order: 7,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'customer_relationship',
    options: [
      {
        key: 'A',
        text: "Wait, they'll come back if they need something",
        textHi: 'इंतज़ार करते हैं, ज़रूरत पड़ने पर वे खुद आ जाएँगे',
        points: 0,
      },
      {
        key: 'B',
        text: 'Message them personally to check in',
        textHi: 'उन्हें निजी तौर पर मैसेज करके हालचाल पूछते हैं',
        points: 3,
      },
      {
        key: 'C',
        text: 'Analyze what changed in your offering',
        textHi: 'सोचते हैं आपकी सर्विस/सामान में क्या बदला',
        points: 2,
      },
      {
        key: 'D',
        text: 'Launch a discount to win them back',
        textHi: 'उन्हें वापस लाने के लिए कोई डिस्काउंट ऑफर करते हैं',
        points: 1,
      },
    ],
  },
  {
    text: 'A customer complains publicly on social media about your service. What do you do?',
    textHi:
      'एक ग्राहक सोशल मीडिया पर सबके सामने आपकी सर्विस की शिकायत करता है। आप क्या करते हैं?',
    order: 8,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'customer_relationship',
    options: [
      {
        key: 'A',
        text: "Ignore it, it'll blow over",
        textHi: 'नज़रअंदाज़ करते हैं, बात अपने आप शांत हो जाएगी',
        points: 0,
      },
      {
        key: 'B',
        text: 'Respond politely, offer to make it right',
        textHi: 'विनम्रता से जवाब देते हैं और गलती सुधारने की पेशकश करते हैं',
        points: 3,
      },
      {
        key: 'C',
        text: 'Delete or hide the comment',
        textHi: 'कमेंट डिलीट या हाइड कर देते हैं',
        points: 1,
      },
      {
        key: 'D',
        text: 'Argue back publicly to defend yourself',
        textHi: 'अपनी सफाई में सबके सामने बहस करते हैं',
        points: 0,
      },
    ],
  },
  {
    text: 'Your busiest regular customer asks for a small favor outside your usual policy. What do you do?',
    textHi:
      'आपका सबसे व्यस्त नियमित ग्राहक आपकी सामान्य नीति से हटकर एक छोटी सी मदद माँगता है। आप क्या करते हैं?',
    order: 9,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'customer_relationship',
    options: [
      {
        key: 'A',
        text: 'Say no, policy is policy for everyone',
        textHi: 'मना कर देते हैं, नीति सबके लिए बराबर है',
        points: 1,
      },
      {
        key: 'B',
        text: 'Bend the rule quietly for them, no big deal',
        textHi: 'चुपचाप उनके लिए नियम में थोड़ी ढील दे देते हैं',
        points: 2,
      },
      {
        key: 'C',
        text: 'Explain your policy warmly and offer an alternative that works for both',
        textHi:
          'अपनी नीति प्यार से समझाते हैं और दोनों के लिए काम आने वाला विकल्प देते हैं',
        points: 3,
      },
      {
        key: 'D',
        text: 'Say yes immediately every time to keep them happy',
        textHi: 'उन्हें खुश रखने के लिए हर बार तुरंत हाँ कह देते हैं',
        points: 1,
      },
    ],
  },

  // strategic_thinking
  {
    text: 'A competitor opens two streets away with lower prices. Your reaction?',
    textHi:
      'दो गलियों की दूरी पर एक प्रतिस्पर्धी कम कीमतों के साथ दुकान खोलता है। आपकी प्रतिक्रिया?',
    order: 10,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'strategic_thinking',
    options: [
      {
        key: 'A',
        text: 'Match their price immediately',
        textHi: 'तुरंत उनकी कीमत के बराबर कर देते हैं',
        points: 1,
      },
      {
        key: 'B',
        text: 'Do nothing, my customers are loyal',
        textHi: 'कुछ नहीं करते, मेरे ग्राहक वफादार हैं',
        points: 0,
      },
      {
        key: 'C',
        text: 'Double down on service/experience',
        textHi: 'अपनी सर्विस/अनुभव पर और ज़्यादा ध्यान देते हैं',
        points: 2,
      },
      {
        key: 'D',
        text: "Study what they're doing differently and adjust",
        textHi:
          'समझते हैं वे अलग क्या कर रहे हैं और उसके अनुसार बदलाव करते हैं',
        points: 3,
      },
    ],
  },
  {
    text: 'Your best-selling product suddenly stops being popular. What is your first move?',
    textHi:
      'आपका सबसे ज़्यादा बिकने वाला प्रोडक्ट अचानक बिकना कम हो जाता है। आपका पहला कदम क्या होगा?',
    order: 11,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'strategic_thinking',
    options: [
      {
        key: 'A',
        text: 'Discount it heavily to clear stock',
        textHi: 'स्टॉक खत्म करने के लिए भारी डिस्काउंट देते हैं',
        points: 1,
      },
      {
        key: 'B',
        text: 'Stop stocking it immediately',
        textHi: 'तुरंत उसे स्टॉक करना बंद कर देते हैं',
        points: 0,
      },
      {
        key: 'C',
        text: 'Ask customers directly why they stopped buying it',
        textHi: 'सीधे ग्राहकों से पूछते हैं कि उन्होंने खरीदना क्यों बंद किया',
        points: 3,
      },
      {
        key: 'D',
        text: 'Wait and see if demand comes back',
        textHi: 'इंतज़ार करते हैं कि मांग वापस आती है या नहीं',
        points: 0,
      },
    ],
  },
  {
    text: 'You get an unexpected chance to supply a big new client, but it means changing how you operate. Do you:',
    textHi:
      'आपको अचानक एक बड़े नए क्लाइंट को सप्लाई करने का मौका मिलता है, पर इसके लिए आपको अपना तरीका बदलना होगा। आप:',
    order: 12,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'strategic_thinking',
    options: [
      {
        key: 'A',
        text: "Decline, too risky to change what's working",
        textHi: 'मना कर देते हैं, जो चल रहा है उसे बदलना जोखिम भरा है',
        points: 0,
      },
      {
        key: 'B',
        text: 'Take it and figure out logistics as you go',
        textHi: 'मौका लेते हैं और आगे बढ़ते हुए बाकी चीज़ें सुलझाते हैं',
        points: 2,
      },
      {
        key: 'C',
        text: 'Study exactly what it will take, then decide with a clear plan',
        textHi:
          'पहले पूरी तरह समझते हैं क्या करना होगा, फिर स्पष्ट योजना के साथ फैसला लेते हैं',
        points: 3,
      },
      {
        key: 'D',
        text: 'Take it only if a friend advises you to',
        textHi: 'सिर्फ तब लेते हैं जब कोई दोस्त सलाह दे',
        points: 1,
      },
    ],
  },

  // investment_discipline
  {
    text: 'You have ₹20,000 of unplanned extra profit this month. Where does it go?',
    textHi:
      'इस महीने आपको बिना सोचे ₹20,000 का अतिरिक्त मुनाफा हुआ है। यह कहाँ खर्च होगा?',
    order: 13,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'investment_discipline',
    options: [
      {
        key: 'A',
        text: 'Save it',
        textHi: 'बचाकर रखते हैं',
        points: 1,
      },
      {
        key: 'B',
        text: 'Marketing / advertising',
        textHi: 'मार्केटिंग / विज्ञापन में',
        points: 2,
      },
      {
        key: 'C',
        text: 'New tech or tools for the business',
        textHi: 'बिज़नेस के लिए नई तकनीक या टूल्स में',
        points: 3,
      },
      {
        key: 'D',
        text: 'More inventory',
        textHi: 'ज़्यादा माल/स्टॉक में',
        points: 1,
      },
    ],
  },
  {
    text: 'A supplier offers a bulk discount if you order 3x your usual stock right now. Do you:',
    textHi:
      'एक सप्लायर अभी आपके सामान्य स्टॉक से 3 गुना ऑर्डर करने पर थोक छूट देने का ऑफर देता है। आप:',
    order: 14,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'investment_discipline',
    options: [
      {
        key: 'A',
        text: 'Buy it all immediately to save money',
        textHi: 'पैसे बचाने के लिए तुरंत पूरा खरीद लेते हैं',
        points: 1,
      },
      {
        key: 'B',
        text: 'Calculate if you can actually sell it before deciding',
        textHi:
          'फैसला लेने से पहले हिसाब लगाते हैं कि क्या आप इसे सच में बेच पाएंगे',
        points: 3,
      },
      {
        key: 'C',
        text: 'Ignore the offer, stick to usual order size',
        textHi: 'ऑफर को नज़रअंदाज़ करते हैं, सामान्य ऑर्डर पर टिके रहते हैं',
        points: 1,
      },
      {
        key: 'D',
        text: 'Borrow money so you can afford the bulk order',
        textHi: 'थोक ऑर्डर के लिए पैसे उधार लेते हैं',
        points: 0,
      },
    ],
  },
  {
    text: "You're deciding between renovating your shop and buying a new tech tool for your business. You:",
    textHi:
      'आप तय कर रहे हैं — दुकान का नवीनीकरण करें या बिज़नेस के लिए नया टेक टूल खरीदें। आप:',
    order: 15,
    timeLimitSeconds: 20,
    type: 'mindset',
    dimension: 'investment_discipline',
    options: [
      {
        key: 'A',
        text: 'Always pick the tech tool without checking impact',
        textHi: 'बिना असर जाँचे हमेशा टेक टूल चुनते हैं',
        points: 1,
      },
      {
        key: 'B',
        text: 'Always pick renovation, it looks nicer',
        textHi: 'हमेशा नवीनीकरण चुनते हैं, दुकान अच्छी दिखती है',
        points: 0,
      },
      {
        key: 'C',
        text: 'Compare which one actually grows revenue more, then decide',
        textHi:
          'तुलना करते हैं कौन सा असल में ज़्यादा रेवेन्यू बढ़ाएगा, फिर फैसला लेते हैं',
        points: 3,
      },
      {
        key: 'D',
        text: 'Flip a coin, both seem fine',
        textHi: 'सिक्का उछालते हैं, दोनों ठीक लगते हैं',
        points: 0,
      },
    ],
  },
];
