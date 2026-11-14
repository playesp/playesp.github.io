import React, { useState } from 'react';
import { 
  X, 
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
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Award, 
  ShieldCheck, 
  ChevronRight,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import type { UserProfile, PlatformSettings } from '../types/index.ts';

export interface PopUpServiceItem {
  code: string;
  num: string;
  name: string;
  hindiName: string;
  category: 'beginner' | 'core' | 'passive' | 'team' | 'referral';
  fee: number;
  minFeeLabel: string;
  dailyPotential: string;
  summaryHindi: string;
  descriptionHindi: string;
  whatYouLearn: string[];
  earningsFormula: string;
  colorGrad: string;
  borderColor: string;
  badgeBg: string;
}

export const ALL_10_POPUP_SERVICES: PopUpServiceItem[] = [
  {
    code: 'EMO',
    num: '1️⃣',
    name: 'EARN MONEY ONLINE (EMO)',
    hindiName: 'अबाउट फर्स्ट सर्विस: अबाउट अर्न मनी ऑनलाइन',
    category: 'beginner',
    fee: 10,
    minFeeLabel: '₹10 मात्र',
    dailyPotential: '₹100 - ₹500 प्रति दिन',
    summaryHindi: 'छात्र-छात्राओं व नए मेंबर्स के लिए सबसे सरल बेसिक ऑनलाइन अर्निंग मॉड्यूल।',
    descriptionHindi: 'EMO सर्विस छात्रों के लिए घर बैठे फोन से सूक्ष्म अर्निंग (Micro Tasks, Daily Clicks, Data Validation, Mini Quizzes) सीखने और तुरंत ₹10 से ₹500 कमाने का 100% लीगल माध्यम है।',
    whatYouLearn: [
      'स्मार्टफोन से माइक्रो टास्क पूरे करने का बेसिक तरीका',
      'दैनिक डिजिटल विज़िट और फीडबैक सबमिशन',
      'डायरेक्ट ₹50 UPI निकासी प्रक्रिया',
      'छात्र पॉकेट मनी बजटिंग'
    ],
    earningsFormula: 'दैनिक 5 टास्क × ₹20 = ₹100/दिन (महीने का ₹3,000+ पॉकेट मनी)',
    colorGrad: 'from-emerald-50 via-white to-white',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-[#388e3c] text-white',
  },
  {
    code: 'MMO',
    num: '2️⃣',
    name: 'MAKE MONEY ONLINE (MMO)',
    hindiName: 'अबाउट सेकंड सर्विस: अबाउट मेक मनी ऑनलाइन',
    category: 'core',
    fee: 50,
    minFeeLabel: '₹50 मात्र',
    dailyPotential: '₹200 - ₹800 प्रति दिन',
    summaryHindi: 'इंटरमीडिएट स्किल-बेस्ड डिजिटल टास्क और कंटेंट शेयरिंग सिस्टम।',
    descriptionHindi: 'MMO में छात्र सोशल टूल्स, स्टेटस प्रमोशन, ऐप टेस्टिंग और रिव्यू सबमिशन से उच्च दैनिक इंसेंटिव कमाते हैं। हर टास्क का त्वरित डिजिटल वेरिफिकेशन होता है।',
    whatYouLearn: [
      'सोशल मीडिया प्रमोशन और रीच बढ़ाना',
      'प्रोडक्ट व सर्विस रिव्यू राइटिंग',
      'डिजिटल कैंपेन में भाग लेना',
      'प्रीमियम टास्क लॉयल्टी पॉइंट्स'
    ],
    earningsFormula: '3 रिव्यू टास्क + 2 शेयरिंग = ₹250/दिन (महीने का ₹7,500+)',
    colorGrad: 'from-amber-50 via-white to-white',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-[#fb641b] text-white',
  },
  {
    code: 'MOM',
    num: '3️⃣',
    name: 'MAKE ONLINE MONEY (MOM)',
    hindiName: 'अबाउट थर्ड सर्विस: अबाउट मेक ऑनलाइन मनी',
    category: 'core',
    fee: 100,
    minFeeLabel: '₹100 मात्र',
    dailyPotential: '₹300 - ₹1,200 प्रति दिन',
    summaryHindi: 'मोबाइल बेस्ड एडवांस ऑटोमेशन व एफिलिएट लिंक जेनरेशन।',
    descriptionHindi: 'MOM सर्विस छात्रों को व्हाट्सएप, इंस्टाग्राम और टेलीग्राम पर लिंक शेयर करके 24 घंटे पैसिव क्लिक्स और रेफरल कन्वर्शन से बड़ी इनकम दिलाती है।',
    whatYouLearn: [
      'हाई-कन्वर्टिंग एफिलिएट लिंक बनाना',
      'व्हाट्सएप ग्रुप्स और स्टेटस ट्रैफिक जनरेशन',
      'क्लिक ट्रैकिंग व एनालिसिस',
      'इंस्टेंट UPI ऑटो-क्रेडिट'
    ],
    earningsFormula: '10 कनवर्टेड क्लिक्स = ₹500/दिन (महीने का ₹15,000+)',
    colorGrad: 'from-cyan-50 via-white to-white',
    borderColor: 'border-cyan-200',
    badgeBg: 'bg-[#2874f0] text-white',
  },
  {
    code: 'OES',
    num: '4️⃣',
    name: 'ONLINE EARNING SYSTEM (OES)',
    hindiName: 'अबाउट फोर्थ सर्विस: अबाउट ऑनलाइन अर्निंग सिस्टम',
    category: 'core',
    fee: 500,
    minFeeLabel: '₹500 प्रीमियम',
    dailyPotential: '₹800 - ₹3,000 प्रति दिन',
    summaryHindi: 'फुल ऑटोमेटेड ऑनलाइन अर्निंग व एंटरप्रेन्योरशिप मास्टरक्लास।',
    descriptionHindi: 'OES हमारा सबसे प्रसिद्ध फ्लैगशिप सिस्टम है जिसमें 10 लेवल कमीशन, डिजिटल रीसेलिंग, वीआईपी रूम ओनरशिप और पर्सनल स्पॉन्सरशिप लीडरशिप मिलती है।',
    whatYouLearn: [
      'फुल ऑटोमेटेड अर्निंग फनल सेटअप',
      'वीआईपी वॉइस रूम होस्टिंग व वर्चुअल गिफ्टिंग',
      'टीम मैनेजमेंट व डेली लीडरबोर्ड स्ट्रैटेजी',
      'हाई-टिकट एफिलिएट मार्केटिंग'
    ],
    earningsFormula: 'टीम वॉल्यूम + डायरेक्ट रेफरल = ₹1,500/दिन (महीने का ₹45,000+)',
    colorGrad: 'from-blue-50 via-white to-white',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-[#2874f0] text-white',
  },
  {
    code: 'MMS',
    num: '5️⃣',
    name: 'MONEY MAKING SYSTEM (MMS)',
    hindiName: 'अबाउट फिफ्थ सर्विस: अबाउट मनी मेकिंग सिस्टम',
    category: 'core',
    fee: 100,
    minFeeLabel: '₹100 मात्र',
    dailyPotential: '₹250 - ₹900 प्रति दिन',
    summaryHindi: 'कंटेंट क्रिएशन, मीम्स व दैनिक क्विज से कमाई का मनोरंजक मॉडल।',
    descriptionHindi: 'MMS में छात्र-छात्राएं ज्ञानवर्धक क्विज खेलकर, मोमेंट्स फीड में पोस्ट करके और वीप्ले रूम में दोस्तों को जोड़कर रोमांचक अर्निंग करते हैं।',
    whatYouLearn: [
      'दैनिक मोमेंट्स और मीम पोस्टिंग गाइड',
      'क्विज और लाइव गेम रिवॉर्ड क्लेम',
      'कॉइन से रियल कैश कन्वर्शन',
      'फ्रेंड्स एंगेजमेंट स्ट्रैटेजी'
    ],
    earningsFormula: 'डेली मोमेंट्स + गेमिंग जीत = ₹300/दिन',
    colorGrad: 'from-yellow-50 via-white to-white',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-[#ffe500] text-[#212121]',
  },
  {
    code: 'NWI',
    num: '6️⃣',
    name: 'NON WORKING INCOME (NWI)',
    hindiName: 'अबाउट सिक्स्थ सर्विस: 3-लेवल डाउनलाइन पैसिव इनकम',
    category: 'passive',
    fee: 200,
    minFeeLabel: '₹200 टियर',
    dailyPotential: '10% L1 | 15% L2 | 25% L3 पैसिव शेयर',
    summaryHindi: 'आपके नीचे बनने वाली वास्तविक 3-लेवल टीम से बिना अतिरिक्त काम किए पैसिव नॉन-वर्किंग इनकम।',
    descriptionHindi: 'NWI में सिस्टम या एडमिन कोई फेक बॉट टीम नहीं जोड़ता। जब आपके नीचे वास्तविक 3-लेवल टीम (Level 1: 10%, Level 2: 15%, Level 3: 25%) बनती है, तो उन सभी से आपको डायरेक्ट पैसिव इनकम वॉलेट में मिलती है।',
    whatYouLearn: [
      '100% वास्तविक 3-लेवल डाउनलाइन पैसिव स्ट्रक्चर',
      'Level-1 (10%), Level-2 (15%), Level-3 (25%) कमीशन मॉडल',
      '1-क्लिक में वॉलेट में अनक्लेम्ड रिवॉर्ड ट्रांसफर',
      '35% अतिरिक्त डायरेक्ट रेफरल विकल्प'
    ],
    earningsFormula: '3×3 उदाहरण (₹200 टियर): L1 ₹60 + L2 ₹270 + L3 ₹1,350 = ₹1,680+ पैसिव रिटर्न',
    colorGrad: 'from-purple-50 via-white to-white',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-600 text-white',
  },
  {
    code: 'SWI',
    num: '7️⃣',
    name: 'SELF WORKING INCOME (SWI)',
    hindiName: 'अबाउट सेवंथ सर्विस: 3.3% स्पेशल रिचार्ज ऐप (₹300)',
    category: 'beginner',
    fee: 300,
    minFeeLabel: '₹300 स्पेशल ऐप',
    dailyPotential: '3.3% रिचार्ज कमीशन + ₹150 (50%) रेफर',
    summaryHindi: 'खास ₹300 वाला 3.3% कमीशन स्पेशल रिचार्ज ऐप! वेरिफिकेशन के बाद सीधे डैशबोर्ड में ऐप लिंक।',
    descriptionHindi: 'SWI में मात्र ₹300 प्लान लेकर आपको हमारा खास 3.3% कमीशन वाला रिचार्ज ऐप मिलता है। एडमिन वेरिफिकेशन के बाद आपके डैशबोर्ड में ऐप लिंक शेयर किया जाएगा और हर रेफरल पर 50% (₹150) सीधा मिलेगा।',
    whatYouLearn: [
      'हर मोबाइल व DTH रिचार्ज पर पक्का 3.3% फिक्स्ड कमीशन',
      'वेरिफिकेशन के तुरंत बाद डैशबोर्ड में 3.3% App Link अनलॉक',
      'प्रति SWI रेफरल पर सीधा 50% (₹150) वॉलेट में',
      'PhonePe/GPay के एक्स्ट्रा प्लेटफॉर्म चार्ज से हमेशा मुक्ति'
    ],
    earningsFormula: '₹300 जॉइनिंग • प्रति रेफरल ₹150 (50%) + खुद के रिचार्ज पर 3.3% पक्का कमीशन',
    colorGrad: 'from-sky-50 via-white to-white',
    borderColor: 'border-sky-200',
    badgeBg: 'bg-[#2874f0] text-white',
  },
  {
    code: 'TWI',
    num: '8️⃣',
    name: 'TEAM WORKING INCOME (TWI)',
    hindiName: 'अबाउट एथ सर्विस: ऑल-प्लान क्रॉस-रेफरल व टीम',
    category: 'team',
    fee: 300,
    minFeeLabel: '₹100 - ₹300',
    dailyPotential: '40% - 70% क्रॉस-प्लान रेफरल + 0.5% टीम रिचार्ज',
    summaryHindi: 'कोई भी एक प्लान लेकर सभी 10 प्लान्स (EMO, SWI, MOM आदि) में टीम बनाने व रेफर करने की पूरी छूट।',
    descriptionHindi: 'TWIS में आपने चाहे कोई भी प्लान चुना हो, आप अपने रोल नंबर से किसी भी अन्य प्लान में नए सदस्यों को रेफर करके टीम बना सकते हैं और टीम के रिचार्ज पर आजीवन 0.1% से 0.5% ओवरराइड पा सकते हैं।',
    whatYouLearn: [
      'ऑल-प्लान क्रॉस-रेफरल (Any-to-Any Plan Referral)',
      '40% डायरेक्ट कमीशन व 0.1%–0.5% टीम रिचार्ज ओवरराइड',
      'एक ही यूनिक रोल नंबर से पूरे 10 प्लान्स में टीम बिल्डिंग',
      'टीम डैशबोर्ड व रियल-टाइम डाउनलाइन ट्रैकिंग'
    ],
    earningsFormula: '20 एक्टिव मेंबर्स टीम + क्रॉस-प्लान रेफरल = ₹1,000 - ₹3,000/दिन',
    colorGrad: 'from-rose-50 via-white to-white',
    borderColor: 'border-rose-200',
    badgeBg: 'bg-rose-600 text-white',
  },
  {
    code: 'PROMOTE',
    num: '9️⃣',
    name: 'PROMOTE & EARN',
    hindiName: 'अबाउट नाइंथ सर्विस: खुद का बिज़नेस, पोस्टर व शुभकामना',
    category: 'referral',
    fee: 50,
    minFeeLabel: '₹50 मात्र',
    dailyPotential: 'स्व-बिज़नेस ग्रोथ + 40% रेफरल (₹20–₹100)',
    summaryHindi: 'ESP प्लेटफॉर्म डिटेल्स के साथ अपने खुद के बिज़नेस, दुकान या सर्विस का प्रचार — बैनर, पोस्टर व शुभकामना कार्ड।',
    descriptionHindi: 'PROMOTE & EARN के अंदर आप अपने बिज़नेस, दुकान, यूट्यूब या सर्विस का नाम व ऑफर डालकर ESP QR और प्लेटफॉर्म डिटेल्स के साथ HD प्रमोशन बैनर, विज्ञापन पोस्टर और शुभकामना कार्ड बना व शेयर कर सकते हैं।',
    whatYouLearn: [
      'खुद का बिज़नेस / दुकान विज्ञापन पोस्टर स्टूडियो',
      'त्योहार, पर्व व बधाई शुभकामना (Shubhkamna) कार्ड जनरेटर',
      'ESP डिटेल्स व अपना रेफरल QR साथ में जोड़ने की सुविधा',
      '40% डायरेक्ट रेफरल कमीशन + दैनिक स्टेटस टास्क आय'
    ],
    earningsFormula: 'अपना बिज़नेस प्रमोशन + ESP रेफरल QR शेयर = दोहरी कमाई व ग्राहक वृद्धि',
    colorGrad: 'from-orange-50 via-white to-white',
    borderColor: 'border-orange-200',
    badgeBg: 'bg-[#fb641b] text-white',
  },
  {
    code: 'REFER',
    num: '🔟',
    name: 'REFER & EARN',
    hindiName: 'अबाउट टेंथ सर्विस: यूनिवर्सल कोड व ₹100+ अपग्रेड',
    category: 'referral',
    fee: 100,
    minFeeLabel: '₹10+ / ₹100+ अपग्रेड',
    dailyPotential: '50% डायरेक्ट (₹5 - ₹500) + ₹2/₹10 वेलकम बोनस',
    summaryHindi: 'सभी 10 प्लान में चलने वाला एकमात्र स्पॉन्सर कोड और डैशबोर्ड से ₹100+ प्लान अपग्रेड सिस्टम।',
    descriptionHindi: 'एक बार ESP रोल नंबर मिलने के बाद आप उसे किसी भी प्लान में रेफर करने के लिए उपयोग कर सकते हैं। साथ ही डैशबोर्ड से ₹100+ देकर SWI (₹300) या किसी भी उच्च प्लान में अपग्रेड होने पर स्पॉन्सर को 50% बोनस मिलता है।',
    whatYouLearn: [
      'सभी 10 प्लान्स में काम करने वाला यूनिवर्सल स्पॉन्सर कोड',
      'डैशबोर्ड में सीधे ₹100+ से सेल्फ प्लान अपग्रेड सुविधा',
      '50% डायरेक्ट व अपग्रेड कमीशन तुरंत वॉलेट में',
      'वेरिफिकेशन पर ₹2 (₹10 प्लान) व ₹10 (₹50+ प्लान) वेलकम बोनस'
    ],
    earningsFormula: 'प्रति रेफरल 50% इंस्टेंट कैश (₹5 से ₹500) + अपग्रेड बोनस',
    colorGrad: 'from-indigo-50 via-white to-white',
    borderColor: 'border-indigo-200',
    badgeBg: 'bg-[#2874f0] text-white',
  },
];

interface ServicesPopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onSelectServiceForRegistration: (code: string, fee: number) => void;
  onSelectServiceCode?: (code: string) => void;
}

export const ServicesPopUpModal: React.FC<ServicesPopUpModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectServiceForRegistration,
  onSelectServiceCode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDetailService, setActiveDetailService] = useState<PopUpServiceItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredServices = selectedCategory === 'all'
    ? ALL_10_POPUP_SERVICES
    : ALL_10_POPUP_SERVICES.filter(s => s.category === selectedCategory);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleEnrollNow = (srv: PopUpServiceItem) => {
    onClose();
    if (onSelectServiceCode) onSelectServiceCode(srv.code);
    onSelectServiceForRegistration(srv.code, srv.fee);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-4xl shadow-xl relative max-h-[92vh] flex flex-col overflow-hidden text-[#212121] my-auto">

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#2874f0] text-white border-b border-blue-600 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#ffe500] flex items-center justify-center shadow-xs text-[#212121] font-black text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap">
                  <span>10 समर्पित अर्निंग सेवाएं</span>
                  <span className="text-[10px] bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-xs font-black">
                    POP-UP SYSTEM
                  </span>
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5">
                छात्र-छात्राओं के लिए मात्र ₹10 से शुरू • 100% लीगल व वेरिफाइड इनकम कोर्सेज
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            title="बंद करें (Close Pop-up)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-[#f1f3f6]">
          
          {/* If detail view is open inside the pop-up */}
          {activeDetailService ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Back to list button */}
              <button
                onClick={() => setActiveDetailService(null)}
                className="inline-flex items-center space-x-2 text-xs font-bold text-[#2874f0] hover:bg-[#f5f8ff] bg-white px-3 py-1.5 rounded-sm border border-slate-300 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>वापस सभी 10 सेवाएं देखें</span>
              </button>

              {/* Service Full Card in Pop-up */}
              <div className={`p-5 sm:p-6 rounded-md bg-gradient-to-br ${activeDetailService.colorGrad} border ${activeDetailService.borderColor} shadow-sm space-y-4`}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xl sm:text-2xl">{activeDetailService.num}</span>
                      <h3 className="text-lg sm:text-2xl font-black text-[#212121]">
                        {activeDetailService.name}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-xs shadow-2xs ${activeDetailService.badgeBg}`}>
                        {activeDetailService.minFeeLabel}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2874f0] font-bold mt-1">
                      {activeDetailService.hindiName}
                    </p>
                  </div>

                  <div className="text-right bg-[#f5f8ff] p-2.5 rounded-md border border-blue-200">
                    <span className="text-[10px] text-slate-600 uppercase font-bold block">दैनिक अर्निंग संभावना</span>
                    <span className="text-sm sm:text-base font-black text-[#388e3c] font-mono">
                      {activeDetailService.dailyPotential}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    📌 सर्विस का मुख्य उद्देश्य (Overview):
                  </h4>
                  <p className="text-xs sm:text-sm text-[#212121] leading-relaxed bg-[#f9fafb] p-3 rounded-md border border-slate-200">
                    {activeDetailService.descriptionHindi}
                  </p>
                </div>

                {/* What You Learn */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#2874f0]">
                    🎯 इस सर्विस में आप क्या सीखेंगे व करेंगे:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeDetailService.whatYouLearn.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-[#212121] bg-white p-2.5 rounded-md border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#388e3c] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formula */}
                <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-black text-[#388e3c] uppercase block">कमाई का फॉर्मूला (Earning Calculation):</span>
                    <span className="font-semibold text-[#212121]">{activeDetailService.earningsFormula}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#388e3c] text-white px-2.5 py-1 rounded-xs">
                    100% लीगल • ₹50 UPI विड्रॉल
                  </span>
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleEnrollNow(activeDetailService)}
                    className="flex-1 py-3 px-6 rounded-sm font-black text-sm text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>इस सर्विस में तुरंत एडमिशन लें ({activeDetailService.minFeeLabel})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopyCode(activeDetailService.code)}
                    className="py-3 px-4 rounded-sm font-bold text-xs bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {copiedCode === activeDetailService.code ? <Check className="w-4 h-4 text-[#388e3c]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode === activeDetailService.code ? 'कोड कॉपी हुआ!' : `कोड कॉपी (${activeDetailService.code})`}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pb-1">
                {[
                  { id: 'all', label: 'सभी 10 सेवाएं (All 10)', icon: '🌟' },
                  { id: 'beginner', label: 'शुरुआती ₹10 (Beginner)', icon: '🌱' },
                  { id: 'core', label: 'कोर अर्निंग (₹50-₹500)', icon: '💼' },
                  { id: 'team', label: 'टीम व नेटवर्क (40%)', icon: '👥' },
                  { id: 'referral', label: 'रेफरल व प्रमोशन', icon: '🎁' },
                  { id: 'passive', label: 'लॉयल्टी पूल (Passive)', icon: '⏳' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                      selectedCategory === tab.id
                        ? 'bg-[#2874f0] text-white shadow-xs'
                        : 'bg-white text-[#212121] hover:bg-[#f5f8ff] border border-slate-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* 10 Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredServices.map((srv) => (
                  <div
                    key={srv.code}
                    className={`p-4 rounded-md bg-gradient-to-br ${srv.colorGrad} border ${srv.borderColor} shadow-2xs hover:border-[#2874f0] transition group flex flex-col justify-between space-y-3`}
                  >
                    {/* Top Row: Icon, Code & Fee */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{srv.num}</span>
                        <div>
                          <h3 className="font-black text-sm text-[#212121] group-hover:text-[#2874f0] transition">
                            {srv.name}
                          </h3>
                          <p className="text-[11px] text-[#2874f0] font-semibold">
                            {srv.hindiName}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-xs shrink-0 shadow-2xs ${srv.badgeBg}`}>
                        {srv.minFeeLabel}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 leading-snug">
                      {srv.summaryHindi}
                    </p>

                    {/* Earning potential badge */}
                    <div className="bg-[#f5f8ff] px-2.5 py-1.5 rounded-sm border border-blue-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">दैनिक क्षमता:</span>
                      <span className="text-[#388e3c] font-mono font-bold">{srv.dailyPotential}</span>
                    </div>

                    {/* Action Buttons in Card */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                      <button
                        onClick={() => setActiveDetailService(srv)}
                        className="py-2 px-2.5 rounded-sm text-xs font-bold bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 transition flex items-center justify-center space-x-1 cursor-pointer"
                        title="पॉप-अप में पूरा विवरण देखें"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#2874f0]" />
                        <span>विवरण पढ़ें</span>
                      </button>

                      <button
                        onClick={() => handleEnrollNow(srv)}
                        className="py-2 px-2.5 rounded-sm text-xs font-black text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-2xs flex items-center justify-center space-x-1 cursor-pointer"
                        title="अभी जॉइन करें"
                      >
                        <span>एडमिशन लें</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#388e3c]" />
            <span>100% भारत सरकार के नियमों के अनुरूप • कोई छुपा शुल्क नहीं</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 font-bold transition cursor-pointer"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
