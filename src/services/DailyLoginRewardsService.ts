import type { UserProfile } from '../types/index.ts';

export interface TieredReward {
  day: number;
  coins: number;
  charms: number;
  xp: number;
  exclusiveItem?: string;
  exclusiveItemIcon?: string;
  badge?: string;
  description: string;
}

export interface RealTimeDayReward {
  day: number;
  dateStr: string;
  displayDate: string;
  dayName: string;
  coins: number;
  isMysteryGift: boolean;
  status: 'claimed' | 'missed' | 'today_can_claim' | 'today_claimed' | 'upcoming';
  reward: TieredReward;
}

export const LOGIN_REWARDS_TIERS: TieredReward[] = [
  {
    day: 1,
    coins: 15,
    charms: 10,
    xp: 25,
    exclusiveItem: 'Bronze Welcome Pin',
    exclusiveItemIcon: '🥉',
    description: 'Day 1 starter coins (15 Coins)'
  },
  {
    day: 2,
    coins: 20,
    charms: 15,
    xp: 50,
    exclusiveItem: 'Lucky Silver Charm',
    exclusiveItemIcon: '🥈',
    description: 'Day 2 reward (20 Coins)'
  },
  {
    day: 3,
    coins: 25,
    charms: 20,
    xp: 75,
    exclusiveItem: 'Golden Diya Frame Trial',
    exclusiveItemIcon: '🪔',
    badge: 'Hot Streak',
    description: 'Day 3 reward (25 Coins)'
  },
  {
    day: 4,
    coins: 30,
    charms: 25,
    xp: 100,
    exclusiveItem: 'Fireworks Gift Pack',
    exclusiveItemIcon: '🎇',
    badge: 'Fire Streak',
    description: 'Day 4 reward (30 Coins)'
  },
  {
    day: 5,
    coins: 35,
    charms: 30,
    xp: 150,
    exclusiveItem: 'Cyber Neon Avatar Halo',
    exclusiveItemIcon: '⚡',
    badge: 'VIP Tier',
    description: 'Day 5 reward (35 Coins)'
  },
  {
    day: 6,
    coins: 40,
    charms: 40,
    xp: 200,
    exclusiveItem: 'Ferrari Supercar Voice Room Drop',
    exclusiveItemIcon: '🏎️',
    badge: 'Super Streak',
    description: 'Day 6 reward (40 Coins)'
  },
  {
    day: 7,
    coins: 100,
    charms: 150,
    xp: 500,
    exclusiveItem: 'Mystery Gift Box 🎁 (Gift Card + 50 Diamonds)',
    exclusiveItemIcon: '🎁',
    badge: 'JACKPOT MYSTERY GIFT',
    description: 'Day 7 Mystery Gift Grand Package'
  }
];

export interface LoginRewardStatus {
  streak: number;
  lastClaimDate?: string;
  canClaimToday: boolean;
  todayReward: TieredReward;
  claimedDays: number[];
  allTiers: TieredReward[];
  // Real-time day-by-day dates and status
  days: RealTimeDayReward[];
  todayDayNumber: number;
  hasMissedDays: boolean;
  missedDayNumbers: number[];
}

