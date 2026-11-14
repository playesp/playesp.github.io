import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Gift, Clock, Sparkles, Check, ChevronRight, 
  HelpCircle, Trophy, Award, Star, Zap, Coins 
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';

export interface MysteryBoxConfig {
  id: number;
  label: string;
  durationSeconds: number;
  name: string;
  hindiName: string;
  coinRewardMin: number;
  coinRewardMax: number;
  charmRewardMin: number;
  charmRewardMax: number;
  specialItem: string;
  specialItemIcon: string;
}

export const TIMED_BOXES_CONFIG: MysteryBoxConfig[] = [
  {
    id: 1,
    label: '1 Min',
    durationSeconds: 60,
    name: 'Quick Welcome Chest',
    hindiName: '1 मिनट क्विक बॉक्स',
    coinRewardMin: 50,
    coinRewardMax: 150,
    charmRewardMin: 10,
    charmRewardMax: 25,
    specialItem: 'Bingo Power Bank Card',
    specialItemIcon: '🔋',
  },
  {
    id: 2,
    label: '3 Min',
    durationSeconds: 180,
    name: 'Explorer Chest',
    hindiName: '3 मिनट एक्सप्लोरर बॉक्स',
    coinRewardMin: 80,
    coinRewardMax: 200,
    charmRewardMin: 15,
    charmRewardMax: 40,
    specialItem: 'Drum Music Frame (1-Day)',
    specialItemIcon: '🥁',
  },
  {
    id: 3,
    label: '5 Min',
    durationSeconds: 300,
    name: 'Bronze Treasure',
    hindiName: '5 मिनट ब्रॉन्ज खजाना',
    coinRewardMin: 120,
    coinRewardMax: 300,
    charmRewardMin: 25,
    charmRewardMax: 60,
    specialItem: 'Dancing Cactus Gift',
    specialItemIcon: '🌵',
  },
  {
    id: 4,
    label: '10 Min',
    durationSeconds: 600,
    name: 'Silver Vault',
    hindiName: '10 मिनट सिल्वर वॉल्ट',
    coinRewardMin: 200,
    coinRewardMax: 500,
    charmRewardMin: 40,
    charmRewardMax: 100,
    specialItem: 'Trickster Gift Card',
    specialItemIcon: '🃏',
  },
  {
    id: 5,
    label: '15 Min',
    durationSeconds: 900,
    name: 'Golden Chest',
    hindiName: '15 मिनट गोल्डन चेस्ट',
    coinRewardMin: 350,
    coinRewardMax: 750,
    charmRewardMin: 70,
    charmRewardMax: 150,
    specialItem: 'Graceful Greeting Banner',
    specialItemIcon: '📜',
  },
  {
    id: 6,
    label: '30 Min',
    durationSeconds: 1800,
    name: 'Diamond Treasury',
    hindiName: '30 मिनट डायमंड खजाना',
    coinRewardMin: 600,
    coinRewardMax: 1200,
    charmRewardMin: 120,
    charmRewardMax: 250,
    specialItem: 'Diwali Phuljhadi Sparkler',
    specialItemIcon: '🎇',
  },
  {
    id: 7,
    label: '45 Min',
    durationSeconds: 2700,
    name: 'Royal Emperor Safe',
    hindiName: '45 मिनट शाही खजाना',
    coinRewardMin: 1000,
    coinRewardMax: 2000,
    charmRewardMin: 200,
    charmRewardMax: 450,
    specialItem: 'Cyber Neon Trial Frame',
    specialItemIcon: '⚡',
  },
  {
    id: 8,
    label: '1 Hour',
    durationSeconds: 3600,
    name: '1-Hour Grand Mythic Chest',
    hindiName: '1 घंटा महा-खजाना (Supreme)',
    coinRewardMin: 2500,
    coinRewardMax: 5000,
    charmRewardMin: 500,
    charmRewardMax: 1200,
    specialItem: '👑 Sharma Ji Royal Symphony & Gold Ring',
    specialItemIcon: '👑',
  },
];

