// Daily Rotating Fresh Information, Knowledge Quiz, 7-Day Streak & Coin Power-Up Economy
// Used consistently by Server APIs, Static Fallback, and ESP PLAY Gaming Lobby UI

export interface DailyIntelItem {
  id: string;
  category: string;
  title: string;
  fact: string;
  proTip: string;
}

export interface DailyQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  coinReward: number;
  xpReward: number;
}

export interface DailyCheckInReward {
  day: number;
  coins: number;
  xp: number;
  label: string;
}

export interface CoinUtilityBooster {
  id: 'booster_2x_24h' | 'streak_shield';
  name: string;
  hindiName: string;
  description: string;
  coinPrice: number;
  icon: string;
  badge: string;
}

export const FREE_SKILL_PLAY_DAILY_LIMIT = 10;

export const SEVEN_DAY_CHECKIN_REWARDS: DailyCheckInReward[] = [
  { day: 1, coins: 15, xp: 20, label: 'Day 1' },
  { day: 2, coins: 20, xp: 25, label: 'Day 2' },
  { day: 3, coins: 25, xp: 35, label: 'Day 3' },
  { day: 4, coins: 30, xp: 45, label: 'Day 4' },
  { day: 5, coins: 35, xp: 60, label: 'Day 5' },
  { day: 6, coins: 40, xp: 80, label: 'Day 6' },
  { day: 7, coins: 100, xp: 150, label: 'Day 7 Mystery Gift' },
];

export const COIN_UTILITY_BOOSTERS: CoinUtilityBooster[] = [
  {
    id: 'booster_2x_24h',
    name: '2x Coin & EXP Surge (24h)',
    hindiName: '⚡ 2x कॉइन व EXP बूस्टर (24 घंटे)',
    description: '24 घंटे तक हर फ्री स्किल गेम और डेली क्विज़ पर डबल (2x) कॉइन्स व +50% EXP पाएं!',
    coinPrice: 30,
    icon: '⚡',
    badge: 'BEST VALUE',
  },
  {
    id: 'streak_shield',
    name: 'Streak Shield',
    hindiName: '🛡️ स्ट्रीक शील्ड (Streak Saver)',
    description: 'अगर किसी दिन लॉगिन छूट जाए तो आपकी 7-Day कॉइन स्ट्रीक टूटने से बचाता है!',
    coinPrice: 20,
    icon: '🛡️',
    badge: 'STREAK LOCK',
  },
];

export const SPOTLIGHT_GAMES_ROTATION = [
  { key: 'ludo', title: 'Ludo 3D King', hindiTitle: 'लूडो 3D किंग (डाइस)', icon: '🎲', bonusLabel: '+50% EXP +3 Bonus Coins', extraCoins: 3 },
  { key: 'cards', title: 'Oh My Card', hindiTitle: 'ओह माय कार्ड (Hi-Lo)', icon: '🃏', bonusLabel: '+50% EXP +3 Bonus Coins', extraCoins: 3 },
  { key: 'bingo', title: 'Bingo Tambola', hindiTitle: 'बिंगो लाइव तंबोला', icon: '🎱', bonusLabel: '+50% EXP +4 Bonus Coins', extraCoins: 4 },
  { key: 'spy', title: "Who's the Spy", hindiTitle: 'हू इज द स्पाई', icon: '🕵️‍♂️', bonusLabel: '+50% EXP +3 Bonus Coins', extraCoins: 3 },
  { key: 'drawing', title: 'Guess My Drawing', hindiTitle: 'चित्र पहचानो चुनौती', icon: '✏️', bonusLabel: '+50% EXP +3 Bonus Coins', extraCoins: 3 },
  { key: 'werewolf', title: 'Space Werewolf', hindiTitle: 'स्पेस वेयरवोल्फ', icon: '🐺', bonusLabel: '+50% EXP +4 Bonus Coins', extraCoins: 4 },
  { key: 'trickster', title: "Trickster's Cafe", hindiTitle: 'ट्रिकस्टर्स कैफे', icon: '🐊', bonusLabel: '+50% EXP +3 Bonus Coins', extraCoins: 3 },
];

