import React, { useState } from 'react';
import {
  X, Shield, Sparkles, MessageSquare, UserPlus, Play, Heart
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
  onOpenSharmaJiProfile?: () => void;
}

export const WePlayBotHubModal: React.FC<WePlayBotHubModalProps> = ({
  onClose,
  onInviteBotToSeat,
  onSummonAllBots,
  onBotAction,
  onOpenWerewolfGame,
}) => {
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const handleAction = (botCode: string, actionType?: string) => {
    onBotAction(botCode, actionType);
    if (botCode === 'judge') {
      setLastActionMessage('⚖️ न्यायाधीश AI ने निष्पक्ष नियम समीक्षा की घोषणा की!');
    } else if (botCode === 'we_bhai') {
      setLastActionMessage('🤝 वी भाई ने कहा: असली टास्क पूरे करें (+5 Coins + EXP प्रति टास्क) और लीडरबोर्ड में ऊपर बढ़ें!');
    } else if (botCode === 'we_chat') {
      setLastActionMessage('💬 वी चैट ने महफ़िल में स्वागत शायरी साझा की!');
    } else if (botCode === 'wolf') {
      setLastActionMessage('🐺 भेड़िया बॉट वेयरवुल्फ गेम के लिए तैयार है!');
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
              <h3 className="text-base sm:text-lg font-black text-white">
                ESP PLAY बॉट सहायता केंद्र (Game & Chat Bots)
              </h3>
              <p className="text-[11px] text-blue-100">
                मनोरंजन, गेम संचालन और नियम मार्गदर्शन (कोई मुफ़्त फर्जी कॉइन ड्रॉप नहीं)
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
          {lastActionMessage && (
            <div className="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center">
              {lastActionMessage}
            </div>
          )}

          {/* Solo Room Fill Banner */}
          <div className="p-3.5 rounded-md bg-[#f5f8ff] border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="p-2.5 rounded-sm bg-[#2874f0] text-white shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#212121]">
                  वॉइस रूम प्रैक्टिस बॉट्स (Solo Mode)
                </h4>
                <p className="text-[11px] text-[#878787]">
                  गेम प्रैक्टिस व चैट मनोरंजन के लिए चारों गेमिंग बॉट्स को माइक स्टेज पर बुलाएं।
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onSummonAllBots();
                setLastActionMessage('🎉 सभी गेमिंग बॉट्स ने प्रैक्टिस स्टेज जॉइन कर लिया!');
                setTimeout(() => setLastActionMessage(null), 4000);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-xs shadow-xs flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#ffe500]" />
              <span>बॉट्स स्टेज पर लाएं</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Judge Bot */}
            <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <AvatarFrame
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=JudgeNyayadhish99"
                  size="md"
                  frameType="judge-justice"
                />
                <div>
                  <h5 className="text-sm font-black text-[#212121]">⚖️ न्यायाधीश (Judge Bot)</h5>
                  <span className="text-[10px] text-[#878787] block font-medium">नियम व निष्पक्षता निर्णायक</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAction('judge')}
                  className="flex-1 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>नियम समीक्षा</span>
                </button>
                <button
                  onClick={() => onInviteBotToSeat('BOT-JUDGE')}
                  className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs cursor-pointer"
                >
                  सीट पर बैठाएं
                </button>
              </div>
            </div>

            {/* 2. Wolf Bot */}
            <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <AvatarFrame
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=WerewolfHostWolf"
                  size="md"
                  frameType="wolf-night"
                />
                <div>
                  <h5 className="text-sm font-black text-[#212121]">🐺 Werewolf Bot</h5>
                  <span className="text-[10px] text-[#878787] block font-medium">वेयरवुल्फ कथावाचक</span>
                </div>
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
                  className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs cursor-pointer"
                >
                  सीट पर बैठाएं
                </button>
              </div>
            </div>

            {/* 3. We Bhai */}
            <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <AvatarFrame
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBhojpuriBrother"
                  size="md"
                  frameType="vip-gold"
                />
                <div>
                  <h5 className="text-sm font-black text-[#212121]">🤝 We Bhai (गाइड बॉट)</h5>
                  <span className="text-[10px] text-[#878787] block font-medium">टास्क व प्लान गाइड</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAction('we_bhai')}
                  className="flex-1 py-1.5 rounded-sm bg-[#388e3c] hover:bg-[#2e7d32] text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>टास्क टिप सुनें</span>
                </button>
                <button
                  onClick={() => onInviteBotToSeat('BOT-BHAI')}
                  className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs cursor-pointer"
                >
                  सीट पर बैठाएं
                </button>
              </div>
            </div>

            {/* 4. We Chat */}
            <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <AvatarFrame
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=WeChatCompanionPoet"
                  size="md"
                  frameType="cosmic-neon"
                />
                <div>
                  <h5 className="text-sm font-black text-[#212121]">💬 We Chat (एंटरटेनमेंट)</h5>
                  <span className="text-[10px] text-[#878787] block font-medium">शायरी व मज़ेदार बातें</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAction('we_chat')}
                  className="flex-1 py-1.5 rounded-sm bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>शायरी सुनें</span>
                </button>
                <button
                  onClick={() => onInviteBotToSeat('BOT-CHAT')}
                  className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-xs cursor-pointer"
                >
                  सीट पर बैठाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