export const DailyLoginRewards = {
  getStorageKey(userId: string): string {
    return `esp_daily_login_status_${userId}`;
  },

  getCycleKey(userId: string): string {
    return `esp_weekly_cycle_${userId}`;
  },

  formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  },

  getTodayDateString(): string {
    return this.formatDate(new Date());
  },

  getYesterdayDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return this.formatDate(d);
  },

  formatDisplayDate(d: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  },

  getDayName(d: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  },

  checkStatus(user: UserProfile): LoginRewardStatus {
    const today = new Date();
    const todayStr = this.formatDate(today);

    // Retrieve or establish weekly cycle start date
    let cycleStartDateStr = '';
    let storedClaimedDates: Record<string, number> = {}; // { "2026-11-10": 1, ... }
    
    try {
      const cycleRaw = localStorage.getItem(this.getCycleKey(user.userId));
      if (cycleRaw) {
        const parsed = JSON.parse(cycleRaw);
        cycleStartDateStr = parsed.cycleStartDate || '';
        storedClaimedDates = parsed.claimedDates || {};
      }
    } catch {}

    // Also sync from user profile if available
    if (user.lastLoginClaimDate) {
      storedClaimedDates[user.lastLoginClaimDate] = user.loginStreak || 1;
    }

    // If no cycle start, or cycle has expired (> 7 days), initialize cycle starting today or recent
    let cycleStartDate: Date;
    if (cycleStartDateStr) {
      cycleStartDate = new Date(cycleStartDateStr + 'T00:00:00');
      // If cycle is older than 7 days, start a new 7-day cycle today
      const diffDays = Math.floor((today.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 7 || diffDays < 0) {
        cycleStartDate = new Date(todayStr + 'T00:00:00');
        cycleStartDateStr = this.formatDate(cycleStartDate);
        storedClaimedDates = {};
      }
    } else {
      // Default: cycle started today
      cycleStartDate = new Date(todayStr + 'T00:00:00');
      cycleStartDateStr = this.formatDate(cycleStartDate);
    }

    // Save cycle start date
    try {
      localStorage.setItem(this.getCycleKey(user.userId), JSON.stringify({
        cycleStartDate: cycleStartDateStr,
        claimedDates: storedClaimedDates,
      }));
    } catch {}

    const days: RealTimeDayReward[] = [];
    const missedDayNumbers: number[] = [];
    let todayDayNumber = 1;
    let canClaimToday = false;

    // Build the 7 real-time calendar days
    for (let i = 0; i < 7; i++) {
      const dayNum = i + 1;
      const dayDate = new Date(cycleStartDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayDateStr = this.formatDate(dayDate);
      const tier = LOGIN_REWARDS_TIERS[i];

      let status: RealTimeDayReward['status'] = 'upcoming';

      if (dayDateStr < todayStr) {
        // In the past
        if (storedClaimedDates[dayDateStr] !== undefined) {
          status = 'claimed';
        } else {
          status = 'missed';
          missedDayNumbers.push(dayNum);
        }
      } else if (dayDateStr === todayStr) {
        // Today!
        todayDayNumber = dayNum;
        if (storedClaimedDates[dayDateStr] !== undefined || user.lastLoginClaimDate === todayStr) {
          status = 'today_claimed';
          canClaimToday = false;
        } else {
          status = 'today_can_claim';
          canClaimToday = true;
        }
      } else {
        // Future date
        status = 'upcoming';
      }

      days.push({
        day: dayNum,
        dateStr: dayDateStr,
        displayDate: this.formatDisplayDate(dayDate),
        dayName: this.getDayName(dayDate),
        coins: tier.coins,
        isMysteryGift: dayNum === 7,
        status,
        reward: tier,
      });
    }

    const todayReward = LOGIN_REWARDS_TIERS[todayDayNumber - 1] || LOGIN_REWARDS_TIERS[0];
    const claimedDays = days.filter(d => d.status === 'claimed' || d.status === 'today_claimed').map(d => d.day);

    return {
      streak: claimedDays.length,
      lastClaimDate: user.lastLoginClaimDate,
      canClaimToday,
      todayReward,
      claimedDays,
      allTiers: LOGIN_REWARDS_TIERS,
      days,
      todayDayNumber,
      hasMissedDays: missedDayNumbers.length > 0,
      missedDayNumbers,
    };
  },

  claimReward(user: UserProfile): {
    updatedUser: UserProfile;
    reward: TieredReward;
    newStreak: number;
    days: RealTimeDayReward[];
  } {
    const status = this.checkStatus(user);
    if (!status.canClaimToday) {
      throw new Error('आज का लॉगिन रिवॉर्ड पहले ही क्लेम किया जा चुका है!');
    }

    const todayStr = this.getTodayDateString();
    const reward = status.todayReward;
    const newStreak = status.streak + 1;
    const newClaimedDays = [...status.claimedDays, status.todayDayNumber];

    // Update cycle storage
    try {
      const cycleRaw = localStorage.getItem(this.getCycleKey(user.userId));
      let cycleData: any = {};
      if (cycleRaw) cycleData = JSON.parse(cycleRaw);
      cycleData.claimedDates = cycleData.claimedDates || {};
      cycleData.claimedDates[todayStr] = status.todayDayNumber;
      localStorage.setItem(this.getCycleKey(user.userId), JSON.stringify(cycleData));
    } catch {}

    const updatedUser: UserProfile = {
      ...user,
      coins: (user.coins || 0) + reward.coins,
      charms: (user.charms || 0) + reward.charms,
      gameXp: (user.gameXp || 0) + reward.xp,
      loginStreak: newStreak,
      lastLoginClaimDate: todayStr,
      claimedDays: newClaimedDays,
    };

    // Update standard cache
    try {
      localStorage.setItem(this.getStorageKey(user.userId), JSON.stringify({
        lastClaimDate: todayStr,
        streak: newStreak,
        claimedDays: newClaimedDays,
      }));
    } catch {}

    const updatedStatus = this.checkStatus(updatedUser);

    return {
      updatedUser,
      reward,
      newStreak,
      days: updatedStatus.days,
    };
  }
};
