import React, { useState, useEffect } from 'react';
import { Briefcase, Gamepad2, CheckCircle2, X, UserCheck, Sparkles } from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';

interface PostLoginProfileModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onUpdated: (updatedUser: UserProfile, goToTab?: 'dashboard' | 'gaming-room') => void;
}

export const PostLoginProfileModal: React.FC<PostLoginProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdated,
}) => {
  const [selectedType, setSelectedType] = useState<'business' | 'gamer'>(
    user?.accountType === 'gamer' ? 'gamer' : 'business'
  );
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [payoutUpiId, setPayoutUpiId] = useState(user?.payoutUpiId || user?.paymentAddress || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setSelectedType(user.accountType === 'gamer' ? 'gamer' : 'business');
      setFullName(user.fullName || '');
      setPayoutUpiId(user.payoutUpiId || user.paymentAddress || '');
      setBio(user.bio || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('कृपया अपना नाम दर्ज करें।', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateUserProfile(user.userId, {
        fullName: fullName.trim(),
        payoutUpiId: payoutUpiId.trim(),
        paymentAddress: payoutUpiId.trim() || user.paymentAddress,
        bio: bio.trim(),
        accountType: selectedType,
      });
      showToast(
        `✅ प्रोफाइल अपडेट हो गई! सक्रिय मोड: ${
          selectedType === 'gamer' ? 'Gaming & Voice Club Profile' : 'Business & Earning Profile'
        }`,
        'success'
      );
      onUpdated(updated, selectedType === 'gamer' ? 'gaming-room' : 'dashboard');
    } catch (err: any) {
      showToast(err?.message || 'प्रोफाइल अपडेट करने में समस्या आई', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-lg shadow-2xl overflow-hidden text-[#212121] animate-fadeIn max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#2874f0] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-sm bg-white/15 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-[#ffe500]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                आप किस प्रकार की प्रोफाइल रखना चाहते हैं?
              </h3>
              <p className="text-[11px] text-blue-100">
                Choose &amp; Update Your Active Profile Mode ({user.userId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white cursor-pointer"
            title="Skip for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Profile Type Cards */}
          <div>
            <label className="text-xs font-bold text-[#212121] block mb-2">
              1. प्रोफाइल प्रकार चुनें (Select Profile Type):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('business')}
                className={`p-3.5 rounded-md border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedType === 'business'
                    ? 'border-[#2874f0] bg-[#f5f8ff] shadow-xs'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-sm bg-[#2874f0]/10 text-[#2874f0] flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  {selectedType === 'business' && (
                    <CheckCircle2 className="w-4 h-4 text-[#2874f0]" />
                  )}
                </div>
                <div className="text-xs font-extrabold text-[#212121]">
                  💼 Business &amp; Earning Profile
                </div>
                <p className="text-[11px] text-[#666666] mt-1 leading-snug">
                  10 अर्निंग प्लान, स्पॉन्सर नेटवर्क, NWI टीम, SWI ऐप लिंक व UPI विथड्रॉल डैशबोर्ड।
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('gamer')}
                className={`p-3.5 rounded-md border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedType === 'gamer'
                    ? 'border-[#fb641b] bg-orange-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-sm bg-[#fb641b]/15 text-[#fb641b] flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  {selectedType === 'gamer' && (
                    <CheckCircle2 className="w-4 h-4 text-[#fb641b]" />
                  )}
                </div>
                <div className="text-xs font-extrabold text-[#212121]">
                  🎮 Gaming &amp; Voice Club Profile
                </div>
                <p className="text-[11px] text-[#666666] mt-1 leading-snug">
                  रियल वॉइस स्टेज, मल्टीप्लेयर गेम्स, VIP व फ्रेम्स, रियल टास्क (+5 कॉइन्स व EXP)।
                </p>
              </button>
            </div>
          </div>

          {/* Quick Editable Profile Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                प्रोफाइल नाम (Display Name) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                UPI ID (Payouts / Wallet)
              </label>
              <input
                type="text"
                value={payoutUpiId}
                onChange={(e) => setPayoutUpiId(e.target.value)}
                placeholder="example@upi"
                className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              प्रोफाइल बायो / परिचय (Bio - Optional)
            </label>
            <input
              type="text"
              maxLength={140}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="जैसे: ESP Digital Partner & Real Player"
              className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] outline-none"
            />
          </div>

          <div className="text-[11px] text-[#666666] bg-[#f5f8ff] border border-blue-100 rounded p-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2874f0] shrink-0" />
            <span>
              आप बाद में भी कभी भी <strong>Dashboard &gt; My Profile</strong> से अपना प्रोफाइल प्रकार और विवरण बदल सकते हैं।
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#fb641b] hover:bg-[#e8550f] text-white py-2.5 rounded-sm font-bold text-xs sm:text-sm cursor-pointer transition shadow-sm disabled:opacity-60"
            >
              {saving ? 'प्रोफाइल सेव हो रही है...' : '✅ प्रोफाइल अपडेट करें और आगे बढ़ें'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-[#212121] font-semibold text-xs cursor-pointer"
            >
              अभी यही रहने दें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
