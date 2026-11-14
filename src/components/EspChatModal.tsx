import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  UserPlus, 
  Users, 
  Search, 
  Send, 
  X, 
  Check, 
  Smile, 
  Image as ImageIcon, 
  Mic, 
  Gift, 
  Sparkles, 
  Award, 
  Circle, 
  ChevronLeft,
  UserCheck,
  Clock,
  ShieldCheck,
  Gamepad2
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { sound8D } from '../services/sound8d.ts';
import { showToast } from '../services/toast.ts';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type?: 'text' | 'voice' | 'gift' | 'photo';
}

export interface EspFriend {
  userId: string;
  gamingId: string;
  fullName: string;
  avatar: string;
  isOnline: boolean;
  gameLevel: number;
  bio: string;
  mutualFriends: number;
  favoriteGame: string;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;
  status: 'friend' | 'pending_sent' | 'pending_received' | 'suggested';
}

interface EspChatModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfileModal?: (friend: EspFriend) => void;
}

// Initial Platform Community Members
const INITIAL_COMMUNITY_MEMBERS: EspFriend[] = [
  {
    userId: 'EMO-MOM-MMO',
    gamingId: 'GAME-ESP-FOUNDER',
    fullName: 'SANTOSH KUMAR (Founder)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarFounder',
    isOnline: true,
    gameLevel: 99,
    bio: 'ESP प्लेटफॉर्म के संस्थापक। किसी भी सहायता के लिए संपर्क करें!',
    mutualFriends: 18,
    favoriteGame: "Who's the Spy & Voice Stage",
    lastMessage: 'नमस्ते! गेम रूम में स्वागत है। आज कौन सा गेम खेल रहे हैं?',
    lastTime: 'Just now',
    unreadCount: 1,
    status: 'friend'
  },
  {
    userId: 'SHARMA-JI-VIP',
    gamingId: 'GAME-778899',
    fullName: 'Sharma Ji (शर्मा जी)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiVIP',
    isOnline: true,
    gameLevel: 88,
    bio: 'लूडो और बिंगो का मास्टर खिलाड़ी। हर दिन नया चैलेंज!',
    mutualFriends: 12,
    favoriteGame: 'Ludo 3D King',
    lastMessage: 'भाई लूडो खेलोगे क्या? रूम नंबर 4 में आओ!',
    lastTime: '5m ago',
    unreadCount: 2,
    status: 'friend'
  },
  {
    userId: 'ESP50VK01',
    gamingId: 'GAME-VIKAS-50',
    fullName: 'Vikas Kumar (विपिन)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VikasKumarAdmin',
    isOnline: true,
    gameLevel: 45,
    bio: 'अर्निंग और गेमिंग दोनों में 100% एक्टिव। फ्रेंड रिक्वेस्ट भेजें!',
    mutualFriends: 8,
    favoriteGame: 'Space Werewolf',
    lastMessage: 'कल वीकली रिवॉर्ड में मुझे 40 कॉइन्स मिले!',
    lastTime: '1h ago',
    unreadCount: 0,
    status: 'friend'
  },
  {
    userId: 'ESP10AS01',
    gamingId: 'GAME-ANITA-10',
    fullName: 'Anita Sharma',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnitaSharma01',
    isOnline: false,
    gameLevel: 32,
    bio: 'म्यूजिक लवर & ओ माई कार्ड चैंपियन 🃏',
    mutualFriends: 5,
    favoriteGame: 'Oh My Card',
    lastMessage: 'चलो कार्ड गेम मैच लगाते हैं!',
    lastTime: 'Yesterday',
    unreadCount: 0,
    status: 'friend'
  },
  // Suggested Friends
  {
    userId: 'ESP200RK02',
    gamingId: 'GAME-RAHUL-200',
    fullName: 'Rahul Roy (राहुल)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RahulRoy200',
    isOnline: true,
    gameLevel: 28,
    bio: 'नया मेंबर, अच्छे दोस्त बनाने आया हूँ।',
    mutualFriends: 4,
    favoriteGame: "Trickster's Cafe",
    status: 'suggested'
  },
  {
    userId: 'ESP100PV03',
    gamingId: 'GAME-PRIYA-100',
    fullName: 'Priya Verma',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaVermaESP',
    isOnline: true,
    gameLevel: 36,
    bio: 'सिंगिंग और वॉइस रूम चैटिंग मेरी हॉबी है 🎙️',
    mutualFriends: 7,
    favoriteGame: 'Mic Grab',
    status: 'suggested'
  },
  {
    userId: 'ESP500DK04',
    gamingId: 'GAME-DEEPAK-500',
    fullName: 'Deepak Chauhan',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DeepakChauhan',
    isOnline: false,
    gameLevel: 42,
    bio: 'डेली टास्क पूरा करो और कॉइन्स जीतो!',
    mutualFriends: 6,
    favoriteGame: 'Bingo Live',
    status: 'suggested'
  },
  // Incoming Friend Request
  {
    userId: 'ESP50NEHA05',
    gamingId: 'GAME-NEHA-50',
    fullName: 'Neha Patel (नेहा)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NehaPatelVIP',
    isOnline: true,
    gameLevel: 22,
    bio: 'हेलो! मुझे अपनी फ्रेंड लिस्ट में शामिल करें।',
    mutualFriends: 3,
    favoriteGame: 'Guess My Drawing',
    status: 'pending_received'
  }
];

