import React, { useState } from 'react';
import { 
  Sparkles, 
  Coins, 
  TrendingUp, 
  Smartphone, 
  Network, 
  Zap, 
  Clock, 
  UserCheck, 
  Users, 
  Share2, 
  Gift, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Download,
  Award,
  Wallet,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Calculator,
  Layers,
  Check,
  Star,
  Info,
  Scale
} from 'lucide-react';
import type { UserProfile, PlatformSettings } from '../types/index.ts';

interface ServiceDetailViewProps {
  selectedServiceCode: string;
  onSelectServiceCode: (code: string) => void;
  onSelectServiceForRegistration: (serviceCode: string, fee: number) => void;
  currentUser: UserProfile | null;
  onGoToDashboard: () => void;
  settings: PlatformSettings;
  onOpenLegalModal?: () => void;
}

export interface SubServicePlan {
  planName: string;
  fee: number;
  welcomeBonus?: string;
  directReward: string;
  levelRewards?: string;
  highlight?: string;
  notes?: string;
}

export interface ComprehensiveServiceData {
  code: string;
  orderNumber: string;
  orderEmoji: string;
  fullListName: string;
  hindiListTitle: string;
  menuTitle: string;
  englishName: string;
  hindiName: string;
  tagline: string;
  hindiTagline: string;
  joiningFeeTiers: number[];
  defaultFee: number;
  dailyEarningEst: string;
  monthlyEarningEst: string;
  referralBonusPercent: number;
  icon: any;
  colorScheme: {
    primary: string;
    badgeBg: string;
    border: string;
    gradient: string;
  };
  subServices: {
    title: string;
    description: string;
    plans: SubServicePlan[];
  }[];
  whatYouGet: string[];
  hindiWhatYouGet: string[];
  referralIncomeDetails: {
    directCommission: string;
    teamLevelCommission: string;
    exampleMath: string;
  };
  dailyTaskWorkflow: string[];
  activationSteps: string[];
  legalStatus: {
    actName: string;
    complianceNote: string;
  };
}

