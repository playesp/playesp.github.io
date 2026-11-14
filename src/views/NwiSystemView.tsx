import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Coins, 
  Wallet, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Gift, 
  Layers, 
  ArrowDownCircle, 
  HelpCircle,
  RefreshCw,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile, PlatformSettings, NwiTreeRecord, NwiMemberNode } from '../types/index.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';

interface NwiSystemViewProps {
  currentUser?: UserProfile | null;
  settings: PlatformSettings;
  onSelectTab: (tab: string) => void;
  onOpenLogin: () => void;
  onSelectServiceForRegistration: (serviceCode: string, fee: number) => void;
  onUpdateUser?: (user: UserProfile) => void;
}

export const NwiSystemView: React.FC<NwiSystemViewProps> = ({
  currentUser,
  settings,
  onSelectTab,
  onOpenLogin,
  onSelectServiceForRegistration,
  onUpdateUser,
}) => {
  const [tree, setTree] = useState<NwiTreeRecord | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [activeLevelTab, setActiveLevelTab] = useState<1 | 2 | 3>(1);
  const [selectedTierFee, setSelectedTierFee] = useState<number>(200);

  useEffect(() => {
    if (currentUser?.userId) {
      loadTreeData();
    }
  }, [currentUser?.userId]);

  const loadTreeData = async () => {
    if (!currentUser?.userId) return;
    setLoadingTree(true);
    try {
      const res = await api.getNwiTree(currentUser.userId);
      if (res && res.success && res.tree) {
        setTree(res.tree);
        setSelectedTierFee(res.tree.tierFee || 200);
      }
    } catch (err) {
      console.warn('Failed to fetch NWI tree', err);
    } finally {
      setLoadingTree(false);
    }
  };

  const handleClaim = async () => {
    if (!currentUser?.userId) {
      onOpenLogin();
      return;
    }

    setClaiming(true);
    try {
      const res = await api.claimNwiReward(currentUser.userId);
      if (res.success && res.claimedAmount) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        showToast(res.message, 'success');
        if (res.user && onUpdateUser) {
          onUpdateUser(res.user);
        }
        if (res.tree) {
          setTree(res.tree);
        }
      } else {
        showToast(res.message || 'क्लेम उपलब्ध नहीं है', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'क्लेम में समस्या आई', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const tierRates = {
    fee: selectedTierFee,
    l1: Math.round(selectedTierFee * 0.10),
    l2: Math.round(selectedTierFee * 0.15),
    l3: Math.round(selectedTierFee * 0.25),
    l1Total: Math.round(selectedTierFee * 0.10 * 3),
    l2Total: Math.round(selectedTierFee * 0.15 * 9),
    l3Total: Math.round(selectedTierFee * 0.25 * 27),
  };
  const grandTotalPassive = tierRates.l1Total + tierRates.l2Total + tierRates.l3Total;

  const totalRealMembers =
    (tree?.level1Members.length || 0) +
    (tree?.level2Members.length || 0) +
    (tree?.level3Members.length || 0);

  const currentMembersList: NwiMemberNode[] =
    activeLevelTab === 1
      ? tree?.level1Members || []
      : activeLevelTab === 2
      ? tree?.level2Members || []
      : tree?.level3Members || [];

  const handleCopySponsorLink = () => {
    if (!currentUser?.userId) return;
    const url = `${window.location.origin}/?ref=${currentUser.userId}`;
    navigator.clipboard.writeText(url);
    showToast(`स्पॉन्सर लिंक कॉपी हो गया! (${currentUser.userId})`, 'success');
  };

  return (
    <div className="space-y-4 py-4 pb-16 w-full max-w-7xl mx-auto overflow-x-hidden font-sans">
      {/* 1. HERO HEADER */}
      <section className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        <div className="bg-[#2874f0] p-5 sm:p-8 text-white space-y-4">
          <div className="max-w-4xl mx-auto text-center space-y-2.5">
            <p className="text-xs font-bold text-[#ffe500] uppercase tracking-wide flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span>NWI 3-Level Team Passive System</span>
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
              NWI 3-Level डाउनलाइन टीम व पैसिव इनकम
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-3xl mx-auto leading-relaxed">
              न एडमिन और न सिस्टम कोई नकली (Bot) टीम बनाएगा — बल्कि आपके नीचे जो <strong className="text-white">असली लेवल टीम (Level 1 → Level 2 → Level 3)</strong> जुड़ेगी, उससे आपको बिना अतिरिक्त काम किए 3 लेवल तक पैसिव इनकम (10%, 15%, 25%) सीधे वॉलेट में मिलेगी।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-5xl mx-auto pt-2 text-[#212121]">
            <div className="bg-white p-3.5 rounded-sm space-y-1">
              <p className="font-bold text-xs text-[#2874f0]">01 · असली टीम से नॉन-वर्किंग लाभ</p>
              <p className="text-[11px] text-[#555555]">
                आपके नीचे जुड़े मेंबर्स आगे अपनी टीम बनाते हैं — आपको लेवल 2 और लेवल 3 से बिना अतिरिक्त काम किए आय मिलती है।
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-sm space-y-1">
              <p className="font-bold text-xs text-[#388e3c]">02 · 100% रियल डेटाबेस ट्रैक</p>
              <p className="text-[11px] text-[#555555]">
                हर मेंबर की जॉइनिंग आपके असली स्पॉन्सर नेटवर्क से जुड़कर दिखती है (कोई फेक या बॉट नाम नहीं)।
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-sm space-y-1">
              <p className="font-bold text-xs text-[#fb641b]">03 · 3-लेवल सीधा वॉलेट क्लेम</p>
              <p className="text-[11px] text-[#555555]">
                Level 1 (10%), Level 2 (15%) व Level 3 (25%) का कमीशन 1-क्लिक में वॉलेट में लेकर UPI से निकालें।
              </p>
            </div>
          </div>

          {!currentUser && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onSelectServiceForRegistration('NWI', selectedTierFee)}
                className="w-full sm:w-auto px-7 py-3 rounded-xs font-bold text-white bg-[#fb641b] hover:bg-[#e8550f] text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>NWI ₹{selectedTierFee} 3-Level प्लान जॉइन करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-6 py-3 rounded-xs font-semibold text-[#2874f0] bg-white hover:bg-blue-50 text-xs sm:text-sm transition cursor-pointer"
              >
                पहले से एक्टिव हैं? लॉगिन करें
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. USER LIVE NWI DASHBOARD */}
      {currentUser && (
        <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 shadow-xs space-y-4 text-[#212121]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#388e3c] font-bold uppercase">
                  Status: {currentUser.status === 'active' ? 'ACTIVE' : 'PENDING'}
                </span>
                <span className="text-[#878787] font-mono">· ID: {currentUser.userId}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#212121] mt-0.5">
                {currentUser.fullName} का NWI रियल 3-Level डैशबोर्ड
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleCopySponsorLink}
                className="px-3.5 py-2 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white text-xs font-semibold transition cursor-pointer"
              >
                Copy Sponsor Link
              </button>
              <button
                onClick={loadTreeData}
                disabled={loadingTree}
                className="px-3.5 py-2 rounded-xs bg-white hover:bg-slate-50 text-[#212121] text-xs font-semibold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTree ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f9fafb] border border-slate-200 p-3.5 rounded-sm">
              <span className="text-[11px] text-[#878787] font-semibold uppercase block">NWI Active Tier</span>
              <span className="text-xl font-bold text-[#212121] tabular-nums">
                ₹{tree?.tierFee || selectedTierFee}
              </span>
              <span className="text-[11px] text-[#666666] block mt-0.5">रियल 3-लेवल ट्री</span>
            </div>

            <div className="bg-[#f9fafb] border border-slate-200 p-3.5 rounded-sm">
              <span className="text-[11px] text-[#878787] font-semibold uppercase block">Total 3-Level Earned</span>
              <span className="text-xl font-bold text-[#388e3c] tabular-nums">
                ₹{tree?.totalPassiveEarned || 0}
              </span>
              <span className="text-[11px] text-[#666666] block mt-0.5">{totalRealMembers} सक्रिय मेंबर्स से</span>
            </div>

            <div className="bg-[#f9fafb] border border-slate-200 p-3.5 rounded-sm">
              <span className="text-[11px] text-[#878787] font-semibold uppercase block">Claimed to Wallet</span>
              <span className="text-xl font-bold text-[#2874f0] tabular-nums">
                ₹{tree?.totalPassiveClaimed || 0}
              </span>
              <span className="text-[11px] text-[#666666] block mt-0.5">मेन बैलेंस में ट्रांसफर्ड</span>
            </div>

            <div className="bg-[#f5f8ff] border border-blue-200 p-3.5 rounded-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#2874f0] font-bold uppercase block">Pending Claim</span>
                <span className="text-xl font-bold text-[#212121] tabular-nums">
                  ₹{tree?.pendingToClaim || 0}
                </span>
              </div>
              <button
                onClick={handleClaim}
                disabled={claiming || !tree || tree.pendingToClaim <= 0}
                className={`mt-2 py-1.5 px-3 rounded-xs text-xs font-bold transition flex items-center justify-center gap-1 ${
                  tree && tree.pendingToClaim > 0
                    ? 'bg-[#fb641b] hover:bg-[#e8550f] text-white cursor-pointer'
                    : 'bg-slate-200 text-[#878787] cursor-not-allowed'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{claiming ? 'Claiming...' : 'Transfer to Wallet'}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. VISUAL 3-LEVEL TREE MATRIX */}
      <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 shadow-xs space-y-5 text-[#212121]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#212121]">
              रियल 3-लेवल डाउनलाइन टीम संरचना (Live Downline Tree)
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              आपके नीचे जुड़े असली मेंबर्स और उनके द्वारा आगे बनने वाली टीम का रियल-टाइम बंटवारा:
            </p>
          </div>
          <span className="text-xs font-bold text-[#2874f0] tabular-nums">
            Total Active Team: {currentUser ? totalRealMembers : 0}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              lvl: 1 as const,
              rate: '10%',
              title: 'डायरेक्ट टीम सदस्य',
              desc: 'आपके स्पॉन्सर कोड से सीधे जुड़ने वाले सक्रिय सदस्य।',
              members: tree?.level1Members.length || 0,
              perMember: tierRates.l1,
              income: tree?.level1Income || 0,
            },
            {
              lvl: 2 as const,
              rate: '15%',
              title: 'नॉन-वर्किंग लेवल 2',
              desc: 'लेवल 1 के मेंबर्स की टीम से जुड़ने वाले सदस्यों पर 15% पैसिव।',
              members: tree?.level2Members.length || 0,
              perMember: tierRates.l2,
              income: tree?.level2Income || 0,
            },
            {
              lvl: 3 as const,
              rate: '25%',
              title: 'नॉन-वर्किंग लेवल 3 (सर्वोच्च)',
              desc: 'लेवल 2 की टीम द्वारा जोड़े गए सदस्यों से बिना काम किए 25% रिटर्न।',
              members: tree?.level3Members.length || 0,
              perMember: tierRates.l3,
              income: tree?.level3Income || 0,
            },
          ].map(card => {
            const active = activeLevelTab === card.lvl;
            return (
              <div
                key={card.lvl}
                onClick={() => setActiveLevelTab(card.lvl)}
                className={`p-4 rounded-sm border transition cursor-pointer flex flex-col justify-between ${
                  active
                    ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-[#2874f0]'
                    : 'bg-white border-slate-200 hover:border-[#2874f0]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2874f0] uppercase">
                      LEVEL {card.lvl} ({card.rate})
                    </span>
                    <span className="text-xs font-bold text-[#388e3c] flex items-center gap-1 tabular-nums">
                      <Users className="w-3.5 h-3.5" />
                      <span>{card.members}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#212121]">{card.title}</h4>
                  <p className="text-xs text-[#555555]">{card.desc}</p>

                  <div className="bg-[#f9fafb] p-2.5 rounded-xs border border-slate-200 space-y-1 text-xs tabular-nums">
                    <div className="flex justify-between text-[#666666]">
                      <span>Rate ({card.rate}):</span>
                      <span className="text-[#212121] font-bold">₹{card.perMember} / ₹{selectedTierFee}</span>
                    </div>
                    <div className="flex justify-between text-[#666666] border-t border-slate-200 pt-1">
                      <span>Level {card.lvl} Earned:</span>
                      <span className="text-[#388e3c] font-bold">₹{card.income}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#2874f0] font-semibold">
                  <span>View members</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Real Members Roster */}
        <div className="bg-[#f9fafb] border border-slate-200 rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h5 className="text-xs sm:text-sm font-bold text-[#212121]">
              लेवल {activeLevelTab} असली मेंबर्स सूची ({currentMembersList.length} सक्रिय)
            </h5>
            <span className="text-xs text-[#388e3c] font-bold tabular-nums">
              {activeLevelTab === 1 ? '10%' : activeLevelTab === 2 ? '15%' : '25%'} Share
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {currentMembersList.length > 0 ? (
              currentMembersList.map((m, idx) => (
                <div
                  key={m.userId + idx}
                  className="bg-white border border-slate-200 p-2.5 rounded-sm flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#2874f0] text-white flex items-center justify-center font-bold shrink-0 text-xs overflow-hidden">
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.fullName} className="w-full h-full object-cover" />
                      ) : (
                        m.fullName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#212121] truncate text-xs">{m.fullName}</p>
                      <span className="text-[11px] text-[#878787] font-mono block tabular-nums">{m.userId} · ₹{m.planFee}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#388e3c] text-xs block tabular-nums">
                      +₹{m.rewardEarned}
                    </span>
                    <span className="text-[10px] text-[#878787]">L{activeLevelTab}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 space-y-2">
                <p className="text-[#212121] text-xs font-bold">
                  {currentUser
                    ? `अभी लेवल ${activeLevelTab} में कोई सक्रिय टीम सदस्य नहीं जुड़ा है।`
                    : 'अपनी लाइव 3-लेवल टीम देखने के लिए कृपया लॉगिन करें।'}
                </p>
                <p className="text-xs text-[#666666] max-w-md mx-auto">
                  जब कोई सदस्य आपके कोड से जुड़कर अपनी टीम बनाएगा, तो असली मेंबर्स यहाँ दिखाई देंगे।
                </p>
                {currentUser && (
                  <button
                    onClick={handleCopySponsorLink}
                    className="px-4 py-2 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white font-semibold text-xs cursor-pointer"
                  >
                    अपना स्पॉन्सर लिंक कॉपी करें →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. TIER SELECTOR & PROJECTION */}
      <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 shadow-xs space-y-5 text-[#212121]">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold text-[#2874f0] uppercase">3-Level Projection</span>
          <h3 className="text-lg sm:text-2xl font-bold text-[#212121]">
            NWI प्लान टियर चुनें व 3-लेवल टीम रिटर्न गणित देखें
          </h3>
          <p className="text-xs text-[#666666]">
            उदाहरण (3×3 टीम: Level 1 में 3 → Level 2 में 9 → Level 3 में 27 मेंबर्स) पर संभावित पैसिव रिटर्न:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
          {[200, 500, 1000, 2000].map(fee => (
            <button
              key={fee}
              onClick={() => setSelectedTierFee(fee)}
              className={`p-3 rounded-sm border text-center transition cursor-pointer ${
                selectedTierFee === fee
                  ? 'bg-[#2874f0] text-white border-[#2874f0] font-bold'
                  : 'bg-[#f9fafb] text-[#212121] border-slate-300 hover:border-[#2874f0]'
              }`}
            >
              <span className="text-base sm:text-lg font-bold tabular-nums block">₹{fee}</span>
              <span className={`text-[11px] block ${selectedTierFee === fee ? 'text-blue-100' : 'text-[#878787]'}`}>
                {fee === 200 ? 'Silver' : fee === 500 ? 'Gold' : fee === 1000 ? 'Diamond' : 'VIP Master'}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-[#f5f8ff] border border-blue-200 p-4 sm:p-5 rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-3">
            <div>
              <span className="text-xs text-[#666666]">Selected Plan:</span>
              <h4 className="text-lg sm:text-xl font-bold text-[#2874f0] tabular-nums">
                ₹{selectedTierFee} NWI 3-Level Plan
              </h4>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#666666]">3×3 उदाहरण संभावित आय:</span>
              <p className="text-2xl font-bold text-[#388e3c] tabular-nums">
                ₹{grandTotalPassive.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs tabular-nums">
            <div className="bg-white p-3 rounded-sm border border-slate-200">
              <span className="text-[#2874f0] font-bold block mb-1">Level 1 (3 members · 10%)</span>
              <p className="text-sm text-[#212121] font-bold">3 × ₹{tierRates.l1} = ₹{tierRates.l1Total}</p>
            </div>
            <div className="bg-white p-3 rounded-sm border border-slate-200">
              <span className="text-[#fb641b] font-bold block mb-1">Level 2 (9 members · 15%)</span>
              <p className="text-sm text-[#212121] font-bold">9 × ₹{tierRates.l2} = ₹{tierRates.l2Total}</p>
            </div>
            <div className="bg-white p-3 rounded-sm border border-slate-200">
              <span className="text-[#388e3c] font-bold block mb-1">Level 3 (27 members · 25%)</span>
              <p className="text-sm text-[#212121] font-bold">27 × ₹{tierRates.l3} = ₹{tierRates.l3Total}</p>
            </div>
          </div>

          <div className="flex justify-center pt-1">
            {currentUser ? (
              <button
                onClick={() => onSelectTab('dashboard')}
                className="w-full sm:w-auto px-8 py-3 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold text-xs sm:text-sm cursor-pointer"
              >
                डैशबोर्ड में NWI स्टेटस देखें →
              </button>
            ) : (
              <button
                onClick={() => onSelectServiceForRegistration('NWI', selectedTierFee)}
                className="w-full sm:w-auto px-8 py-3 rounded-xs bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>₹{selectedTierFee} से NWI प्लान एक्टिवेट करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-3 max-w-4xl mx-auto text-[#212121]">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <HelpCircle className="w-5 h-5 text-[#2874f0]" />
          <h4 className="text-base font-bold text-[#212121]">
            NWI रियल लेवल-टीम सिस्टम से जुड़े आम सवाल
          </h4>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="bg-[#f9fafb] p-3 rounded-sm border border-slate-200 space-y-1">
            <p className="font-bold text-[#212121]">Q1. NWI में नॉन-वर्किंग इनकम कैसे मिलती है?</p>
            <p className="text-[#555555] leading-relaxed">
              सिस्टम कोई नकली बॉट टीम नहीं बनाता। जब आपके नीचे असली लेवल टीम (Level 1, 2 व 3) बनती है, तो आपको लेवल 2 से 15% और लेवल 3 से 25% बिना अतिरिक्त काम किए पैसिव इनकम मिलती है।
            </p>
          </div>
          <div className="bg-[#f9fafb] p-3 rounded-sm border border-slate-200 space-y-1">
            <p className="font-bold text-[#212121]">Q2. 3 लेवल में कमीशन प्रतिशत कितना-कितना है?</p>
            <p className="text-[#555555] leading-relaxed">
              लेवल 1 पर 10%, लेवल 2 पर 15%, और लेवल 3 पर 25% (कुल 50% लेवल बंटवारा)।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