export const DAILY_INTEL_CARDS: DailyIntelItem[] = [
  {
    id: 'intel-1',
    category: '🧠 Brain & Reflex Fact',
    title: 'पज़ल और डाइस गेम्स से फोकस 23% बढ़ता है',
    fact: 'रिसर्च के अनुसार रोज़ 15 मिनट तेज़ निर्णय लेने वाले गेम्स (जैसे Bingo और Oh My Card) खेलने से पैटर्न पहचानने की स्पीड और याददाश्त तेज़ होती है।',
    proTip: 'आज बिना किसी फीस के Free Skill Match खेलकर +10 से +15 Coins जीतें और अपना 2x Booster अनलॉक करें!',
  },
  {
    id: 'intel-2',
    category: '🇮🇳 Digital India Tech Fact',
    title: 'UPI ने भारत को दुनिया का #1 रियल-टाइम पेमेंट लीडर बनाया',
    fact: 'भारत में हर महीने 1,400 करोड़ से अधिक UPI ट्रांजैक्शन होते हैं—जो दुनिया के कुल रियल-टाइम डिजिटल पेमेंट्स का लगभग 46% हिस्सा है।',
    proTip: 'अपनी यूनिक @Username और ESP ID सुरक्षित रखें—वॉइस रूम में दोस्तों को आमंत्रित कर Charms और Ranking बढ़ाएं।',
  },
  {
    id: 'intel-3',
    category: '🎲 Game Theory Strategy',
    title: 'Oh My Card में Probability (संभावना) का नियम',
    fact: 'अगर टेबल पर अभी 2, 3 या 4 का पत्ता आया है, तो अगला पत्ता Higher होने की संभावना 75% से अधिक होती है! प्रो खिलाड़ी इसी गणित से Streak बनाते हैं।',
    proTip: 'लगातार 3 सही अनुमान के बाद संभावित जीत पर स्मार्ट Cashout करना प्रो स्ट्रेटेजी है।',
  },
  {
    id: 'intel-4',
    category: '🚀 Space & Science GK',
    title: 'ISRO का चंद्रयान-3: चाँद के दक्षिणी ध्रुव पर पहली लैंडिंग',
    fact: '23 अगस्त 2023 को भारत चंद्रमा के दक्षिणी ध्रुव (South Pole) के पास सुरक्षित सॉफ्ट लैंडिंग करने वाला दुनिया का पहला देश बना।',
    proTip: 'रोज़ नए GK सवालों का सही जवाब देकर Daily Quiz से मुफ्त +10 Coins और +25 EXP पाएं!',
  },
  {
    id: 'intel-5',
    category: '🎙️ Voice Social Psychology',
    title: 'पर्सनल वॉइस रूम से टीम लीडरशिप मजबूत होती है',
    fact: 'ग्रुप वॉइस रूम्स में होस्टिंग करने और दोस्तों के साथ स्ट्रैटेजी डिस्कस करने से कम्युनिकेशन कॉन्फिडेंस और नेटवर्किंग दोनों बढ़ते हैं।',
    proTip: 'अपने Personal Voice Room में नया Wallpaper लगाएं और 1 गिफ्ट भेजकर Daily Task (+5 Coins) पूरा करें!',
  },
  {
    id: 'intel-6',
    category: '🔥 Streak Power Rule',
    title: '7-दिन लगातार चेक-इन करने से 135+ Extra Coins मिलते हैं',
    fact: 'लगातार 7 दिन गेम हब में आने पर Day 7 Mega Chest (+50 Coins) खुलता है। सिर्फ 20 Coins का Streak Shield आपकी मेहनत को टूटने से बचाता है।',
    proTip: 'कॉइन्स खर्च करके 2x Booster Pass लेने पर अगले 24 घंटे हर स्किल गेम से डबल कॉइन कमाई होती है!',
  },
  {
    id: 'intel-7',
    category: '🐍 Arcade Reflex Insight',
    title: 'Snake Rush में गोल्डन कॉइन (🪙) का स्मार्ट उपयोग',
    fact: 'लाल सेब (+10 स्कोर) के मुकाबले गोल्डन कॉइन सीधे +25 स्कोर देता है—सिर्फ 3 गोल्डन कॉइन पकड़ते ही आप जीत के लक्ष्य के करीब पहुंच जाते हैं।',
    proTip: 'दीवार के पास तेज़ टर्न लेने की जगह बीच के 4x4 स्पेस में घूमना सबसे सुरक्षित तरीका है।',
  },
  {
    id: 'intel-8',
    category: '💡 Smart Economy Tip',
    title: 'VIP Badge सिर्फ दिखावा नहीं—रियल EXP व स्टेटस बूस्टर है',
    fact: 'Silver, Gold या Diamond VIP अनलॉक करने पर हर गेम और टास्क पर 1.25x से 2.0x तक बोनस EXP और स्पेशल प्रोफाइल क्राउन मिलता है।',
    proTip: 'जीते हुए कॉइन्स को बचाकर पहले 2x Booster, फिर Silver VIP या Amazon/Google Play वाउचर अनलॉक करें।',
  },
  {
    id: 'intel-9',
    category: '🔢 Tambola Probability Fact',
    title: 'Bingo में सेंटर "FREE" स्लॉट आपकी जीत को आसान बनाता है',
    fact: '5x5 बिंगो कार्ड में बीच का स्लॉट पहले से मार्क होता है—इसलिए तीसरी रो, तीसरे कॉलम और दोनों डायगोनल को पूरा करने के लिए केवल 4 नंबर चाहिए!',
    proTip: 'जल्दी जीत के लिए Diagonal और 4 Corners पैटर्न पर ध्यान दें।',
  },
  {
    id: 'intel-10',
    category: '🌐 Cyber Safety Fact',
    title: 'कभी भी OTP, UPI PIN या पासवर्ड किसी से शेयर न करें',
    fact: 'किसी भी प्लेटफॉर्म पर असली सहायता टीम या एडमिन आपसे कभी भी आपका पासवर्ड या UPI पिन नहीं पूछते। अपनी ESP खाता सुरक्षा मजबूत रखें।',
    proTip: 'अपनी यूनिक @username सेट करें ताकि दोस्त बिना फोन नंबर देखे आपको खोज सकें।',
  },
  {
    id: 'intel-11',
    category: '♟️ Strategy & Patience',
    title: 'लगातार छोटे Wins बड़े Jackpot से तेज़ रैंक दिलाते हैं',
    fact: 'शीर्ष लीडरबोर्ड खिलाड़ी पहले Free Skill Rounds और 20-Coin टेबल्स से कॉइन्स जोड़ते हैं, फिर Fortune Spin और Pro Tables में हिस्सा लेते हैं।',
    proTip: 'आज के सभी 10 Free Skill Rounds का इस्तेमाल कर अपना बैंक बढ़ाएं!',
  },
  {
    id: 'intel-12',
    category: '🏆 Clan Teamwork Effect',
    title: 'एक्टिव Clan और Friends लिस्ट 2x मज़ा बढ़ाती है',
    fact: 'जब आपके Friends ऑनलाइन होते हैं और आप एक-दूसरे को Moments या Room में सपोर्ट करते हैं, तो आपके Charms और Clan Ranking तेजी से बढ़ते हैं।',
    proTip: 'Ranking टैब से आज के टॉप खिलाड़ियों को देखें और उन्हें Add Friend भेजें!',
  },
];

