import React, { useState } from 'react';
import { X, Award, Sparkles, CreditCard } from 'lucide-react';
import type { UserProfile, PlatformSettings } from '../types/index.ts';
import { DigitalIdCard } from './DigitalIdCard.tsx';
import { MultiCardShowcase } from './MultiCardShowcase.tsx';

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  settings: PlatformSettings;
}

export const IdCardModal: React.FC<IdCardModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
}) => {
  const [modalMode, setModalMode] = useState<'primary' | 'showcase'>('primary');

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 max-w-2xl w-full shadow-xl relative space-y-3 max-h-[95vh] overflow-y-auto scrollbar-none text-[#212121]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-600 hover:text-[#212121] rounded-sm bg-[#f1f3f6] z-20 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-sm bg-blue-50 text-[#2874f0] text-xs font-bold border border-blue-200">
            <Award className="w-4 h-4 text-[#fb641b]" />
            <span>EARNING SYSTEM PLATFORM (ESP) • OFFICIAL ID</span>
          </div>
          <h2 className="text-xl font-bold text-[#212121]">ESP Verified Digital ID Card &amp; Passes</h2>
          <p className="text-xs text-slate-600">
            {user.fullName} • रोल नंबर: <span className="font-mono text-[#2874f0] font-bold">{user.userId}</span> • सर्विस: <span className="text-[#388e3c] font-bold">{user.chosenServiceName || user.chosenServiceCode}</span>
          </p>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="flex items-center justify-center space-x-2 pt-1">
          <button
            onClick={() => setModalMode('primary')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              modalMode === 'primary'
                ? 'bg-[#2874f0] text-white shadow-2xs'
                : 'bg-[#f1f3f6] text-[#212121] hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>वेरिफाइड डिजिटल ID (Primary Card)</span>
          </button>
          <button
            onClick={() => setModalMode('showcase')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              modalMode === 'showcase'
                ? 'bg-[#2874f0] text-white shadow-2xs'
                : 'bg-[#f1f3f6] text-[#212121] hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>6-इन-1 शोकेस पास (Passes)</span>
          </button>
        </div>

        <div className="py-2 flex justify-center w-full">
          {modalMode === 'primary' ? (
            <DigitalIdCard user={user} settings={settings} />
          ) : (
            <MultiCardShowcase user={user} settings={settings} />
          )}
        </div>
      </div>
    </div>
  );
};
