import React, { useState } from 'react';
import { Lock, ShieldAlert, X } from 'lucide-react';
import { api } from '../services/api.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (password: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('कृपया एडमिन मास्टर पासवर्ड दर्ज करें');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getAdminOverview(password);
      if (res.success) {
        onAdminLoginSuccess(password);
        onClose();
      } else {
        setErrorMsg('अमान्य एडमिन सुरक्षा कुंजी (Invalid Master Key)');
      }
    } catch {
      setErrorMsg('अमान्य एडमिन सुरक्षा कुंजी (Invalid Master Key)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 max-w-sm w-full shadow-xl relative space-y-5 text-[#212121]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-md bg-blue-50 text-[#2874f0] flex items-center justify-center mx-auto border border-blue-200">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#212121]">ESP Master Admin Access</h2>
          <p className="text-xs text-slate-500">
            Restricted security area for system administrators
          </p>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#212121] block mb-1">
              Admin Master Password
            </label>
            <input
              type="password"
              placeholder="Enter secure master key"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2.5 text-xs text-[#212121] outline-none"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-2.5 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-[#1e60d5] transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying Key...' : 'Unlock Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
