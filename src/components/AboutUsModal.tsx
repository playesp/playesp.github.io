import React from 'react';
import { X, ShieldCheck, Award, Users, HeartHandshake, Building2, MapPin, Phone, Mail, CheckCircle, Sparkles } from 'lucide-react';
import type { PlatformSettings } from '../types/index.ts';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlatformSettings;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative max-w-3xl w-full bg-white text-[#212121] rounded-md border border-slate-200 shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#2874f0] p-4 sm:p-6 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white text-[#2874f0] flex items-center justify-center shadow-2xs font-bold text-xl">
              🏢
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffe500]">
                Official Company Profile • वास्तविक परिचय
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white">
                हमारे बारे में (About ESP Platform)
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto text-xs sm:text-sm leading-relaxed text-[#212121]">
          {/* Mission & Vision */}
          <div className="p-4 sm:p-5 rounded-md bg-[#f5f8ff] border border-blue-200 space-y-2.5">
            <div className="flex items-center space-x-2 text-[#2874f0] font-bold text-sm sm:text-base">
              <Sparkles className="w-5 h-5" />
              <span>हमारा विज़न एवं उद्देश्य (Our Mission)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              <strong>EARNING SYSTEM PLATFORM (ESP)</strong> भारत का एक पारदर्शी, सुरक्षित और डिजिटल एम्पावरमेंट प्लेटफॉर्म है। हमारा उद्देश्य हर आम नागरिक, युवा और छात्र-छात्रा को मात्र <strong>₹10 के न्यूनतम बजट</strong> से अपने घर बैठे ऑनलाइन डिजिटल टूल्स, एफिलिएट कमीशन, यूटिलिटी सेवाओं और स्किल्स बेस्ड गेमिंग (ESP PLAY) के जरिए वास्तविक आमदनी प्राप्त करने का कानूनी व सुरक्षित अवसर प्रदान करना है।
            </p>
          </div>

          {/* Key Leadership & Team - Real Pictures & Details */}
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#212121] mb-3 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#2874f0]" />
              <span>मुख्य संस्थापक एवं नेतृत्व टीम (Leadership Team)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Founder */}
              <div className="p-4 rounded-md bg-[#fffdf5] border border-amber-200 flex items-start space-x-3.5 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Santosh Kumar"
                  className="w-14 h-14 rounded-md object-cover border-2 border-[#fb641b] shadow-2xs shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <h5 className="font-bold text-sm sm:text-base text-[#212121]">SANTOSH KUMAR</h5>
                    <ShieldCheck className="w-4 h-4 text-[#388e3c] shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-[#fb641b] block">
                    Chief Founder &amp; Managing Director
                  </span>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Sponsor ID: <code className="bg-amber-100 px-1.5 py-0.5 rounded-sm text-amber-900 font-semibold">EMO-MOM-MMO</code>. 8+ वर्षों का डिजिटल नेटवर्किंग, एफिलिएट एवं फिनटेक अनुभव।
                  </p>
                </div>
              </div>

              {/* Operations Head */}
              <div className="p-4 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-start space-x-3.5 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Vikas Kumar"
                  className="w-14 h-14 rounded-md object-cover border-2 border-[#2874f0] shadow-2xs shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <h5 className="font-bold text-sm sm:text-base text-[#212121]">VIKAS KUMAR</h5>
                    <Award className="w-4 h-4 text-[#2874f0] shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-[#2874f0] block">
                    Head of Operations &amp; Accounts Verification
                  </span>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Payee: <code className="bg-blue-100 px-1.5 py-0.5 rounded-sm text-[#2874f0] font-semibold">8877490845@SPICEPAY</code>. बैंक यूटीआर ऑडिट, 12-अंक वेरिफिकेशन व आईडी कार्ड स्वीकृति।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars of ESP Platform */}
          <div className="space-y-2">
            <h4 className="text-sm sm:text-base font-bold text-[#388e3c] flex items-center space-x-2">
              <HeartHandshake className="w-5 h-5" />
              <span>हमारा विश्वास और कार्य सिद्धांत (Our Core Pillars)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-md bg-[#f9fafb] border border-slate-200 flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#388e3c] mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700">
                  <strong>100% कानूनी एवं सुरक्षित:</strong> Consumer Protection Direct Selling Rules 2021 के पूर्ण अनुरूप।
                </span>
              </div>
              <div className="p-3 rounded-md bg-[#f9fafb] border border-slate-200 flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#388e3c] mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700">
                  <strong>तत्काल यूपीआई भुगतान:</strong> न्यूनतम निकासी मात्र ₹50, कोई फालतू होल्ड या छुपा शुल्क नहीं।
                </span>
              </div>
              <div className="p-3 rounded-md bg-[#f9fafb] border border-slate-200 flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#388e3c] mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700">
                  <strong>वेरिफाइड डिजिटल आईडी कार्ड:</strong> क्यूआर कोड व यूनिक रोल नंबर के साथ आधिकारिक मेंबरशिप प्रमाण।
                </span>
              </div>
              <div className="p-3 rounded-md bg-[#f9fafb] border border-slate-200 flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#388e3c] mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700">
                  <strong>रियल-टाइम कम्युनिटी व सपोर्ट:</strong> फाउंडर से सीधे संपर्क हेतु टेलीग्राम व व्हाट्सएप 24x7 एक्टिव।
                </span>
              </div>
            </div>
          </div>

          {/* Corporate Headquarters Address */}
          <div className="p-4 rounded-md bg-[#f1f3f6] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-md bg-white border border-blue-200 text-[#2874f0] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">मुख्य कॉर्पोरेट कार्यालय</span>
                <p className="text-xs font-semibold text-[#212121]">{settings.contactAddress}</p>
              </div>
            </div>

            <div className="shrink-0 text-xs text-[#388e3c] font-bold">
              📞 +91 {settings.whatsappNumber}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f9fafb] border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-sm font-bold text-xs bg-[#2874f0] hover:bg-[#1e60d5] text-white transition cursor-pointer"
          >
            समझ गया / Close
          </button>
        </div>
      </div>
    </div>
  );
};
