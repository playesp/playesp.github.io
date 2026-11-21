import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Users,
  Search,
  Send,
  X,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { sound8D } from '../services/sound8d.ts';
import { api } from '../services/api.ts';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface EspFriend {
  userId: string;
  gamingId: string;
  username?: string;
  fullName: string;
  avatar: string;
  isOnline: boolean;
  gameLevel: number;
  bio: string;
  favoriteGame: string;
  lastMessage?: string;
  lastTime?: string;
}

interface EspChatModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser?: (u: UserProfile) => void;
}

export const EspChatModal: React.FC<EspChatModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'players'>('chats');
  const [players, setPlayers] = useState<EspFriend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFriend, setActiveFriend] = useState<EspFriend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showProfileCard, setShowProfileCard] = useState<EspFriend | null>(null);

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const stored = localStorage.getItem(`esp_real_messages_${currentUser.userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(`esp_real_messages_${currentUser.userId}`, JSON.stringify(messages));
    } catch {}
  }, [messages, currentUser.userId]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const realList = await api.getRealCommunityPlayers();
      const mapped: EspFriend[] = (Array.isArray(realList) ? realList : [])
        .filter((p: any) => p.userId && p.userId !== currentUser.userId)
        .map((p: any) => ({
          userId: p.userId,
          gamingId: p.gamingId || `GAME-${p.userId}`,
          username: p.username || '',
          fullName: p.fullName || p.userId,
          avatar:
            p.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.userId)}`,
          isOnline: Boolean(p.isOnline),
          gameLevel: p.gameLevel || 1,
          bio: p.bio || `${p.chosenServiceCode || 'ESP'} Member`,
          favoriteGame: p.chosenServiceName || 'ESP Community',
        }));
      setPlayers(mapped);
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPlayers();
    }
  }, [isOpen, currentUser.userId]);

  if (!isOpen) return null;

  const q = (searchQuery || '').toLowerCase().trim();
  const cleanHandleQ = q.replace(/^@+/, '');
  const filteredPlayers = players.filter(
    (f) =>
      (f.fullName || '').toLowerCase().includes(q) ||
      (f.userId || '').toLowerCase().includes(q) ||
      (cleanHandleQ !== '' && (f.username || '').toLowerCase().includes(cleanHandleQ))
  );

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeFriend) return;
    sound8D.play8DChime(520, 'click');

    const msgText = inputText.trim();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.userId,
      senderName: currentUser.fullName,
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    const friendId = activeFriend.userId;
    setMessages((prev) => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMsg],
    }));
    setInputText('');

    // Record real chat action for the verified Daily Chat Task (+5 Coins + EXP when 3 chats sent)
    try {
      const res = await api.recordTaskAction(currentUser.userId, 'chat_sent', 1);
      if (res?.user && onUpdateUser) {
        onUpdateUser(res.user);
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden flex flex-col h-[85vh] max-h-[720px] text-[#212121]">
        {/* Header */}
        <div className="bg-[#2874f0] text-white p-3.5 sm:p-4 border-b border-blue-600 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            {activeFriend && (
              <button
                onClick={() => setActiveFriend(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center shadow-xs font-black">
              💬
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  ESP CHAT
                </h2>
                <span className="text-[9px] bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-xs font-black uppercase">
                  REAL MEMBERS
                </span>
              </div>
              <p className="text-[10px] text-blue-100">
                केवल वास्तविक रजिस्टर्ड सदस्यों से जुड़ें • 3 मैसेज पर चैट टास्क पूरा होता है
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {!activeFriend && (
              <button
                onClick={loadPlayers}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeFriend ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#f1f3f6]">
            <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div
                onClick={() => setShowProfileCard(activeFriend)}
                className="flex items-center space-x-2.5 cursor-pointer group"
              >
                <img
                  src={activeFriend.avatar}
                  alt={activeFriend.fullName}
                  className="w-10 h-10 rounded-full border-2 border-[#2874f0] object-cover"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#2874f0] flex items-center gap-1.5">
                    <span>{activeFriend.fullName}</span>
                    <span className="text-[9px] bg-[#f5f8ff] text-[#2874f0] border border-blue-200 px-1.5 rounded-xs font-mono font-bold">
                      Lv {activeFriend.gameLevel}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-600">
                    {activeFriend.isOnline ? '🟢 Online' : '⚪ Registered'} • {activeFriend.userId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProfileCard(activeFriend)}
                className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#2874f0] border border-slate-300 text-xs font-bold cursor-pointer"
              >
                👤 प्रोफाइल
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages[activeFriend.userId] || []).length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  नमस्ते भेजकर {activeFriend.fullName} के साथ बातचीत शुरू करें!
                </div>
              ) : (
                (messages[activeFriend.userId] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] sm:max-w-[70%] rounded-xl px-3.5 py-2.5 shadow-2xs ${
                        msg.isMe
                          ? 'bg-[#2874f0] text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-[#212121] rounded-bl-xs'
                      }`}
                    >
                      <p className="text-xs sm:text-sm break-words leading-relaxed font-medium">
                        {msg.text}
                      </p>
                      <div
                        className={`text-right mt-1 text-[9px] ${
                          msg.isMe ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white px-3 py-1.5 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['👋', '❤️', '🔥', '👍', '🎮', '🤝', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setInputText((prev) => prev + emoji)}
                  className="px-2 py-0.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-sm transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="bg-white p-2.5 sm:p-3 border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`${activeFriend.fullName} को मैसेज भेजें...`}
                className="flex-1 bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs sm:text-sm text-[#212121] placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="p-2 sm:px-4 sm:py-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-black text-xs transition disabled:opacity-40 flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-slate-200 grid grid-cols-2 text-center">
              <button
                onClick={() => setActiveTab('chats')}
                className={`py-2.5 text-xs font-black transition border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === 'chats'
                    ? 'border-[#2874f0] text-[#2874f0] bg-[#f5f8ff]'
                    : 'border-transparent text-slate-600 hover:text-[#2874f0]'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>चैट्स ({filteredPlayers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('players')}
                className={`py-2.5 text-xs font-black transition border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === 'players'
                    ? 'border-[#2874f0] text-[#2874f0] bg-[#f5f8ff]'
                    : 'border-transparent text-slate-600 hover:text-[#2874f0]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>असली मेंबर्स ({filteredPlayers.length})</span>
              </button>
            </div>

            <div className="p-3 bg-[#f9fafb] border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="@username, नाम या ESP आईडी से असली खिलाड़ी खोजें..."
                  className="w-full bg-white border border-slate-300 rounded-sm pl-9 pr-4 py-2 text-xs text-[#212121] placeholder-slate-400 focus:outline-none focus:border-[#2874f0]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
              {loading && filteredPlayers.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  सदस्य लोड हो रहे हैं...
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs px-4">
                  अभी कोई अन्य रजिस्टर्ड सदस्य नहीं मिला।
                </div>
              ) : (
                filteredPlayers.map((f) => {
                  const lastMsgs = messages[f.userId] || [];
                  const last = lastMsgs[lastMsgs.length - 1];
                  return (
                    <div
                      key={f.userId}
                      onClick={() => setActiveFriend(f)}
                      className="p-3 sm:p-3.5 hover:bg-[#f5f8ff] transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={f.avatar}
                            alt={f.fullName}
                            className="w-11 h-11 rounded-full border-2 border-slate-200 group-hover:border-[#2874f0] object-cover"
                          />
                          {f.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#388e3c] border-2 border-white" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#2874f0] flex items-center gap-1.5 flex-wrap">
                            <span>{f.fullName}</span>
                            {f.username ? (
                              <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 rounded-full font-bold">
                                @{f.username}
                              </span>
                            ) : (
                              <span className="text-[9px] bg-[#f1f3f6] text-slate-600 px-1.5 rounded-xs font-mono">
                                {f.userId}
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-600 truncate max-w-[210px] sm:max-w-[300px]">
                            {last ? last.text : f.bio}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-[10px] text-[#2874f0] font-bold block">
                          Lv {f.gameLevel}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {last ? last.timestamp : 'Chat →'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {showProfileCard && (
          <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
            <div className="w-full max-w-sm bg-white border border-slate-200 rounded-md p-5 shadow-xl relative space-y-4 text-[#212121]">
              <button
                onClick={() => setShowProfileCard(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2 pt-2">
                <img
                  src={showProfileCard.avatar}
                  alt={showProfileCard.fullName}
                  className="w-20 h-20 rounded-full border-4 border-[#2874f0] shadow-md object-cover mx-auto"
                />
                <h3 className="text-base font-black text-[#212121]">{showProfileCard.fullName}</h3>
                <p className="text-[11px] text-[#2874f0] font-mono font-bold">
                  ESP: {showProfileCard.userId}
                </p>
                <p className="text-xs text-slate-600 px-4">{showProfileCard.bio}</p>
              </div>

              <button
                onClick={() => {
                  setActiveFriend(showProfileCard);
                  setShowProfileCard(null);
                }}
                className="w-full py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-black text-xs shadow-xs cursor-pointer"
              >
                💬 मैसेज भेजें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
