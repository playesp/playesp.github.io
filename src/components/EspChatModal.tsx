import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Users,
  Search,
  Send,
  X,
  ChevronLeft,
  RefreshCw,
  Gamepad2,
  Lock,
  Play,
  DoorOpen,
} from 'lucide-react';
import type { UserProfile, DirectMessageRecord } from '../types/index.ts';
import { sound8D } from '../services/sound8d.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  inviteType?: 'game' | 'locked_room';
  gameKey?: string;
  gameName?: string;
  roomAddress?: string;
  roomTitle?: string;
  passcode?: string;
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

const DM_INVITE_GAMES = [
  { key: 'spy', label: "🕵️ Who's the Spy" },
  { key: 'liars_party', label: "🃏 Liar's Party" },
  { key: 'werewolf', label: '🐺 Space Werewolf' },
  { key: 'bingo', label: '🎱 Bingo Live' },
  { key: 'cards', label: '🃏 Oh My Card' },
  { key: 'snake', label: '🐍 Snake Rush' },
  { key: 'crazy_alpaca', label: '🦙 Crazy Alpaca' },
  { key: 'ludo', label: '🎲 Ludo Party' },
  { key: 'pool', label: '🎱 8-Ball Pool' },
  { key: 'mic_grab', label: '🎤 Mic Grab' },
];

interface EspChatModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser?: (u: UserProfile) => void;
  onAcceptGameInvite?: (gameKey: string) => void;
  onAcceptRoomInvite?: (roomAddress: string, passcode?: string) => void;
}

