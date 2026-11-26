import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertCircle,
  X,
  Smartphone,
  Laptop,
  Eye,
  EyeOff,
  KeyRound,
  Search,
  CheckCircle2,
  ArrowLeft,
  Gamepad2,
  Briefcase,
  ShieldCheck,
  Monitor,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import type { UserProfile, UserSession } from '../types/index.ts';
import { api } from '../services/api.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, destination: 'platform' | 'gaming-room') => void;
  onSwitchToRegister: (mode: 'business' | 'gamer') => void;
  initialDestination?: 'platform' | 'gaming-room';
}

type ModalMode = 'login' | 'forget-id' | 'forget-password';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  initialDestination = 'platform',
}) => {
  const [mode, setMode] = useState<ModalMode>('login');
  const [selectedDestination, setSelectedDestination] = useState<'platform' | 'gaming-room'>(initialDestination);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [lookupInput, setLookupInput] = useState('');
  const [foundAccount, setFoundAccount] = useState<{
    userId: string;
    gamingId: string;
    fullName: string;
    accountType: string;
    chosenServiceCode: string;
    accounts?: Array<{
      userId: string;
      gamingId: string;
      fullName: string;
      accountType: string;
      chosenServiceCode: string;
    }>;
  } | null>(null);

  const [resetIdentifier, setResetIdentifier] = useState('');
  const [verifyPhone, setVerifyPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deviceConflictSessions, setDeviceConflictSessions] = useState<UserSession[] | null>(null);
  const [deviceConflictMax, setDeviceConflictMax] = useState<number>(4);

  useEffect(() => {
    if (isOpen) {
      setSelectedDestination(initialDestination);
      setErrorMsg(null);
      setDeviceConflictSessions(null);
    }
  }, [isOpen, initialDestination]);

  if (!isOpen) return null;

  const switchMode = (nextMode: ModalMode) => {
    setMode(nextMode);
    setErrorMsg(null);
    setDeviceConflictSessions(null);
    setFoundAccount(null);
    setResetSuccessMsg(null);
    if (nextMode === 'forget-password' && identifier && !resetIdentifier) {
      setResetIdentifier(identifier);
    }
  };

  const attemptLogin = async (opts?: { replaceSessionId?: string; replaceOldestDevice?: boolean }) => {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();
    if (!cleanId || !cleanPass) {
      setErrorMsg('कृपया अपनी ESP ID / मोबाइल / ईमेल और पासवर्ड दर्ज करें।');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await api.login(cleanId, cleanPass, opts);
      setDeviceConflictSessions(null);
      onLoginSuccess(user, selectedDestination);
      onClose();
    } catch (err: any) {
      if (err?.code === 'DEVICE_LIMIT_REACHED' && Array.isArray(err.activeSessions)) {
        setDeviceConflictSessions(err.activeSessions);
        setDeviceConflictMax(err.maxDevices || 4);
        setErrorMsg(err.message || 'अधिकतम 4 डिवाइस लॉगिन सीमा पूरी हो चुकी है।');
      } else {
        setDeviceConflictSessions(null);
        setErrorMsg(err.message || 'लॉगिन असफल रहा। कृपया अपना आईडी/मोबाइल व पासवर्ड जांचें।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptLogin();
  };

  const handleForgetIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) {
      setErrorMsg('कृपया अपना रजिस्टर्ड मोबाइल नंबर या ईमेल दर्ज करें');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setFoundAccount(null);
    try {
      const data = await api.forgetId(lookupInput.trim());
      setFoundAccount(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'इस विवरण से कोई खाता नहीं मिला।');
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim() || !verifyPhone.trim() || !newPassword.trim()) {
      setErrorMsg('कृपया सभी आवश्यक जानकारी भरें');
      return;
    }
    if (newPassword.trim().length < 4) {
      setErrorMsg('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setResetSuccessMsg(null);
    try {
      const data = await api.forgetPassword(resetIdentifier.trim(), verifyPhone.trim(), newPassword.trim());
      setResetSuccessMsg(data.message || 'पासवर्ड सफलतापूर्वक बदल दिया गया है!');
      setIdentifier(data.userId);
      setPassword(newPassword.trim());
    } catch (err: any) {
      setErrorMsg(err.message || 'पासवर्ड रीसेट असफल रहा। विवरण जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const applyRecoveredIdAndLogin = (idToUse: string) => {
    setIdentifier(idToUse);
    setMode('login');
    setErrorMsg(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="ESP Member Login"
    >
      <div className="bg-white rounded-sm max-w-3xl w-full shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto border border-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login popup"
          className="absolute right-2.5 top-2.5 z-20 w-10 h-10 rounded-full flex items-center justify-center text-[#878787] hover:text-[#212121] hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Flipkart Blue Brand Panel */}
        <div className="md:col-span-5 bg-[#2874f0] text-white p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold">
              {mode === 'login' ? (
                <Lock className="w-4 h-4 text-[#ffe500]" />
              ) : mode === 'forget-id' ? (
                <Search className="w-4 h-4 text-[#ffe500]" />
              ) : (
                <KeyRound className="w-4 h-4 text-[#ffe500]" />
              )}
              <span>ESP Official Access</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug">
              {mode === 'login' && 'Login to ESP'}
              {mode === 'forget-id' && 'Find Your ESP ID'}
              {mode === 'forget-password' && 'Reset Password'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {mode === 'login' && '10 अर्निंग सेवाएं, NWI पैसिव इनकम, SWI 3.3% ऐप और ESP Gaming Time एक ही जगह।'}
              {mode === 'forget-id' && 'अपने रजिस्टर्ड मोबाइल नंबर या ईमेल से अपना ESP ID व Gaming ID तुरंत खोजें।'}
              {mode === 'forget-password' && 'मोबाइल या ईमेल सत्यापित करके अपना नया पासवर्ड तुरंत सेट करें।'}
            </p>
          </div>

          <div className="hidden md:block space-y-2.5 pt-4 border-t border-white/20 text-xs text-blue-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#ffe500] shrink-0" />
              <span>लॉगिन के बाद चुना गया पेज सीधे खुलेगा</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#ffe500] shrink-0" />
              <span>मोबाइल व लैपटॉप मल्टी-डिवाइस सपोर्ट</span>
            </div>
          </div>
        </div>

        {/* Right Clean White Form Panel */}
        <div className="md:col-span-7 p-5 sm:p-7 space-y-4 text-[#212121]">
          {errorMsg && (
            <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug font-medium">{errorMsg}</span>
              </div>
              {mode === 'login' && !deviceConflictSessions && (
                <div className="flex flex-wrap items-center gap-3 pl-6 pt-0.5">
                  <button
                    type="button"
                    onClick={() => switchMode('forget-id')}
                    className="text-[11px] font-bold text-[#2874f0] underline cursor-pointer"
                  >
                    ESP ID खोजें (Forget ID?)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('forget-password')}
                    className="text-[11px] font-bold text-[#fb641b] underline cursor-pointer"
                  >
                    नया पासवर्ड बनाएं (Forget Password?)
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'login' && deviceConflictSessions && (
            <div className="p-3.5 rounded-sm bg-amber-50 border border-amber-300 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-[#fb641b]" />
                  <span>Active Devices ({deviceConflictSessions.length}/{deviceConflictMax} Max Slots)</span>
                </span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => attemptLogin({ replaceOldestDevice: true })}
                  className="px-2.5 py-1 rounded-xs text-[11px] font-bold bg-[#fb641b] text-white hover:bg-[#e8550f] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace Oldest</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-900 leading-snug">
                नीचे किसी 1 पुराने डिवाइस को लॉगआउट करें — आपका सारा डेटा (Coins, Balance, Level, Room) जैसा था वैसा ही खुलेगा:
              </p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                {deviceConflictSessions.map((s, idx) => (
                  <div
                    key={s.sessionId}
                    className="bg-white border border-amber-200 rounded-xs px-2.5 py-2 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#212121] truncate">
                        #{idx + 1} · {s.deviceName}
                      </p>
                      <p className="text-[10px] text-[#666666]">
                        Last active: {new Date(s.lastActive || s.loginTime).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => attemptLogin({ replaceSessionId: s.sessionId })}
                      className="shrink-0 px-2.5 py-1 rounded-xs bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Logout & Login</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <>
              {/* Clear Destination Selector: ESP PLATFORM vs ESP GAMING TIME */}
              <div className="space-y-1.5 pr-6">
                <span className="text-[11px] font-semibold text-[#878787] block">
                  लॉगिन के बाद कौन सा पेज खोलें?
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDestination('platform')}
                    className={`min-h-[46px] px-3 py-2 rounded-sm border text-left transition cursor-pointer flex items-center gap-2 ${
                      selectedDestination === 'platform'
                        ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0] ring-1 ring-[#2874f0]'
                        : 'bg-white text-[#555555] border-slate-300 hover:border-[#2874f0]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold whitespace-nowrap">ESP PLATFORM</span>
                      <span className="block text-[10px] text-[#878787] truncate">इनकम व डैशबोर्ड</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDestination('gaming-room')}
                    className={`min-h-[46px] px-3 py-2 rounded-sm border text-left transition cursor-pointer flex items-center gap-2 ${
                      selectedDestination === 'gaming-room'
                        ? 'bg-orange-50 border-[#fb641b] text-[#fb641b] ring-1 ring-[#fb641b]'
                        : 'bg-white text-[#555555] border-slate-300 hover:border-[#fb641b]'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold whitespace-nowrap">ESP GAMING TIME</span>
                      <span className="block text-[10px] text-[#878787] truncate">गेम्स व वॉइस क्लब</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    ESP ID / Gaming ID / Mobile / Email
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. ESP10..., GAME-..., या 10 अंकों का मोबाइल"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full min-h-[42px] bg-white border border-slate-300 focus:border-[#2874f0] rounded-xs px-3.5 py-2 text-sm text-[#212121] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    Password (पासवर्ड)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="अपना पासवर्ड दर्ज करें"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full min-h-[42px] bg-white border border-slate-300 focus:border-[#2874f0] rounded-xs pl-3.5 pr-11 py-2 text-sm text-[#212121] outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#878787] hover:text-[#212121] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forget ID & Forget Password */}
                <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => switchMode('forget-id')}
                    className="text-[#2874f0] hover:underline font-semibold flex items-center gap-1 cursor-pointer py-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Forget ID?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('forget-password')}
                    className="text-[#2874f0] hover:underline font-semibold flex items-center gap-1 cursor-pointer py-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Forget Password?</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xs text-sm font-bold text-white bg-[#fb641b] hover:bg-[#e8550f] transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading
                    ? 'लॉगिन हो रहा है...'
                    : selectedDestination === 'gaming-room'
                    ? 'Login & Open ESP Gaming Time'
                    : 'Login & Open ESP Platform'}
                </button>
              </form>

              <div className="md:hidden bg-[#f5f7fa] border border-slate-200 rounded-xs px-3 py-2 flex items-center gap-2 text-[11px] text-[#555555]">
                <Laptop className="w-3.5 h-3.5 text-[#2874f0] shrink-0" />
                <span>मोबाइल और लैपटॉप दोनों पर सुरक्षित लॉगिन उपलब्ध।</span>
              </div>

              {/* New Visitor Register Buttons */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-[#555555] text-center">
                  नए विजिटर हैं? तुरंत नया खाता बनाएं:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToRegister('business');
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <div className="text-left leading-tight">
                      <span className="block whitespace-nowrap">ESP PLATFORM</span>
                      <span className="block text-[10px] text-blue-100">रजिस्टर (₹10+ इनकम)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToRegister('gamer');
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xs bg-white hover:bg-[#f5f8ff] text-[#2874f0] border border-[#2874f0] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4 shrink-0" />
                    <div className="text-left leading-tight">
                      <span className="block whitespace-nowrap">ESP GAMING TIME</span>
                      <span className="block text-[10px] text-[#388e3c]">रजिस्टर (100% FREE)</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* MODE 2: FORGET ID */}
          {mode === 'forget-id' && (
            <div className="space-y-4 pt-2">
              <form onSubmit={handleForgetIdSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    Registered Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    placeholder="10 अंकों का मोबाइल नंबर या ईमेल दर्ज करें"
                    value={lookupInput}
                    onChange={e => setLookupInput(e.target.value)}
                    className="w-full min-h-[42px] bg-white border border-slate-300 focus:border-[#2874f0] rounded-xs px-3.5 py-2 text-sm text-[#212121] outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 rounded-xs text-sm font-bold text-white bg-[#2874f0] hover:bg-[#1c62d6] transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'खोजा जा रहा है...' : 'मेरी ESP ID खोजें'}
                </button>
              </form>

              {foundAccount && (
                <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-[#388e3c] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {(foundAccount.accounts && foundAccount.accounts.length > 1)
                        ? `इस नंबर/ईमेल से ${foundAccount.accounts.length} खाते मिले:`
                        : `खाता मिल गया: ${foundAccount.fullName}`}
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-0.5">
                    {(foundAccount.accounts && foundAccount.accounts.length > 0
                      ? foundAccount.accounts
                      : [foundAccount]
                    ).map(acc => (
                      <div key={acc.userId} className="bg-white p-2.5 rounded-xs border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#212121]">{acc.fullName}</span>
                          <span className="text-[10px] font-semibold text-[#2874f0]">
                            {acc.accountType === 'gamer' ? 'Gaming Profile' : `Business (${acc.chosenServiceCode})`}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          <div className="bg-slate-50 px-2 py-1.5 rounded-xs border border-slate-200">
                            <span className="text-[10px] text-[#878787] block">ESP ID</span>
                            <span className="font-mono font-bold text-[#212121]">{acc.userId}</span>
                          </div>
                          <div className="bg-slate-50 px-2 py-1.5 rounded-xs border border-slate-200">
                            <span className="text-[10px] text-[#878787] block">Gaming ID</span>
                            <span className="font-mono font-bold text-[#2874f0]">{acc.gamingId}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => applyRecoveredIdAndLogin(acc.userId)}
                            className="flex-1 min-h-[38px] py-1.5 px-2 rounded-xs bg-[#fb641b] hover:bg-[#e8550f] text-white text-xs font-bold cursor-pointer transition"
                          >
                            लॉगिन करें ({acc.userId})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetIdentifier(acc.userId);
                              switchMode('forget-password');
                            }}
                            className="px-2.5 py-1.5 rounded-xs border border-[#2874f0] text-[#2874f0] hover:bg-blue-50 text-[11px] font-semibold cursor-pointer"
                          >
                            Reset Pass
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full min-h-[42px] py-2 rounded-xs border border-slate-300 text-[#212121] hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>वापस लॉगिन पर जाएं</span>
              </button>
            </div>
          )}

          {/* MODE 3: FORGET PASSWORD */}
          {mode === 'forget-password' && (
            <div className="space-y-4 pt-2">
              <form onSubmit={handleForgetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    ESP ID / Gaming ID / Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="अपना ID या मोबाइल नंबर दर्ज करें"
                    value={resetIdentifier}
                    onChange={e => setResetIdentifier(e.target.value)}
                    className="w-full min-h-[42px] bg-white border border-slate-300 focus:border-[#2874f0] rounded-xs px-3.5 py-2 text-sm text-[#212121] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    रजिस्टर्ड मोबाइल नंबर या ईमेल (Verify)
                  </label>
                  <input
                    type="text"
                    placeholder="खाते से जुड़ा मोबाइल नंबर या ईमेल दर्ज करें"
                    value={verifyPhone}
                    onChange={e => setVerifyPhone(e.target.value)}
                    className="w-full min-h-[42px] bg-white border border-slate-300 focus:border-[#2874f0] rounded-xs px-3.5 py-2 text-sm text-[#212121] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    नया पासवर्ड (New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="नया पासवर्ड (कम से कम 4 अक्षर)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full min-h-[42px] bg-white border border-slate-300 focus:border-[#2874f0] rounded-xs pl-3.5 pr-11 py-2 text-sm text-[#212121] outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(prev => !prev)}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#878787] hover:text-[#212121] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 rounded-xs text-sm font-bold text-white bg-[#fb641b] hover:bg-[#e8550f] transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'पासवर्ड अपडेट हो रहा है...' : 'पासवर्ड रीसेट करें'}
                </button>
              </form>

              {resetSuccessMsg && (
                <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-[#388e3c] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{resetSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full min-h-[42px] py-2 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white text-xs font-bold cursor-pointer transition"
                  >
                    नए पासवर्ड से लॉगिन करें
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full min-h-[42px] py-2 rounded-xs border border-slate-300 text-[#212121] hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>वापस लॉगिन पर जाएं</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
