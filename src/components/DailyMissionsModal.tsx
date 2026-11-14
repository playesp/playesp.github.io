import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, CheckCircle2, Award, Gift, Sparkles, Coins, Zap, 
  Flame, ChevronRight, Check, Trophy, Play, Radio, Camera,
  IdCard, Users, ExternalLink
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';

export interface GamingDailyMission {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  icon: string;
  coinReward: number;
  xpReward: number;
  actionLabel: string;
  actionKey: 'moments' | 'idcard' | 'voice' | 'spin' | 'gift' | 'clans';
}

export const GAMING_DAILY_MISSIONS: GamingDailyMission[] = [
  {
    id: 'mission-moments',
    title: 'Visit Moments Feed',
    hindiTitle: 'मोमेंट्स फीड देखें',
    description: 'कम्युनिटी मेंबर्स की पोस्ट्स, फोटो व स्टोरीज देखें',
    icon: '📸',
    coinReward: 60,
    xpReward: 30,
    actionLabel: 'Go to Moments',
    actionKey: 'moments',
  },
  {
    id: 'mission-idcard',
    title: 'Check Official ID Card',
    hindiTitle: 'अपना वेरीफाइड ID कार्ड चेक करें',
    description: 'अपना आधिकारिक डिजिटल मेम्बरशिप कार्ड खोलें व देखें',
    icon: '🪪',
    coinReward: 50,
    xpReward: 25,
    actionLabel: 'View ID Card',
    actionKey: 'idcard',
  },
  {
    id: 'mission-voice',
    title: 'Join Voice Room Stage',
    hindiTitle: 'वॉइस रूम स्टेज में शामिल हों',
    description: 'लाइव वॉइस रूम में जाकर दोस्तों से बातचीत करें',
    icon: '🎙️',
    coinReward: 80,
    xpReward: 40,
    actionLabel: 'Enter Stage',
    actionKey: 'voice',
  },
  {
    id: 'mission-spin',
    title: 'Spin Fortune Wheel',
    hindiTitle: 'फॉर्च्यून व्हील घुमाएं',
    description: 'डेली लकी फॉर्च्यून व्हील में अपनी किस्मत आजमाएं',
    icon: '🎡',
    coinReward: 50,
    xpReward: 25,
    actionLabel: 'Spin Wheel',
    actionKey: 'spin',
  },
  {
    id: 'mission-gift',
    title: 'Send a Room Gift or Diya',
    hindiTitle: 'कोई भी गिफ्ट या दीया भेजें',
    description: 'किसी भी मेंबर या स्टेज पर गिफ्ट भेजकर चार्म्स बढ़ाएं',
    icon: '🎁',
    coinReward: 100,
    xpReward: 50,
    actionLabel: 'Open Gift Shop',
    actionKey: 'gift',
  },
  {
    id: 'mission-clans',
    title: 'Check Top 5 Clans',
    hindiTitle: 'टॉप 5 क्लैन रैंकिंग देखें',
    description: 'लीडरबोर्ड में शीर्ष 5 क्लैन की कमाई व XP देखें',
    icon: '🛡️',
    coinReward: 40,
    xpReward: 20,
    actionLabel: 'View Clans',
    actionKey: 'clans',
  },
];

