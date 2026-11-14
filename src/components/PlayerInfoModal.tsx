import React from 'react';
import { 
  X, CheckCircle, Trophy, Sparkles, Coins, Shield, 
  Gift, Share2, Copy, Check, MessageSquare, ExternalLink, Calendar, UserCheck, Crown
} from 'lucide-react';
import { AvatarFrame } from './AvatarFrame.tsx';

export interface RealPlayerProfile {
  userId: string;
  fullName: string;
  phone?: string;
  email?: string;
  chosenServiceName?: string;
  chosenServiceCode?: string;
  joiningFee?: number;
  joiningDate?: string;
  status?: string;
  coins?: number;
  charms?: number;
  gameLevel?: number;
  gameXp?: number;
  roomAddress?: string;
  houseName?: string;
  clanName?: string;
  clanRole?: string;
  sponsorId?: string;
  sponsorName?: string;
  loginStreak?: number;
  avatar?: string;
  role?: string;
  roleTitle?: string;
  crownPost?: boolean;
  frameType?: string;
}

interface PlayerInfoModalProps {
  player: RealPlayerProfile | null;
  onClose: () => void;
  onSendGift?: (player: RealPlayerProfile) => void;
}

export const PlayerInfoModal: React.FC<PlayerInfoModalProps> = ({ player, onClose, onSendGift }) => {
  const [copiedId, setCopiedId] = React.useState(false);
  const [shareNotice, setShareNotice] = React.useState(false);

  if (!player) return null;

  const isSharmaJi = player.userId === 'SHARMA-JI-VIP' || (player.gameLevel || 0) >= 90;

  const handleCopyId = () => {
    navigator.clipboard.writeText(player.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShare = () => {
    const shareText = `🎮 Real Player Profile: ${player.fullName} (Lvl ${player.gameLevel || 1}, Charms ${player.charms || 0}) - ESP Gaming Address: ${player.roomAddress || `ESP-ROOM-${player.userId}`}`;
    navigator.clipboard.writeText(shareText);
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 shadow-xl rounded-md p-5 sm:p-6 max-w-md w-full relative text-[#212121] space-y-4 overflow-hidden">

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 relative z-10">
          <div className="flex items-center space-x-2">
            {isSharmaJi ? <Crown className="w-5 h-5 text-amber-500 animate-bounce" /> : <UserCheck className="w-5 h-5 text-[#2874f0]" />}
            <h3 className="text-base font-black text-[#212121]">
              {isSharmaJi ? '👑 SUPREME GRANDMASTER PROFILE' : 'REAL PLAYER PROFILE DASHBOARD'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {shareNotice && (
          <div className="p-2 rounded-sm bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center">
            ✅ प्लेयर प्रोफाइल लिंक क्लिपबोर्ड पर कॉपी हो गया!
          </div>
        )}

        {/* Player Digital ID Showcase Card */}
        <div className={`bg-gradient-to-br ${isSharmaJi ? 'from-amber-50 via-white to-yellow-50 border-amber-300' : 'from-[#f5f8ff] via-white to-blue-50 border-blue-200'} rounded-md p-4 border relative shadow-2xs z-10`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <AvatarFrame
                src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.userId}`}
                alt={player.fullName}
                size="lg"
                frameType={isSharmaJi ? 'royal-dragon-crown' : 'vip-gold'}
                level={player.gameLevel || 1}
                showCrown={isSharmaJi}
                isSpeaking={true}
              />

              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-base font-black text-[#212121]">
                    {player.fullName}
                  </h4>
                  <CheckCircle className="w-4 h-4 text-[#388e3c]" />
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-xs font-mono font-bold text-[#2874f0] bg-white px-2 py-0.5 rounded-xs border border-blue-200">
                    {player.userId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded-xs bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] text-[10px] cursor-pointer"
                    title="रोल नं. कॉपी करें"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-[#388e3c]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${isSharmaJi ? 'text-amber-700' : 'text-[#2874f0]'}`}>
                  {player.roleTitle || (isSharmaJi ? '👑 ESP PLAY Grand Emperor (सर्वोच्च महाराजा)' : player.role === 'admin' ? '👑 ESP Founder & Admin' : '✨ 100% Verified Real Member')}
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-xs text-[9px] font-black uppercase bg-[#388e3c] text-white">
              {player.status === 'active' ? 'VERIFIED' : 'ACTIVE'}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-white p-2 rounded-sm border border-slate-200">
              <span className="text-[9px] text-slate-500 uppercase font-semibold block">Coins</span>
              <span className="text-xs font-black text-amber-600 mt-0.5 block">
                🪙 {(player.coins || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-2 rounded-sm border border-slate-200">
              <span className="text-[9px] text-slate-500 uppercase font-semibold block">Charms</span>
              <span className="text-xs font-black text-rose-600 mt-0.5 block">
                ✨ {(player.charms || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-2 rounded-sm border border-slate-200">
              <span className="text-[9px] text-slate-500 uppercase font-semibold block">Clan Role</span>
              <span className="text-xs font-bold text-[#2874f0] mt-0.5 block truncate">
                {player.clanRole || 'Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Real Detailed Information List */}
        <div className="space-y-2 text-xs bg-[#f9fafb] p-3.5 rounded-md border border-slate-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-600">सक्रिय सर्विस (Active Service):</span>
            <span className="font-bold text-[#2874f0] text-right">{player.chosenServiceName || 'ONLINE EARNING SYSTEM (OES)'}</span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-600">गेमिंग रूम पता (Gaming Address):</span>
            <span className="font-mono font-bold text-[#212121] text-right">{player.roomAddress || `ESP-ROOM-${player.userId}`}</span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-600">फैमिली क्लैन (Clan):</span>
            <span className="font-bold text-purple-700">{player.clanName || 'Royal Warriors ESP'}</span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-600">जॉइनिंग दिनांक (Joining Date):</span>
            <span className="text-[#212121] font-medium">{player.joiningDate || '2024-03-01'}</span>
          </div>

          {player.sponsorId && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">स्पॉन्सर कोड (Sponsor):</span>
              <span className="font-mono text-[#212121] font-semibold">{player.sponsorId}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`grid ${onSendGift ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1 relative z-10`}>
          {onSendGift && (
            <button
              onClick={() => {
                onClose();
                onSendGift(player);
              }}
              className="w-full py-2.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Send Gift (गिफ्ट भेजें)</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Profile (शेयर करें)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
