import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Award, Gift, Sparkles, Coins, Zap, 
  Flame, ChevronRight, Check, Trophy, Play, Radio
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';

export interface DashboardTask {
  id: string;
  title: string;
  hindiTitle: string;
  coinReward: number;
  xpReward: number;
  charmReward?: number;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  category: 'game' | 'gift' | 'social' | 'login';
  icon: string;
  actionText?: string;
}

interface DailyTasksProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onNavigateToGames?: () => void;
  onNavigateToVoiceRoom?: () => void;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({
  user,
  onUpdateUser,
  onNavigateToGames,
  onNavigateToVoiceRoom,
}) => {
  const storageKey = `esp_dashboard_tasks_claimed_${user.userId}_${new Date().toISOString().slice(0, 10)}`;
  const progressKey = `esp_dashboard_tasks_progress_${user.userId}_${new Date().toISOString().slice(0, 10)}`;

  const [claimedIds, setClaimedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [localProgress, setLocalProgress] = useState<{ [key: string]: number }>(() => {
    try {
      const stored = localStorage.getItem(progressKey);
      return stored ? JSON.parse(stored) : {
        gamesPlayed: (user.gameLevel || 1) >= 2 ? 3 : 1,
        giftsSent: (user.charms || 0) >= 50 ? 5 : 2,
        roomsVisited: 2,
        spinsCompleted: 1,
      };
    } catch {
      return {
        gamesPlayed: 1,
        giftsSent: 2,
        roomsVisited: 1,
        spinsCompleted: 1,
      };
    }
  });

  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const tasks: DashboardTask[] = [
    {
      id: 'dt_play_3_games',
      title: 'Play 3 Games',
      hindiTitle: '3 गेम्स खेलें (Who\'s the Spy, Card, Snake)',
      coinReward: 250,
      xpReward: 60,
      charmReward: 15,
      target: 3,
      progress: Math.min(3, localProgress.gamesPlayed || 0),
      isCompleted: (localProgress.gamesPlayed || 0) >= 3,
      isClaimed: claimedIds.includes('dt_play_3_games'),
      category: 'game',
      icon: '🎮',
      actionText: 'Play Games',
    },
    {
      id: 'dt_send_5_gifts',
      title: 'Send 5 Gifts',
      hindiTitle: 'वॉइस रूम में 5 गिफ्ट्स भेजें',
      coinReward: 400,
      xpReward: 100,
      charmReward: 50,
      target: 5,
      progress: Math.min(5, localProgress.giftsSent || 0),
      isCompleted: (localProgress.giftsSent || 0) >= 5,
      isClaimed: claimedIds.includes('dt_send_5_gifts'),
      category: 'gift',
      icon: '🎁',
      actionText: 'Send Gifts',
    },
    {
      id: 'dt_visit_voice_rooms',
      title: 'Join 2 Voice Rooms',
      hindiTitle: '2 लाइव वॉइस रूम्स में भाग लें',
      coinReward: 150,
      xpReward: 40,
      charmReward: 10,
      target: 2,
      progress: Math.min(2, localProgress.roomsVisited || 0),
      isCompleted: (localProgress.roomsVisited || 0) >= 2,
      isClaimed: claimedIds.includes('dt_visit_voice_rooms'),
      category: 'social',
      icon: '🎙️',
      actionText: 'Join Room',
    },
    {
      id: 'dt_daily_fortune_spin',
      title: 'Complete 1 Fortune Spin',
      hindiTitle: '24 घंटे का लकी स्पिन पूरा करें',
      coinReward: 100,
      xpReward: 30,
      charmReward: 10,
      target: 1,
      progress: Math.min(1, localProgress.spinsCompleted || 0),
      isCompleted: (localProgress.spinsCompleted || 0) >= 1,
      isClaimed: claimedIds.includes('dt_daily_fortune_spin'),
      category: 'login',
      icon: '🎡',
      actionText: 'Spin Now',
    },
    {
      id: 'dt_invite_friend',
      title: 'Share Sponsor Referral Link',
      hindiTitle: 'अपना स्पॉन्सर रेफरल लिंक शेयर करें',
      coinReward: 300,
      xpReward: 80,
      charmReward: 25,
      target: 1,
      progress: (user.referralEarnings || 0) > 0 ? 1 : 0,
      isCompleted: true,
      isClaimed: claimedIds.includes('dt_invite_friend'),
      category: 'social',
      icon: '📢',
      actionText: 'Share Link',
    }
  ];

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const claimedCount = tasks.filter(t => t.isClaimed).length;
  const totalCoinsAvailable = tasks.reduce((sum, t) => sum + t.coinReward, 0);

  const handleClaim = (task: DashboardTask) => {
    if (!task.isCompleted || task.isClaimed) return;

    const newClaimed = [...claimedIds, task.id];
    setClaimedIds(newClaimed);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newClaimed));
    } catch {}

    const newCoins = (user.coins || 0) + task.coinReward;
    const newXp = (user.gameXp || 0) + task.xpReward;
    const newCharms = (user.charms || 0) + (task.charmReward || 0);

    onUpdateUser({
      ...user,
      coins: newCoins,
      gameXp: newXp,
      charms: newCharms,
    });

    setClaimFeedback(`🎉 टास्क पूरा! 🪙 +${task.coinReward} Coins और ✨ +${task.charmReward || 0} Charms आपके खाते में जुड़ गए!`);
    setTimeout(() => setClaimFeedback(null), 4000);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-[#ffe500] flex items-center justify-center text-[#212121] font-black shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-[#212121]">
                Daily Tasks & Coin Rewards
              </h3>
              <span className="bg-[#ffe500] text-[#212121] font-extrabold text-[9px] px-2 py-0.5 rounded-sm">
                TODAY'S POOL
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              दैनिक गतिविधियां पूरी करें (जैसे 'Play 3 Games', 'Send 5 Gifts') और मुफ़्त कॉइन्स क्लेम करें!
            </p>
          </div>
        </div>

        {/* Overall Progress Counter */}
        <div className="flex items-center space-x-3 bg-[#f9fafb] px-3.5 py-2 rounded-md border border-slate-200 text-xs font-mono shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">Completed</span>
            <span className="font-black text-[#388e3c]">{completedCount}/{tasks.length}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">Claimed</span>
            <span className="font-black text-[#fb641b]">🪙 {claimedCount * 250}+</span>
          </div>
        </div>
      </div>

      {claimFeedback && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center animate-fadeIn">
          {claimFeedback}
        </div>
      )}

      {/* Task Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tasks.map((task) => {
          const progressPercent = Math.min(100, Math.round((task.progress / task.target) * 100));

          return (
            <div
              key={task.id}
              className={`p-4 rounded-md border transition-all relative overflow-hidden flex flex-col justify-between ${
                task.isClaimed
                  ? 'bg-[#f9fafb] border-slate-200 opacity-80'
                  : task.isCompleted
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-xl shrink-0">
                    {task.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#212121]">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {task.hindiTitle}
                    </p>
                  </div>
                </div>

                {/* Reward pill */}
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm bg-[#ffe500]/50 text-[#212121] border border-amber-300 font-mono text-xs font-black">
                    <span>🪙</span>
                    <span>+{task.coinReward}</span>
                  </span>
                  {task.charmReward && (
                    <span className="block text-[9px] text-[#2874f0] font-mono font-bold mt-0.5">
                      ✨ +{task.charmReward}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Actions */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-600">
                    <span>Progress: {task.progress}/{task.target}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        task.isCompleted ? 'bg-[#388e3c]' : 'bg-[#2874f0]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  {task.isClaimed ? (
                    <span className="px-3 py-1.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5 text-[#388e3c]" />
                      <span>Claimed</span>
                    </span>
                  ) : task.isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(task)}
                      className="px-3.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-xs font-bold text-white flex items-center space-x-1 shadow-xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim +{task.coinReward}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (task.category === 'game') onNavigateToGames?.();
                        else if (task.category === 'gift' || task.category === 'social') onNavigateToVoiceRoom?.();
                      }}
                      className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 text-[#2874f0] border border-blue-200 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <span>{task.actionText || 'Go & Do'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
