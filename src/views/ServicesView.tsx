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
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  Award,
  Scale,
  ShieldCheck,
  FileText
} from 'lucide-react';
import type { ServiceItem, UserProfile } from '../types/index.ts';

interface ServicesViewProps {
  services: ServiceItem[];
  currentUser?: UserProfile | null;
  onSelectServiceForRegistration: (serviceCode: string, fee: number) => void;
  onGoToDashboard?: () => void;
  onSelectServiceCode?: (code: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenLegalModal?: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  currentUser,
  onSelectServiceForRegistration,
  onGoToDashboard,
  onSelectServiceCode,
  onSelectTab,
  onOpenLegalModal,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const getServiceIcon = (code: string) => {
    switch (code) {
      case 'EMO': return <Coins className="w-6 h-6 text-emerald-600" />;
      case 'MMO': return <TrendingUp className="w-6 h-6 text-amber-600" />;
      case 'MOM': return <Smartphone className="w-6 h-6 text-teal-600" />;
      case 'OES': return <Network className="w-6 h-6 text-blue-600" />;
      case 'MMS': return <Zap className="w-6 h-6 text-yellow-600" />;
      case 'NWI': return <Clock className="w-6 h-6 text-indigo-600" />;
      case 'SWI': return <UserCheck className="w-6 h-6 text-purple-600" />;
      case 'TWI': return <Users className="w-6 h-6 text-rose-600" />;
      case 'PROMOTE': return <Share2 className="w-6 h-6 text-orange-600" />;
      case 'REFER': return <Gift className="w-6 h-6 text-pink-600" />;
      default: return <Sparkles className="w-6 h-6 text-emerald-600" />;
    }
  };

  const getServiceFullListName = (code: string) => {
    switch (code) {
      case 'EMO': return '1️⃣ EARN MONEY ONLINE (EMO)';
      case 'MMO': return '2️⃣ MAKE MONEY ONLINE (MMO)';
      case 'MOM': return '3️⃣ MAKE ONLINE MONEY (MOM)';
      case 'OES': return '4️⃣ ONLINE EARNING SYSTEM (OES)';
      case 'MMS': return '5️⃣ MONEY MAKING SYSTEM (MMS)';
      case 'NWI': return '6️⃣ NON WORKING INCOME (NWI)';
      case 'SWI': return '7️⃣ SELF WORKING INCOME (SWI)';
      case 'TWI': return '8️⃣ TEAM WORKING INCOME (TWI)';
      case 'PROMOTE': return '9️⃣ PROMOTE & EARN';
      case 'REFER': return '🔟 REFER & EARN';
      default: return code;
    }
  };

  const getServiceMenuTitle = (code: string, idx: number) => {
    switch (code) {
      case 'EMO': return 'अबाउट फर्स्ट सर्विस: अबाउट अर्न मनी ऑनलाइन';
      case 'MMO': return 'अबाउट सेकंड सर्विस: अबाउट मेक मनी ऑनलाइन';
      case 'MOM': return 'अबाउट थर्ड सर्विस: अबाउट मेक ऑनलाइन मनी';
      case 'OES': return 'अबाउट फोर्थ सर्विस: अबाउट ऑनलाइन अर्निंग सिस्टम';
      case 'MMS': return 'अबाउट फिफ्थ सर्विस: अबाउट मनी मेकिंग सिस्टम';
      case 'NWI': return 'अबाउट सिक्स्थ सर्विस: अबाउट नॉन वर्किंग इनकम (NWI - रियल 3-लेवल टीम)';
      case 'SWI': return 'अबाउट सेवंथ सर्विस: अबाउट सेल्फ वर्किंग इनकम (SWI - 3.3% स्पेशल ऐप)';
      case 'TWI': return 'अबाउट एथ सर्विस: अबाउट टीम वर्किंग इनकम (TWIS - ऑल-प्लान रेफरल)';
      case 'PROMOTE': return 'अबाउट नाइंथ सर्विस: अबाउट प्रमोट & अर्न (खुद का बिज़नेस व शुभकामना)';
      case 'REFER': return 'अबाउट टेंथ सर्विस: अबाउट रेफर & अर्न (यूनिक कोड व अपग्रेड)';
      default: return `अबाउट सर्विस #${idx + 1}`;
    }
  };

  const handleOpenDetail = (code: string) => {
    if (onSelectServiceCode) {
      onSelectServiceCode(code);
    }
    if (onSelectTab) {
      onSelectTab('service-detail');
    }
  };

  const filteredServices = services.filter(s => {
    if (filter === 'all') return true;
    return s.category === filter;
  });

  return (
    <div className="space-y-4 py-4 pb-16 w-full overflow-x-hidden font-sans">
      {/* Flipkart Top Catalogue Banner */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        <div className="bg-[#2874f0] p-4 sm:p-6 text-white space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#ffe500] uppercase tracking-wide">
              ESP Official 10 Services Catalogue
            </span>
            <span className="text-xs text-blue-100 font-medium">
              मात्र ₹10 से प्रारंभ · 100% भारत सरकार नियमानुकूल
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
            सभी 10 अर्निंग सेवाओं का सम्पूर्ण व स्पष्ट विवरण
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-4xl">
            प्रत्येक सेवा के अंतर्गत क्या वास्तविक कार्य है, क्या डिजिटल टूल्स मिलते हैं और कितना रेफरल कमीशन प्राप्त होता है — नीचे पारदर्शी तरीके से देखें।
          </p>
        </div>

        <div className="px-4 sm:px-6 py-3 bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#212121]">
            <ShieldCheck className="w-4 h-4 text-[#388e3c] shrink-0" />
            <span>
              <strong>Legal Compliance:</strong> केवल वास्तविक कार्य, डिजिटल टूल्स व यूटिलिटी कमीशन मॉडल सक्रिय हैं।
            </span>
          </div>
          {onOpenLegalModal && (
            <button
              onClick={onOpenLegalModal}
              className="px-3 py-1.5 rounded-xs text-xs font-semibold bg-white hover:bg-[#f5f8ff] text-[#2874f0] border border-slate-300 transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Report →</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-sm p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap no-scrollbar shadow-xs">
        <span className="text-[11px] sm:text-xs font-bold text-[#878787] px-1.5 shrink-0">Filter:</span>
        {[
          { id: 'all', label: 'All 10 Services' },
          { id: 'task', label: 'Tasks & 3.3% App' },
          { id: 'direct', label: 'Promote & Refer' },
          { id: 'passive', label: 'NWI Passive' },
          { id: 'team', label: 'Team Work' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1.5 min-h-[34px] rounded-xs text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
              filter === cat.id
                ? 'bg-[#2874f0] text-white'
                : 'bg-[#f1f3f6] text-[#212121] hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Service Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((srv, idx) => {
          const isUserPlan = currentUser?.chosenServiceCode === srv.code;
          const menuTitle = getServiceMenuTitle(srv.code, idx);

          return (
            <div
              key={srv.id}
              className={`bg-white rounded-sm p-5 border transition flex flex-col justify-between shadow-xs hover:shadow-md ${
                isUserPlan ? 'border-[#388e3c] ring-1 ring-[#388e3c]' : 'border-slate-200 hover:border-[#2874f0]'
              }`}
            >
              <div className="space-y-3.5">
                {/* Top Metadata Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#878787] tabular-nums">
                    #0{idx + 1} · {srv.code}
                  </span>
                  <span className="text-xs font-bold text-white bg-[#388e3c] px-2 py-0.5 rounded-xs tabular-nums">
                    {srv.referralBonusPercent}% Referral
                  </span>
                </div>

                {/* Title & Icon */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-sm bg-[#f5f8ff] border border-blue-100 flex items-center justify-center shrink-0">
                    {getServiceIcon(srv.code)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-[#212121] text-base leading-snug">
                      {getServiceFullListName(srv.code)}
                    </h2>
                    <p className="text-xs font-medium text-[#2874f0] mt-0.5">{menuTitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                  {srv.hindiDescription || srv.description}
                </p>

                {/* Pricing & Earnings Strip */}
                <div className="bg-[#f9fafb] rounded-sm p-3.5 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs gap-2">
                    <span className="text-[#666666] font-semibold">उपलब्ध प्लान चार्ज:</span>
                    <div className="flex flex-wrap gap-1 justify-end tabular-nums">
                      {srv.joiningFeeTiers.map(fee => (
                        <span key={fee} className="bg-white text-[#212121] font-mono font-bold text-xs px-2 py-0.5 rounded-xs border border-slate-300">
                          ₹{fee}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
                    <span className="text-[#666666] font-semibold">अनुमानित आय:</span>
                    <span className="text-[#388e3c] font-bold text-xs sm:text-sm tabular-nums">{srv.dailyEarningEst}</span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase font-bold text-[#878787] tracking-wider">
                    प्रमुख लाभ (Highlights)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#212121]">
                    {srv.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 py-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#388e3c] shrink-0" />
                        <span className="truncate font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => handleOpenDetail(srv.code)}
                  className="w-full py-2.5 rounded-xs text-xs font-bold bg-[#2874f0] hover:bg-[#1c62d6] text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>पूरा विवरण व कमीशन चार्ट देखें (About {srv.code})</span>
                </button>

                {currentUser ? (
                  <button
                    onClick={onGoToDashboard}
                    className="w-full py-2 rounded-xs text-xs font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>डैशबोर्ड खोलें ({currentUser.userId})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-[#666666] font-semibold shrink-0">त्वरित प्रवेश:</span>
                    <div className="flex flex-1 flex-wrap gap-1.5">
                      {srv.joiningFeeTiers.slice(0, 4).map(tier => (
                        <button
                          key={tier}
                          onClick={() => onSelectServiceForRegistration(srv.code, tier)}
                          className="flex-1 min-w-[54px] py-1.5 rounded-xs text-xs font-bold bg-[#fb641b] hover:bg-[#e8550f] text-white transition text-center cursor-pointer tabular-nums"
                        >
                          ₹{tier}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
