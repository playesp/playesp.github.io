import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, CheckCircle2, Calendar, Award, Gift, Clock, 
  Sparkles, Coins, Zap, Trophy, Flame, ChevronRight, Check
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';

export interface DailyTaskItem {
  id: string;
  title: string;
  hindiTitle: string;
  coinReward: number;
  xpReward: number;
  charmReward?: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

interface DailyTasksAndLoginModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
  initialTab?: 'tasks' | 'login';
}

export const DailyTasksAndLoginModal: React.FC<DailyTasksAndLoginModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  initialTab = 'tasks',
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'login'>(initialTab);

  // Claimed tasks state persisted in localStorage
  const [claimedTaskIds, setClaimedTaskIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`esp_daily_claimed_tasks_${user.userId}`);
      return stored ? JSON.parse(stored) : ['t1'];
    } catch {
      return ['t1'];
    }
  });

  // Claimed login days state
  const [claimedLoginDays, setClaimedLoginDays] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`esp_claimed_login_days_${user.userId}`);
      return stored ? JSON.parse(stored) : [1];
    } catch {
      return [1];
    }
  });

  const dailyTasksList: DailyTaskItem[] = [
    {
      id: 't1',
      title: 'Daily App Login',
      hindiTitle: 'दैनिक ऐप लॉगिन (Daily Login)',
      coinReward: 50,
      xpReward: 10,
      charmReward: 5,
      progress: 1,
      target: 1,
      isCompleted: true,
      isClaimed: claimedTaskIds.includes('t1'),
      icon: '📱',
    },
    {
      id: 't2',
      title: 'Spend 3 mins in Voice Room',
      hindiTitle: 'वॉइस रूम में 3 मिनट समय बिताएं',
      coinReward: 100,
      xpReward: 20,
      charmReward: 10,
      progress: 3,
      target: 3,
      isCompleted: true,
      isClaimed: claimedTaskIds.includes('t2'),
      icon: '🎙️',
    },
    {
      id: 't3',
      title: 'Send 1 Gift in Voice Room',
      hindiTitle: 'किसी भी साथी को 1 गिफ्ट भेजें',
      coinReward: 150,
      xpReward: 30,
      charmReward: 20,
      progress: (user.charms || 0) > 10 ? 1 : 0,
      target: 1,
      isCompleted: (user.charms || 0) > 10,
      isClaimed: claimedTaskIds.includes('t3'),
      icon: '🎁',
    },
    {
      id: 't4',
      title: 'Play 1 Game (Spy / Dice / Snake)',
      hindiTitle: 'जासूस कौन है या डाइस गेम खेलें',
      coinReward: 120,
      xpReward: 25,
      charmReward: 15,
      progress: 1,
      target: 1,
      isCompleted: true,
      isClaimed: claimedTaskIds.includes('t4'),
      icon: '🎲',
    },
    {
      id: 't5',
      title: 'Spin Daily Fortune Wheel',
      hindiTitle: 'डेली फॉर्च्यून स्पिन घुमाएं',
      coinReward: 80,
      xpReward: 15,
      charmReward: 10,
      progress: 1,
      target: 1,
      isCompleted: true,
      isClaimed: claimedTaskIds.includes('t5'),
      icon: '🎡',
    },
    {
      id: 't6',
      title: 'Share Room with Friends',
      hindiTitle: 'अपना रूम इनवाइट लिंक शेयर करें',
      coinReward: 200,
      xpReward: 40,
      charmReward: 30,
      progress: 0,
      target: 1,
      isCompleted: false,
      isClaimed: claimedTaskIds.includes('t6'),
      icon: '📢',
    },
  ];

  const SEVEN_DAY_REWARDS = [
    { day: 1, coins: 100, charms: 10, special: 'Starter Boost', icon: '🪙' },
    { day: 2, coins: 200, charms: 25, special: 'XP Spark', icon: '✨' },
    { day: 3, coins: 300, charms: 50, special: 'Lucky Diya', icon: '🪔' },
    { day: 4, coins: 500, charms: 100, special: 'Phuljhadi Gift', icon: '🎇' },
    { day: 5, coins: 750, charms: 150, special: 'Cyber Frame Trial', icon: '⚡' },
    { day: 6, coins: 1000, charms: 250, special: 'Super Ferrari Gift', icon: '🏎️' },
    { day: 7, coins: 2500, charms: 500, special: '👑 Grand Emperor Crown', icon: '👑' },
  ];

  const handleClaimTask = (task: DailyTaskItem) => {
    if (!task.isCompleted || task.isClaimed) return;

    const newClaimed = [...claimedTaskIds, task.id];
    setClaimedTaskIds(newClaimed);
    try {
      localStorage.setItem(`esp_daily_claimed_tasks_${user.userId}`, JSON.stringify(newClaimed));
    } catch {}

    onUpdateUser({
      ...user,
      coins: (user.coins || 0) + task.coinReward,
      gameXp: (user.gameXp || 0) + task.xpReward,
      charms: (user.charms || 0) + (task.charmReward || 0),
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleClaimLoginDay = (day: number, coins: number, charms: number) => {
    if (claimedLoginDays.includes(day)) return;

    const newClaimedDays = [...claimedLoginDays, day];
    setClaimedLoginDays(newClaimedDays);
    try {
      localStorage.setItem(`esp_claimed_login_days_${user.userId}`, JSON.stringify(newClaimedDays));
    } catch {}

    onUpdateUser({
      ...user,
      coins: (user.coins || 0) + coins,
      charms: (user.charms || 0) + charms,
      gameXp: (user.gameXp || 0) + 150,
    });

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-md border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-[#ffe500]" />
            <h3 className="text-base font-black text-white">
              दैनिक रिवॉर्ड्स व मिशन्स (Daily Tasks & Login)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {/* Tab Switcher: Tasks vs 7-Day Login */}
          <div className="grid grid-cols-2 gap-2 mb-4 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-3 rounded-sm font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>📋 दैनिक टास्क्स (Daily Tasks)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`py-2 px-3 rounded-sm font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'login'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>📅 7-डे लॉगिन (7-Day Login)</span>
            </button>
          </div>

          {/* TAB 1: DAILY TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {dailyTasksList.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 flex items-center justify-between hover:border-blue-300 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-2xl">{task.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#212121] truncate">
                        {task.hindiTitle}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                        <span className="text-[#fb641b] font-mono font-bold">🪙 +{task.coinReward} Coins</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#2874f0] font-mono font-bold">⚡ +{task.xpReward} XP</span>
                        {task.charmReward && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-pink-600 font-mono font-bold">✨ +{task.charmReward}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {task.isClaimed ? (
                      <span className="px-3 py-1 rounded-sm bg-emerald-50 text-[#388e3c] text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> क्लेम हुआ
                      </span>
                    ) : task.isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleClaimTask(task)}
                        className="px-3 py-1.5 rounded-sm font-black text-xs bg-[#fb641b] hover:bg-[#e8550f] text-white shadow-xs transition cursor-pointer"
                      >
                        क्लेम करें
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                        }}
                        className="px-3 py-1 rounded-sm bg-[#f5f8ff] text-[#2874f0] text-[11px] font-bold border border-blue-200 hover:bg-blue-50 cursor-pointer"
                      >
                        पूरा करें &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: 7-DAY LOGIN CALENDAR */}
          {activeTab === 'login' && (
            <div className="space-y-3">
              <p className="text-xs text-[#878787]">
                प्रतिदिन लगातार लॉगिन करें और 7वें दिन पाएं <strong className="text-[#212121]">2,500 कॉइन्स + 👑 शाही क्राउन बैज</strong>!
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {SEVEN_DAY_REWARDS.map((item) => {
                  const isClaimed = claimedLoginDays.includes(item.day);
                  const isCurrent = item.day === (claimedLoginDays.length + 1);

                  return (
                    <div
                      key={item.day}
                      onClick={() => {
                        if (!isClaimed && (isCurrent || item.day <= claimedLoginDays.length + 1)) {
                          handleClaimLoginDay(item.day, item.coins, item.charms);
                        }
                      }}
                      className={`p-2 rounded-sm border flex flex-col items-center justify-between text-center transition cursor-pointer ${
                        isClaimed
                          ? 'bg-emerald-50 border-emerald-200'
                          : isCurrent
                          ? 'bg-[#f5f8ff] border-[#2874f0] ring-2 ring-blue-200 shadow-sm scale-105'
                          : 'bg-[#f9fafb] border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-black text-[#878787]">Day {item.day}</span>
                      <span className="text-2xl my-1">{item.icon}</span>
                      <span className="text-[10px] font-mono font-black text-[#fb641b]">+{item.coins}c</span>
                      <span className="text-[9px] text-pink-600 font-bold">+{item.charms}✨</span>

                      <div className="mt-1">
                        {isClaimed ? (
                          <span className="text-[9px] font-black text-[#388e3c]">✅ लिया</span>
                        ) : isCurrent ? (
                          <span className="text-[9px] font-black text-[#2874f0] animate-pulse">क्लिक करें</span>
                        ) : (
                          <span className="text-[9px] text-slate-400">लॉक 🔒</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-[#878787]">
            <span>कॉइन बैलेंस: <strong className="text-[#fb641b]">🪙 {user.coins || 0}</strong></span>
            <span>चार्म्स: <strong className="text-pink-600">✨ {user.charms || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