export const DAILY_QUIZ_BANK: DailyQuizQuestion[] = [
  {
    id: 'quiz-1',
    topic: 'Science & Space 🇮🇳',
    question: 'चंद्रयान-3 के लैंडर का नाम क्या था जिसने चाँद के दक्षिणी ध्रुव पर सफलतापूर्वक लैंड किया?',
    options: ['प्रज्ञान (Pragyan)', 'विक्रम (Vikram)', 'आदित्य (Aditya)', 'गगनयान (Gaganyaan)'],
    correctIndex: 1,
    explanation: 'सही उत्तर: विक्रम (Vikram)! प्रज्ञान रोवर का नाम था और विक्रम लैंडर था।',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-2',
    topic: 'Gaming Math 🃏',
    question: 'ताश की मानक गड्डी (Standard Deck) में कुल कितने पत्ते और कितने लाल पत्ते होते हैं?',
    options: ['52 पत्ते · 26 लाल', '54 पत्ते · 20 लाल', '48 पत्ते · 24 लाल', '52 पत्ते · 13 लाल'],
    correctIndex: 0,
    explanation: 'सही उत्तर: 52 पत्ते और 26 लाल पत्ते (13 पान ♥ + 13 ईंट ♦)!',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-3',
    topic: 'Digital India 💡',
    question: 'भारत के UPI पेमेंट सिस्टम को किस संस्था ने विकसित और संचालित किया है?',
    options: ['SEBI', 'NPCI', 'TRAI', 'ISRO'],
    correctIndex: 1,
    explanation: 'सही उत्तर: NPCI (National Payments Corporation of India)!',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-4',
    topic: 'Esports & Logic 🧠',
    question: 'Ludo के एक मानक पासे (Dice) के विपरीत फलकों (Opposite faces) के अंकों का योग हमेशा कितना होता है?',
    options: ['6', '7', '8', '9'],
    correctIndex: 1,
    explanation: 'सही उत्तर: 7! (1+6=7, 2+5=7, 3+4=7 हमेशा होता है)।',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-5',
    topic: 'General Knowledge 🌍',
    question: 'दुनिया का सबसे बड़ा महासागर (Ocean) कौन सा है?',
    options: ['हिंद महासागर', 'अटलांटिक महासागर', 'प्रशांत महासागर (Pacific)', 'आर्कटिक महासागर'],
    correctIndex: 2,
    explanation: 'सही उत्तर: प्रशांत महासागर (Pacific Ocean)!',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-6',
    topic: 'Bingo Knowledge 🎱',
    question: 'क्लासिक 75-बॉल Bingo Tambola कार्ड में "I" कॉलम में किस रेंज के नंबर होते हैं?',
    options: ['1 से 15', '16 से 30', '31 से 45', '46 से 60'],
    correctIndex: 1,
    explanation: 'सही उत्तर: 16 से 30! (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)।',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-7',
    topic: 'Cyber Tech 🔒',
    question: 'सुरक्षित पासवर्ड रखने का सबसे बेहतरीन तरीका कौन सा है?',
    options: ['123456 रखना', 'अपना मोबाइल नंबर रखना', 'अक्षर + अंक + 8+ लंबाई', 'नाम लिखना'],
    correctIndex: 2,
    explanation: 'सही उत्तर: अक्षर + अंक + कम से कम 8 अक्षरों का यूनिक पासवर्ड!',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-8',
    topic: 'Brain Speed ⚡',
    question: 'अगर एक साँप गेम में 1 सेब = +10 अंक और 1 गोल्डन कॉइन = +25 अंक है, तो 3 सेब + 2 कॉइन = ?',
    options: ['70 अंक', '80 अंक', '90 अंक', '65 अंक'],
    correctIndex: 1,
    explanation: 'सही उत्तर: 80 अंक! (30 + 50 = 80 — यानी तुरंत Snake Rush जीत)!',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-9',
    topic: 'Sports & Pride 🏆',
    question: 'ओलंपिक में व्यक्तिगत स्वर्ण पदक जीतने वाले भारत के पहले ट्रैक एंड फील्ड एथलीट कौन हैं?',
    options: ['मिल्खा सिंह', 'नीरज चोपड़ा', 'पी.टी. उषा', 'अभिनव बिंद्रा'],
    correctIndex: 1,
    explanation: 'सही उत्तर: नीरज चोपड़ा (टोक्यो ओलंपिक भाला फेंक स्वर्ण)!',
    coinReward: 10,
    xpReward: 25,
  },
  {
    id: 'quiz-10',
    topic: 'Smart Math 🔢',
    question: 'अगर आपके पास 2x Coin Booster है और आप डेली क्विज़ से 10 कॉइन जीतते हैं, तो कुल कितने कॉइन मिलेंगे?',
    options: ['15 Coins', '20 Coins', '25 Coins', '12 Coins'],
    correctIndex: 1,
    explanation: 'सही उत्तर: 20 Coins! 2x Booster आपके क्विज़ और स्किल गेम रिवॉर्ड्स को दोगुना कर देता है।',
    coinReward: 10,
    xpReward: 25,
  },
];