interface TimedMysteryChestModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
}

export const TimedMysteryChestModal: React.FC<TimedMysteryChestModalProps> = ({
  user,
  onUpdateUser,
  onClose,
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<number>(1);
  const [openedBoxIds, setOpenedBoxIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`esp_opened_timed_boxes_${user.userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    try {
      const start = localStorage.getItem(`esp_room_session_start_${user.userId}`);
      if (start) {
        return Math.floor((Date.now() - parseInt(start, 10)) / 1000);
      }
      const now = Date.now();
      localStorage.setItem(`esp_room_session_start_${user.userId}`, now.toString());
      return 0;
    } catch {
      return 0;
    }
  });

  const [isOpeningAnimation, setIsOpeningAnimation] = useState(false);
  const [openedRewardPackage, setOpenedRewardPackage] = useState<{
    coins: number;
    charms: number;
    specialItem: string;
    specialItemIcon: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const start = localStorage.getItem(`esp_room_session_start_${user.userId}`);
        if (start) {
          setElapsedSeconds(Math.floor((Date.now() - parseInt(start, 10)) / 1000));
        }
      } catch {}
    }, 1000);
    return () => clearInterval(timer);
  }, [user.userId]);

  const activeBox = TIMED_BOXES_CONFIG.find(b => b.id === selectedBoxId) || TIMED_BOXES_CONFIG[0];
  const isBoxOpened = openedBoxIds.includes(activeBox.id);
  const remainingSeconds = Math.max(0, activeBox.durationSeconds - elapsedSeconds);
  const isBoxReadyToClaim = !isBoxOpened && remainingSeconds === 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOpenChest = () => {
    if (isOpeningAnimation || isBoxOpened || (!isBoxReadyToClaim && (user.coins || 0) < 100)) return;

    setIsOpeningAnimation(true);

    setTimeout(() => {
      const coinsWon = Math.floor(Math.random() * (activeBox.coinRewardMax - activeBox.coinRewardMin + 1)) + activeBox.coinRewardMin;
      const charmsWon = Math.floor(Math.random() * (activeBox.charmRewardMax - activeBox.charmRewardMin + 1)) + activeBox.charmRewardMin;

      const reward = {
        coins: coinsWon,
        charms: charmsWon,
        specialItem: activeBox.specialItem,
        specialItemIcon: activeBox.specialItemIcon,
      };

      setOpenedRewardPackage(reward);
      setIsOpeningAnimation(false);

      const newOpened = [...openedBoxIds, activeBox.id];
      setOpenedBoxIds(newOpened);
      try {
        localStorage.setItem(`esp_opened_timed_boxes_${user.userId}`, JSON.stringify(newOpened));
      } catch {}

      onUpdateUser({
        ...user,
        coins: (user.coins || 0) + coinsWon,
        charms: (user.charms || 0) + charmsWon,
        gameXp: (user.gameXp || 0) + 100,
      });

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-md border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2874f0] text-white border-b border-blue-600 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-[#ffe500] px-2.5 py-0.5 rounded-sm text-xs font-black text-[#212121]">
              <span>🪙</span>
              <span className="font-mono">{user.coins || 0}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/15 px-2.5 py-0.5 rounded-sm border border-white/25 text-xs font-black text-white">
              <span>✨</span>
              <span className="font-mono">{user.charms || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-black tracking-wide text-white flex items-center gap-1">
              <span>Rewards Center</span>
              <HelpCircle className="w-3.5 h-3.5 text-blue-100 cursor-pointer" />
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* User Level and XP Progress Bar */}
          <div className="flex items-center space-x-3 bg-[#f5f8ff] p-2.5 rounded-sm border border-blue-100 relative z-10">
            <div className="w-9 h-9 rounded-full bg-[#2874f0] p-0.5 shrink-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                alt="Avatar"
                className="w-full h-full rounded-full bg-white object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-black text-[#212121] truncate">✨ {user.fullName} ✨</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-sm bg-[#2874f0] text-white">
                  Lv {user.gameLevel || 2}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#388e3c] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((user.gameXp || 75) % 200) / 2)}%` }}
                />
              </div>
            </div>
            <div className="text-base shrink-0 animate-bounce">
              🎁
            </div>
          </div>

          {/* 8 Timed Chests Tab Strip */}
          <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none relative z-10">
            {TIMED_BOXES_CONFIG.map((b) => {
              const isOpened = openedBoxIds.includes(b.id);
              const isSelected = selectedBoxId === b.id;
              const isReady = !isOpened && elapsedSeconds >= b.durationSeconds;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBoxId(b.id);
                    setOpenedRewardPackage(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-sm font-black text-[11px] shrink-0 flex items-center space-x-1 transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                      : isOpened
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : isReady
                      ? 'bg-emerald-50 text-[#388e3c] border-emerald-300 animate-pulse'
                      : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span>{isOpened ? '✅' : isReady ? '🎁' : '⏱️'}</span>
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>

          {/* CENTER 3D PODIUM AND GLOWING CHEST */}
          <div className="flex flex-col items-center justify-center my-4 py-3 rounded-md bg-[#f5f8ff] border border-blue-100 relative z-10">
            <div className="relative flex flex-col items-center justify-center w-64 h-44">
              <div
                className={`relative z-20 cursor-pointer transform transition duration-300 ${
                  isOpeningAnimation ? 'animate-bounce scale-110' : 'hover:scale-105'
                }`}
                onClick={handleOpenChest}
              >
                {/* Wooden & Gold Treasure Chest Visual */}
                <div className="w-44 h-32 relative bg-gradient-to-b from-[#b45309] via-[#92400e] to-[#78350f] rounded-2xl border-4 border-amber-300 shadow-xl flex flex-col items-center justify-center overflow-hidden">
                  <div className="w-full h-10 bg-gradient-to-b from-[#d97706] to-[#b45309] border-b-4 border-amber-400 flex items-center justify-center">
                    <div className="w-16 h-2 bg-amber-300 rounded-full opacity-60" />
                  </div>
                  <div className="my-auto w-10 h-10 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-500 border-2 border-amber-600 shadow-lg flex items-center justify-center font-black text-amber-950 text-xs">
                    {isBoxOpened ? '✓' : '🔒'}
                  </div>
                  <div className="w-full h-2 bg-amber-400/80 mt-auto" />

                  {isBoxReadyToClaim && (
                    <span className="absolute -top-1 px-2.5 py-0.5 rounded-sm bg-[#388e3c] text-white font-black text-[10px] shadow animate-bounce">
                      खोलें (READY)!
                    </span>
                  )}
                  {isBoxOpened && (
                    <span className="absolute -top-1 px-2.5 py-0.5 rounded-sm bg-slate-700 text-white font-bold text-[9px]">
                      CLAIMED ✅
                    </span>
                  )}
                </div>
              </div>

              {/* Pedestal Base below chest */}
              <div className="w-56 h-8 bg-gradient-to-r from-[#2874f0] via-blue-500 to-[#2874f0] rounded-[100%] shadow-md border-t-2 border-blue-200 -mt-3 relative z-10 flex items-center justify-center">
                <div className="w-44 h-4 bg-blue-900/30 rounded-[100%]" />
              </div>
            </div>

            <h4 className="text-base font-black text-[#212121] mt-1">
              {activeBox.name}
            </h4>
            <p className="text-xs text-[#2874f0] font-bold">
              {activeBox.hindiName}
            </p>
          </div>

          {/* Package Reward Preview Cards Horizontal Grid */}
          <div className="bg-[#f9fafb] p-3 rounded-sm border border-slate-200 mb-3 relative z-10">
            <p className="text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>संभावित उपहार पैकेज (Chest Reward Cards):</span>
              <span className="text-[#fb641b] font-black">{activeBox.coinRewardMin}-{activeBox.coinRewardMax} Coins</span>
            </p>

            <div className="grid grid-cols-5 gap-1.5 text-center">
              <div className="bg-white p-1.5 rounded-sm border border-slate-200 flex flex-col items-center">
                <span className="text-lg">{activeBox.specialItemIcon}</span>
                <span className="text-[9px] font-bold text-[#212121] truncate max-w-[50px] mt-0.5">
                  {activeBox.specialItem.split(' ')[0]}
                </span>
                <span className="text-[8px] text-[#fb641b] font-mono font-bold">x1</span>
              </div>
              <div className="bg-white p-1.5 rounded-sm border border-slate-200 flex flex-col items-center">
                <span className="text-lg">🪙</span>
                <span className="text-[9px] font-bold text-[#212121] truncate max-w-[50px] mt-0.5">Coins</span>
                <span className="text-[8px] text-[#fb641b] font-mono font-bold">+{activeBox.coinRewardMax}</span>
              </div>
              <div className="bg-white p-1.5 rounded-sm border border-slate-200 flex flex-col items-center">
                <span className="text-lg">✨</span>
                <span className="text-[9px] font-bold text-[#212121] truncate max-w-[50px] mt-0.5">Charms</span>
                <span className="text-[8px] text-pink-600 font-mono font-bold">+{activeBox.charmRewardMax}</span>
              </div>
              <div className="bg-white p-1.5 rounded-sm border border-slate-200 flex flex-col items-center">
                <span className="text-lg">📜</span>
                <span className="text-[9px] font-bold text-[#212121] truncate max-w-[50px] mt-0.5">Greeting</span>
                <span className="text-[8px] text-[#2874f0] font-mono font-bold">x1</span>
              </div>
              <div className="bg-white p-1.5 rounded-sm border border-slate-200 flex flex-col items-center">
                <span className="text-lg">⚡</span>
                <span className="text-[9px] font-bold text-[#212121] truncate max-w-[50px] mt-0.5">EXP</span>
                <span className="text-[8px] text-[#388e3c] font-mono font-bold">+100</span>
              </div>
            </div>
          </div>

          {/* Opened Reward Popup Announcement */}
          {openedRewardPackage && (
            <div className="mb-3 p-3.5 rounded-sm bg-emerald-50 border border-emerald-300 text-center animate-fadeIn shadow-sm relative z-20">
              <h5 className="text-xs font-black text-[#388e3c] uppercase tracking-wide">
                🎉 बधाई हो! आपको पैकेज में मिला:
              </h5>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs font-bold">
                <span className="text-[#fb641b]">🪙 +{openedRewardPackage.coins} Coins</span>
                <span className="text-pink-600">✨ +{openedRewardPackage.charms} Charms</span>
                <span className="text-[#2874f0]">{openedRewardPackage.specialItemIcon} {openedRewardPackage.specialItem}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="relative z-10 pt-1">
            {isBoxOpened ? (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-sm font-black text-sm bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>यह बॉक्स पहले ही खोला जा चुका है (Already Claimed)</span>
              </button>
            ) : isBoxReadyToClaim ? (
              <button
                type="button"
                onClick={handleOpenChest}
                disabled={isOpeningAnimation}
                className="w-full py-3.5 rounded-sm font-black text-base text-white bg-[#388e3c] hover:bg-[#2e7d32] transition shadow-sm cursor-pointer flex items-center justify-center space-x-2 animate-pulse"
              >
                <span>{isOpeningAnimation ? 'बॉक्स खुल रहा है...' : 'Open (मुफ़्त खोलें) x1'}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleOpenChest}
                  disabled={isOpeningAnimation || (user.coins || 0) < 100}
                  className="w-full py-3.5 rounded-sm font-black text-sm text-white bg-[#fb641b] hover:bg-[#e8550f] transition shadow-sm cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>Open Instant (100 Coins) x1</span>
                </button>
                <p className="text-center text-[11px] text-[#878787] flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>मुफ़्त खुलने में समय शेष: <strong className="text-[#2874f0] font-mono">{formatTime(remainingSeconds)}</strong></span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
