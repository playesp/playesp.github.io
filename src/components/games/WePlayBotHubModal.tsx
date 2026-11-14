import React, { useState } from 'react';
import { 
  X, Shield, Sparkles, Trophy, Crown, Flame, 
  MessageSquare, Volume2, UserPlus, Gift, Play, 
  CheckCircle, ArrowRight, Star, Heart
} from 'lucide-react';
import type { WePlayBot, UserProfile } from '../../types/index.ts';
import { AvatarFrame } from '../AvatarFrame.tsx';

interface WePlayBotHubModalProps {
  user: UserProfile;
  bots: WePlayBot[];
  onClose: () => void;
  onInviteBotToSeat: (botId: string) => void;
  onSummonAllBots: () => void;
  onBotAction: (botCode: string, actionType?: string) => void;
  onOpenWerewolfGame: () => void;
  onOpenSharmaJiProfile: () => void;
}

export const WePlayBotHubModal: React.FC<WePlayBotHubModalProps> = ({
  user,
  bots,
  onClose,
  onInviteBotToSeat,
  onSummonAllBots,
  onBotAction,
  onOpenWerewolfGame,
  onOpenSharmaJiProfile,
}) => {
  const [selectedBotCode, setSelectedBotCode] = useState<string>('all');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const handleAction = (botCode: string, actionType?: string) => {
    onBotAction(botCode, actionType);
    if (botCode === 'judge') {
      setLastActionMessage('⚖️ न्यायाधीश ने इंसाफ का फैसला सुनाया और आपको 50 कॉइन्स रिवॉर्ड मिला!');
    } else if (botCode === 'we_bhai') {
      setLastActionMessage('🤝 वी भाई ने आपको 100 लकी कॉइन्स और गेमिंग टिप प्रदान की!');
    } else if (botCode === 'we_chat') {
      setLastActionMessage('💬 वी चैट ने महफ़िल में खूबसूरत शायरी व चुटकुला सुनाया!');
    } else if (botCode === 'wolf') {
      setLastActionMessage('🐺 भेड़िया बॉट ने रात के शिकार का आह्वान किया!');
    } else if (botCode === 'sharma_ji') {
      setLastActionMessage('👑 शर्मा जी ने 98,765 चार्म्स का शाही आशीर्वाद और 200 कॉइन्स दिए!');
    }
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-md max-w-2xl w-full shadow-2xl relative text-[#212121] my-auto max-h-[92vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-sm bg-[#ffe500] text-[#212121] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                ESP PLAY एजेंट बॉट्स व शर्मा जी सिस्टम
              </h3>
              <p className="text-[11px] text-blue-100">
                अगर आप अकेले ऑनलाइन हैं तो बॉट्स के साथ खेलें, बातें करें और मनोरंजन पाएं!
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Action Feedback Banner */}
          {lastActionMessage && (
            <div className="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center">
              {lastActionMessage}
            </div>
          )}

          {/* 🌟 SHARMA JI ROYAL GRANDMASTER SPOTLIGHT CARD */}
          <div className="p-4 rounded-md bg-amber-50/70 border border-amber-300 shadow-xs relative overflow-hidden">
            <div className="sm:absolute sm:top-0 sm:right-0 px-3 py-1 bg-[#ffe500] text-[#212121] font-black text-[10px] rounded-sm sm:rounded-none sm:rounded-bl-md uppercase tracking-wider inline-flex items-center space-x-1 shadow-2xs mb-2 sm:mb-0">
              <Crown className="w-3.5 h-3.5 text-[#fb641b]" />
              <span>Highest Level 99 • Grand Emperor</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 pt-1">
              <AvatarFrame
                src="https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyalLegend99"
                alt="Sharma Ji"
                size="lg"
                frameType="royal-dragon-crown"
                level={99}
                showCrown={true}
                isSpeaking={true}
              />

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <h4 className="text-base font-black text-[#212121]">
                    👑 Sharma Ji (शर्मा जी)
                  </h4>
                  <span className="px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121] font-black text-[10px] shadow-2xs">
                    क्राउन पोस्ट धारक 👑
                  </span>
                  <span className="px-2 py-0.5 rounded-sm bg-pink-50 border border-pink-200 text-pink-700 font-bold text-[10px]">
                    ✨ 98,765 Charms
                  </span>
                </div>
                <p className="text-xs text-[#212121]/80 leading-relaxed">
                  पूरे ESP PLAY & ESP इकोसिस्टम के सर्वोच्च लेजेंड! सबसे हाई लेवल (99), 98,765 चार्म्स और शाही ड्रैगन क्राउन फ्रेम के साथ स्टेज पर रौनक बिखेरते हैं।
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                  <button
                    onClick={() => {
                      onInviteBotToSeat('SHARMA-JI-VIP');
                      handleAction('sharma_ji');
                    }}
                    className="px-3.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>शर्मा जी को स्टेज पर बैठाएं</span>
                  </button>
                  <button
                    onClick={() => handleAction('sharma_ji')}
                    className="px-3.5 py-1.5 rounded-sm bg-white hover:bg-amber-100 border border-amber-300 text-[#212121] font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5 text-[#fb641b]" />
                    <span>आशीर्वाद व 200 कॉइन्स लें</span>
                  </button>
                  <button
                    onClick={onOpenSharmaJiProfile}
                    className="px-3 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#ffe500]" />
                    <span>राजमहल प्रोफाइल</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ⚡ INSTANT SOLO ROOM FILL BUTTON */}
          <div className="p-3.5 rounded-md bg-[#f5f8ff] border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="p-2.5 rounded-sm bg-[#2874f0] text-white shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#212121]">
                  क्या आप कमरे में अकेले हैं? (Solo Player Mode)
                </h4>
                <p className="text-[11px] text-[#878787]">
                  एक क्लिक में न्यायाधीश, भेड़िया बॉट, वी भाई, वी चैट और शर्मा जी को माइक सीट पर बुलाएं!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onSummonAllBots();
                setLastActionMessage('🎉 सभी ESP PLAY AI बॉट्स व शर्मा जी ने स्टेज जॉइन कर लिया!');
                setTimeout(() => setLastActionMessage(null), 4000);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-xs shadow-xs flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#ffe500]" />
              <span>सभी बॉट्स को स्टेज पर लाएं</span>
            </button>
          </div>

          {/* ALL ESP PLAY AGENT BOTS LIST & DUTY EXPLANATION */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-black uppercase text-[#2874f0] tracking-wider flex items-center space-x-1.5">
              <span>🤖 ESP PLAY बॉट रोस्टर एवं उनकी शक्तियां (Bot Superpowers)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* 1. ⚖️ NYAYADHISH (JUDGE BOT) */}
              <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 hover:border-[#2874f0] transition space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <AvatarFrame
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=JudgeNyayadhish99"
                      size="md"
                      frameType="judge-justice"
                      level={80}
                    />
                    <div>
                      <h5 className="text-sm font-black text-[#212121]">⚖️ न्यायाधीश (Judge Bot)</h5>
                      <span className="text-[10px] text-[#878787] block font-medium">नियम व निष्पक्षता निर्णायक</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-amber-50 text-amber-700 font-bold border border-amber-200">
                        Lvl 80 • 50,000 Charms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#212121] bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                  <p className="font-bold text-[#2874f0]">📌 काम व शक्तियां:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[#878787] text-[10px]">
                    <li>हर गेम मूव की निष्पक्ष निगरानी व चीटिंग रोकथाम।</li>
                    <li>विवाद होने पर फैसला सुनाना (Ruling) और इंसाफ बोनस देना।</li>
                    <li>कमरे में अनुशासन बनाए रखना और गाली-गलौज रोकना।</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAction('judge')}
                    className="flex-1 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>न्याय मांगें (+50 Coins)</span>
                  </button>
                  <button
                    onClick={() => onInviteBotToSeat('BOT-JUDGE')}
                    className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>सीट पर बैठाएं</span>
                  </button>
                </div>
              </div>

              {/* 2. 🐺 WOLF BOT (WEREWOLF NARRATOR) */}
              <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 hover:border-[#2874f0] transition space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <AvatarFrame
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=WerewolfHostWolf"
                      size="md"
                      frameType="wolf-night"
                      level={75}
                    />
                    <div>
                      <h5 className="text-sm font-black text-[#212121]">🐺 Werewolf Bot (भेड़िया बॉट)</h5>
                      <span className="text-[10px] text-[#878787] block font-medium">वेयरवुल्फ कथावाचक व गेम सूत्रधार</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        Lvl 75 • 45,000 Charms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#212121] bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                  <p className="font-bold text-purple-700">📌 काम व शक्तियां:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[#878787] text-[10px]">
                    <li>ESP PLAY के लोकप्रिय वेयरवुल्फ (भेड़िया) गेम का लाइव संचालन।</li>
                    <li>रात-दिन का चक्र, गुप्त भूमिकाएं (Seer, Doctor, Wolf) बांटना।</li>
                    <li>अकेले यूजर के लिए बॉट लॉबी बनाकर तुरंत गेम चालू करना।</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onOpenWerewolfGame}
                    className="flex-1 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>भेड़िया गेम खेलें</span>
                  </button>
                  <button
                    onClick={() => onInviteBotToSeat('BOT-WOLF')}
                    className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>सीट पर बैठाएं</span>
                  </button>
                </div>
              </div>

              {/* 3. 🤝 WE BHAI (ASSISTANT BOT) */}
              <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 hover:border-[#388e3c] transition space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <AvatarFrame
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBhojpuriBrother"
                      size="md"
                      frameType="vip-gold"
                      level={70}
                    />
                    <div>
                      <h5 className="text-sm font-black text-[#212121]">🤝 We Bhai (वी भाई)</h5>
                      <span className="text-[10px] text-[#878787] block font-medium">देसी कम्युनिटी गाइड व बोनस साथी</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-emerald-50 text-[#388e3c] font-bold border border-emerald-200">
                        Lvl 70 • 40,000 Charms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#212121] bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                  <p className="font-bold text-[#388e3c]">📌 काम व शक्तियां:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[#878787] text-[10px]">
                    <li>10 कमाई वाली सर्विसेज (EMO, MMO, NWI) के सटीक ट्रिक्स समझाना।</li>
                    <li>दैनिक 100 लकी कॉइन्स का उपहार देना।</li>
                    <li>स्टेज पर अकेलापन दूर कर देसी भाषा में हौसला बढ़ाना।</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAction('we_bhai')}
                    className="flex-1 py-1.5 rounded-sm bg-[#388e3c] hover:bg-[#2e7d32] text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>100 कॉइन बोनस लें</span>
                  </button>
                  <button
                    onClick={() => onInviteBotToSeat('BOT-BHAI')}
                    className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>सीट पर बैठाएं</span>
                  </button>
                </div>
              </div>

              {/* 4. 💬 WE CHAT (ENTERTAINMENT BOT) */}
              <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 hover:border-pink-400 transition space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <AvatarFrame
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=WeChatCompanionPoet"
                      size="md"
                      frameType="cosmic-neon"
                      level={65}
                    />
                    <div>
                      <h5 className="text-sm font-black text-[#212121]">💬 We Chat (वी चैट AI)</h5>
                      <span className="text-[10px] text-[#878787] block font-medium">मनोरंजन, शायरी और बातें</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-pink-50 text-pink-700 font-bold border border-pink-200">
                        Lvl 65 • 38,000 Charms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#212121] bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                  <p className="font-bold text-pink-700">📌 काम व शक्तियां:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[#878787] text-[10px]">
                    <li>24x7 मीठी हिंदी शायरी, हंसी-मज़ाक और महफ़िल का माहौल।</li>
                    <li>यूजर को अकेला न महसूस होने देना और लाइव जवाब देना।</li>
                    <li>गिफ्ट्स मिलने पर संगीत और चार्मिंग बधाइयां देना।</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAction('we_chat')}
                    className="flex-1 py-1.5 rounded-sm bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>शायरी / जोक्स सुनें</span>
                  </button>
                  <button
                    onClick={() => onInviteBotToSeat('BOT-CHAT')}
                    className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>सीट पर बैठाएं</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Footer info */}
          <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 text-[11px] text-[#878787] flex items-center justify-between gap-2">
            <span>💡 टिप: किसी भी बॉट को सीट पर बैठाकर आप माइक पर लाइव बातचीत कर सकते हैं।</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-sm bg-slate-200 hover:bg-slate-300 text-[#212121] font-bold text-xs cursor-pointer shrink-0"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