export function getDaySeedFromDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDailyIntelForDate(dateStr: string): DailyIntelItem {
  const seed = getDaySeedFromDate(dateStr);
  return DAILY_INTEL_CARDS[seed % DAILY_INTEL_CARDS.length];
}

export function getDailyQuizForDate(dateStr: string): DailyQuizQuestion {
  const seed = getDaySeedFromDate(dateStr);
  return DAILY_QUIZ_BANK[(seed + 3) % DAILY_QUIZ_BANK.length];
}

export function getSpotlightGameForDate(dateStr: string) {
  const seed = getDaySeedFromDate(dateStr);
  return SPOTLIGHT_GAMES_ROTATION[seed % SPOTLIGHT_GAMES_ROTATION.length];
}

export function getYesterdayDateString(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * India Standard Time (IST / UTC+05:30) helpers so daily tasks & check-in reset
 * strictly at 12:00 AM (00:00:00 IST) midnight every night.
 */
export function getIstDateString(referenceMs: number = Date.now()): string {
  const istMs = referenceMs + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().slice(0, 10);
}

export function getLiveIstTimeMeta(referenceMs: number = Date.now()) {
  const istDateObj = new Date(referenceMs + 5.5 * 60 * 60 * 1000);
  const istDate = istDateObj.toISOString().slice(0, 10);
  const hh = istDateObj.getUTCHours();
  const mm = istDateObj.getUTCMinutes();
  const ss = istDateObj.getUTCSeconds();
  const istTimeLabel = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} IST`;
  const elapsedSec = hh * 3600 + mm * 60 + ss;
  const secondsUntilMidnight = Math.max(1, 86400 - elapsedSec);
  const nextResetAtIso = new Date(referenceMs + secondsUntilMidnight * 1000).toISOString();
  return {
    serverIso: new Date(referenceMs).toISOString(),
    istDate,
    istTimeLabel,
    secondsUntilMidnight,
    nextResetAtIso,
  };
}
