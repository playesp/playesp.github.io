import React, { useState } from 'react';
import { Trophy, Crown, Sparkles, TrendingUp, Zap, Award, Flame, Users, ChevronRight, Coins } from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { AvatarFrame, type FrameVariant } from '../AvatarFrame.tsx';

export interface LeaderboardUser {
  id: string;
  rank: number;
  userId: string;
  fullName: string;
  avatar: string;
  frameType: FrameVariant;
  gameLevel: number;
  gameXp: number;
  totalEarnings: number;
  charms: number;
  clanName?: string;
  badge?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardWidgetProps {
  currentUser: UserProfile;
  onOpenPlayerProfile?: (user: LeaderboardUser) => void;
  className?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  currentUser,
  onOpenPlayerProfile,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'earners' | 'players'>('earners');

  const topEarnersList: LeaderboardUser[] = [
    {
      id: 'e1',
      rank: 1,
      userId: 'ESP-SHARMA-99',
      fullName: '👑 शर्मा जी (Grand Emperor)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiEmperor99',
      frameType: 'royal-dragon-crown',
      gameLevel: 99,
      gameXp: 185000,
      totalEarnings: 298765,
      charms: 98765,
      clanName: '👑 Sharma Ji Royal Syndicate',
      badge: 'TOP 1 GLOBAL EARNER',
    },
    {
      id: 'e2',
      rank: 2,
      userId: 'EMO-MOM-MMO',
      fullName: 'Santosh Kumar (Founder)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
      frameType: 'royal-dragon-crown',
      gameLevel: 65,
      gameXp: 98000,
      totalEarnings: 185400,
      charms: 45200,
      clanName: 'ESP Founders Syndicate',
      badge: 'SYSTEM FOUNDER',
    },
    {
      id: 'e3',
      rank: 3,
      userId: 'ESP10VIKAS',
      fullName: 'Vikas Kumar (Admin Payee)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VikasKumarAdmin',
      frameType: 'vip-gold',
      gameLevel: 48,
      gameXp: 62000,
      totalEarnings: 94800,
      charms: 28400,
      clanName: 'SpicePay Elite',
      badge: 'MASTER PAYEE',
    },
    {
      id: 'e4',
      rank: 4,
      userId: 'ESP10RAHUL',
      fullName: 'Rahul Verma',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RahulVermaESP',
      frameType: 'cosmic-neon',
      gameLevel: 42,
      gameXp: 48500,
      totalEarnings: 68450,
      charms: 18900,
      clanName: 'Digital Warriors',
    },
    {
      id: 'e5',
      rank: 5,
      userId: 'ESP10PRIYA',
      fullName: 'Priya Patel',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaPatelESP',
      frameType: 'vip-gold',
      gameLevel: 39,
      gameXp: 42100,
      totalEarnings: 54300,
      charms: 15400,
      clanName: 'Golden Stars',
    },
    {
      id: 'e6',
      rank: 6,
      userId: 'ESP10AMIT',
      fullName: 'Amit Kumar Singh',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AmitKumarSingh',
      frameType: 'standard',
      gameLevel: 35,
      gameXp: 36200,
      totalEarnings: 42100,
      charms: 11200,
      clanName: 'Bihar Super Earners',
    },
    {
      id: 'e7',
      rank: 7,
      userId: 'ESP10NEHA',
      fullName: 'Neha Sharma',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NehaSharmaESP',
      frameType: 'standard',
      gameLevel: 31,
      gameXp: 31000,
      totalEarnings: 33750,
      charms: 9800,
      clanName: 'Royal Queens',
    },
    {
      id: 'e8',
      rank: 8,
      userId: 'ESP10VIKRAM',
      fullName: 'Vikram Rathore',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VikramRathore',
      frameType: 'standard',
      gameLevel: 28,
      gameXp: 27500,
      totalEarnings: 27900,
      charms: 8100,
      clanName: 'Rajputana Kings',
    },
    {
      id: 'e9',
      rank: 9,
      userId: 'ESP10POOJA',
      fullName: 'Pooja Gupta',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PoojaGupta',
      frameType: 'standard',
      gameLevel: 25,
      gameXp: 23100,
      totalEarnings: 22400,
      charms: 6700,
      clanName: 'Lucknow Superstars',
    },
    {
      id: 'e10',
      rank: 10,
      userId: currentUser.userId || 'ESP-YOU',
      fullName: `${currentUser.fullName || 'You'} (आप)`,
      avatar: currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.userId}`,
      frameType: (currentUser.frameType as FrameVariant) || 'standard',
      gameLevel: currentUser.gameLevel || 5,
      gameXp: currentUser.gameXp || 750,
      totalEarnings: currentUser.totalEarnings || 15400,
      charms: currentUser.charms || 150,
      clanName: currentUser.clanName || 'Royal Warriors ESP',
      isCurrentUser: true,
      badge: 'YOUR RANK',
    },
  ];

  const topPlayersList: LeaderboardUser[] = [
    {
      id: 'p1',
      rank: 1,
      userId: 'ESP-SHARMA-99',
      fullName: '👑 शर्मा जी (Grand Emperor)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiEmperor99',
      frameType: 'royal-dragon-crown',
      gameLevel: 99,
      gameXp: 250000,
      totalEarnings: 298765,
      charms: 98765,
      clanName: '👑 Sharma Ji Royal Syndicate',
      badge: 'LVL 99 ESP PLAY KING',
    },
    {
      id: 'p2',
      rank: 2,
      userId: 'ESP-NYAYADHISH',
      fullName: '⚖️ न्यायाधीश (Supreme Judge)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NyayadhishJudge',
      frameType: 'judge-justice',
      gameLevel: 75,
      gameXp: 165000,
      totalEarnings: 85000,
      charms: 54000,
      clanName: 'Supreme Court Justice',
      badge: 'IMPARTIAL MASTER',
    },
    {
      id: 'p3',
      rank: 3,
      userId: 'ESP-WEBHAI',
      fullName: '🤝 वी भाई (We Bhai Bro)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBro',
      frameType: 'wolf-night',
      gameLevel: 68,
      gameXp: 138000,
      totalEarnings: 74000,
      charms: 41000,
      clanName: 'Yaar Beli Gang',
      badge: 'PARTY WINGMAN',
    },
    {
      id: 'p4',
      rank: 4,
      userId: 'ESP-SIMRAN',
      fullName: '🌸 सिमरन (Party Hostess)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SimranHostess',
      frameType: 'vip-gold',
      gameLevel: 60,
      gameXp: 112000,
      totalEarnings: 61000,
      charms: 38500,
      clanName: 'Starlight Angels',
    },
    {
      id: 'p5',
      rank: 5,
      userId: 'ESP-WECHATAI',
      fullName: '💬 वी चैट AI (Chat Companion)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeChatAIBot',
      frameType: 'cosmic-neon',
      gameLevel: 55,
      gameXp: 95000,
      totalEarnings: 45000,
      charms: 29000,
      clanName: 'Neural Intelligence',
    },
    {
      id: 'p6',
      rank: 6,
      userId: 'EMO-MOM-MMO',
      fullName: 'Santosh Kumar',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
      frameType: 'royal-dragon-crown',
      gameLevel: 50,
      gameXp: 82000,
      totalEarnings: 185400,
      charms: 45200,
      clanName: 'ESP Founders Syndicate',
    },
    {
      id: 'p7',
      rank: 7,
      userId: 'ESP-WOLFMASTER',
      fullName: '🐺 वोल्फ अल्फा (Werewolf Pro)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WolfAlphaPro',
      frameType: 'wolf-night',
      gameLevel: 44,
      gameXp: 69000,
      totalEarnings: 38000,
      charms: 19500,
      clanName: 'Moonlight Wolves',
    },
    {
      id: 'p8',
      rank: 8,
      userId: 'ESP-SNAKEKING',
      fullName: '🐍 स्नेक रश चैंपियन',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SnakeRushChampion',
      frameType: 'standard',
      gameLevel: 38,
      gameXp: 54000,
      totalEarnings: 29000,
      charms: 14000,
      clanName: 'Arcade Rushers',
    },
    {
      id: 'p9',
      rank: 9,
      userId: 'ESP-BINGOROYAL',
      fullName: '🎲 तंबोला मास्टर जीतू',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TambolaJeetu',
      frameType: 'standard',
      gameLevel: 32,
      gameXp: 41000,
      totalEarnings: 22000,
      charms: 9500,
      clanName: 'Lucky Housie Club',
    },
    {
      id: 'p10',
      rank: 10,
      userId: currentUser.userId || 'ESP-YOU',
      fullName: `${currentUser.fullName || 'You'} (आप)`,
      avatar: currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.userId}`,
      frameType: (currentUser.frameType as FrameVariant) || 'standard',
      gameLevel: currentUser.gameLevel || 5,
      gameXp: currentUser.gameXp || 750,
      totalEarnings: currentUser.totalEarnings || 0,
      charms: currentUser.charms || 150,
      clanName: currentUser.clanName || 'Royal Warriors ESP',
      isCurrentUser: true,
      badge: 'YOUR RANK',
    },
  ];

