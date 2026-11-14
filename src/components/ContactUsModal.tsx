import React, { useState } from 'react';
import { X, Send, Mail, MapPin, Phone, MessageSquare, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import type { PlatformSettings, UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlatformSettings;
  currentUser?: UserProfile | null;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentUser,
}) => {
  const [name, setName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('कृपया नाम, ईमेल और संदेश भरें', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitContactMessage({
        name,
        email,
        phone,
        telegramUsername,
        subject: subject || 'सामान्य सहायता व मार्गदर्शन',
        message,
      });

      if (res.success) {
        setSubmitted(true);
        showToast('आपका संदेश सफलतापूर्वक एडमिन को भेज दिया गया है!', 'success', 'संदेश प्राप्त');
        setTimeout(() => {
          setSubmitted(false);
          setMessage('');
          setSubject('');
          onClose();
        }, 2200);
      } else {
        showToast(res.message || 'संदेश नहीं भेजा जा सका', 'error');
      }
    } catch {
      showToast('नेटवर्क त्रुटि के कारण संदेश नहीं भेजा जा सका', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const telegramLink = settings.telegramLink || 'https://t.me/espplatform_official';
  const telegramHandle = settings.telegramUsername || '@espplatform_official';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-white text-[#212121] rounded-md border border-slate-200 shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#2874f0] p-4 sm:p-6 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white text-[#2874f0] flex items-center justify-center shadow-2xs font-bold text-xl">
              ✉️
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffe500]">
                Official Helpdesk &amp; Communication
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white">
                संपर्क पेज (Contact Us &amp; Support)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto text-xs sm:text-sm">
          {/* Official Contact Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Telegram */}
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-between hover:border-[#0088cc] transition group shadow-2xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-sm bg-[#0088cc] text-white flex items-center justify-center text-xl shrink-0">
                  ✈️
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0088cc] block">आधिकारिक टेलीग्राम</span>
                  <span className="font-bold text-xs sm:text-sm text-[#212121] group-hover:underline">
                    {telegramHandle}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#0088cc] shrink-0" />
            </a>

            {/* WhatsApp Support */}
            <a
              href={`https://wa.me/91${settings.whatsappNumber}?text=नमस्ते%20फाउंडर%20संतोष%20कुमार%20जी,%20मुझे%20ESP%20प्लेटफॉर्म%20के%20बारे%20में%20जानकारी%20चाहिए`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between hover:border-[#388e3c] transition group shadow-2xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-sm bg-[#388e3c] text-white flex items-center justify-center font-bold text-xl shrink-0">
                  💬
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#388e3c] block">व्हाट्सएप हेल्पलाइन</span>
                  <span className="font-bold text-xs sm:text-sm text-[#212121] group-hover:underline">
                    +91 {settings.whatsappNumber}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#388e3c] shrink-0" />
            </a>

            {/* Email Address */}
            <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-sm bg-blue-50 text-[#2874f0] border border-blue-200 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">आधिकारिक ईमेल आईडी</span>
                <span className="font-bold text-xs text-[#212121] truncate block">
                  {settings.supportEmail}
                </span>
              </div>
            </div>

            {/* Head Office Address */}
            <div className="p-3.5 rounded-md bg-[#f9fafb] border border-slate-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-sm bg-amber-50 text-[#fb641b] border border-amber-200 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">कॉर्पोरेट ऑफिस का पता</span>
                <span className="font-semibold text-xs text-slate-700 leading-tight block">
                  {settings.contactAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Message Sending Form */}
          <div className="p-4 sm:p-5 rounded-md bg-[#f9fafb] border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-[#2874f0] font-bold text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>सीधा संदेश भेजें (Send Direct Inquiry to Management)</span>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2 animate-fadeIn">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-[#388e3c] flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
                <h5 className="font-bold text-base text-[#388e3c]">संदेश प्राप्त हुआ!</h5>
                <p className="text-xs text-slate-600">
                  हमारी सपोर्ट टीम व फाउंडर 24 घंटे के भीतर आपके ईमेल / व्हाट्सएप पर संपर्क करेंगे।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#212121] mb-1">
                      आपका पूरा नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#212121] mb-1">
                      ईमेल आईडी (Email Address) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#212121] mb-1">
                      मोबाइल नंबर / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#212121] mb-1">
                      Telegram Username (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={e => setTelegramUsername(e.target.value)}
                      placeholder="e.g. @your_username"
                      className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    विषय (Subject)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. ₹10 जॉइनिंग, डिजिटल आईडी कार्ड या वॉइस रूम पूछताछ"
                    className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    आपका संदेश / सवाल (Your Message) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="कृपया अपनी बात विस्तार से लिखें..."
                    className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-sm font-bold text-xs bg-[#fb641b] hover:bg-[#e5530d] text-white shadow-2xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'भेज रहे हैं...' : 'संदेश भेजें / Submit Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f9fafb] border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-600">
            24 घंटे के भीतर त्वरित प्रतिक्रिया
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm font-bold text-xs bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 transition cursor-pointer"
          >
            बंद करें / Close
          </button>
        </div>
      </div>
    </div>
  );
};
