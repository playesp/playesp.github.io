import React, { useState, useEffect } from 'react';
import { Lock, X, Monitor, LogOut, RefreshCw, Globe, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.ts';
import { auth, ADMIN_GOOGLE_EMAIL, signInWithGoogle, onFirebaseAuthChange } from '../services/firebase.ts';
import type { AdminSession } from '../types/index.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (password: string, adminToken?: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cloudConnecting, setCloudConnecting] = useState(false);
  const [cloudEmail, setCloudEmail] = useState<string | null>(() => auth.currentUser?.email || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictSessions, setConflictSessions] = useState<AdminSession[] | null>(null);
  const [maxDevices, setMaxDevices] = useState(4);

  useEffect(() => {
    const unsub = onFirebaseAuthChange(fbUser => {
      setCloudEmail(fbUser?.email || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setConflictSessions(null);
      setCloudEmail(auth.currentUser?.email || null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCloudVerified = Boolean(cloudEmail && cloudEmail.toLowerCase() === ADMIN_GOOGLE_EMAIL);

  const handleConnectGoogleCloud = async () => {
    if (cloudConnecting) return;
    setCloudConnecting(true);
    setErrorMsg(null);
    try {
      const fbUser = await signInWithGoogle();
      setCloudEmail(fbUser.email || null);
      if (fbUser.email?.toLowerCase() !== ADMIN_GOOGLE_EMAIL) {
        setErrorMsg(`कृपया केवल अधिकृत एडमिन Google खाता (${ADMIN_GOOGLE_EMAIL}) चुनें।`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google Cloud Sync कनेक्ट करने में त्रुटि आई');
    } finally {
      setCloudConnecting(false);
    }
  };

  const attemptAdminLogin = async (opts?: { replaceSessionId?: string; replaceOldestDevice?: boolean }) => {
    if (!password.trim()) {
      setErrorMsg('कृपया एडमिन मास्टर पासवर्ड दर्ज करें');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.adminLogin(password.trim(), opts);
      if (res.success) {
        setConflictSessions(null);
        onAdminLoginSuccess(password.trim(), res.adminToken);
        onClose();
      } else {
        setErrorMsg('अमान्य एडमिन सुरक्षा कुंजी (Invalid Master Key)');
      }
    } catch (err: any) {
      if (err?.code === 'DEVICE_LIMIT_REACHED' && Array.isArray(err.activeSessions)) {
        setConflictSessions(err.activeSessions);
        setMaxDevices(err.maxDevices || 4);
        setErrorMsg(err.message || 'Admin Panel पहले से 4 डिवाइसेस में लॉगिन है।');
      } else {
        setConflictSessions(null);
        setErrorMsg(err?.message || 'अमान्य एडमिन सुरक्षा कुंजी (Invalid Master Key)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptAdminLogin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-7 max-w-md w-full shadow-xl relative space-y-4 text-[#212121]">
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
          <h2 className="text-lg font-bold text-[#212121]">ESP Multi-Device Admin Access</h2>
          <p className="text-xs text-slate-500">
            Up to 4 Admin devices supported simultaneously with live Cross-Origin Cloud Sync
          </p>
        </div>

        {/* 1-Click Google Cloud Bridge Connection for Firestore Full User Data Sync */}
        <div
          className={`p-3 rounded-sm border text-xs flex items-center justify-between gap-2 ${
            isCloudVerified
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="min-w-0">
            <div className="font-bold flex items-center gap-1.5">
              {isCloudVerified ? (
                <CheckCircle2 className="w-4 h-4 text-[#388e3c] shrink-0" />
              ) : (
                <Globe className="w-4 h-4 text-[#2874f0] shrink-0" />
              )}
              <span className="truncate">
                {isCloudVerified ? 'Cloud Database Connected' : 'Live Cloud Database Sync'}
              </span>
            </div>
            <p className="text-[10.5px] opacity-80 truncate mt-0.5">
              {isCloudVerified
                ? `${cloudEmail} (सभी रजिस्टर्ड यूज़र स्वतः दिखेंगे)`
                : 'दूसरे डिवाइस/URL से सभी रजिस्ट्रेशन डेटा खींचने के लिए कनेक्ट करें'}
            </p>
          </div>
          {!isCloudVerified && (
            <button
              type="button"
              onClick={handleConnectGoogleCloud}
              disabled={cloudConnecting}
              className="px-2.5 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white text-[11px] font-bold shrink-0 cursor-pointer disabled:opacity-60"
            >
              {cloudConnecting ? 'Connecting...' : 'Connect Google'}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {conflictSessions && (
          <div className="p-3 rounded-sm bg-amber-50 border border-amber-300 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-[#fb641b]" />
                <span>Admin Slots Full ({conflictSessions.length}/{maxDevices})</span>
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => attemptAdminLogin({ replaceOldestDevice: true })}
                className="px-2.5 py-1 rounded-xs bg-[#fb641b] text-white text-[11px] font-bold hover:bg-[#e8550f] flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace Oldest</span>
              </button>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {conflictSessions.map((s, idx) => (
                <div key={s.sessionId} className="bg-white border border-amber-200 rounded-xs px-2.5 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#212121] truncate">#{idx + 1} · {s.deviceName}</p>
                    <p className="text-[10px] text-[#666666]">{new Date(s.lastActive || s.loginTime).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => attemptAdminLogin({ replaceSessionId: s.sessionId })}
                    className="shrink-0 px-2.5 py-1 rounded-xs bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout &amp; Enter</span>
                  </button>
                </div>
              ))}
            </div>
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