export const COMPREHENSIVE_SERVICES: ComprehensiveServiceData[] = [
  // 1. EARN MONEY ONLINE (EMO)
  {
    code: 'EMO',
    orderNumber: '01',
    orderEmoji: '1️⃣',
    fullListName: '1️⃣ EARN MONEY ONLINE (EMO)',
    hindiListTitle: 'अबाउट फर्स्ट सर्विस: अबाउट अर्न मनी ऑनलाइन',
    menuTitle: 'अबाउट फर्स्ट सर्विस: अबाउट अर्न मनी ऑनलाइन (EMO)',
    englishName: 'EARN MONEY ONLINE (EMO)',
    hindiName: 'अर्न मनी ऑनलाइन',
    tagline: 'Dual Income System: EMO Normal 50% Direct & EMO Fast 55% Direct / 60% 3-Level Matrix',
    hindiTagline: 'नॉर्मल में 50% डायरेक्ट तथा फास्ट में 55% डायरेक्ट या 60% 3-लेवल इनकम (₹10 से शुरू)',
    joiningFeeTiers: [10, 50, 100, 500, 1000],
    defaultFee: 10,
    dailyEarningEst: '₹5 - ₹550 / invite',
    monthlyEarningEst: '₹500 - ₹16,500 / month',
    referralBonusPercent: 55,
    icon: Coins,
    colorScheme: {
      primary: 'text-emerald-700',
      badgeBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-500',
      gradient: 'from-emerald-900 via-teal-900 to-slate-900',
    },
    subServices: [
      {
        title: '1️⃣ EMO NORMAL EARNING SERVICE (50% Flat Direct)',
        description: 'इस सर्विस को आप मात्र ₹10, ₹50 या ₹100 से शुरू कर सकते हैं। हर वेरिफाइड इनविटेशन पर 50% सीधा कमीशन तुरंत वॉलेट में प्राप्त होता है।',
        plans: [
          { planName: 'EMO Normal Tier-1', fee: 10, directReward: '₹5 (50% प्रति Invitation)', highlight: 'Welcome Offer (मात्र ₹10)' },
          { planName: 'EMO Normal Tier-2', fee: 50, directReward: '₹25 (50% प्रति Invitation)', highlight: 'Most Popular' },
          { planName: 'EMO Normal Tier-3', fee: 100, directReward: '₹50 (50% प्रति Invitation)', highlight: '50% Assured Profit' },
        ]
      },
      {
        title: '2️⃣ EMO FAST INCOME EARNING SERVICE (55% Direct या 60% 3-Level)',
        description: 'फास्ट सर्विस में आपको 55% सीधा डायरेक्ट इनविटेशन या 60% (35% + 15% + 10%) 3-लेवल टीम कमीशन मिलता है। इसे ₹100, ₹500 या ₹1000 से जॉइन कर सकते हैं।',
        plans: [
          { 
            planName: 'EMO Fast Tier-1', 
            fee: 100, 
            directReward: '₹55 Direct (55%)', 
            levelRewards: '3-Level (60%): L1 ₹35 (35%) | L2 ₹15 (15%) | L3 ₹10 (10%)',
            notes: 'संतुलित व लॉस-प्रूफ 3-लेवल इनकम सिस्टम'
          },
          { 
            planName: 'EMO Fast Tier-2', 
            fee: 500, 
            directReward: '₹275 Direct (55%)', 
            levelRewards: '3-Level (60%): L1 ₹175 (35%) | L2 ₹75 (15%) | L3 ₹50 (10%)',
            notes: 'उच्च मुनाफा व 3-लेवल ऑटो डिस्ट्रीब्यूशन'
          },
          { 
            planName: 'EMO Fast Tier-3', 
            fee: 1000, 
            directReward: '₹550 Direct (55%)', 
            levelRewards: '3-Level (60%): L1 ₹350 (35%) | L2 ₹150 (15%) | L3 ₹100 (10%)',
            notes: 'अधिकतम रिटर्न: ₹550 डायरेक्ट या ₹600 तक टीम बंटवारा'
          },
        ]
      }
    ],
    whatYouGet: [
      'Verified Member Roll Number & Digital ID Card issued immediately',
      'Dual earning rights: Normal 50% Direct & Fast 55% Direct / 60% 3-Level affiliate matrix',
      'Instant direct UPI withdrawal facility into PhonePe / GPay / Paytm',
      'Cross-plan referral flexibility with your universal Sponsor Code',
      'Official invoice & membership agreement',
    ],
    hindiWhatYouGet: [
      'पंजीकरण होते ही आपका आधिकारिक रोल नंबर व वेरिफाइड डिजिटल आईडी कार्ड',
      'नॉर्मल 50% डायरेक्ट और फास्ट 55% डायरेक्ट / 60% 3-लेवल दोनों से कमाने का अधिकार',
      '₹50 की न्यूनतम सीमा के साथ सीधे अपने UPI बैंक खाते में तुरंत निकासी',
      'ऑफिशियल चैटिंग क्लब में फाउंडर संतोष कुमार द्वारा प्रतिदिन मार्गदर्शन',
      'आधिकारिक डिजिटल रसीद व सदस्य आईडी',
    ],
    referralIncomeDetails: {
      directCommission: 'Normal में 50% (₹5–₹50) तथा Fast में 55% (₹55–₹550) प्रति डायरेक्ट इनविटेशन',
      teamLevelCommission: 'Fast सर्विस में कुल 60% 3-लेवल डिस्ट्रीब्यूशन (Level-1: 35%, Level-2: 15%, Level-3: 10%)',
      exampleMath: 'अगर आप ₹100 के EMO Fast प्लान से 10 दोस्तों को जोड़ते हैं, तो आपको सीधे ₹550 (55%) मिलेंगे। उनकी 3-लेवल टीम से 35%, 15%, 10% अतिरिक्त आय होगी।',
    },
    dailyTaskWorkflow: [
      '1. अपने ESP डैशबोर्ड में लॉगिन करें',
      '2. अपना रेफरल लिंक और स्पॉन्सर रोल नंबर कॉपी करें',
      '3. व्हाट्सएप और सोशल मीडिया पर इनविटेशन लिंक शेयर करें',
      '4. नया सदस्य जुड़ते ही कमीशन तुरंत वॉलेट में जमा होता है',
    ],
    activationSteps: [
      'नीचे से अपनी क्षमता अनुसार ₹10, ₹50, ₹100, ₹500 या ₹1000 का प्लान चुनें',
      'एडमिन UPI (8877490845@SPICEPAY) पर भुगतान करें',
      '12 अंकों का बैंक UTR नंबर सबमिट करके आईडी तुरंत एक्टिवेट करें',
    ],
    legalStatus: {
      actName: 'Consumer Protection (Direct Selling) Rules, 2021',
      complianceNote: '100% नियमानुकूल फ्रीलांस माइक्रो-टास्क एवं लॉस-प्रूफ एफिलिएट मॉडल।'
    }
  },

  // 2. MAKE MONEY ONLINE (MMO)
  {
    code: 'MMO',
    orderNumber: '02',
    orderEmoji: '2️⃣',
    fullListName: '2️⃣ MAKE MONEY ONLINE (MMO)',
    hindiListTitle: 'अबाउट सेकंड सर्विस: अबाउट मेक मनी ऑनलाइन',
    menuTitle: 'अबाउट सेकंड सर्विस: अबाउट मेक मनी ऑनलाइन (MMO)',
    englishName: 'MAKE MONEY ONLINE (MMO)',
    hindiName: 'मेक मनी ऑनलाइन',
    tagline: 'Flat 55% Business & YouTube Promotion Payouts on Every Verified Tier',
    hindiTagline: 'व्यवसाय, दुकान व यूट्यूब का प्रचार करवाएं और हर टियर पर फ्लैट 55% (₹28 से ₹550) सीधा नकद पाएं',
    joiningFeeTiers: [50, 100, 500, 1000],
    defaultFee: 50,
    dailyEarningEst: '₹28 - ₹550 / invite',
    monthlyEarningEst: '₹1,500 - ₹18,000 / month',
    referralBonusPercent: 55,
    icon: TrendingUp,
    colorScheme: {
      primary: 'text-amber-700',
      badgeBg: 'bg-amber-600 text-white',
      border: 'border-amber-500',
      gradient: 'from-amber-900 via-yellow-900 to-slate-900',
    },
    subServices: [
      {
        title: '📢 BUSINESS & SOCIAL MEDIA PROMOTION (55% FLAT COMMISSION)',
        description: 'अपने व्यवसाय, दुकान, यूट्यूब चैनल या सेवा का विज्ञापन करवाएं। हर प्लान टियर पर एक समान 55% सीधा नकद कमीशन तय किया गया है:',
        plans: [
          { planName: 'MMO Basic Promo', fee: 50, directReward: '₹28 प्रति Invitation (55%)', highlight: '55% Flat Direct' },
          { planName: 'MMO Standard Promo', fee: 100, directReward: '₹55 प्रति Invitation (55%)', highlight: 'Most Popular' },
          { planName: 'MMO Premium Promo', fee: 500, directReward: '₹275 प्रति Invitation (55%)', highlight: 'Bulk Ad Reach' },
          { planName: 'MMO Business Partner', fee: 1000, directReward: '₹550 प्रति Invitation (55%)', highlight: 'Maximum Profit' },
        ]
      }
    ],
    whatYouGet: [
      'Official Business Promotional Banner & Ad placement rights',
      'Flat 55% commission (₹28 to ₹550) on every verified business/member invitation',
      'Access to ready-made high-converting social media promotional creatives',
      'Verified MMO Advertiser badge on Member ID Card',
      'Priority settlement for daily promotional payouts',
    ],
    hindiWhatYouGet: [
      'अपने व्यवसाय या यूट्यूब चैनल के लिए आधिकारिक प्रचार बैनर और विज्ञापन अधिकार',
      'प्रत्येक व्यावसायिक इनविटेशन पर फ्लैट 55% (₹28 से ₹550 तक) का सीधा नकद लाभ',
      'रेडिमेड सोशल मीडिया पोस्टर्स और विज्ञापन सामग्री का निःशुल्क उपयोग',
      'सदस्य आईडी कार्ड पर वेरिफाइड MMO एडवरटाइजर बैज',
      'दैनिक पेआउट का प्राथमिकता के आधार पर सीधे बैंक में ट्रांसफर',
    ],
    referralIncomeDetails: {
      directCommission: 'सभी टियर पर एक समान फ्लैट 55% (₹28, ₹55, ₹275, ₹550 प्रति इनविटेशन)',
      teamLevelCommission: 'बिना किसी जटिलता के तुरंत डायरेक्ट वॉलेट क्रेडिट',
      exampleMath: 'अगर आप ₹100 वाले MMO प्लान से 4 व्यापारियों या दोस्तों को जोड़ते हैं, तो ₹220 (55% x 4) तुरंत आपके वॉलेट में आ जाएंगे।',
    },
    dailyTaskWorkflow: [
      '1. MMO प्रोमोशनल पोस्टर्स डैशबोर्ड से डाउनलोड करें',
      '2. स्थानीय दुकानदारों, यूट्यूबर्स और छात्रों को ESP विज्ञापन प्लान दिखाएं',
      '3. उनके पंजीकरण पर प्रति व्यक्ति फ्लैट 55% (₹28 से ₹550) कमाएं',
    ],
    activationSteps: [
      '₹50, ₹100, ₹500 या ₹1000 का MMO प्लान चुनें',
      'पेमेंट करके 12-अंकों का UTR दर्ज करें',
      'तुरंत प्रोमोशनल अधिकार और आईडी कार्ड प्राप्त करें',
    ],
    legalStatus: {
      actName: 'Consumer Protection Act, 2019 & IT Act 2000',
      complianceNote: 'वास्तविक डिजिटल एडवरटाइजिंग व मर्चेंट प्रमोशन सर्विस। 100% वैध व्यापारिक मॉडल।'
    }
  },

  // 3. MAKE ONLINE MONEY (MOM)
  {
    code: 'MOM',
    orderNumber: '03',
    orderEmoji: '3️⃣',
    fullListName: '3️⃣ MAKE ONLINE MONEY (MOM)',
    hindiListTitle: 'अबाउट थर्ड सर्विस: अबाउट मेक ऑनलाइन मनी',
    menuTitle: 'अबाउट थर्ड सर्विस: अबाउट मेक ऑनलाइन मनी (MOM)',
    englishName: 'MAKE ONLINE MONEY (MOM)',
    hindiName: 'मेक ऑनलाइन मनी (डिजिटल स्टार्टर किट)',
    tagline: 'High-Value Digital Asset Kit + Social Promotion + Exact 70% Direct Affiliate Commission',
    hindiTagline: 'पंजीकरण पर ₹1500 मूल्य की डिजिटल किट (AI प्रॉम्प्ट्स, पोस्टर्स) और सटीक 70% डायरेक्ट एफिलिएट कमीशन',
    joiningFeeTiers: [100, 499, 999, 4999],
    defaultFee: 499,
    dailyEarningEst: '₹70 - ₹3,499 / refer',
    monthlyEarningEst: '₹3,000 - ₹35,000 / month',
    referralBonusPercent: 70,
    icon: Smartphone,
    colorScheme: {
      primary: 'text-teal-700',
      badgeBg: 'bg-teal-600 text-white',
      border: 'border-teal-500',
      gradient: 'from-teal-900 via-cyan-950 to-slate-900',
    },
    subServices: [
      {
        title: '📦 DIGITAL ASSET KITS & EXACT 70% AFFILIATE PAYOUT',
        description: 'MOM में जॉइनिंग पर आपको डिजिटल एसेट किट (Social Media Graphics Pack, AI Prompts, Video Templates) मिलती है और हर सेल पर सटीक 70% सीधा कमीशन मिलता है:',
        plans: [
          { planName: 'MOM Starter Asset Kit', fee: 100, welcomeBonus: '₹1500 Digital Starter Kit', directReward: '₹70 प्रति Invitation (70%)', highlight: '70% Affiliate Share' },
          { planName: 'MOM Bronze Marketing Suite', fee: 499, welcomeBonus: '₹3500 Premium Creative Pack', directReward: '₹349 प्रति Refer (70%)', highlight: 'Full Social Suite' },
          { planName: 'MOM Silver Creator Bundle', fee: 999, welcomeBonus: '₹7500 AI & Video Bundle', directReward: '₹699 प्रति Refer (70%)', highlight: 'Pro Creator Kit' },
          { planName: 'MOM VIP Master Agency', fee: 4999, welcomeBonus: '₹25,000 Complete Agency Suite', directReward: '₹3,499 प्रति Refer (70%)', highlight: 'VIP Lifetime Agency' },
        ]
      }
    ],
    whatYouGet: [
      'Instant access to ₹1500+ valuable Digital Asset Starter Kit on activation',
      '500+ High-Converting AI Prompts for ChatGPT, Gemini and Canva design',
      'Free Social Media Promotion of your personal profiles across our network',
      'Exact 70% direct referral commission (₹70 to ₹3,499) on every kit purchased',
      'Digital Certificate of Affiliate Partnership and Verified ID Card',
    ],
    hindiWhatYouGet: [
      'सक्रिय होते ही ₹1500+ मूल्य की वास्तविक डिजिटल स्टार्टर किट का तुरंत एक्सेस',
      'चैटजीपीटी और कैनवा डिजाइनिंग के 500+ रेडीमेड एआई प्रॉम्प्ट्स',
      'हमारे नेटवर्क पर आपके प्रोफाइल या यूट्यूब का आधिकारिक डिजिटल प्रचार',
      'आपके लिंक से होने वाली हर डिजिटल किट खरीद पर सटीक 70% (₹70 से ₹3,499) सीधा कमीशन',
      'वेरिफाइड एफिलिएट पार्टनरशिप सर्टिफिकेट व डिजिटल आईडी कार्ड',
    ],
    referralIncomeDetails: {
      directCommission: 'सटीक 70% सीधा पारदर्शी कमीशन (₹70, ₹349, ₹699, ₹3,499 प्रति व्यक्ति)',
      teamLevelCommission: 'डिजिटल प्रोडक्ट बिक्री पर आधारित वैध एफिलिएट मार्जिन',
      exampleMath: 'अगर आप ₹499 वाले ब्रॉन्ज पैक से 3 दोस्तों को जोड़ते हैं, तो ₹1,047 (₹349 x 3) की सीधी नकद कमाई आपके वॉलेट में होगी।',
    },
    dailyTaskWorkflow: [
      '1. डिजिटल स्टार्टर किट और सोशल पोस्टर्स डाउनलोड करें',
      '2. छात्रों और युवाओं को डिजिटल कौशल किट के बारे में बताएं',
      '3. बिक्री सफल होते ही सटीक 70% कमीशन तुरंत वॉलेट में प्राप्त करें',
    ],
    activationSteps: [
      '₹100, ₹499, ₹999 या ₹4999 का डिजिटल किट प्लान चुनें',
      'एडमिन UPI पर भुगतान करके UTR सबमिट करें',
      'तुरंत डिजिटल एसेट बंडल डाउनलोड करें और कमाई शुरू करें',
    ],
    legalStatus: {
      actName: 'Consumer Protection (Direct Selling) Rules, 2021 (Rule 5)',
      complianceNote: '100% नियमानुकूल। शुल्क के बदले वास्तविक डिजिटल उत्पाद (Deliverables) दिए जाते हैं।'
    }
  },

  // 4. ONLINE EARNING SYSTEM (OES)
  {
    code: 'OES',
    orderNumber: '04',
    orderEmoji: '4️⃣',
    fullListName: '4️⃣ ONLINE EARNING SYSTEM (OES)',
    hindiListTitle: 'अबाउट फोर्थ सर्विस: अबाउट ऑनलाइन अर्निंग सिस्टम',
    menuTitle: 'अबाउट फोर्थ सर्विस: अबाउट ऑनलाइन अर्निंग सिस्टम (OES)',
    englishName: 'ONLINE EARNING SYSTEM (OES)',
    hindiName: 'ऑनलाइन अर्निंग सिस्टम (क्रिएटर टूल्स व 5-लेवल)',
    tagline: 'Creator Tools Suite + 70% Total 5-Level Matrix (L1: 40%, L2: 12%, L3: 8%, L4: 5%, L5: 5%)',
    hindiTagline: 'स्टूडेंट व क्रिएटर टूल्स (रिज्यूमे मेकर, आईडी कार्ड) और 70% कुल 5-स्तरीय लॉस-प्रूफ एफिलिएट मैट्रिक्स',
    joiningFeeTiers: [500, 1000, 5000, 10000],
    defaultFee: 500,
    dailyEarningEst: '₹200 - ₹4,000 / refer',
    monthlyEarningEst: '₹6,000 - ₹1,20,000 / month',
    referralBonusPercent: 40,
    icon: Network,
    colorScheme: {
      primary: 'text-blue-700',
      badgeBg: 'bg-blue-600 text-white',
      border: 'border-blue-500',
      gradient: 'from-blue-900 via-indigo-950 to-slate-900',
    },
    subServices: [
      {
        title: '💻 ENTERPRISE CREATOR TOOLS & 70% TOTAL 5-LEVEL MATRIX',
        description: 'OES में ₹500 से ₹10,000 तक के सभी प्लान पर कुल 70% का पारदर्शी 5-लेवल कमीशन बंटवारा (L1: 40%, L2: 12%, L3: 8%, L4: 5%, L5: 5% = कुल 70%) सक्रिय है:',
        plans: [
          { 
            planName: 'OES Starter ₹500', 
            fee: 500, 
            welcomeBonus: '₹1500 Student Resume & ID Tools', 
            directReward: '₹200 Direct (L1: 40%)', 
            levelRewards: '5-Level (70%): L1 ₹200 (40%) | L2 ₹60 (12%) | L3 ₹40 (8%) | L4 ₹25 (5%) | L5 ₹25 (5%)',
            highlight: 'Entry Level ₹500',
          },
          { 
            planName: 'OES Prime ₹1,000', 
            fee: 1000, 
            welcomeBonus: '₹2500 Creator Tool Access', 
            directReward: '₹400 Direct (L1: 40%)', 
            levelRewards: '5-Level (70%): L1 ₹400 (40%) | L2 ₹120 (12%) | L3 ₹80 (8%) | L4 ₹50 (5%) | L5 ₹50 (5%)',
            highlight: 'SaaS Creator Suite',
          },
          { 
            planName: 'OES Executive ₹5,000', 
            fee: 5000, 
            welcomeBonus: '₹10,000 Agency Software', 
            directReward: '₹2,000 Direct (L1: 40%)', 
            levelRewards: '5-Level (70%): L1 ₹2000 | L2 ₹600 | L3 ₹400 | L4 ₹250 | L5 ₹250',
            highlight: '40% Direct + 30% Levels 2-5'
          },
          { 
            planName: 'OES Elite ₹10,000', 
            fee: 10000, 
            welcomeBonus: '₹25,000 Master Franchise Suite', 
            directReward: '₹4,000 Direct (L1: 40%)', 
            levelRewards: '5-Level (70%): L1 ₹4000 | L2 ₹1200 | L3 ₹800 | L4 ₹500 | L5 ₹500',
            highlight: 'VIP Master Franchise'
          },
        ]
      }
    ],
    whatYouGet: [
      'Full access to online Smart Resume Maker & Verified ID Card generator',
      'Total 70% Generational 5-Level Matrix (40% L1 + 12% L2 + 8% L3 + 5% L4 + 5% L5)',
      'Starts sustainably from ₹500 Starter Tier up to ₹10,000 Elite Tier',
      'VIP Leader Matrix dashboard with downline CRM analytics',
      'Dedicated Admin Priority Support on WhatsApp',
    ],
    hindiWhatYouGet: [
      'ऑनलाइन स्मार्ट रिज्यूमे मेकर और वेरिफाइड आईडी कार्ड जनरेटर सॉफ्टवेयर का पूर्ण एक्सेस',
      '5 लेवल तक कुल 70% पारदर्शी जनरेशनल मैट्रिक्स (L1: 40%, L2: 12%, L3: 8%, L4: 5%, L5: 5%)',
      'मात्र ₹500 के स्टार्टर प्लान से ₹10,000 के एलीट टियर तक सभी के लिए उपलब्ध',
      'वीआईपी लीडर मैट्रिक्स डैशबोर्ड और डाउनलाइन सीआरएम टूल्स',
      'व्हाट्सएप पर फाउंडर व एडमिन द्वारा प्राथमिकता सहायता',
    ],
    referralIncomeDetails: {
      directCommission: 'Level-1 डायरेक्ट 40% (₹200 से ₹4,000 प्रति व्यक्ति)',
      teamLevelCommission: 'Levels 2–5 से अतिरिक्त 30% (12% + 8% + 5% + 5%) यानी कुल 70% पेआउट मैट्रिक्स',
      exampleMath: 'अगर आप ₹500 वाले स्टार्टर प्लान से 5 साथियों को जोड़ते हैं तो ₹1,000 डायरेक्ट (40%) और आगे 5 लेवल तक 12%, 8%, 5%, 5% लगातार मिलता रहेगा।',
    },
    dailyTaskWorkflow: [
      '1. OES सॉफ्टवेयर टूल्स और रिज्यूमे जनरेटर का उपयोग करें',
      '2. छात्रों व नौकरी चाहने वालों को पेशेवर रिज्यूमे और आईडी कार्ड बनाकर दें',
      '3. नए सदस्यों को 5-लेवल एफिलिएट सिस्टम में शामिल करें',
    ],
    activationSteps: [
      '₹500, ₹1000, ₹5000 या ₹10000 का OES प्लान चुनें',
      'एडमिन UPI पर एक्टिवेशन चार्ज जमा करके UTR दर्ज करें',
      'सॉफ्टवेयर टूल्स और 5-लेवल अर्निंग राइट्स तुरंत सक्रिय करें',
    ],
    legalStatus: {
      actName: 'Consumer Protection (Direct Selling) Rules, 2021',
      complianceNote: 'सॉफ्टवेयर-एज-ए-सर्विस (SaaS) एवं लॉस-प्रूफ 70% टोटल कैप मल्टी-टियर एफिलिएट मॉडल।'
    }
  },

  // 5. MONEY MAKING SYSTEM (MMS)
  {
    code: 'MMS',
    orderNumber: '05',
    orderEmoji: '5️⃣',
    fullListName: '5️⃣ MONEY MAKING SYSTEM (MMS)',
    hindiListTitle: 'अबाउट फिफ्थ सर्विस: अबाउट मनी मेकिंग सिस्टम',
    menuTitle: 'अबाउट फिफ्थ सर्विस: अबाउट मनी मेकिंग सिस्टम (MMS)',
    englishName: 'MONEY MAKING SYSTEM (MMS)',
    hindiName: 'मनी मेकिंग सिस्टम',
    tagline: '5 Specialized Branches: 50% Direct + 20% Levels 2-5 Matrix (Total 70% Payout Cap)',
    hindiTagline: 'MMS में 5 विशिष्ट सेवाएं: 50% सीधा डायरेक्ट + 20% लेवल 2 से 5 तक (कुल 70% सुरक्षित पेआउट)',
    joiningFeeTiers: [100, 250, 500, 1000, 2500],
    defaultFee: 250,
    dailyEarningEst: '₹50 - ₹1,250 / invite',
    monthlyEarningEst: '₹3,600 - ₹37,500 / month',
    referralBonusPercent: 50,
    icon: Zap,
    colorScheme: {
      primary: 'text-yellow-700',
      badgeBg: 'bg-yellow-500 text-slate-950',
      border: 'border-yellow-500',
      gradient: 'from-yellow-900 via-amber-950 to-slate-900',
    },
    subServices: [
      {
        title: '⚡ 5 SPECIALIZED MMS EARNING BRANCHES (50% DIRECT + 20% L2-L5)',
        description: 'MMS की सभी 5 शाखाओं में 50% डायरेक्ट कमीशन के साथ Level 2–5 तक कुल 20% (L2: 8%, L3: 5%, L4: 4%, L5: 3%) यानी कुल 70% पारदर्शी वितरण सक्रिय है:',
        plans: [
          { planName: '1. NLIS (Non Level Income Service)', fee: 100, directReward: '₹50 Direct (50%)', levelRewards: 'फास्ट नॉन-लेवल 50% डायरेक्ट पेआउट', highlight: 'Non-Level Fast Payout' },
          { planName: '2. LIS (Level Income Service)', fee: 250, directReward: '₹125 Direct (50%)', levelRewards: 'L2: ₹20 (8%) | L3: ₹13 (5%) | L4: ₹10 (4%) | L5: ₹8 (3%)', highlight: 'Level Income Matrix' },
          { planName: '3. ULIS (Ultra Level Income Service)', fee: 500, directReward: '₹250 Direct (50%)', levelRewards: 'L2: ₹40 (8%) | L3: ₹25 (5%) | L4: ₹20 (4%) | L5: ₹15 (3%)', highlight: 'Deep 5-Level Matrix' },
          { planName: '4. PIS (Pro Income Service)', fee: 1000, directReward: '₹500 Direct (50%)', levelRewards: 'L2: ₹80 (8%) | L3: ₹50 (5%) | L4: ₹40 (4%) | L5: ₹30 (3%)', highlight: 'Pro Level Rewards' },
          { planName: '5. UPIS (Ultra Pro Income Service)', fee: 2500, directReward: '₹1,250 Direct (50%)', levelRewards: 'L2: ₹200 (8%) | L3: ₹125 (5%) | L4: ₹100 (4%) | L5: ₹75 (3%)', highlight: 'Total 70% VIP Cap' },
        ]
      }
    ],
    whatYouGet: [
      'Access to all 5 specialized MMS sub-service income modules',
      '50% Direct Commission + 20% Levels 2-5 Matrix (8% + 5% + 4% + 3% = 70% total)',
      'VIP Golden Crown emblem on your digital membership badge',
      'Direct WhatsApp helpline with founder SANTOSH KUMAR',
      'Priority UPI payout settlement within 15 minutes',
    ],
    hindiWhatYouGet: [
      'सभी 5 विशिष्ट MMS सब-सर्विस मॉड्यूल्स का संपूर्ण एक्सेस',
      '50% डायरेक्ट + 20% लेवल 2–5 तक (कुल 70%) पारदर्शी व लॉस-प्रूफ डिस्ट्रीब्यूशन',
      'डिजिटल मेंबरशिप बैज पर वीआईपी गोल्डन क्राउन प्रतीक',
      'फाउंडर संतोष कुमार के साथ सीधा व्हाट्सएप हेल्पलाइन मार्गदर्शन',
      '15 मिनट के अंदर प्राथमिकता के आधार पर त्वरित UPI पेआउट',
    ],
    referralIncomeDetails: {
      directCommission: '50% फ्लैट डायरेक्ट रेफरल इंसेंटिव (₹50, ₹125, ₹250, ₹500, ₹1,250 प्रति व्यक्ति)',
      teamLevelCommission: 'लेवल 2 से 5 तक कुल 20% टीम शेयर (L2: 8%, L3: 5%, L4: 4%, L5: 3%)',
      exampleMath: 'अगर आप ₹250 वाले LIS प्लान में 8 साथियों को जोड़ते हैं, तो ₹1,000 डायरेक्ट और आगे लेवल 2-5 की टीम से अतिरिक्त 20% आय लगातार मिलेगी।',
    },
    dailyTaskWorkflow: [
      '1. MMS 5-ब्रांच मॉड्यूल्स को समझें',
      '2. छात्रों को उनके बजट अनुसार ₹100 से ₹2500 का प्लान सुझाएं',
      '3. कमीशन वॉलेट में आते ही सीधे बैंक में ट्रांसफर करें',
    ],
    activationSteps: [
      '₹100, ₹250, ₹500, ₹1000 या ₹2500 का MMS टियर चुनें',
      'पेमेंट UTR दर्ज करके तुरंत वीआईपी आईडी कार्ड अनलॉक करें',
    ],
    legalStatus: {
      actName: 'Consumer Protection (Direct Selling) Rules, 2021',
      complianceNote: 'पारदर्शी 70% टोटल कैप स्तर-आधारित एफिलिएट इंसेंटिव मॉडल। 100% वैध व स्थायी।'
    }
  },

  // 6. NON WORKING INCOME (NWI)
  {
    code: 'NWI',
    orderNumber: '06',
    orderEmoji: '6️⃣',
    fullListName: '6️⃣ NON WORKING INCOME (NWI)',
    hindiListTitle: 'अबाउट सिक्स्थ सर्विस: अबाउट नॉन वर्किंग इनकम (NWI)',
    menuTitle: 'अबाउट सिक्स्थ सर्विस: अबाउट नॉन वर्किंग इनकम (NWI)',
    englishName: 'NON WORKING INCOME (NWI)',
    hindiName: 'नॉन वर्किंग इनकम (3-लेवल डाउनलाइन पैसिव)',
    tagline: '100% Real 3-Level Downline Passive Income (L1: 10%, L2: 15%, L3: 25%) — Zero Fake Bots',
    hindiTagline: 'आपके नीचे बनने वाली वास्तविक 3-लेवल टीम (L1: 10%, L2: 15%, L3: 25%) से पैसिव नॉन-वर्किंग इनकम (कोई फेक बॉट या सिस्टम टीम नहीं)',
    joiningFeeTiers: [200, 500, 1000, 2000],
    defaultFee: 200,
    dailyEarningEst: '10% / 15% / 25% per Level',
    monthlyEarningEst: '₹1,680 - ₹16,800+ / 3-Level Cycle',
    referralBonusPercent: 35,
    icon: Clock,
    colorScheme: {
      primary: 'text-indigo-700',
      badgeBg: 'bg-indigo-600 text-white',
      border: 'border-indigo-500',
      gradient: 'from-indigo-900 via-purple-950 to-slate-900',
    },
    subServices: [
      {
        title: '👑 NWI 3-LEVEL REAL TEAM PASSIVE INCOME (L1: 10% | L2: 15% | L3: 25%)',
        description: 'NWI में एडमिन या सिस्टम द्वारा कोई फेक या ऑटो-बॉट टीम नहीं बनाई जाती। जब आपके स्पॉन्सर नेटवर्क और आपके नीचे वास्तविक लेवल टीम (Level 1, 2 और 3 मेंबर्स) बनती है, तो उनकी जॉइनिंग पर बिना अतिरिक्त काम किए आपको 10%, 15% और 25% पैसिव नॉन-वर्किंग इनकम सीधे वॉलेट में मिलती है:',
        plans: [
          { planName: 'NWI Level 1 Downline Share', fee: 200, directReward: '10% प्रति L1 मेंबर', levelRewards: 'उदा. 3 वास्तविक मेंबर्स पर ₹60', highlight: 'Level 1 = 10%' },
          { planName: 'NWI Level 2 Non-Working', fee: 500, directReward: '15% प्रति L2 मेंबर', levelRewards: 'उदा. 9 मेंबर्स (₹500 टियर) पर ₹675 पैसिव', highlight: 'Level 2 = 15%' },
          { planName: 'NWI Level 3 Non-Working', fee: 1000, directReward: '25% प्रति L3 मेंबर', levelRewards: 'उदा. 27 मेंबर्स (₹1000 टियर) पर ₹6,750 पैसिव', highlight: 'Level 3 = 25%' },
          { 
            planName: 'NWI VIP ₹2,000 Master Tier', 
            fee: 2000, 
            directReward: '35% Direct + 50% (L1+L2+L3)', 
            levelRewards: 'L1 (10%): ₹200/सदस्य | L2 (15%): ₹300/सदस्य | L3 (25%): ₹500/सदस्य',
            highlight: '100% Real Team Tree',
            notes: 'पूर्णतः वास्तविक डाउनलाइन टीम पर आधारित — 1-क्लिक में वॉलेट में क्लेम!'
          },
        ]
      }
    ],
    whatYouGet: [
      'Pure non-working passive earnings from real Level 1, 2 & 3 teams formed beneath you',
      'Transparent 3-Level split: Level-1 (10%), Level-2 (15%), Level-3 (25%) = 50% Passive Pool',
      'Zero fake bot members — every member & rupee is tracked from real database registrations',
      'Optional 35% direct sponsor bonus when you share your link directly',
      'Instant 1-click claim to your main withdrawable UPI wallet',
    ],
    hindiWhatYouGet: [
      'आपके नीचे बनने वाली वास्तविक 3-लेवल टीम (L1, L2, L3) से बिना अतिरिक्त काम किए पैसिव कमाई',
      'पारदर्शी 3-स्तरीय दर: Level-1 पर 10%, Level-2 पर 15% और Level-3 पर 25% नॉन-वर्किंग इनकम',
      'सिस्टम में 0% फेक डेटा — केवल रियल यूजर रजिस्ट्रेशन से जनरेट होने वाला असली कमीशन',
      'यदि आप स्वयं लिंक शेयर करते हैं तो 35% अतिरिक्त डायरेक्ट बोनस विकल्प',
      'अर्जित पैसिव आय को डैशबोर्ड से 1-क्लिक में सीधे मुख्य वॉलेट में क्लेम करने की सुविधा',
    ],
    referralIncomeDetails: {
      directCommission: '35% डायरेक्ट रेफरल विकल्प (यदि आप किसी को सीधे जोड़ते हैं)',
      teamLevelCommission: '3-लेवल नॉन-वर्किंग पैसिव आय: Level-1 (10%) + Level-2 (15%) + Level-3 (25%)',
      exampleMath: '₹200 टियर में यदि आपके नीचे 3×3 (3, 9, 27) की वास्तविक टीम बनती है तो L1 से ₹60, L2 से ₹270 और L3 से ₹1,350 = ₹1,680 पैसिव इनकम प्राप्त होती है।',
    },
    dailyTaskWorkflow: [
      '1. डैशबोर्ड में "👑 NWI 3-Level टीम" टैब खोलें',
      '2. अपने नीचे Level-1, Level-2 और Level-3 में जुड़े वास्तविक मेंबर्स की संख्या देखें',
      '3. उपलब्ध "Unclaimed Passive Income" को 1-क्लिक से वॉलेट में क्लेम करें',
    ],
    activationSteps: [
      '₹200, ₹500, ₹1000 या ₹2000 का NWI प्लान चुनें',
      'एडमिन UPI पर भुगतान करके 12-अंकों का UTR दर्ज करें',
      'आपका रियल 3-लेवल पैसिव मैट्रिक्स तुरंत सक्रिय हो जाएगा',
    ],
    legalStatus: {
      actName: 'Consumer Protection (Direct Selling) Rules, 2021',
      complianceNote: '100% पारदर्शी, रियल डाउनलाइन-आधारित 3-लेवल पैसिव मॉडल। कोई नकली बॉट या भ्रामक वादा नहीं।'
    }
  },

  // 7. SELF WORKING INCOME (SWI / SWIS) - 3.3% SPECIAL RECHARGE APP + RECHARGE & BILL PAY
  {
    code: 'SWI',
    orderNumber: '07',
    orderEmoji: '7️⃣',
    fullListName: '7️⃣ SELF WORKING INCOME (SWI)',
    hindiListTitle: 'अबाउट सेवंथ सर्विस: अबाउट सेल्फ वर्किंग इनकम (SWIS)',
    menuTitle: 'अबाउट सेवंथ सर्विस: अबाउट सेल्फ वर्किंग इनकम (SWIS - 3.3% App & Recharge)',
    englishName: 'SELF WORKING INCOME SYSTEM (SWIS)',
    hindiName: 'सेल्फ वर्किंग इनकम (3.3% स्पेशल रिचार्ज ऐप व बिल)',
    tagline: 'Featured ₹300 Special 3.3% Recharge App Service (50% = ₹150 Refer Commission) + Admin Dashboard App Link',
    hindiTagline: 'खास ₹300 वाला 3.3% कमीशन स्पेशल रिचार्ज ऐप! रेफर पर 50% (₹150) कमीशन और वेरिफिकेशन के बाद सीधे डैशबोर्ड में ऐप लिंक',
    joiningFeeTiers: [100, 150, 300, 350, 597, 599, 997, 1197, 1199, 1500, 1594],
    defaultFee: 300,
    dailyEarningEst: '3.3% App Margin | ₹150 Refer',
    monthlyEarningEst: '₹2,000 - ₹20,000 / month',
    referralBonusPercent: 50,
    icon: UserCheck,
    colorScheme: {
      primary: 'text-purple-700',
      badgeBg: 'bg-purple-600 text-white',
      border: 'border-purple-500',
      gradient: 'from-purple-900 via-fuchsia-950 to-slate-900',
    },
    subServices: [
      {
        title: '📲 3.3% SPECIAL RECHARGE APP & SWIS BILL SERVICES',
        description: 'PhonePe, Google Pay के एक्स्ट्रा ₹2-₹3 चार्ज से बचें! हमारा खास 3.3% कमीशन स्पेशल रिचार्ज ऐप मात्र ₹300 में उपलब्ध है। वेरिफिकेशन होते ही एडमिन द्वारा सीधे आपके डैशबोर्ड में स्पेशल ऐप लिंक शेयर किया जाएगा और प्रति रेफरल पर 50% (₹150) मिलेगा:',
        plans: [
          { 
            planName: '(1) 3.3% SPECIAL RECHARGE APP SERVICE', 
            fee: 300, 
            welcomeBonus: 'एडमिन द्वारा वेरिफाइड डैशबोर्ड में डायरेक्ट ऐप लिंक शेयर', 
            directReward: '₹150 प्रति Refer (50% Commission)', 
            levelRewards: 'हर मोबाइल व DTH रिचार्ज पर पक्का 3.3% फिक्स्ड कमीशन',
            highlight: '⭐ Most Recommended (₹300)',
            notes: 'ID शुल्क ₹300 • रेफर कमीशन 50% (₹150) • वेरिफाई होते ही डैशबोर्ड में App Link अनलॉक'
          },
          { planName: '(2) LRCS (Low Recharge Commission Service)', fee: 100, directReward: '₹50 Refer (50%)', levelRewards: '1% Fixed Recharge Commission', highlight: 'ID Activation: ₹100' },
          { planName: '(3) MRCS (Medium Recharge Commission Service)', fee: 150, directReward: '₹75 Refer (50%)', levelRewards: '1.5% Fixed Recharge Commission', highlight: 'ID Activation: ₹150' },
          { planName: '(4) HRCS (High Recharge Commission Service)', fee: 350, directReward: '₹175 Refer (50%)', levelRewards: '2.5% - 3.0% Multi-Operator Commission', highlight: 'ID Activation: ₹350' },
          { planName: '(5) SHRCS (Super High Recharge Service)', fee: 597, directReward: '₹298 Refer (50%)', levelRewards: '3.0% - 3.5% Fixed Operator Margin', highlight: 'ID: ₹597 / ₹997 / ₹1197' },
          { planName: '(6) AEPS & BILL PAYMENTS (AEPS & BPS)', fee: 1500, directReward: '₹750 Refer (50%)', levelRewards: '₹4 से ₹12 प्रति AEPS ट्रांजेक्शन + BBPS', highlight: 'Banking & Cash Point' },
        ]
      }
    ],
    whatYouGet: [
      'Official 3.3% Commission Special Recharge App Access Link directly inside your Dashboard after Admin Verification',
      'Flat 50% Referral Commission (₹150 on every ₹300 SWI plan enrollment)',
      'Zero extra platform convenience fees charged by third-party payment apps',
      'Earn consistent 3.3% commission on your own, family & customer mobile/DTH recharges',
      'Instant commission credit + Verified Digital ID Card',
    ],
    hindiWhatYouGet: [
      'एडमिन द्वारा UTR वेरिफिकेशन के तुरंत बाद आपके डैशबोर्ड में "3.3% स्पेशल रिचार्ज ऐप लिंक" सीधा प्राप्त होगा',
      '₹300 के SWI प्लान पर प्रति रेफरल 50% (सीधे ₹150) नकद कमीशन',
      'गूगल पे व फोनपे द्वारा लिए जाने वाले एक्स्ट्रा चार्ज से हमेशा के लिए मुक्ति',
      'अपने खुद के, परिवार व ग्राहकों के हर रिचार्ज पर पक्का 3.3% कमीशन',
      'तुरंत वॉलेट क्रेडिट और वेरिफाइड डिजिटल आईडी कार्ड',
    ],
    referralIncomeDetails: {
      directCommission: '50% फ्लैट कमीशन (₹300 प्लान पर ₹150 सीधा रेफरल इनाम)',
      teamLevelCommission: 'TWIS के साथ जोड़कर किसी भी अन्य प्लान में भी मेंबर रेफर करने की सुविधा',
      exampleMath: 'अगर आप ₹300 वाला SWI 3.3% ऐप प्लान लेते हैं और केवल 10 लोगों को यह प्लान रेफर करते हैं, तो ₹1,500 (₹150 x 10) सीधे मिलेंगे और खुद के रिचार्ज पर 3.3% आजीवन बचत होगी।',
    },
    dailyTaskWorkflow: [
      '1. ₹300 से SWI प्लान एक्टिवेट करें और एडमिन वेरिफिकेशन की प्रतीक्षा करें',
      '2. वेरिफाई होते ही डैशबोर्ड के "📲 3.3% Special Recharge App" कार्ड से ऐप लिंक खोलें',
      '3. ऐप में लॉगिन कर रोजाना 3.3% कमीशन कमाएं व 50% (₹150) रेफर इनकम पाएं',
    ],
    activationSteps: [
      '₹300 वाला 3.3% स्पेशल ऐप प्लान (या ₹100–₹1500) चुनें',
      'एडमिन UPI पर पेमेंट करके UTR सबमिट करें',
      'एडमिन वेरिफिकेशन के बाद आपके डैशबोर्ड पर ऐप लिंक दिखाई देगा',
    ],
    legalStatus: {
      actName: 'Bharat Bill Payment System (BBPS) & Telecom Reseller Norms',
      complianceNote: '100% भारत सरकार व ट्राई (TRAI) नियमानुकूल टेलिकॉम व यूटिलिटी कमीशन सेवा।'
    }
  },

  // 8. TEAM WORKING INCOME (TWI / TWIS) - CROSS-PLAN TEAM & ALL-PLAN REFERRAL
  {
    code: 'TWI',
    orderNumber: '08',
    orderEmoji: '8️⃣',
    fullListName: '8️⃣ TEAM WORKING INCOME (TWI)',
    hindiListTitle: 'अबाउट एथ सर्विस: अबाउट टीम वर्किंग इनकम (TWIS)',
    menuTitle: 'अबाउट एथ सर्विस: अबाउट टीम वर्किंग इनकम (TWIS - All-Plan Team)',
    englishName: 'TEAM WORKING INCOME SYSTEM (TWIS)',
    hindiName: 'टीम वर्किंग इनकम (सभी प्लान रेफर व टीम)',
    tagline: 'Universal Cross-Plan Team Power: Join ANY Plan & Refer Friends into ANY ESP/TWI Plan!',
    hindiTagline: 'कोई भी प्लान चुनकर किसी भी अन्य प्लान में टीम बनाएं और रेफर करें! 40% डायरेक्ट + टीम रिचार्ज ओवरराइड',
    joiningFeeTiers: [100, 150, 300, 350, 597, 599, 997, 1197, 1199, 1500],
    defaultFee: 300,
    dailyEarningEst: '₹40 - ₹600+ / invite',
    monthlyEarningEst: '₹3,000 - ₹50,000 / month',
    referralBonusPercent: 40,
    icon: Users,
    colorScheme: {
      primary: 'text-rose-700',
      badgeBg: 'bg-rose-600 text-white',
      border: 'border-rose-500',
      gradient: 'from-rose-900 via-red-950 to-slate-900',
    },
    subServices: [
      {
        title: '👥 ALL-PLAN CROSS-REFERRAL & TWIS TEAM RECHARGE MATRIX',
        description: 'TWIS की सबसे बड़ी ताकत: आपने चाहे कोई भी प्लान (EMO, MMO, MOM, SWI, NWI, TWI, PROMOTE आदि) लिया हो, आप किसी भी दूसरे प्लान में नए मेंबर को रेफर करके उसकी टीम से कमाई कर सकते हैं + टीम रिचार्ज ओवरराइड (0.1%–0.5%) अलग से मिलता है:',
        plans: [
          { planName: '1. Cross-Plan Universal Referral', fee: 100, directReward: '40% - 70% (रेफर प्लान अनुसार)', levelRewards: 'कोई भी प्लान चुनकर EMO/MMO/MOM/SWI/NWI/TWI सभी में रेफर की छूट', highlight: '🌐 Any-to-Any Plan Refer' },
          { planName: '2. TWI 3.3% App Team (SWI Linked)', fee: 300, directReward: '₹120 - ₹150 Direct Cash', levelRewards: '0.3% Team Recharge Overrides (3.3% ऐप यूजर्स की टीम पर)', highlight: '⭐ ₹300 Special Team' },
          { planName: '3. TMRCS (Team Medium Commission)', fee: 150, directReward: '₹60 Direct Cash (40%)', levelRewards: '0.2% Team Recharge Overrides', highlight: 'ID Activation: ₹150' },
          { planName: '4. THRCS (Team High Commission)', fee: 350, directReward: '₹140 Direct Cash (40%)', levelRewards: '0.3% Team Recharge Overrides', highlight: 'ID Activation: ₹350' },
          { planName: '5. TSHRCS Super Team Pack', fee: 597, directReward: '₹239 Direct Cash (40%)', levelRewards: '0.4% Team Recharge Overrides', highlight: 'ID: ₹597 / ₹997 / ₹1197' },
          { planName: '6. TAEPS WITH BILL PAYMENTS', fee: 1500, directReward: '₹600 Direct Cash (40%)', levelRewards: '0.5% Banking & Bill Pay Team Share', highlight: 'Highest Team Tier' },
        ]
      }
    ],
    whatYouGet: [
      'Cross-Plan Team Building: Enroll in ANY plan and refer users into ANY of the 10 plans seamlessly',
      'Commission automatically calculated from the new member\'s chosen plan rate (40% to 70%)',
      'Lifetime passive override (0.1% - 0.5%) on recharges performed by your downline team',
      'Unified single Roll Number / Sponsor Code works across all 10 plans',
      'Real-time Team Breakdown CRM & Verified Leader ID Card',
    ],
    hindiWhatYouGet: [
      'ऑल-प्लान क्रॉस-रेफरल: एक प्लान लेकर भी आप सभी 10 प्लान्स (EMO, SWI, MOM, NWI आदि) में टीम बना सकते हैं',
      'जब आपका साथी किसी भी प्लान से जुड़ेगा, तो उस प्लान का तय रेफर कमीशन सीधे आपके वॉलेट में जुड़ेगा',
      'आपकी टीम द्वारा किए जाने वाले हर मोबाइल रिचार्ज पर 0.1% से 0.5% ओवरराइड कमीशन',
      'केवल एक यूनिक रोल नंबर (Sponsor ID) से पूरे ESP प्लेटफॉर्म की टीम मैनेज करने की सुविधा',
      'वेरिफाइड TWIS टीम लीडर डिजिटल आईडी कार्ड',
    ],
    referralIncomeDetails: {
      directCommission: '40% TWIS डायरेक्ट + क्रॉस-प्लान रेफरल पर 40% से 70% तक कमीशन',
      teamLevelCommission: 'टीम के रिचार्ज टर्नओवर पर 0.1% से 0.5% का स्थायी ओवरराइड',
      exampleMath: 'अगर आपने ₹100 या ₹300 से अपनी आईडी ली है और कोई दोस्त आपके लिंक से ₹499 का MOM या ₹300 का SWI लेता है, तो आपको पूरा कमीशन बिना किसी रोक के मिलेगा!',
    },
    dailyTaskWorkflow: [
      '1. अपना एकमात्र स्पॉन्सर लिंक (All-Plan Link) शेयर करें',
      '2. सामने वाले व्यक्ति को उसकी पसंद का कोई भी प्लान (₹10 से ₹10,000) चुनने दें',
      '3. उसके प्लान अनुसार डायरेक्ट व लेवल/टीम कमीशन तुरंत अपने वॉलेट में पाएं',
    ],
    activationSteps: [
      '₹100, ₹150, ₹300 (स्पेशल टीम) या ₹1500 तक का TWIS प्लान चुनें',
      'एडमिन UPI पर पेमेंट करके UTR दर्ज करें',
      'क्रॉस-प्लान टीम बिल्डिंग तुरंत शुरू करें',
    ],
    legalStatus: {
      actName: 'Consumer Protection (Direct Selling) Rules, 2021',
      complianceNote: 'सभी 10 योजनाओं के बीच पारदर्शी क्रॉस-प्लान टीम नेटवर्क व लॉस-प्रूफ ओवरराइड मॉडल।'
    }
  },

  // 9. PROMOTE & EARN - OWN BUSINESS / SHOP / SERVICE + SHUBHKAMNA + ESP DETAILS
  {
    code: 'PROMOTE',
    orderNumber: '09',
    orderEmoji: '9️⃣',
    fullListName: '9️⃣ PROMOTE & EARN',
    hindiListTitle: 'अबाउट नाइंथ सर्विस: अबाउट प्रमोट & अर्न',
    menuTitle: 'अबाउट नाइंथ सर्विस: अबाउट प्रमोट & अर्न (Business, Poster & Shubhkamna)',
    englishName: 'PROMOTE & EARN (BUSINESS & SHUBHKAMNA STUDIO)',
    hindiName: 'प्रमोट & अर्न (खुद का बिज़नेस, पोस्टर व शुभकामना)',
    tagline: 'Promote Your Own Shop, Business or Service Alongside ESP Details — Banners, Posters & Shubhkamna Cards!',
    hindiTagline: 'हमारे प्लेटफॉर्म डिटेल्स के साथ अपने खुद के बिज़नेस, दुकान या सर्विस का प्रचार करें — HD बैनर, विज्ञापन पोस्टर और शुभकामना कार्ड बनाएं!',
    joiningFeeTiers: [50, 100, 250],
    defaultFee: 50,
    dailyEarningEst: '₹5 - ₹25 Ad Task | Business Reach',
    monthlyEarningEst: '₹600 - ₹7,500 + Own Business Growth',
    referralBonusPercent: 40,
    icon: Share2,
    colorScheme: {
      primary: 'text-orange-700',
      badgeBg: 'bg-orange-600 text-white',
      border: 'border-orange-500',
      gradient: 'from-orange-900 via-amber-950 to-slate-900',
    },
    subServices: [
      {
        title: '📢 OWN BUSINESS PROMOTION BANNERS, POSTERS & SHUBHKAMNA STUDIO',
        description: 'प्रमोट एंड अर्न के अंदर आप न केवल ESP का प्रचार कर सकते हैं, बल्कि हमारे ऑफिशियल प्लेटफॉर्म डिटेल्स व QR कोड के साथ अपने खुद के बिज़नेस, दुकान, यूट्यूब या सर्विस के लिए आकर्षक प्रमोशन बैनर, पोस्टर और त्योहार/बधाई शुभकामना कार्ड 1-क्लिक में बना व शेयर कर सकते हैं:',
        plans: [
          { planName: 'Promote Starter (Business + Status)', fee: 50, welcomeBonus: 'कस्टम बिज़नेस पोस्टर + शुभकामना स्टूडियो', directReward: '₹20 Refer (40%) | ₹5 Ad Task', highlight: 'Start at Just ₹50' },
          { planName: 'Promote Standard (Multi-Banner)', fee: 100, welcomeBonus: 'HD बिज़नेस बैनर + ESP डिटेल्स टेम्पलेट्स', directReward: '₹40 Refer (40%) | ₹12 Ad Task', highlight: 'Most Popular' },
          { planName: 'Promote Pro Influencer', fee: 250, welcomeBonus: 'अनलिमिटेड कस्टम बैनर, पोस्टर व शुभकामना कार्ड', directReward: '₹100 Refer (40%) | ₹25 Ad Task', highlight: 'Max Promotion Suite' },
        ]
      }
    ],
    whatYouGet: [
      'Custom Poster Studio to promote YOUR OWN Business, Shop, Coaching, YouTube or Service',
      'Built-in Promotional Banners, Ad Posters & Shubhkamna / Festival Greeting Cards',
      'Co-branded option to attach ESP Platform Details & Referral QR Code so you earn both ways',
      '1-Click HD PNG Poster Download & WhatsApp Share Caption ready',
      '40% direct referral bonus (₹20 / ₹40 / ₹100) + sustainable daily ad task payouts',
    ],
    hindiWhatYouGet: [
      'अपने खुद के बिज़नेस, दुकान, उत्पाद या सर्विस का नाम व ऑफर डालकर विज्ञापन पोस्टर बनाने की सुविधा',
      'प्रमोशन बैनर, आकर्षक विज्ञापन पोस्टर और पर्व/त्योहार शुभकामना (Shubhkamna) कार्ड टेम्पलेट्स',
      'हर पोस्टर में ESP प्लेटफॉर्म डिटेल्स व आपका निजी रेफरल QR कोड जोड़ने का विकल्प (दोहरा लाभ)',
      '1-क्लिक में HD PNG बैनर डाउनलोड और व्हाट्सएप शेयर कैप्शन',
      '40% डायरेक्ट रेफरल कमीशन (₹20, ₹40, ₹100) और दैनिक स्टेटस टास्क बोनस',
    ],
    referralIncomeDetails: {
      directCommission: '40% डायरेक्ट रेफरल कमीशन (₹20, ₹40, ₹100 प्रति इनविटेशन)',
      teamLevelCommission: 'खुद के बिज़नेस प्रचार से ग्राहकों की वृद्धि + दैनिक स्टेटस टास्क आय (₹5 से ₹25)',
      exampleMath: 'अपने दुकान/बिज़नेस पोस्टर व शुभकामना कार्ड पर ESP QR लगाकर स्टेटस शेयर करने से आपको अपने व्यापार के ग्राहक भी मिलेंगे और साथ जुड़ने वाले प्रत्येक साथी पर ₹20–₹100 कमीशन भी मिलेगा!',
    },
    dailyTaskWorkflow: [
      '1. डैशबोर्ड में "Promo Posters" टैब खोलें',
      '2. "Own Business Ad" या "Shubhkamna Card" चुनकर अपना नाम, ऑफर/शुभकामना व संपर्क लिखें',
      '3. ESP डिटेल्स ऑन रखकर HD बैनर डाउनलोड करें और WhatsApp/Facebook पर शेयर करें',
    ],
    activationSteps: [
      '₹50, ₹100 या ₹250 का प्रमोटर प्लान चुनें',
      'एडमिन UPI पर भुगतान करके UTR सबमिट करें',
      'तुरंत बिज़नेस पोस्टर व शुभकामना कार्ड बनाना शुरू करें',
    ],
    legalStatus: {
      actName: 'Indian Contract Act 1872 & IT Act 2000',
      complianceNote: 'डिजिटल ब्रांडिंग, स्व-व्यवसाय विज्ञापन और सोशल मीडिया प्रमोशन पर आधारित 100% वैध सेवा।'
    }
  },

  // 10. REFER & EARN (CROSS-PLAN CODE, WELCOME BONUS & ₹100+ PLAN UPGRADE)
  {
    code: 'REFER',
    orderNumber: '10',
    orderEmoji: '🔟',
    fullListName: '🔟 REFER & EARN',
    hindiListTitle: 'अबाउट टेंथ सर्विस: अबाउट रेफर & अर्न',
    menuTitle: 'अबाउट टेंथ सर्विस: अबाउट रेफर & अर्न (Sponsor Code, Bonus & ₹100+ Upgrade)',
    englishName: 'REFER & EARN (SPONSOR CODE & UPGRADE)',
    hindiName: 'रेफर & अर्न (स्पॉन्सर कोड व ₹100+ अपग्रेड)',
    tagline: 'Universal Sponsor Code + Sustainable Welcome Bonus + Direct ₹100+ Self Plan Upgrade Inside Dashboard',
    hindiTagline: 'सभी 10 प्लान में चलने वाला यूनिक स्पॉन्सर कोड, ₹2-₹10 वेलकम बोनस और डैशबोर्ड से कभी भी ₹100+ प्लान अपग्रेड की सुविधा',
    joiningFeeTiers: [10, 50, 100, 250, 500, 1000],
    defaultFee: 100,
    dailyEarningEst: '₹5 - ₹500 / referral',
    monthlyEarningEst: '₹3,000 - ₹1,00,000 / month',
    referralBonusPercent: 50,
    icon: Gift,
    colorScheme: {
      primary: 'text-pink-700',
      badgeBg: 'bg-pink-600 text-white',
      border: 'border-pink-500',
      gradient: 'from-pink-900 via-rose-950 to-slate-900',
    },
    subServices: [
      {
        title: '🎁 UNIVERSAL SPONSOR CODE, WELCOME BONUS & SELF PLAN UPGRADE (₹100+)',
        description: 'ESP में जॉइन करने के बाद आपका ROLL NUMBER आपका यूनिवर्सल स्पॉन्सर कोड बन जाता है, जिससे आप किसी भी प्लान में लोगों को जोड़ सकते हैं। साथ ही डैशबोर्ड में सीधे ₹100+ से अपना प्लान अपग्रेड करने पर आपके स्पॉन्सर को 50% अपग्रेड बोनस मिलता है:',
        plans: [
          { planName: 'Micro Starter Sponsor', fee: 10, welcomeBonus: '₹2 Welcome Bonus', directReward: '₹5 Direct Cash (50%)', highlight: 'Minimum ₹10 Entry' },
          { planName: 'Basic Sponsor Code', fee: 50, welcomeBonus: '₹10 Welcome Bonus', directReward: '₹25 Direct Cash (50%)', highlight: 'Student Friendly' },
          { planName: 'Standard Sponsor (Most Popular)', fee: 100, welcomeBonus: '₹10 Bonus + Plan Upgrade Eligible', directReward: '₹50 Direct Cash (50%)', highlight: '50% Flat Share' },
          { planName: 'Pro Sponsor Upgrade', fee: 250, welcomeBonus: '₹10 Welcome Bonus', directReward: '₹125 Direct Cash (50%)', highlight: 'Enhanced Payout' },
          { planName: 'VIP Sponsor Upgrade', fee: 500, welcomeBonus: '₹10 Welcome Bonus', directReward: '₹250 Direct Cash (50%)', highlight: 'Priority Lead Pool' },
          { planName: 'Master Sponsor Franchise', fee: 1000, welcomeBonus: '₹10 Bonus + Full Upgrade Credit', directReward: '₹500 Direct Cash (50%)', highlight: 'Maximum Referral' },
        ]
      }
    ],
    whatYouGet: [
      'Universal Unique Roll Number / Sponsor Code that works across ALL 10 ESP Plans',
      'Instant Self Plan Upgrade (₹100+) directly inside your Dashboard with UTR verification',
      'Flat 50% referral & upgrade commission (₹5 to ₹500) credited on verification',
      'Sustainable Welcome Cash Bonus (₹2 on ₹10 plan, ₹10 on ₹50+ plans)',
      'Zero limit on direct referrals or cross-plan invitations',
    ],
    hindiWhatYouGet: [
      'आजीवन वैध यूनिवर्सल रोल नंबर / स्पॉन्सर कोड जो सभी 10 प्लान्स में काम करता है',
      'डैशबोर्ड के अंदर से मात्र ₹100 या अधिक देकर किसी भी समय प्लान अपग्रेड/स्विच करने की सुविधा',
      'हर डायरेक्ट जॉइनिंग और प्लान अपग्रेड पर 50% (₹5 से ₹500 तक) सीधा नकद कमीशन',
      'एडमिन वेरिफिकेशन पर ₹2 (₹10 प्लान) और ₹10 (₹50+ प्लान) का सुरक्षित वेलकम बोनस',
      'अपने कोड से जितने चाहें उतने दोस्तों को जोड़ने की असीमित स्वतंत्रता',
    ],
    referralIncomeDetails: {
      directCommission: '50% सीधा नकद कमीशन (₹5 से लेकर ₹500 प्रति डायरेक्ट इनविटेशन)',
      teamLevelCommission: 'डैशबोर्ड से ₹100+ प्लान अपग्रेड पर स्पॉन्सर को 50% (₹50+) अपग्रेड कमीशन',
      exampleMath: 'अगर आप ₹100 वाले प्लान से 10 दोस्तों को जोड़ते हैं, तो ₹500 सीधे मिलेंगे। यदि उनमें से 5 लोग ₹300 SWI में अपग्रेड करते हैं तो ₹150 x 5 = ₹750 अतिरिक्त मिलेंगे!',
    },
    dailyTaskWorkflow: [
      '1. डैशबोर्ड से अपना यूनिक रोल नंबर और रेफरल लिंक कॉपी करें',
      '2. दोस्तों को उनके बजट अनुसार कोई भी ESP प्लान चुनकर जुड़ने के लिए कहें',
      '3. ज़रूरत पड़ने पर डैशबोर्ड के "🚀 Plan Upgrade (₹100+)" से उच्च प्लान अनलॉक करें',
    ],
    activationSteps: [
      'मात्र ₹10 से ₹1000 का स्पॉन्सर प्लान चुनें',
      'एडमिन UPI पर भुगतान करके UTR सबमिट करें और अपना आधिकारिक रोल नंबर पाएं',
    ],
    legalStatus: {
      actName: 'Consumer Protection (Direct Selling) Rules, 2021',
      complianceNote: 'लॉस-प्रूफ व पारदर्शी क्रॉस-प्लान एफिलिएट रेफरल व अपग्रेड मॉडल। (₹0 फ्री गेमिंग अकाउंट पर ₹0 कैश कमीशन)।'
    }
  }
];

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  selectedServiceCode,
  onSelectServiceCode,
  onSelectServiceForRegistration,
  currentUser,
  onGoToDashboard,
  settings,
  onOpenLegalModal,
}) => {
  const currentService = COMPREHENSIVE_SERVICES.find(s => s.code === selectedServiceCode) || COMPREHENSIVE_SERVICES[0];
  const ServiceIcon = currentService.icon;

  const [selectedPlanFee, setSelectedPlanFee] = useState<number>(currentService.defaultFee);
  const [calcReferrals, setCalcReferrals] = useState<number>(5);

  const estimatedDirectReward = Math.round((selectedPlanFee * currentService.referralBonusPercent / 100) * calcReferrals);

  return (
    <div className="space-y-4 py-4 pb-16 w-full overflow-x-hidden font-sans">
      {/* Flipkart Top Breadcrumb & Service Banner */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        <div className="bg-[#2874f0] p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#ffe500]">
              ESP Service #{currentService.orderNumber} · {currentService.code} · Legal & Verified
            </p>
            <h1 className="text-lg sm:text-2xl font-bold text-white">
              {currentService.menuTitle}
            </h1>
          </div>

          {onOpenLegalModal && (
            <button
              onClick={onOpenLegalModal}
              className="px-3.5 py-2 rounded-xs text-xs font-semibold bg-white hover:bg-blue-50 text-[#2874f0] transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Scale className="w-4 h-4" />
              <span>Legal Safety Report →</span>
            </button>
          )}
        </div>
      </div>

      {/* 10 Services Clean Selector Grid */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2874f0]" />
            <h2 className="text-sm sm:text-base font-bold text-[#212121]">
              सभी 10 समर्पित सेवाएं (Select Service)
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#2874f0]">
            Service #{currentService.orderNumber} Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {COMPREHENSIVE_SERVICES.map(srv => {
            const isSelected = srv.code === currentService.code;
            const TabIcon = srv.icon;
            return (
              <button
                key={srv.code}
                onClick={() => {
                  onSelectServiceCode(srv.code);
                  setSelectedPlanFee(srv.defaultFee);
                  window.scrollTo({ top: 80, behavior: 'smooth' });
                }}
                className={`p-3 rounded-sm text-left transition flex flex-col justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-[#f5f8ff] border-[#2874f0] text-[#212121] ring-1 ring-[#2874f0]'
                    : 'bg-white border-slate-200 hover:border-[#2874f0] text-[#212121]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-[11px] font-bold text-[#878787] tabular-nums">
                      #{srv.orderNumber} · {srv.code}
                    </span>
                    <TabIcon className={`w-4 h-4 ${isSelected ? 'text-[#2874f0]' : 'text-[#878787]'}`} />
                  </div>
                  <div className="font-bold text-xs leading-snug mb-1 text-[#212121]">
                    {srv.englishName}
                  </div>
                  <div className="text-[11px] font-medium text-[#555555] line-clamp-1 mb-2">
                    {srv.hindiName}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] tabular-nums">
                  <span className="font-bold text-[#212121]">Starts ₹{srv.defaultFee}</span>
                  <span className={`font-semibold ${isSelected ? 'text-[#2874f0]' : 'text-[#878787]'}`}>
                    {isSelected ? 'Selected' : 'View →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Service Product Overview Card */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-[#388e3c] text-white font-bold px-2 py-0.5 rounded-xs">
                {currentService.referralBonusPercent}% Max Referral
              </span>
              <span className="text-[#388e3c] font-semibold">100% Legal & Govt Compliant</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-[#212121] flex items-center gap-2.5">
              <ServiceIcon className="w-7 h-7 text-[#2874f0] shrink-0" />
              <span>{currentService.englishName}</span>
            </h2>
            <p className="text-sm sm:text-base font-medium text-[#555555]">
              {currentService.hindiName} — {currentService.hindiTagline}
            </p>
          </div>

          <button
            onClick={() => onSelectServiceForRegistration(currentService.code, selectedPlanFee)}
            className="px-6 py-3 rounded-xs bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer shrink-0 self-start"
          >
            Join ₹{selectedPlanFee} Plan Now →
          </button>
        </div>

        {/* 4 Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#212121]">
          <div className="bg-[#f9fafb] border border-slate-200 p-3.5 rounded-sm">
            <span className="text-[11px] text-[#878787] font-semibold block">Starting Fee</span>
            <span className="text-xl font-bold text-[#212121] tabular-nums">₹{currentService.defaultFee}</span>
            <span className="text-[11px] text-[#388e3c] font-medium block">Transparent tiers</span>
          </div>
          <div className="bg-[#f9fafb] border border-slate-200 p-3.5 rounded-sm">
            <span className="text-[11px] text-[#878787] font-semibold block">Estimated Income</span>
            <span className="text-lg font-bold text-[#2874f0] tabular-nums">{currentService.dailyEarningEst}</span>
            <span className="text-[11px] text-[#666666] block">{currentService.monthlyEarningEst}</span>
          </div>
          <div className="bg-[#f9fafb] border border-slate-200 p-3.5 rounded-sm">
            <span className="text-[11px] text-[#878787] font-semibold block">Referral Rate</span>
            <span className="text-xl font-bold text-[#388e3c] tabular-nums">{currentService.referralBonusPercent}%</span>
            <span className="text-[11px] text-[#666666] block">Instant wallet credit</span>
          </div>
          <div className="bg-[#f9fafb] border border-slate-200 p-3.5 rounded-sm">
            <span className="text-[11px] text-[#878787] font-semibold block">Payout Mode</span>
            <span className="text-xl font-bold text-[#212121]">100% UPI</span>
            <span className="text-[11px] text-[#666666] block">PhonePe / GPay / Paytm</span>
          </div>
        </div>

        {/* Legal Audit Strip */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-3.5 flex items-start gap-3">
          <Scale className="w-5 h-5 text-[#388e3c] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#212121]">{currentService.legalStatus.actName}</p>
            <p className="text-[#555555] mt-0.5">{currentService.legalStatus.complianceNote}</p>
          </div>
        </div>
      </div>

      {/* Sub-Services & Plan Tiers */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-[#2874f0] uppercase">Official Plans & Commission Chart</span>
            <h3 className="text-lg sm:text-xl font-bold text-[#212121] mt-0.5">
              {currentService.englishName} — उपलब्ध प्लान टियर्स
            </h3>
          </div>
          <span className="text-xs text-[#666666]">
            चुने गए प्लान पर तुरंत वेरिफाइड आईडी कार्ड जारी
          </span>
        </div>

        {currentService.subServices.map((sub, idx) => (
          <div key={idx} className="space-y-4">
            <div className="bg-[#f9fafb] border border-slate-200 rounded-sm p-4">
              <h4 className="text-sm sm:text-base font-bold text-[#212121]">{sub.title}</h4>
              <p className="text-xs sm:text-sm text-[#555555] mt-1 leading-relaxed">{sub.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sub.plans.map((plan, pIdx) => (
                <div
                  key={pIdx}
                  className={`rounded-sm p-4 border transition flex flex-col justify-between ${
                    selectedPlanFee === plan.fee
                      ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-[#2874f0]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#212121]">{plan.planName}</span>
                      {plan.highlight && (
                        <span className="bg-[#388e3c] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs shrink-0">
                          {plan.highlight}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-[#212121] tabular-nums">₹{plan.fee}</span>
                      <span className="text-xs text-[#878787]">Joining Charge</span>
                    </div>

                    {plan.welcomeBonus && (
                      <div className="bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-semibold p-2 rounded-xs">
                        {plan.welcomeBonus}
                      </div>
                    )}

                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666] font-medium">Direct Commission:</span>
                        <span className="font-bold text-[#388e3c] tabular-nums">{plan.directReward}</span>
                      </div>
                      {plan.levelRewards && (
                        <div className="text-[#555555] bg-[#f9fafb] p-2 rounded-xs border border-slate-200 text-[11px]">
                          <strong>Team/Level:</strong> {plan.levelRewards}
                        </div>
                      )}
                      {plan.notes && (
                        <div className="text-[11px] text-[#2874f0] font-medium bg-blue-50 p-2 rounded-xs border border-blue-100">
                          {plan.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <button
                      onClick={() => onSelectServiceForRegistration(currentService.code, plan.fee)}
                      className="w-full py-2 rounded-xs text-xs font-bold bg-[#fb641b] hover:bg-[#e8550f] text-white transition cursor-pointer text-center"
                    >
                      इस प्लान से प्रवेश लें (₹{plan.fee}) →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Deliverables & Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#388e3c]" />
            <h3 className="text-base font-bold text-[#212121]">Official Deliverables</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#212121]">
            {currentService.hindiWhatYouGet.map((item, i) => (
              <li key={i} className="flex items-start gap-2 bg-[#f9fafb] p-2.5 rounded-xs border border-slate-200">
                <Check className="w-4 h-4 text-[#388e3c] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <Award className="w-5 h-5 text-[#2874f0]" />
            <h3 className="text-base font-bold text-[#212121]">Daily Workflow & Payouts</h3>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-[#212121]">
            {currentService.dailyTaskWorkflow.map((step, i) => (
              <div key={i} className="bg-[#f5f8ff] border border-blue-100 p-2.5 rounded-xs">
                {step}
              </div>
            ))}
          </div>
          <div className="bg-[#f9fafb] p-3 rounded-xs border border-slate-200 text-xs text-[#555555]">
            <strong>Withdrawal Rule:</strong> न्यूनतम विथड्रॉल मात्र ₹{settings.minWithdrawal} · 100% UPI सीधे बैंक में।
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <Calculator className="w-5 h-5 text-[#2874f0]" />
          <h3 className="text-base font-bold text-[#212121]">
            {currentService.englishName} Income Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#555555]">प्लान राशि चुनें:</label>
            <select
              value={selectedPlanFee}
              onChange={e => setSelectedPlanFee(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-[#212121] font-bold rounded-xs p-2.5 text-sm outline-none focus:border-[#2874f0]"
            >
              {currentService.joiningFeeTiers.map(tier => (
                <option key={tier} value={tier}>₹{tier} Plan</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-[#555555]">
              <span>रेफरल सदस्य:</span>
              <span className="font-bold text-[#2874f0] tabular-nums">{calcReferrals} व्यक्ति</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={calcReferrals}
              onChange={e => setCalcReferrals(Number(e.target.value))}
              className="w-full accent-[#2874f0] cursor-pointer mt-2"
            />
          </div>

          <div className="bg-[#2874f0] rounded-sm p-3.5 text-white flex flex-col justify-center text-center">
            <span className="text-[11px] text-blue-100 font-semibold uppercase">सीधी अनुमानित रेफरल कमाई</span>
            <span className="text-2xl font-bold text-[#ffe500] tabular-nums">₹{estimatedDirectReward.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-blue-100">सीधे आपके UPI खाते में</span>
          </div>
        </div>
      </div>

      {/* Bottom Join Bar */}
      <div className="bg-[#2874f0] rounded-sm p-6 text-white text-center space-y-4 shadow-sm">
        <h3 className="text-xl sm:text-2xl font-bold">
          {currentService.englishName} से अभी शुरुआत करें
        </h3>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto">
          पंजीकरण मात्र 2 मिनट में पूरा होता है। भुगतान UTR दर्ज करते ही वेरिफाइड रोल नंबर व डिजिटल आईडी कार्ड जारी हो जाता है।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onSelectServiceForRegistration(currentService.code, selectedPlanFee)}
            className="px-8 py-3 rounded-xs text-sm font-bold bg-[#fb641b] hover:bg-[#e8550f] text-white transition shadow-sm cursor-pointer"
          >
            अभी ₹{selectedPlanFee} से प्रवेश लें →
          </button>

          <a
            href={`https://api.whatsapp.com/send?phone=91${settings.whatsappNumber}&text=${encodeURIComponent(
              `नमस्ते Santosh Ji, मुझे ESP की सर्विस #${currentService.orderNumber} ${currentService.code} (${currentService.hindiName}) के बारे में जानना है।`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xs text-xs sm:text-sm font-bold bg-white text-[#2874f0] hover:bg-blue-50 transition flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#388e3c]" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};
