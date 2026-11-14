import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  ChevronRight, 
  ShieldCheck, 
  CornerDownLeft 
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { ChatMessage } from '../types/index.ts';

const FAQ_SUGGESTIONS = [
  'ESP क्या है और कमाई कैसे होती है?',
  'मात्र ₹10 से शुरुआत कैसे करें?',
  'NWI नॉन-वर्किंग इनकम क्या है?',
  'UPI पेमेंट और QR कोड की जानकारी',
  'कमाई को बैंक/UPI में कैसे निकाले?',
  'वेरिफाइड डिजिटल ID कार्ड कैसे मिलेगा?',
];

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'नमस्ते! 🙏 मैं **IOIS & ESP (Earning System Platform)** का आधिकारिक AI असिस्टेंट हूँ। आप मुझसे प्लान्स (₹10+), 10 सर्विसेज, UPI पेमेंट, डिजिटल आईडी कार्ड या विथड्रॉल के बारे में कुछ भी पूछ सकते हैं।',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: ['ESP क्या है?', '₹10 से शुरुआत', 'NWI ऑटो पूल', 'पैसे कैसे निकाले?'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.chatWithAi(textToSend);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.reply || 'मैं आपकी सहायता के लिए यहाँ हूँ। कृपया कोई विशिष्ट प्रश्न पूछें।',
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: data.options || [],
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'ai',
          text: 'ईएसपी सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें या हमारे आधिकारिक WhatsApp नंबर पर संपर्क करें।',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && !isMinimized && (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2 bg-[#2874f0] hover:bg-[#1e60d5] text-white font-bold px-3.5 py-2 rounded-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-blue-400 group"
            aria-label="Open ESP AI Assistant"
          >
            <div className="relative">
              <Bot className="w-4 h-4 text-[#ffe500] group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <span className="text-xs font-bold tracking-wide hidden xs:inline">ESP AI Help</span>
            <span className="text-[9px] bg-[#ffe500] text-[#212121] font-mono font-bold px-1.5 py-0.5 rounded-sm">
              24x7
            </span>
          </button>
          
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-sm bg-white hover:bg-slate-100 text-slate-600 hover:text-[#212121] border border-slate-300 shadow text-xs cursor-pointer"
            title="Minimize Chatbot"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Compact Bubble when Minimized */}
      {!isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="p-2.5 rounded-full bg-[#2874f0] text-white shadow-xl border border-blue-300 hover:scale-110 transition cursor-pointer opacity-90 hover:opacity-100"
          title="Open ESP AI Assistant"
        >
          <Bot className="w-4 h-4" />
        </button>
      )}


      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] max-h-[85vh] h-[550px] bg-white border border-slate-200 rounded-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#212121]">
          {/* Top Bar */}
          <div className="bg-[#2874f0] p-3.5 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-sm bg-white/15 text-[#ffe500] border border-white/25 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white">IOIS &amp; ESP AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-blue-100">Earning System Platform Helper</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-sm text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick FAQ Strip */}
          <div className="bg-[#f9fafb] border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            <span className="text-[#fb641b] font-bold shrink-0">FAQ:</span>
            {FAQ_SUGGESTIONS.map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(faq)}
                className="whitespace-nowrap bg-white hover:bg-blue-50 hover:text-[#2874f0] text-slate-700 px-2 py-0.5 rounded-sm transition border border-slate-200 cursor-pointer font-medium"
              >
                {faq}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-[#f1f3f6]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-md p-3 leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#2874f0] text-white font-medium rounded-tr-none'
                      : 'bg-white text-[#212121] border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </div>
                  <span
                    className={`text-[9px] block text-right mt-1 opacity-75 ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {/* Follow-up Quick Action Pills */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(opt)}
                        className="bg-white hover:bg-blue-50 text-[#2874f0] border border-blue-200 text-[10px] font-semibold px-2.5 py-1 rounded-sm transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-600 text-xs bg-white p-2.5 rounded-md border border-slate-200 max-w-[60%]">
                <Sparkles className="w-3.5 h-3.5 text-[#fb641b] animate-spin" />
                <span>ESP AI सोच रहा है...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="ESP प्लान्स, UPI पेमेंट, विथड्रॉल पूछें..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white transition cursor-pointer disabled:opacity-40"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