  const currentList = activeTab === 'earners' ? topEarnersList : topPlayersList;
  const podiumTop3 = currentList.slice(0, 3);
  const remaining7 = currentList.slice(3, 10);

  return (
    <div className={`bg-white rounded-md border border-slate-200 shadow-lg text-[#212121] overflow-hidden ${className}`}>
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#2874f0] text-white border-b border-blue-600">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-[#ffe500]" />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
              <span>लीडरबोर्ड रैंकिंग (Top 10)</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121]">
                LIVE REAL-TIME
              </span>
            </h3>
          </div>
          <p className="text-xs text-blue-100 mt-0.5">
            प्लेटफ़ॉर्म के सर्वोच्च अर्नर और गेमिंग महारथी (Top 10 Earners & Players)
          </p>
        </div>

        {/* Tab Selector: Earners vs Players */}
        <div className="flex items-center bg-blue-700/60 p-1 rounded-sm border border-blue-400/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('earners')}
            className={`px-3 py-1.5 rounded-sm font-black text-xs flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'earners'
                ? 'bg-[#ffe500] text-[#212121] shadow-xs'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>👑 टॉप अर्नर्स (Earnings)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('players')}
            className={`px-3 py-1.5 rounded-sm font-black text-xs flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'players'
                ? 'bg-[#ffe500] text-[#212121] shadow-xs'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ टॉप प्लेयर्स (XP)</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* TOP 3 PODIUM DISPLAY */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 pt-6 pb-4 px-2 rounded-md bg-[#f5f8ff] border border-blue-100 items-end">
          {/* RANK 2 - SILVER (Left) */}
          <div className="flex flex-col items-center order-1">
            <div className="text-xl mb-1">🥈</div>
            <div className="relative">
              <AvatarFrame
                src={podiumTop3[1].avatar}
                frameType={podiumTop3[1].frameType}
                size="md"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-600 border border-white text-[10px] font-black text-white shadow">
                #2
              </div>
            </div>
            <p className="font-black text-xs text-[#212121] text-center mt-3 truncate max-w-[90px] sm:max-w-[130px]">
              {podiumTop3[1].fullName}
            </p>
            <span className="text-[10px] text-[#878787] font-semibold">Lvl {podiumTop3[1].gameLevel}</span>
            <div className="mt-1 px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-[11px] font-mono font-black text-[#2874f0]">
              {activeTab === 'earners'
                ? `₹${podiumTop3[1].totalEarnings.toLocaleString('en-IN')}`
                : `${podiumTop3[1].gameXp.toLocaleString()} XP`}
            </div>
            <span className="text-[9px] text-pink-600 font-bold mt-0.5">✨ {podiumTop3[1].charms.toLocaleString()}</span>
          </div>

          {/* RANK 1 - GOLD (Center Champion) */}
          <div className="flex flex-col items-center order-2 relative">
            <div className="absolute -top-7 animate-bounce">
              <Crown className="w-8 h-8 text-amber-500 drop-shadow-sm" />
            </div>
            <div className="relative mt-2">
              <AvatarFrame
                src={podiumTop3[0].avatar}
                frameType={podiumTop3[0].frameType}
                size="lg"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#fb641b] text-white font-black text-xs shadow border border-white">
                👑 #1
              </div>
            </div>
            <p className="font-black text-sm text-[#212121] text-center mt-3.5 truncate max-w-[110px] sm:max-w-[150px]">
              {podiumTop3[0].fullName}
            </p>
            <span className="text-[10px] text-[#fb641b] font-bold">Lvl {podiumTop3[0].gameLevel} Supreme</span>
            <div className="mt-1 px-3 py-1 rounded-sm bg-[#ffe500] border border-amber-400 text-xs font-mono font-black text-[#212121] shadow-xs">
              {activeTab === 'earners'
                ? `₹${podiumTop3[0].totalEarnings.toLocaleString('en-IN')}`
                : `${podiumTop3[0].gameXp.toLocaleString()} XP`}
            </div>
            <span className="text-[10px] text-pink-600 font-bold mt-0.5">✨ {podiumTop3[0].charms.toLocaleString()} Charms</span>
          </div>

          {/* RANK 3 - BRONZE (Right) */}
          <div className="flex flex-col items-center order-3">
            <div className="text-xl mb-1">🥉</div>
            <div className="relative">
              <AvatarFrame
                src={podiumTop3[2].avatar}
                frameType={podiumTop3[2].frameType}
                size="md"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-700 border border-white text-[10px] font-black text-white shadow">
                #3
              </div>
            </div>
            <p className="font-black text-xs text-[#212121] text-center mt-3 truncate max-w-[90px] sm:max-w-[130px]">
              {podiumTop3[2].fullName}
            </p>
            <span className="text-[10px] text-[#878787] font-semibold">Lvl {podiumTop3[2].gameLevel}</span>
            <div className="mt-1 px-2 py-0.5 rounded-sm bg-white border border-amber-200 text-[11px] font-mono font-black text-amber-700">
              {activeTab === 'earners'
                ? `₹${podiumTop3[2].totalEarnings.toLocaleString('en-IN')}`
                : `${podiumTop3[2].gameXp.toLocaleString()} XP`}
            </div>
            <span className="text-[9px] text-pink-600 font-bold mt-0.5">✨ {podiumTop3[2].charms.toLocaleString()}</span>
          </div>
        </div>

        {/* RANKS 4 TO 10 TABLE */}
        <div className="space-y-2">
          {remaining7.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenPlayerProfile?.(item)}
              className={`p-2.5 sm:p-3 rounded-sm border transition flex items-center justify-between cursor-pointer ${
                item.isCurrentUser
                  ? 'bg-emerald-50 border-[#388e3c] ring-1 ring-emerald-200 shadow-xs'
                  : 'bg-[#f9fafb] hover:bg-[#f5f8ff] border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className={`w-7 text-center font-black text-sm ${item.rank <= 5 ? 'text-[#fb641b]' : 'text-[#878787]'}`}>
                  #{item.rank}
                </span>

                <div className="relative shrink-0">
                  <AvatarFrame
                    src={item.avatar}
                    frameType={item.frameType}
                    size="sm"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-xs sm:text-sm font-black text-[#212121] truncate">
                      {item.fullName}
                    </p>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-blue-50 text-[#2874f0] border border-blue-200 shrink-0">
                        {item.badge}
                      </span>
                    )}
                    {item.isCurrentUser && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-sm bg-[#388e3c] text-white uppercase shrink-0">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-[#878787]">
                    <span className="text-[#2874f0] font-bold">Lvl {item.gameLevel}</span>
                    <span>•</span>
                    <span className="text-pink-600 font-medium">✨ {item.charms.toLocaleString()} Charms</span>
                    {item.clanName && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline text-[#878787] truncate max-w-[120px]">{item.clanName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Score / Earning display */}
              <div className="text-right shrink-0 pl-2">
                <div className="font-mono font-black text-xs sm:text-sm text-[#388e3c]">
                  {activeTab === 'earners'
                    ? `₹${item.totalEarnings.toLocaleString('en-IN')}`
                    : `${item.gameXp.toLocaleString()} XP`}
                </div>
                <span className="text-[10px] text-[#878787]">
                  {activeTab === 'earners' ? 'कुल पेआउट' : 'गेमिंग स्कोर'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#878787]">
          <span>🔄 रीयल-टाइम अपडेट: हर 60 सेकंड में स्वतः रिफ्रेश</span>
          <span className="text-[#fb641b] font-bold">👑 शर्मा जी Lvl 99 टॉप पर!</span>
        </div>
      </div>
    </div>
  );
};