export const EspChatModal: React.FC<EspChatModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onOpenProfileModal,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'add_friends' | 'requests'>('chats');
  const [friendsList, setFriendsList] = useState<EspFriend[]>(() => {
    try {
      const stored = localStorage.getItem(`esp_friends_${currentUser.userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_COMMUNITY_MEMBERS;
  });

  const [activeFriend, setActiveFriend] = useState<EspFriend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showProfileCard, setShowProfileCard] = useState<EspFriend | null>(null);

  // Chat messages thread per friend
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const stored = localStorage.getItem(`esp_messages_${currentUser.userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      'EMO-MOM-MMO': [
        { id: 'm1', senderId: 'EMO-MOM-MMO', senderName: 'SANTOSH KUMAR', text: 'नमस्ते! ESP CHAT में आपका स्वागत है।', timestamp: '10:00 AM', isMe: false },
        { id: 'm2', senderId: currentUser.userId, senderName: currentUser.fullName, text: 'सर, बहुत बढ़िया गेमिंग और अर्निंग सिस्टम बना है!', timestamp: '10:02 AM', isMe: true },
        { id: 'm3', senderId: 'EMO-MOM-MMO', senderName: 'SANTOSH KUMAR', text: 'धन्यवाद! अपने दोस्तों को भी इनवाइट करें और साथ में खेलें।', timestamp: '10:05 AM', isMe: false }
      ],
      'SHARMA-JI-VIP': [
        { id: 'm4', senderId: 'SHARMA-JI-VIP', senderName: 'Sharma Ji', text: 'भाई लूडो खेलोगे क्या? 3D पासा फेंकने में मजा आता है!', timestamp: '11:15 AM', isMe: false }
      ]
    };
  });

  // Save changes locally
  useEffect(() => {
    try {
      localStorage.setItem(`esp_friends_${currentUser.userId}`, JSON.stringify(friendsList));
    } catch {}
  }, [friendsList, currentUser.userId]);

  useEffect(() => {
    try {
      localStorage.setItem(`esp_messages_${currentUser.userId}`, JSON.stringify(messages));
    } catch {}
  }, [messages, currentUser.userId]);

  if (!isOpen) return null;

  // Filter lists
  const confirmedFriends = friendsList.filter(f => f.status === 'friend');
  const suggestedFriends = friendsList.filter(f => f.status === 'suggested');
  const pendingRequests = friendsList.filter(f => f.status === 'pending_received');

  const filteredChatFriends = confirmedFriends.filter(f => 
    f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send Message
  const handleSendMessage = () => {
    if (!inputText.trim() || !activeFriend) return;

    sound8D.play8DChime(520, 'click');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.userId,
      senderName: currentUser.fullName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text'
    };

    const friendId = activeFriend.userId;
    const currentThread = messages[friendId] || [];
    const updatedThread = [...currentThread, newMsg];

    setMessages(prev => ({
      ...prev,
      [friendId]: updatedThread
    }));

    setInputText('');

    // Update friend last message
    setFriendsList(prev => prev.map(f => {
      if (f.userId === friendId) {
        return {
          ...f,
          lastMessage: newMsg.text,
          lastTime: 'Just now'
        };
      }
      return f;
    }));

    // Friendly auto-reply simulation after 1.5 seconds
    setTimeout(() => {
      const autoReplies = [
        'बहुत बढ़िया! मैं भी अभी गेम रूम में आ रहा हूँ।',
        'अरे वाह! चलो आज मिलकर बड़ा मैच जीतते हैं!',
        'हाहा, एकदम सही कहा आपने! 🎮',
        'शानदार! चलो एक राउंड और खेलते हैं।',
        '👍 ओके ब्रो, मैं तैयार हूँ!'
      ];
      const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

      const replyMsg: ChatMessage = {
        id: `reply_${Date.now()}`,
        senderId: activeFriend.userId,
        senderName: activeFriend.fullName,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        type: 'text'
      };

      setMessages(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), replyMsg]
      }));

      sound8D.play8DChime(660, 'mic');

      setFriendsList(prev => prev.map(f => {
        if (f.userId === friendId) {
          return {
            ...f,
            lastMessage: randomReply,
            lastTime: 'Just now'
          };
        }
        return f;
      }));
    }, 1500);
  };

  // Add Friend Action
  const handleSendFriendRequest = (friend: EspFriend) => {
    sound8D.play8DChime(440, 'win');
    setFriendsList(prev => prev.map(f => {
      if (f.userId === friend.userId) {
        return { ...f, status: 'pending_sent' };
      }
      return f;
    }));
  };

  // Accept Request
  const handleAcceptRequest = (friend: EspFriend) => {
    sound8D.play8DChime(580, 'win');
    setFriendsList(prev => prev.map(f => {
      if (f.userId === friend.userId) {
        return { ...f, status: 'friend' };
      }
      return f;
    }));
  };

  // Decline Request
  const handleDeclineRequest = (friend: EspFriend) => {
    setFriendsList(prev => prev.filter(f => f.userId !== friend.userId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden flex flex-col h-[85vh] max-h-[720px] text-[#212121]">
        
        {/* ============================================================== */}
        {/* 1. TOP HEADER (ESP CHAT - SOCIAL NETWORK)                      */}
        {/* ============================================================== */}
        <div className="bg-[#2874f0] text-white p-3.5 sm:p-4 border-b border-blue-600 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            {activeFriend ? (
              <button
                onClick={() => setActiveFriend(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                title="वापस सूची में जाएं"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : null}

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center shadow-xs font-black">
                💬
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                    ESP CHAT
                  </h2>
                  <span className="text-[9px] bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-xs font-black uppercase">
                    सोशल नेटवर्क
                  </span>
                </div>
                <p className="text-[10px] text-blue-100">दोस्त बनाएं, 1-on-1 चैट करें व प्रोफाइल देखें</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. CHAT THREAD VIEW (IF FRIEND IS SELECTED)                    */}
        {/* ============================================================== */}
        {activeFriend ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#f1f3f6]">
            
            {/* Friend Active Header */}
            <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div 
                onClick={() => setShowProfileCard(activeFriend)}
                className="flex items-center space-x-2.5 cursor-pointer group"
                title="प्रोफाइल देखें"
              >
                <div className="relative">
                  <img
                    src={activeFriend.avatar}
                    alt={activeFriend.fullName}
                    className="w-10 h-10 rounded-full border-2 border-[#2874f0] object-cover shadow-2xs"
                  />
                  {activeFriend.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#388e3c] border-2 border-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#2874f0] transition flex items-center gap-1.5">
                    <span>{activeFriend.fullName}</span>
                    <span className="text-[9px] bg-[#f5f8ff] text-[#2874f0] border border-blue-200 px-1.5 rounded-xs font-mono font-bold">
                      Lvl {activeFriend.gameLevel}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-600 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeFriend.isOnline ? 'bg-[#388e3c]' : 'bg-slate-400'}`} />
                    <span>{activeFriend.isOnline ? 'Active Now' : 'Offline'}</span>
                    <span>• {activeFriend.favoriteGame}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProfileCard(activeFriend)}
                className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#2874f0] border border-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>👤 प्रोफाइल</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages[activeFriend.userId] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} animate-fadeIn`}
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
                    <div className={`flex items-center justify-end space-x-1 mt-1 text-[9px] ${msg.isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.isMe && <span>✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Emoji Strip */}
            <div className="bg-white px-3 py-1.5 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['❤️', '😂', '👑', '🔥', '👍', '🎮', '🪙', '🌹', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setInputText(prev => prev + emoji)}
                  className="px-2 py-0.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-sm transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Bar */}
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
                className="p-2 sm:px-4 sm:py-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-black text-xs transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

          </div>
        ) : (
          /* ============================================================== */
          /* 3. TABS CONTENT (CHATS, FRIENDS, ADD FRIENDS, REQUESTS)        */
          /* ============================================================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-4 text-center">
              <button
                onClick={() => setActiveTab('chats')}
                className={`py-2.5 text-xs font-black transition border-b-2 flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                  activeTab === 'chats'
                    ? 'border-[#2874f0] text-[#2874f0] bg-[#f5f8ff]'
                    : 'border-transparent text-slate-600 hover:text-[#2874f0]'
                }`}
              >
                <div className="relative">
                  <MessageCircle className="w-4 h-4" />
                  {confirmedFriends.reduce((acc, f) => acc + (f.unreadCount || 0), 0) > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#fb641b] text-white text-[8px] font-black px-1 rounded-full">
                      {confirmedFriends.reduce((acc, f) => acc + (f.unreadCount || 0), 0)}
                    </span>
                  )}
                </div>
                <span>मैसेज ({confirmedFriends.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('friends')}
                className={`py-2.5 text-xs font-black transition border-b-2 flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                  activeTab === 'friends'
                    ? 'border-[#2874f0] text-[#2874f0] bg-[#f5f8ff]'
                    : 'border-transparent text-slate-600 hover:text-[#2874f0]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>दोस्त ({confirmedFriends.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('add_friends')}
                className={`py-2.5 text-xs font-black transition border-b-2 flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                  activeTab === 'add_friends'
                    ? 'border-[#2874f0] text-[#2874f0] bg-[#f5f8ff]'
                    : 'border-transparent text-slate-600 hover:text-[#2874f0]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>सजेस्टेड ({suggestedFriends.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2.5 text-xs font-black transition border-b-2 flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                  activeTab === 'requests'
                    ? 'border-[#2874f0] text-[#2874f0] bg-[#f5f8ff]'
                    : 'border-transparent text-slate-600 hover:text-[#2874f0]'
                }`}
              >
                <div className="relative">
                  <Clock className="w-4 h-4" />
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#fb641b] text-white text-[8px] font-black px-1 rounded-full">
                      {pendingRequests.length}
                    </span>
                  )}
                </div>
                <span>रिक्वेस्ट ({pendingRequests.length})</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 bg-[#f9fafb] border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="नाम या ESP आईडी से खोजें..."
                  className="w-full bg-white border border-slate-300 rounded-sm pl-9 pr-4 py-2 text-xs text-[#212121] placeholder-slate-400 focus:outline-none focus:border-[#2874f0]"
                />
              </div>
            </div>

            {/* TAB 1: CHATS LIST */}
            {activeTab === 'chats' && (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
                {filteredChatFriends.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    कोई बातचीत नहीं मिली। "सजेस्टेड" टैब से नए दोस्त बनाएं!
                  </div>
                ) : (
                  filteredChatFriends.map((f) => (
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
                            className="w-11 h-11 rounded-full border-2 border-slate-200 group-hover:border-[#2874f0] object-cover shadow-2xs"
                          />
                          {f.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#388e3c] border-2 border-white" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#2874f0] transition flex items-center gap-1.5">
                            <span>{f.fullName}</span>
                            <span className="text-[9px] bg-[#f1f3f6] text-slate-600 px-1.5 rounded-xs font-mono">
                              {f.userId}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-600 truncate max-w-[200px] sm:max-w-[280px]">
                            {f.lastMessage || f.bio}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-[10px] text-slate-500 block">{f.lastTime || 'Today'}</span>
                        {f.unreadCount ? (
                          <span className="inline-block bg-[#2874f0] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            {f.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: CONFIRMED FRIENDS */}
            {activeTab === 'friends' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#f1f3f6]">
                {confirmedFriends.map((f) => (
                  <div
                    key={f.userId}
                    className="bg-white border border-slate-200 rounded-md p-3 flex items-center justify-between shadow-2xs"
                  >
                    <div 
                      onClick={() => setShowProfileCard(f)}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <img src={f.avatar} alt={f.fullName} className="w-10 h-10 rounded-full border border-[#2874f0]" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#2874f0] transition">
                          {f.fullName}
                        </h4>
                        <p className="text-[10px] text-slate-600">{f.favoriteGame} • Lvl {f.gameLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowProfileCard(f)}
                        className="px-2.5 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 text-xs text-[#212121] font-bold cursor-pointer"
                      >
                        प्रोफाइल
                      </button>
                      <button
                        onClick={() => setActiveFriend(f)}
                        className="px-3 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white text-xs font-black shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>चैट</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SUGGESTED / ADD FRIENDS */}
            {activeTab === 'add_friends' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f1f3f6]">
                <div className="p-2.5 bg-[#f5f8ff] rounded-md border border-blue-200 text-xs text-[#212121]">
                  💡 <strong>दोस्त बनाएं:</strong> अपने खास दोस्तों को फ्रेंड लिस्ट में जोड़ें ताकि उनके साथ वॉइस रूम में बातें कर सकें और गेम्स खेल सकें!
                </div>

                {suggestedFriends.map((f) => (
                  <div
                    key={f.userId}
                    className="bg-white border border-slate-200 rounded-md p-3.5 flex items-center justify-between shadow-2xs"
                  >
                    <div 
                      onClick={() => setShowProfileCard(f)}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <img src={f.avatar} alt={f.fullName} className="w-12 h-12 rounded-full border-2 border-slate-200 group-hover:border-[#2874f0]" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#2874f0] transition">
                          {f.fullName}
                        </h4>
                        <p className="text-[10px] text-[#2874f0] font-bold">{f.mutualFriends} mutual friends</p>
                        <p className="text-[10px] text-slate-600">{f.favoriteGame}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendFriendRequest(f)}
                      className="px-3.5 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-black text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend (दोस्त बनाएं)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: REQUESTS (ACCEPT / DECLINE) */}
            {activeTab === 'requests' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f1f3f6]">
                {pendingRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    कोई नया फ्रेंड रिक्वेस्ट पेंडिंग नहीं है।
                  </div>
                ) : (
                  pendingRequests.map((f) => (
                    <div
                      key={f.userId}
                      className="bg-white border border-slate-200 rounded-md p-3.5 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={f.avatar} alt={f.fullName} className="w-11 h-11 rounded-full border border-[#2874f0]" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-[#212121]">{f.fullName}</h4>
                          <p className="text-[10px] text-slate-600">ने आपको फ्रेंड रिक्वेस्ट भेजी है</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(f)}
                          className="px-3 py-1.5 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-2xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(f)}
                          className="px-2.5 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* 4. PROFILE MODAL OVERLAY                                       */}
        {/* ============================================================== */}
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
                <div className="relative inline-block">
                  <img
                    src={showProfileCard.avatar}
                    alt={showProfileCard.fullName}
                    className="w-20 h-20 rounded-full border-4 border-[#2874f0] shadow-md object-cover mx-auto"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#388e3c] border-2 border-white" />
                </div>
                <h3 className="text-base font-black text-[#212121]">{showProfileCard.fullName}</h3>
                <p className="text-[11px] text-[#2874f0] font-mono font-bold">
                  ESP: {showProfileCard.userId} | {showProfileCard.gamingId}
                </p>
                <p className="text-xs text-slate-600 italic px-4">"{showProfileCard.bio}"</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200">
                <div className="bg-[#f5f8ff] border border-blue-100 p-2 rounded-sm">
                  <p className="text-[10px] text-slate-500 font-bold">Level</p>
                  <p className="text-sm font-black text-[#2874f0]">{showProfileCard.gameLevel}</p>
                </div>
                <div className="bg-[#f5f8ff] border border-blue-100 p-2 rounded-sm">
                  <p className="text-[10px] text-slate-500 font-bold">Fav Game</p>
                  <p className="text-xs font-bold text-[#212121] truncate">{showProfileCard.favoriteGame}</p>
                </div>
                <div className="bg-[#f5f8ff] border border-blue-100 p-2 rounded-sm">
                  <p className="text-[10px] text-slate-500 font-bold">Status</p>
                  <p className="text-xs font-bold text-[#388e3c]">
                    {showProfileCard.status === 'friend' ? 'मित्र ✓' : 'सजेस्टेड'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveFriend(showProfileCard);
                    setShowProfileCard(null);
                  }}
                  className="flex-1 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-black text-xs shadow-xs cursor-pointer"
                >
                  💬 मैसेज भेजें
                </button>
                <button
                  onClick={() => {
                    sound8D.play8DChime(660, 'win');
                    showToast(`🌹 ${showProfileCard.fullName} को रॉयल गुलाब गिफ्ट भेजा गया!`, 'success');
                  }}
                  className="px-4 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>गिफ्ट 🌹</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