export const EspChatModal: React.FC<EspChatModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateUser,
  onAcceptGameInvite,
  onAcceptRoomInvite,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'players'>('chats');
  const [players, setPlayers] = useState<EspFriend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFriend, setActiveFriend] = useState<EspFriend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showProfileCard, setShowProfileCard] = useState<EspFriend | null>(null);
  const [showGameInvitePicker, setShowGameInvitePicker] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

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

  const mapServerThread = useCallback(
    (records: DirectMessageRecord[], peerId?: string): Record<string, ChatMessage[]> | ChatMessage[] => {
      if (peerId) {
        return records.map((r) => ({
          id: r.id,
          senderId: r.fromUserId,
          senderName: r.fromName,
          text: r.text,
          timestamp: r.timestamp,
          isMe: r.fromUserId === currentUser.userId,
          inviteType: r.inviteType,
          gameKey: r.gameKey,
          gameName: r.gameName,
          roomAddress: r.roomAddress,
          roomTitle: r.roomTitle,
          passcode: r.passcode,
        }));
      }
      const grouped: Record<string, ChatMessage[]> = {};
      records.forEach((r) => {
        const peer = r.fromUserId === currentUser.userId ? r.toUserId : r.fromUserId;
        if (!grouped[peer]) grouped[peer] = [];
        grouped[peer].push({
          id: r.id,
          senderId: r.fromUserId,
          senderName: r.fromName,
          text: r.text,
          timestamp: r.timestamp,
          isMe: r.fromUserId === currentUser.userId,
          inviteType: r.inviteType,
          gameKey: r.gameKey,
          gameName: r.gameName,
          roomAddress: r.roomAddress,
          roomTitle: r.roomTitle,
          passcode: r.passcode,
        });
      });
      return grouped;
    },
    [currentUser.userId]
  );

  const syncAllDms = useCallback(async () => {
    try {
      const res = await api.getDirectMessages(currentUser.userId);
      if (res?.success && Array.isArray(res.messages) && res.messages.length > 0) {
        const grouped = mapServerThread(res.messages) as Record<string, ChatMessage[]>;
        setMessages((prev) => ({ ...prev, ...grouped }));
      }
    } catch {}
  }, [currentUser.userId, mapServerThread]);

  const syncPeerThread = useCallback(
    async (peerId: string) => {
      try {
        const res = await api.getDirectMessages(currentUser.userId, peerId);
        if (res?.success && Array.isArray(res.messages)) {
          const list = mapServerThread(res.messages, peerId) as ChatMessage[];
          if (list.length > 0) {
            setMessages((prev) => ({ ...prev, [peerId]: list }));
          }
        }
      } catch {}
    },
    [currentUser.userId, mapServerThread]
  );

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
      syncAllDms();
    }
  }, [isOpen, currentUser.userId]);

  useEffect(() => {
    if (!isOpen || !activeFriend) return;
    syncPeerThread(activeFriend.userId);
    const interval = setInterval(() => {
      syncPeerThread(activeFriend.userId);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, activeFriend?.userId, syncPeerThread]);

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
    const friendId = activeFriend.userId;
    setInputText('');

    try {
      const res = await api.sendDirectMessage({
        fromUserId: currentUser.userId,
        toUserId: friendId,
        text: msgText,
      });
      if (res?.success && Array.isArray(res.thread)) {
        const list = mapServerThread(res.thread, friendId) as ChatMessage[];
        setMessages((prev) => ({ ...prev, [friendId]: list }));
      }
      if (res?.user && onUpdateUser) {
        onUpdateUser(res.user);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: currentUser.userId,
        senderName: currentUser.fullName,
        text: msgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      };
      setMessages((prev) => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), fallbackMsg],
      }));
    }
  };

  const handleSendGameInvite = async (gameKey: string, gameName: string) => {
    if (!activeFriend) return;
    setSendingInvite(true);
    setShowGameInvitePicker(false);
    try {
      sound8D.play8DChime(660, 'win');
      const res = await api.sendDirectMessage({
        fromUserId: currentUser.userId,
        toUserId: activeFriend.userId,
        inviteType: 'game',
        gameKey,
        gameName,
        text: `🎮 आओ मेरे साथ "${gameName}" खेलें! नीचे क्लिक करके गेम शुरू करें।`,
      });
      if (res?.success && Array.isArray(res.thread)) {
        const list = mapServerThread(res.thread, activeFriend.userId) as ChatMessage[];
        setMessages((prev) => ({ ...prev, [activeFriend.userId]: list }));
      }
      if (res?.user && onUpdateUser) onUpdateUser(res.user);
      showToast(`🎮 ${activeFriend.fullName} को "${gameName}" का DM इनवाइट भेजा गया!`, 'success');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleSendLockedRoomInvite = async () => {
    if (!activeFriend) return;
    setSendingInvite(true);
    try {
      sound8D.play8DChime(580, 'mic');
      const myRoomRes = await api.getMyPersonalVoiceRoom(currentUser.userId);
      const roomObj = myRoomRes?.room;
      const roomAddr = roomObj?.roomAddress || currentUser.roomAddress || '10001';
      const roomTitle = roomObj?.title || `${currentUser.fullName}'s Private Room`;
      const roomPass = roomObj?.passcode || '';
      const res = await api.sendDirectMessage({
        fromUserId: currentUser.userId,
        toUserId: activeFriend.userId,
        inviteType: 'locked_room',
        roomAddress: roomAddr,
        roomTitle,
        passcode: roomPass,
        text: roomPass
          ? `🔒 मेरे पर्सनल लॉक वॉइस रूम "${roomTitle}" (#${roomAddr}) में आओ! पासकोड: ${roomPass}`
          : `🏠 मेरे पर्सनल वॉइस रूम "${roomTitle}" (#${roomAddr}) में जॉइन करें!`,
      });
      if (res?.success && Array.isArray(res.thread)) {
        const list = mapServerThread(res.thread, activeFriend.userId) as ChatMessage[];
        setMessages((prev) => ({ ...prev, [activeFriend.userId]: list }));
      }
      if (res?.user && onUpdateUser) onUpdateUser(res.user);
      showToast(`🔒 ${activeFriend.fullName} को आपके रूम #${roomAddr} का लॉक इनवाइट भेजा गया!`, 'success');
    } catch {
      showToast('लॉक रूम इनवाइट भेजने में समस्या आई', 'error');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden flex flex-col h-[85vh] max-h-[740px] text-[#212121]">
        {/* Header */}
        <div className="bg-[#2874f0] text-white p-3.5 sm:p-4 border-b border-blue-600 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            {activeFriend && (
              <button
                onClick={() => {
                  setActiveFriend(null);
                  setShowGameInvitePicker(false);
                }}
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
                  ESP CHAT &amp; DM INVITES
                </h2>
                <span className="text-[9px] bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-xs font-black uppercase">
                  LIVE DM
                </span>
              </div>
              <p className="text-[10px] text-blue-100">
                1-on-1 चैट, 🎮 गेम इनवाइट व 🔒 पर्सनल लॉक रूम इनवाइट भेजें
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {!activeFriend && (
              <button
                onClick={() => {
                  loadPlayers();
                  syncAllDms();
                }}
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
            {/* Peer Header */}
            <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2">
              <div
                onClick={() => setShowProfileCard(activeFriend)}
                className="flex items-center space-x-2.5 cursor-pointer group min-w-0"
              >
                <img
                  src={activeFriend.avatar}
                  alt={activeFriend.fullName}
                  className="w-10 h-10 rounded-full border-2 border-[#2874f0] object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#2874f0] flex items-center gap-1.5 truncate">
                    <span className="truncate">{activeFriend.fullName}</span>
                    <span className="text-[9px] bg-[#f5f8ff] text-[#2874f0] border border-blue-200 px-1.5 rounded-xs font-mono font-bold shrink-0">
                      Lv {activeFriend.gameLevel}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-600 truncate">
                    {activeFriend.isOnline ? '🟢 Online' : '⚪ Registered'} • {activeFriend.userId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={sendingInvite}
                  onClick={() => setShowGameInvitePicker((v) => !v)}
                  className="px-2.5 py-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  title="DM में गेम खेलने का इनवाइट भेजें"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Game Invite</span>
                </button>
                <button
                  type="button"
                  disabled={sendingInvite}
                  onClick={handleSendLockedRoomInvite}
                  className="px-2.5 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  title="अपने पर्सनल लॉक वॉइस रूम का इनवाइट भेजें"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock Room Invite</span>
                </button>
              </div>
            </div>

            {/* DM Game Invite Picker Drawer */}
            {showGameInvitePicker && (
              <div className="bg-indigo-50 border-b border-indigo-200 p-2.5 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-black text-indigo-900">
                  <span>🎮 किस गेम के लिए {activeFriend.fullName} को आमंत्रित करें?</span>
                  <button
                    type="button"
                    onClick={() => setShowGameInvitePicker(false)}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DM_INVITE_GAMES.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => handleSendGameInvite(g.key, g.label)}
                      className="px-2.5 py-1 rounded-sm bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-900 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages[activeFriend.userId] || []).length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  नमस्ते भेजकर या ऊपर से 🎮 Game / 🔒 Room Invite भेजकर {activeFriend.fullName} से जुड़ें!
                </div>
              ) : (
                (messages[activeFriend.userId] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    {msg.inviteType === 'game' ? (
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-xl p-3 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-md border border-indigo-400/50 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                          <Gamepad2 className="w-4 h-4" />
                          <span>DM GAME INVITE • {msg.gameName || msg.gameKey}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-white/20 gap-2">
                          <span className="text-[9px] text-indigo-100">{msg.timestamp}</span>
                          {msg.gameKey && onAcceptGameInvite && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onAcceptGameInvite(msg.gameKey!);
                              }}
                              className="px-3 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>Play Now</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : msg.inviteType === 'locked_room' ? (
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-xl p-3 bg-gradient-to-br from-amber-600 to-rose-700 text-white shadow-md border border-amber-300/60 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black text-yellow-200">
                          <Lock className="w-4 h-4" />
                          <span>PERSONAL LOCKED ROOM INVITE</span>
                        </div>
                        <div className="bg-black/25 rounded-lg p-2 text-xs space-y-0.5">
                          <div className="font-black">🏠 {msg.roomTitle || 'Private Voice Room'}</div>
                          <div className="font-mono text-[11px] text-amber-200">
                            Room ID: #{msg.roomAddress}
                            {msg.passcode ? ` • Key: ${msg.passcode}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/20 gap-2">
                          <span className="text-[9px] text-amber-100">{msg.timestamp}</span>
                          {msg.roomAddress && onAcceptRoomInvite && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onAcceptRoomInvite(msg.roomAddress!, msg.passcode);
                              }}
                              className="px-3 py-1 rounded-md bg-white hover:bg-yellow-100 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                            >
                              <DoorOpen className="w-3 h-3" />
                              <span>Unlock &amp; Join Room</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Emojis + DM Invite Shortcuts */}
            <div className="bg-white px-3 py-1.5 border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
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
              <button
                type="button"
                onClick={() => setShowProfileCard(activeFriend)}
                className="text-[11px] font-bold text-[#2874f0] hover:underline shrink-0 cursor-pointer"
              >
                👤 Profile
              </button>
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
