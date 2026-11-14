import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageCircle, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { PlatformSettings } from '../types/index.ts';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlatformSettings;
}

export const HelplineModal: React.FC<HelplineModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'रजिस्ट्रेशन के बाद आईडी कार्ड कब एक्टिवेट होता है?',
      a: 'एडमिन द्वारा आपके 12 अंकों के UPI UTR / Transaction No. का मिलान होते ही आपका आईडी कार्ड तुरंत एक्टिवेट हो जाता है। सामान्यतः इसमें 5 से 15 मिनट का समय लगता है।'
    },
    {
      q: 'न्यूनतम निकासी (Minimum Payout) कितनी है?',
      a: `न्यूनतम निकासी मात्र ₹${settings.minWithdrawal || 50} है। इसे आप सीधे अपने PhonePe, Google Pay या Paytm UPI पर बिना किसी अतिरिक्त शुल्क के प्राप्त कर सकते हैं।`
    },
    {
      q: 'क्या छात्र अपनी पढ़ाई के साथ यह कर सकते हैं?',
      a: 'हां! यह सिस्टम विशेष रूप से कॉलेज और स्कूल के विद्यार्थियों के लिए बनाया गया है। प्रतिदिन केवल 15 से 30 मिनट देकर आप अपनी पॉकेट मनी कमा सकते हैं।'
    },
    {
      q: 'ESP ID और GAMING ID में क्या अंतर है?',
      a: 'ESP ID आपके 10 अर्निंग कोर्सेज, रेफरल टीम व UPI बैंक पेआउट के लिए है। जबकि GAMING ID वीप्ले 8-सीट वॉइस रूम, मिनी गेम्स और वर्चुअल गिफ्टिंग के लिए है।'
    }
  ];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(settings.whatsappNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-xl shadow-xl relative max-h-[92vh] flex flex-col overflow-hidden text-[#212121] my-auto">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#2874f0] flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center shadow-2xs text-[#2874f0] font-bold text-xl">
              📞
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  ESP आधिकारिक हेल्पलाइन व सपोर्ट
                </h2>
                <span className="text-[10px] bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-sm font-bold">
                  24x7 HELP
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                24x7 छात्र सहायता केंद्र • त्वरित समाधान
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Direct */}
            <a
              href={`https://api.whatsapp.com/send?phone=91${settings.whatsappNumber}&text=${encodeURIComponent('नमस्ते ESP सपोर्ट, मुझे एडमिशन व अर्निंग के बारे में जानकारी चाहिए।')}`}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 hover:border-[#388e3c] transition flex items-center space-x-3 shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-sm bg-[#388e3c] flex items-center justify-center text-white shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#212121] group-hover:text-[#388e3c] transition">
                  व्हाट्सएप लाइव चैट
                </p>
                <p className="text-[11px] text-[#388e3c] font-mono font-semibold">
                  +91 {settings.whatsappNumber}
                </p>
              </div>
            </a>

            {/* Helpline Call */}
            <a
              href={`tel:+91${settings.whatsappNumber}`}
              className="p-3.5 rounded-md bg-blue-50 border border-blue-200 hover:border-[#2874f0] transition flex items-center space-x-3 shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-sm bg-[#2874f0] flex items-center justify-center text-white shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#212121] group-hover:text-[#2874f0] transition">
                  हेल्पलाइन डायरेक्ट कॉल
                </p>
                <p className="text-[11px] text-[#2874f0] font-mono font-semibold">
                  सुबह 9:00 - रात 9:00
                </p>
              </div>
            </a>
          </div>

          {/* Official Email & UPI Details */}
          <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 flex items-center space-x-1.5 font-semibold">
                <Mail className="w-4 h-4 text-[#2874f0]" />
                <span>ईमेल सपोर्ट:</span>
              </span>
              <a href={`mailto:${settings.supportEmail || 'ioisplatform@gmail.com'}`} className="font-mono text-[#2874f0] font-bold hover:underline">
                {settings.supportEmail || 'ioisplatform@gmail.com'}
              </a>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 flex items-center space-x-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#388e3c]" />
                <span>आधिकारिक UPI ID:</span>
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[#388e3c] font-bold">{settings.adminUpiId}</span>
                <button
                  onClick={handleCopyUpi}
                  className="p-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Copy UPI"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center space-x-1.5 font-semibold">
                <Clock className="w-4 h-4 text-[#fb641b]" />
                <span>मुख्यालय पता:</span>
              </span>
              <span className="text-[#212121] font-medium">{settings.contactAddress}</span>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2874f0] flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>अक्सर पूछे जाने वाले सवाल (FAQ):</span>
            </h3>

            <div className="space-y-1.5">
              {faqs.map((f, i) => (
                <div key={i} className="rounded-md bg-[#f9fafb] border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-3 text-xs font-bold text-[#212121] hover:text-[#2874f0] flex items-center justify-between cursor-pointer"
                  >
                    <span>{f.q}</span>
                    {openFaq === i ? <ChevronUp className="w-3.5 h-3.5 text-[#2874f0]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-3 pb-3 pt-2 text-xs text-slate-700 leading-relaxed border-t border-slate-200 bg-white">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#f9fafb] border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-bold text-xs transition cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
