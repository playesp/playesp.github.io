import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image as ImageIcon, 
  Users, 
  MessageSquare, 
  Phone, 
  Share2, 
  Plus, 
  CheckCheck, 
  Search, 
  ShieldCheck, 
  UserPlus, 
  Sparkles, 
  HelpCircle, 
  MoreVertical, 
  ArrowLeft,
  Lock,
  X,
  Volume2
} from 'lucide-react';
import type { ChatRoom, ClubChatMessage, UserContact, UserProfile, PlatformSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';

interface ChatClubViewProps {
  currentUser: UserProfile | null;
  settings: PlatformSettings;
  onOpenLogin: () => void;
  onSelectTab: (tab: string) => void;
}

export const ChatClubView: React.FC<ChatClubViewProps> = ({
  currentUser,
  settings,
  onOpenLogin,
  onSelectTab,
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-global');
  const [messages, setMessages] = useState<ClubChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Mobile navigation state
  const [mobileActiveView, setMobileActiveView] = useState<'rooms' | 'chat' | 'contacts'>('rooms');

  // Contact list
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contactRoll, setContactRoll] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Create party room modal
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    try {
      const data = await api.getChatRooms();
      setRooms(data);
    } catch (e) {
      console.error('Error fetching rooms', e);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      setLoadingMessages(true);
      const data = await api.getChatMessages(roomId);
      setMessages(data);
    } catch (e) {
      console.error('Error fetching messages', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchContacts = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getUserContacts(currentUser.userId);
      setContacts(data);
    } catch (e) {
      console.error('Error fetching contacts', e);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      const timer = setInterval(() => {
        fetchMessages(activeRoomId);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (currentUser) {
      fetchContacts();
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0] || {
    id: 'room-global',
    name: 'ESP National Community Club',
    hindiName: 'राष्ट्रीय कम्युनिटी क्लब',
    description: 'All ESP verified members',
    category: 'community',
    membersCount: 2840,
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    const finalMsg = textToSend || inputText;
    if (!finalMsg.trim()) return;

    try {
      const sent = await api.sendChatMessage({
        roomId: activeRoomId,
        senderId: currentUser.userId,
        senderName: currentUser.fullName,
        senderRollNumber: currentUser.userId,
        senderAvatar: currentUser.avatar,
        text: finalMsg.trim(),
      });

      setMessages(prev => [...prev, sent]);
      if (!textToSend) setInputText('');
      fetchRooms();
    } catch (e) {
      console.error('Error sending message', e);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!newRoomName.trim()) return;

    try {
      const created = await api.createChatRoom({
        name: newRoomName.trim(),
        description: newRoomDesc.trim() || 'ESP Party Friend Group',
        createdById: currentUser.userId,
      });

      setShowCreateRoomModal(false);
      setNewRoomName('');
      setNewRoomDesc('');
      await fetchRooms();
      setActiveRoomId(created.id);
      setMobileActiveView('chat');
    } catch (err: any) {
      showToast(err?.message || 'Error creating party room', 'error');
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!contactRoll.trim() || !contactName.trim()) return;

    try {
      await api.saveUserContact({
        userId: currentUser.userId,
        contactRollNumber: contactRoll.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      });
      setShowAddContactModal(false);
      setContactRoll('');
      setContactName('');
      setContactPhone('');
      await fetchContacts();
    } catch (err: any) {
      showToast(err?.message || 'Error saving contact', 'error');
    }
  };

  const handleInviteWhatsApp = () => {
    const text = encodeURIComponent(
      `👋 *HELL0 FRIEND! JOIN ME ON ESP CHATTING CLUB & EARNING PLATFORM!*\n\n` +
      `I am earning through ESP starting at just ₹10. Join our official community club:\n` +
      `🔗 *Direct Joining Link:* ${window.location.origin}/?ref=${currentUser?.userId || settings.ownerSponsorId}\n` +
      `👑 *My Sponsor Code:* ${currentUser?.userId || settings.ownerSponsorId}\n` +
      `✨ Get verified member Digital ID Card instantly!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const quickQuestions = [
    '₹10 से शुरुआत कैसे करें?',
    'NWI ऑटो पूल कैसे काम करता है?',
    'डायरेक्ट UPI निकासी कितनी देर में आती है?',
    'आईडी कार्ड कैसे डाउनलोड करें?',
  ];

  return (
    <div className="py-2 pb-24 w-full max-w-6xl mx-auto space-y-4">
      {/* Flipkart Top Strip */}
      <div className="bg-[#2874f0] rounded-md p-3.5 sm:p-4 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 flex-wrap">
          <span className="bg-[#ffe500] text-[#212121] font-extrabold text-[11px] px-2.5 py-0.5 rounded">
            ESP COMMUNITY CLUB
          </span>
          <span className="text-xs sm:text-sm font-bold text-white">
            ESP मेंबर्स लाइव चैटिंग, 10 सर्विसेज चर्चा व दोस्त बनाओ
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInviteWhatsApp}
            className="px-3.5 py-1.5 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp पर दोस्त बुलाओ</span>
          </button>
        </div>
      </div>

      {/* Main Clean Marketplace Chat Container */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs flex flex-col md:flex-row h-[78vh] min-h-[580px]">
        
        {/* Left Column: Channels, Friends & Party Rooms */}
        <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col ${
          mobileActiveView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="bg-[#f5f8ff] p-3.5 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-[#2874f0] flex items-center justify-center font-black text-white text-xs shadow-xs">
                ESP
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#212121]">ESP Chat Club</h3>
                <span className="text-[11px] text-[#388e3c] font-bold">2,840+ Verified Members</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowCreateRoomModal(true)}
                title="पार्टी रूम / नया ग्रुप बनाएं"
                className="p-2 rounded text-[#2874f0] hover:bg-blue-50 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAddContactModal(true)}
                title="कांटेक्ट जोड़ें"
                className="p-2 rounded text-[#388e3c] hover:bg-emerald-50 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-2.5 bg-white border-b border-slate-100">
            <div className="bg-[#f1f3f6] rounded px-3 py-1.5 flex items-center space-x-2 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="रूम या दोस्त खोजें..."
                className="bg-transparent border-none text-xs text-[#212121] placeholder-slate-400 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2874f0] bg-[#f9fafb]">
              ऑफिशियल चैट रूम्स (Club Channels)
            </div>

            {rooms.map(room => {
              const isSelected = room.id === activeRoomId;
              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setActiveRoomId(room.id);
                    setMobileActiveView('chat');
                  }}
                  className={`p-3 flex items-center space-x-3 cursor-pointer transition ${
                    isSelected ? 'bg-[#f5f8ff] border-l-2 border-[#2874f0]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-black text-sm text-[#2874f0] shrink-0">
                    {room.category === 'community' ? '🌐' : room.category === 'service' ? '💼' : room.category === 'help' ? '👑' : '🤝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#212121] truncate">{room.name}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{room.lastMessageTime || 'Live'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 truncate">
                      <span className="truncate">{room.lastMessage || room.hindiName}</span>
                      <span className="text-[10px] text-[#388e3c] font-bold ml-1 shrink-0">{room.membersCount} 👥</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Saved Contacts Section */}
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#388e3c] bg-[#f9fafb] flex items-center justify-between">
              <span>सहेजे गए मित्र ({contacts.length})</span>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="text-[10px] text-[#2874f0] hover:underline font-bold cursor-pointer"
              >
                + जोड़ें
              </button>
            </div>

            {contacts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                कोई कांटेक्ट सेव नहीं है। &ldquo;+ जोड़ें&rdquo; पर क्लिक करके रोल नंबर जोड़ें।
              </div>
            ) : (
              contacts.map(c => (
                <div
                  key={c.id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => {
                    setInputText(`@${c.contactRollNumber} `);
                    setMobileActiveView('chat');
                  }}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2874f0] flex items-center justify-center text-xs font-bold text-white">
                      {c.contactName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#212121] block">{c.contactName}</span>
                      <span className="text-[10px] text-[#2874f0] font-mono font-bold">{c.contactRollNumber}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#f1f3f6] px-2 py-0.5 rounded text-slate-700 font-semibold">
                    टैग करें
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Screen */}
        <div className={`flex-1 bg-[#f1f3f6] flex flex-col relative ${
          mobileActiveView === 'rooms' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header of Active Chat */}
          <div className="bg-white p-3 px-4 flex items-center justify-between border-b border-slate-200 z-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileActiveView('rooms')}
                className="md:hidden p-1 text-slate-600 hover:text-[#2874f0]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-base">
                {activeRoom.category === 'community' ? '🌐' : activeRoom.category === 'service' ? '💼' : activeRoom.category === 'help' ? '👑' : '🤝'}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#212121] leading-tight">{activeRoom.name}</h4>
                <p className="text-[11px] text-slate-500">
                  {activeRoom.hindiName || activeRoom.description} • {activeRoom.membersCount} सक्रिय सदस्य
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleInviteWhatsApp}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>मित्रों को जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 relative">
            <div className="max-w-md mx-auto bg-white border border-blue-200 rounded p-2.5 text-center text-[11px] text-[#2874f0] font-semibold space-y-0.5 shadow-2xs">
              <span className="flex items-center justify-center gap-1 font-bold">
                <Lock className="w-3 h-3" />
                ESP वेरिफाइड कम्युनिटी चैट रूम (Official Protection)
              </span>
              <p className="text-slate-600 text-[10px]">
                सभी संदेश सुरक्षित हैं। किसी भी सर्विस संबंधी प्रश्न पूछें और अन्य मेंबर्स से चर्चा करें।
              </p>
            </div>

            {loadingMessages ? (
              <div className="text-center py-10 text-xs text-slate-500">संदेश लोड हो रहे हैं...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                इस ग्रुप में अभी कोई संदेश नहीं है। पहला संदेश लिखें!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser && msg.senderId === currentUser.userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 shadow-2xs relative space-y-1 ${
                        isMe
                          ? 'bg-[#2874f0] text-white rounded-tr-none'
                          : 'bg-white text-[#212121] rounded-tl-none border border-slate-200'
                      }`}
                    >
                      {!isMe && (
                        <div className="flex items-center space-x-1.5 pb-0.5">
                          <span className="text-[11px] font-extrabold text-[#2874f0]">
                            {msg.senderName}
                          </span>
                          <span className="text-[9px] bg-[#f1f3f6] px-1.5 py-0.5 rounded text-slate-700 font-mono font-bold">
                            {msg.senderRollNumber}
                          </span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line break-words">
                        {msg.text}
                      </p>

                      {msg.imageUrl && (
                        <div className="rounded overflow-hidden mt-1 max-h-48">
                          <img src={msg.imageUrl} alt="attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      <div className={`flex items-center justify-end space-x-1 text-[9px] pt-0.5 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#ffe500]" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Discussion Topic Suggestions */}
          <div className="bg-white px-3 py-2 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] text-[#2874f0] font-bold shrink-0">तुरंत पूछें:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-[#f1f3f6] hover:bg-blue-50 text-[#212121] px-2.5 py-1 rounded-full border border-slate-200 shrink-0 cursor-pointer transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="bg-white p-2.5 sm:p-3 border-t border-slate-200 flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-slate-500">
              <button
                onClick={() => setInputText(prev => prev + ' 👍')}
                className="p-1.5 hover:text-[#2874f0] rounded cursor-pointer"
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="p-1.5 hover:text-[#2874f0] rounded cursor-pointer"
                title="Add Contact"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder={currentUser ? "संदेश लिखें..." : "चैट करने के लिए पहले लॉगिन करें..."}
              value={inputText}
              disabled={!currentUser}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-[#f1f3f6] border border-slate-200 rounded px-3.5 py-2 text-xs sm:text-sm text-[#212121] placeholder-slate-400 focus:outline-none focus:border-[#2874f0]"
            />

            {currentUser ? (
              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full bg-[#2874f0] hover:bg-blue-700 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-bold text-xs cursor-pointer shrink-0"
              >
                Login to Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Party Room / Group */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-md max-w-md w-full p-5 space-y-4 shadow-xl text-[#212121]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-base font-extrabold text-[#212121]">नया ग्रुप / पार्टी रूम बनाएं</h3>
              <button onClick={() => setShowCreateRoomModal(false)} className="text-slate-500 hover:text-[#212121] text-sm font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">ग्रुप का नाम:</label>
                <input
                  type="text"
                  placeholder="उदा. बिहार टीम अर्नर्स, स्टूडेंट्स स्पेशल..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded p-2.5 text-xs text-[#212121] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">विवरण / उद्देश्य:</label>
                <input
                  type="text"
                  placeholder="उदा. नए दोस्तों को जोड़ना और ₹10 प्लान शेयर करना"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded p-2.5 text-xs text-[#212121] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRoomModal(false)}
                  className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-blue-700 text-white cursor-pointer"
                >
                  ग्रुप बनाएं
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Contact / Address Book */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-md max-w-md w-full p-5 space-y-4 shadow-xl text-[#212121]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-base font-extrabold text-[#212121]">कांटेक्ट एड्रेस जोड़ें (Add Contact)</h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-500 hover:text-[#212121] text-sm font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">मित्र का रोल नंबर (ID):</label>
                <input
                  type="text"
                  placeholder="उदा. ESP10RK01"
                  value={contactRoll}
                  onChange={(e) => setContactRoll(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded p-2.5 text-xs text-[#212121] uppercase outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">नाम:</label>
                <input
                  type="text"
                  placeholder="मित्र का पूरा नाम"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded p-2.5 text-xs text-[#212121] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">व्हाट्सएप नंबर (ऐच्छिक):</label>
                <input
                  type="tel"
                  placeholder="10 अंकों का मोबाइल नंबर"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded p-2.5 text-xs text-[#212121] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm text-xs font-bold bg-[#388e3c] hover:bg-emerald-700 text-white cursor-pointer"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