interface DailyMissionsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onPerformAction: (actionKey: 'moments' | 'idcard' | 'voice' | 'spin' | 'gift' | 'clans') => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onPerformAction,
}) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageStateKey = `esp_gaming_missions_${user.userId}_${todayKey}`;

  // State: Record of completed mission IDs and claimed mission IDs
  const [missionState, setMissionState] = useState<{
    completedIds: string[];
    claimedIds: string[];
    superChestClaimed: boolean;
  }>(() => {
    try {
      const stored = localStorage.getItem(storageStateKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { completedIds: [], claimedIds: [], superChestClaimed: false };
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  // Sync to localStorage
  const saveState = (newState: typeof missionState) => {
    setMissionState(newState);
    try {
      localStorage.setItem(storageStateKey, JSON.stringify(newState));
    } catch {}
  };

  if (!isOpen) return null;

  const totalMissions = GAMING_DAILY_MISSIONS.length;
  const completedCount = missionState.claimedIds.length;
  const isSuperChestReady = completedCount >= 4 && !missionState.superChestClaimed;

  const handleExecuteAction = (mission: GamingDailyMission) => {
    // Mark completed if not already
    if (!missionState.completedIds.includes(mission.id)) {
      const updated = {
        ...missionState,
        completedIds: [...missionState.completedIds, mission.id],
      };
      saveState(updated);
    }

    // Trigger parent action
    onPerformAction(mission.actionKey);
    setFeedback(`🎯 "${mission.title}" एक्शन पूरा हुआ! अब क्लेम बटन दबाकर रिवॉर्ड प्राप्त करें।`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleClaimReward = (mission: GamingDailyMission) => {
    if (missionState.claimedIds.includes(mission.id)) return;

    const updatedCoins = (user.coins || 0) + mission.coinReward;
    const updatedXp = (user.gameXp || 0) + mission.xpReward;

    onUpdateUser({
      ...user,
      coins: updatedCoins,
      gameXp: updatedXp,
    });

    const nextClaimed = [...missionState.claimedIds, mission.id];
    saveState({
      ...missionState,
      claimedIds: nextClaimed,
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    setFeedback(`🎉 बधाई! +${mission.coinReward} Coins और +${mission.xpReward} XP आपके खाते में जुड़ गए!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClaimSuperChest = () => {
    if (!isSuperChestReady) return;

    const bonusCoins = 200;
    const bonusCharms = 100;
    const updatedCoins = (user.coins || 0) + bonusCoins;
    const updatedCharms = (user.charms || 0) + bonusCharms;

    onUpdateUser({
      ...user,
      coins: updatedCoins,
      charms: updatedCharms,
    });

    saveState({
      ...missionState,
      superChestClaimed: true,
    });

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });

    setFeedback(`👑 सुपर चेस्ट खुला! +${bonusCoins} Coins और +${bonusCharms} Charms मिले!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden relative my-6 text-[#212121]">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-blue-600 bg-[#2874f0] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center text-xl shadow-xs font-black">
              🎯
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>Daily Missions System</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-xs bg-[#ffe500] text-[#212121]">
                  Resets Daily
                </span>
              </h3>
              <p className="text-[11px] text-blue-100">
                साधारण दैनिक कार्य पूरे करें और तुरंत फ्री Coins और XP प्राप्त करें
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-5 mt-3 px-4 py-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center animate-fadeIn">
            {feedback}
          </div>
        )}

        {/* Progress & Super Milestone Banner */}
        <div className="p-5 border-b border-slate-200 bg-[#f5f8ff]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#212121] flex items-center space-x-1.5">
              <span>Missions Progress</span>
              <span className="text-[#2874f0] font-mono font-black">({completedCount} / {totalMissions} Claimed)</span>
            </span>
            <span className="text-[11px] text-[#388e3c] font-black">
              {Math.round((completedCount / totalMissions) * 100)}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#2874f0] h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalMissions) * 100}%` }}
            />
          </div>

          {/* Super Milestone Chest Box */}
          <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="text-3xl animate-bounce">🎁</div>
              <div>
                <div className="text-xs font-black text-[#212121] flex items-center space-x-1.5 flex-wrap">
                  <span>Daily Super Chest (4/6 Missions)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#ffe500] text-[#212121] font-black">
                    +200 Coins +100 Charms
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {missionState.superChestClaimed
                    ? 'सुपर चेस्ट सफलतापूर्वक क्लेम कर लिया गया है!'
                    : completedCount >= 4
                    ? 'सुपर चेस्ट अनलॉक हो चुका है! नीचे दिए बटन से क्लेम करें।'
                    : `अनलॉक करने के लिए ${4 - completedCount} और मिशन पूरे करें`}
                </p>
              </div>
            </div>

            <div>
              {missionState.superChestClaimed ? (
                <span className="px-3 py-1.5 rounded-sm bg-emerald-50 text-[#388e3c] text-xs font-bold border border-emerald-200">
                  Claimed ✅
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleClaimSuperChest}
                  disabled={!isSuperChestReady}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-black transition shadow-2xs cursor-pointer ${
                    isSuperChestReady
                      ? 'bg-[#fb641b] hover:bg-[#e5530d] text-white animate-pulse'
                      : 'bg-white text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  Claim Chest
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto no-scrollbar bg-[#f1f3f6]">
          {GAMING_DAILY_MISSIONS.map(mission => {
            const isCompleted = missionState.completedIds.includes(mission.id);
            const isClaimed = missionState.claimedIds.includes(mission.id);

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-md border transition-all flex items-center justify-between gap-3 shadow-2xs ${
                  isClaimed
                    ? 'bg-[#f9fafb] border-slate-200 opacity-75'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white hover:border-[#2874f0] border-slate-200'
                }`}
              >
                {/* Left: Icon & Mission Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                    {mission.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-xs font-black text-[#212121]">
                        {mission.title}
                      </h4>
                      <span className="text-[10px] text-slate-500">({mission.hindiTitle})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                      {mission.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200 flex items-center space-x-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        <span>+{mission.coinReward} Coins</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#2874f0] bg-[#f5f8ff] px-2 py-0.5 rounded-xs border border-blue-200 flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-[#2874f0]" />
                        <span>+{mission.xpReward} XP</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Action or Claim Button */}
                <div className="shrink-0">
                  {isClaimed ? (
                    <div className="flex items-center space-x-1 text-[#388e3c] font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-sm border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>Claimed</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleClaimReward(mission)}
                      className="px-3.5 py-1.5 rounded-sm text-xs font-black bg-[#388e3c] hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer animate-bounce"
                    >
                      Claim
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleExecuteAction(mission)}
                      className="px-3.5 py-1.5 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white shadow-2xs transition cursor-pointer flex items-center space-x-1"
                    >
                      <span>{mission.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-600">
          <span>💡 प्रतिदिन रात 12 बजे नए मिशन रीसेट होते हैं।</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
