import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  Smartphone,
  CreditCard,
  UserCheck,
  FileText,
  Lock,
  Award,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import type { PlatformSettings, ServiceItem, UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';

interface RegisterViewProps {
  settings: PlatformSettings;
  services: ServiceItem[];
  initialServiceCode?: string;
  initialFee?: number;
  initialSponsorId?: string;
  initialRegistrationType?: 'business' | 'gamer';
  onSuccessRegistration: (user: UserProfile, accountType?: 'business' | 'gamer') => void;
  onSelectTab: (tab: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  settings,
  services,
  initialServiceCode,
  initialFee,
  initialSponsorId,
  initialRegistrationType = 'business',
  onSuccessRegistration,
  onSelectTab,
}) => {
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    fullAddress: '',
    paymentAddress: '',
    password: '',
    confirmPassword: '',

    joiningDate: new Date().toISOString().split('T')[0],
    sponsorId: initialSponsorId || settings.ownerSponsorId || 'EMO-MOM-MMO',
    sponsorName: settings.ownerName || 'SANTOSH KUMAR',
    chosenServiceCode: initialServiceCode || 'EMO',
    joiningFee: initialFee || 10,

    paymentUtr: '',
    paymentScreenshot: '',
  });

  const [sponsorDetails, setSponsorDetails] = useState<{
    valid: boolean;
    sponsorId: string;
    sponsorName: string;
    isOwner: boolean;
    maskedPhone?: string;
    maskedEmail?: string;
    planName?: string;
    joiningDate?: string;
  }>({
    valid: true,
    sponsorId: initialSponsorId || settings.ownerSponsorId || 'EMO-MOM-MMO',
    sponsorName: settings.ownerName || 'SANTOSH KUMAR',
    isOwner: true,
  });

  const [showSponsorCard, setShowSponsorCard] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentQrUrl, setPaymentQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null);

  // Dual Registration Architecture: Purpose-First (Free Gaming vs Business Income Plan)
  const [registrationType, setRegistrationType] = useState<'business' | 'gamer'>(initialRegistrationType);
  const [gamerName, setGamerName] = useState('');
  const [gamerUsername, setGamerUsername] = useState('');
  const [gamerSponsorId, setGamerSponsorId] = useState(initialSponsorId || settings.ownerSponsorId || 'EMO-MOM-MMO');
  const [gamerPhone, setGamerPhone] = useState('');
  const [gamerEmail, setGamerEmail] = useState('');
  const [gamerPassword, setGamerPassword] = useState('');
  const [gamerLoading, setGamerLoading] = useState(false);
  const [step1Checking, setStep1Checking] = useState(false);
  const [regUsernameCheck, setRegUsernameCheck] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
    message: string;
  }>({ status: 'idle', message: '' });

  const activeRegUsername =
    registrationType === 'gamer' ? gamerUsername : formData.username;

  useEffect(() => {
    const cleaned = activeRegUsername.trim().replace(/^@+/, '').toLowerCase();
    if (!cleaned) {
      setRegUsernameCheck({ status: 'idle', message: '' });
      return;
    }
    if (!/^[a-z0-9]{3,24}$/.test(cleaned)) {
      setRegUsernameCheck({
        status: 'invalid',
        message: 'कोई Symbol (_ - . @) उपयोग न करें — केवल 3-24 अक्षर (a-z और 0-9) लिखें',
      });
      return;
    }
    let cancelled = false;
    setRegUsernameCheck({ status: 'checking', message: 'यूनिक @username जांचा जा रहा है...' });
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsernameAvailability(cleaned);
        if (cancelled) return;
        if (res.available) {
          setRegUsernameCheck({
            status: 'available',
            message: `✓ @${res.normalized || cleaned} उपलब्ध है!`,
          });
        } else {
          setRegUsernameCheck({
            status: 'taken',
            message: res.message || `@${cleaned} पहले से लिया जा चुका है!`,
          });
        }
      } catch {
        if (!cancelled) setRegUsernameCheck({ status: 'idle', message: '' });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeRegUsername]);

  useEffect(() => {
    setRegistrationType(initialRegistrationType);
    setErrorMsg(null);
    setStep(1);
  }, [initialRegistrationType]);

  useEffect(() => {
    if (initialSponsorId) {
      setFormData(prev => ({ ...prev, sponsorId: initialSponsorId }));
      setGamerSponsorId(initialSponsorId);
    }
  }, [initialSponsorId]);

  const [securityCode, setSecurityCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [inputSecurityCode, setInputSecurityCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGamerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!gamerName.trim()) {
      setErrorMsg('कृपया अपना पूरा नाम (Full Name / Nickname) दर्ज करें');
      return;
    }
    const cleanPhone = gamerPhone.trim();
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg('कृपया एक मान्य 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)');
      return;
    }
    const cleanEmail = gamerEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('कृपया एक वैध ईमेल पता (Email Address) दर्ज करें (उदा. rahul@gmail.com)');
      return;
    }
    if (!gamerPassword || gamerPassword.length < 6) {
      setErrorMsg('सुरक्षा के लिए पासवर्ड कम से कम 6 अक्षरों का होना चाहिए');
      return;
    }
    if (gamerUsername.trim() && (regUsernameCheck.status === 'taken' || regUsernameCheck.status === 'invalid')) {
      setErrorMsg(regUsernameCheck.message || 'कृपया एक मान्य और उपलब्ध @username चुनें');
      return;
    }
    if (inputSecurityCode.trim() !== securityCode) {
      setErrorMsg('अमान्य सुरक्षा कोड (Security Code Mismatch)');
      return;
    }

    setGamerLoading(true);
    try {
      const cleanUname = gamerUsername.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || undefined;
      const dupCheck = await api.checkIdentityAvailability({
        phone: cleanPhone,
        email: cleanEmail,
        username: cleanUname,
      });
      if (!dupCheck.available) {
        setErrorMsg(dupCheck.message || 'यह मोबाइल नंबर या ईमेल पहले से पंजीकृत है।');
        setGamerLoading(false);
        return;
      }

      const res = await api.register({
        fullName: gamerName.trim(),
        username: cleanUname,
        sponsorId: gamerSponsorId.trim() || formData.sponsorId || settings.ownerSponsorId,
        phone: cleanPhone,
        email: cleanEmail,
        password: gamerPassword,
        accountType: 'gamer',
        chosenServiceCode: 'GAME',
        joiningFee: 0,
        paymentUtr: 'FREE_GAMING_USER',
      });
      if (res.success && res.user) {
        setRegisteredUser(res.user);
        onSuccessRegistration(res.user, 'gamer');
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch {}
      } else {
        setErrorMsg(res.message || 'पंजीकरण विफल रहा');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'सर्वर से कनेक्ट नहीं हो सका');
    } finally {
      setGamerLoading(false);
    }
  };

  const refreshSecurityCode = () => {
    setSecurityCode(Math.floor(100000 + Math.random() * 900000).toString());
    setInputSecurityCode('');
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'पासवर्ड दर्ज करें', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'कमज़ोर (Weak)', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { score: 2, label: 'मध्यम (Moderate)', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 3) return { score: 3, label: 'अच्छा (Good)', color: 'bg-blue-500', text: 'text-blue-600' };
    return { score: 4, label: 'अति सुरक्षित (Strong 🔒)', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const currentService = services.find(s => s.code === formData.chosenServiceCode) || services[0];

  useEffect(() => {
    const timer = setTimeout(async () => {
      const code = formData.sponsorId.trim();
      if (!code || code === settings.ownerSponsorId) {
        setSponsorDetails({
          valid: true,
          sponsorId: settings.ownerSponsorId,
          sponsorName: settings.ownerName,
          isOwner: true,
        });
        setFormData(prev => ({ ...prev, sponsorName: settings.ownerName }));
        return;
      }

      try {
        const res = await api.checkSponsor(code);
        if (res.valid) {
          setSponsorDetails({
            valid: true,
            sponsorId: res.sponsorId,
            sponsorName: res.sponsorName,
            isOwner: res.isOwner,
            maskedPhone: res.maskedPhone,
            maskedEmail: res.maskedEmail,
            planName: res.planName,
            joiningDate: res.joiningDate,
          });
          setFormData(prev => ({ ...prev, sponsorName: res.sponsorName }));
        } else {
          setSponsorDetails({
            valid: true,
            sponsorId: res.fallbackSponsorId || settings.ownerSponsorId,
            sponsorName: res.fallbackSponsorName || settings.ownerName,
            isOwner: true,
          });
          setFormData(prev => ({ ...prev, sponsorName: res.fallbackSponsorName || settings.ownerName }));
        }
      } catch {
        setSponsorDetails({
          valid: true,
          sponsorId: settings.ownerSponsorId,
          sponsorName: settings.ownerName,
          isOwner: true,
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.sponsorId, settings.ownerSponsorId, settings.ownerName]);

  // Payment QR
  useEffect(() => {
    const upiUri = `upi://pay?pa=${settings.adminUpiId}&pn=${encodeURIComponent(
      settings.adminPayeeName
    )}&am=${formData.joiningFee}&cu=INR&tn=${encodeURIComponent(
      `ESP Joining ${formData.chosenServiceCode} by ${formData.fullName || 'Member'}`
    )}`;

    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(url => setPaymentQrUrl(url))
      .catch(err => console.error(err));
  }, [settings.adminUpiId, settings.adminPayeeName, formData.joiningFee, formData.chosenServiceCode, formData.fullName]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('File size must be less than 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, paymentScreenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    setErrorMsg(null);
    if (!formData.fullName.trim()) {
      setErrorMsg('कृपया अपना पूरा नाम (Full Name) दर्ज करें');
      return false;
    }
    if (formData.username.trim() && (regUsernameCheck.status === 'taken' || regUsernameCheck.status === 'invalid')) {
      setErrorMsg(regUsernameCheck.message || 'कृपया एक मान्य और उपलब्ध @username चुनें');
      return false;
    }
    const cleanPhone = formData.phone.trim();
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg('कृपया एक मान्य 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (शुरुआत 6, 7, 8 या 9 से होनी चाहिए)');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMsg('कृपया एक वैध Email Address दर्ज करें (उदा. rahul@gmail.com)');
      return false;
    }
    if (!formData.paymentAddress.trim()) {
      setErrorMsg('कृपया अपना Payout Address (UPI ID / Bank details) दर्ज करें ताकि आपको तुरंत भुगतान मिल सके');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('सुरक्षा के लिए पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Minimum 6 characters for bank-grade protection)');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('दोनों पासवर्ड एक जैसे होने चाहिए (Password mismatch)');
      return false;
    }
    if (inputSecurityCode.trim() !== securityCode) {
      setErrorMsg('अमान्य सुरक्षा कोड (Security Verification Code Mismatch)। कृपया बॉक्स में दिख रहा 6 अंकों का सही सुरक्षा कोड दर्ज करें।');
      return false;
    }
    if (!agreeTerms) {
      setErrorMsg('कृपया 256-Bit SSL सुरक्षित पंजीकरण नियम व शर्तें स्वीकार करें');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setErrorMsg(null);
    if (!formData.chosenServiceCode) {
      setErrorMsg('कृपया कोई एक सर्विस चुनें');
      return false;
    }
    if (!formData.joiningFee || formData.joiningFee <= 0) {
      setErrorMsg('कृपया जॉइनिंग चार्ज चुनें');
      return false;
    }
    return true;
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.paymentUtr.trim()) {
      setErrorMsg('कृपया 12 अंकों का UPI Transaction Ref / UTR Number दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const cleanHandle = formData.username.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const res = await api.register({
        ...formData,
        username: cleanHandle || undefined,
      });
      if (res.success && res.user) {
        setRegisteredUser(res.user);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        onSuccessRegistration(res.user, 'business');
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during registration');
    } finally {
      setLoading(false);
    }
  };

  // Mock visitor preview profile for sponsor ID card
  const sponsorPreviewProfile: UserProfile = {
    id: 'sponsor-preview',
    userId: sponsorDetails.sponsorId,
    fullName: sponsorDetails.sponsorName,
    phone: sponsorDetails.maskedPhone || '******',
    email: sponsorDetails.maskedEmail || '***@***.com',
    fullAddress: 'Protected by User Privacy',
    paymentAddress: '******',
    payoutUpiId: '******',
    sponsorId: 'OWNER / ESP SYSTEM',
    sponsorName: 'SANTOSH KUMAR',
    chosenServiceCode: 'ESP-DIRECT',
    chosenServiceName: sponsorDetails.planName || 'VERIFIED SPONSOR',
    joiningFee: 10,
    joiningDate: sponsorDetails.joiningDate || '2024-03-01',
    paymentUtr: 'VERIFIED',
    status: 'active',
    balance: 0,
    totalEarnings: 0,
    referralEarnings: 0,
    promoEarnings: 0,
    totalWithdrawn: 0,
    role: 'member',
    createdAt: '2024-03-01',
    privacySettings: {
      showPhone: false,
      showEmail: false,
      showAddress: false,
    },
  };

  if (registeredUser) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#388e3c] flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-9 h-9 text-[#388e3c]" />
          </div>

          <div className="space-y-2">
            <span
              className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded border ${
                registeredUser.status === 'active'
                  ? 'text-[#388e3c] bg-emerald-50 border-emerald-200'
                  : 'text-amber-700 bg-amber-50 border-amber-300'
              }`}
            >
              {registeredUser.status === 'active'
                ? '✅ INSTANTLY ACTIVE • FREE GAMING PASS'
                : '⏳ PENDING ADMIN VERIFICATION'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#212121]">
              बधाई हो, {registeredUser.fullName}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {registeredUser.status === 'active'
                ? 'आपकी फ्री गेमिंग व वॉइस क्लब ID तुरंत Active हो गई है! आप सीधे सभी गेम्स खेल सकते हैं और भविष्य में इसी ID से ₹10+ Earning में अपग्रेड कर सकते हैं।'
                : 'आपका बिजनेस प्लान आवेदन सफलतापूर्वक Admin Panel में भेज दिया गया है! UTR सत्यापन के बाद आपकी Earning सेवा व Verified ID Card Active हो जाएगा।'}
            </p>
          </div>

          {/* Dual ID Architecture Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {/* Box 1: ESP ID */}
            <div className="p-4 rounded-md bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <span className="bg-[#388e3c] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  ESP ID (Sponsor)
                </span>
                <span className="text-[10px] text-[#388e3c] font-bold">Pocket Money & Team</span>
              </div>
              <p className="font-mono text-2xl font-black text-[#212121] tracking-wider my-1">
                {registeredUser.userId}
              </p>
              <p className="text-[11px] text-slate-600">
                Study & Earn, Daily Tasks, Direct Sponsor Referral & UPI Payouts.
              </p>
            </div>

            {/* Box 2: GAMING ID */}
            <div className="p-4 rounded-md bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="bg-[#2874f0] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  ESP GAMING ID
                </span>
                <span className="text-[10px] text-[#2874f0] font-bold">ESP PLAY Voice Stage</span>
              </div>
              <p className="font-mono text-2xl font-black text-[#2874f0] tracking-wider my-1">
                {registeredUser.gamingId || `ESPGT${(registeredUser.userId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4) || '01'}`}
              </p>
              <p className="text-[11px] text-slate-600">
                8-Seat Mic Stage, Mini-Games, Luxury Gifts, Charms & Clan battles.
              </p>
            </div>
          </div>

          <div className="bg-[#f9fafb] p-3 rounded-md border border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <span>Plan: <strong className="text-[#2874f0]">{registeredUser.chosenServiceName} (₹{registeredUser.joiningFee})</strong></span>
            <span>Sponsor: <strong className="text-[#212121]">{registeredUser.sponsorName}</strong> ({registeredUser.sponsorId})</span>
          </div>

          {/* Generated Verified Digital ID Card for the newly registered user */}
          <div className="pt-2 pb-3">
            <h3 className="text-sm font-extrabold text-[#212121] uppercase tracking-wider mb-2">
              आपका आधिकारिक डिजिटल पहचान पत्र (Verified ID Card)
            </h3>
            <DigitalIdCard user={registeredUser} settings={settings} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-sm font-bold text-xs sm:text-sm text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-sm cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Go to My Member Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-5 px-3 sm:px-4 pb-20 w-full overflow-x-hidden">
      {/* Flipkart Top Header Banner */}
      <div className="bg-[#2874f0] text-white rounded-md p-5 mb-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-white/15 text-[#ffe500] text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OFFICIAL ESP JOINING PORTAL</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-white">
            3-Step Official Joining & Registration
          </h1>
          <p className="text-xs text-blue-100">
            सरल 3 चरणों में अपना खाता बनाएं और तुरंत अपना Roll Number व Verified Digital ID Card पाएं।
          </p>
        </div>
        <div className="bg-white/15 border border-white/25 rounded px-3 py-2 text-xs font-bold text-white shrink-0">
          256-Bit SSL Secured
        </div>
      </div>

      {/* Purpose-First Registration Mode Selector */}
      <div className="bg-white p-3 sm:p-4 rounded-md border border-slate-200 mb-5 shadow-2xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs sm:text-sm font-extrabold text-[#212121]">
            आप प्लेटफ़ॉर्म पर किस लिए आए हैं? (पहले अपना उद्देश्य चुनें)
          </p>
          <span className="text-[10px] font-bold text-[#2874f0] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Same ID से Gaming → Earning अपग्रेड उपलब्ध
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setRegistrationType('gamer');
            }}
            className={`flex-1 py-3 px-4 rounded text-xs sm:text-sm flex items-center space-x-2.5 transition cursor-pointer text-left border ${
              registrationType === 'gamer'
                ? 'bg-[#fb641b] text-white border-[#fb641b] shadow-xs'
                : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl shrink-0">🎮</span>
            <div>
              <span className="block leading-tight font-extrabold">1. फ्री गेमिंग व वॉइस क्लब (FREE ₹0)</span>
              <span className={`text-[11px] font-medium block ${registrationType === 'gamer' ? 'text-orange-100' : 'text-slate-500'}`}>
                तुरंत Active • 16+ गेम्स, टाइपिंग अकैडमी व कॉइन्स
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setRegistrationType('business');
            }}
            className={`flex-1 py-3 px-4 rounded text-xs sm:text-sm flex items-center space-x-2.5 transition cursor-pointer text-left border ${
              registrationType === 'business'
                ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl shrink-0">💼</span>
            <div>
              <span className="block leading-tight font-extrabold">2. इनकम व बिजनेस पार्टनर (₹10+)</span>
              <span className={`text-[11px] font-medium block ${registrationType === 'business' ? 'text-blue-100' : 'text-slate-500'}`}>
                10 अर्निंग प्लान्स, Admin वेरिफिकेशन (Pending → Active)
              </span>
            </div>
          </button>
        </div>
      </div>

        {/* ===================== FREE GAMER ACCOUNT FORM ===================== */}
        {registrationType === 'gamer' && (
          <div className="bg-white rounded-md p-5 sm:p-7 border border-slate-200 shadow-xs text-[#212121] mb-6 space-y-5">
            <div className="bg-[#f5f8ff] p-4 rounded-md border border-blue-200 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded bg-[#2874f0] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  🎮
                </div>
                <div>
                  <span className="bg-[#388e3c] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    FREE GAMER PASS • 0 COINS START
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#212121] mt-0.5">
                    ESP GAMING TIME &amp; वॉइस क्लब पंजीकरण
                  </h3>
                </div>
              </div>
              <div className="text-right hidden sm:block shrink-0">
                <span className="text-[#2874f0] text-xs font-extrabold">Real Task Economy</span>
                <p className="text-[11px] text-slate-500">+5 Coins &amp; EXP / Task</p>
              </div>
            </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded p-3 flex items-center space-x-2.5 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleGamerSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={gamerName}
                  onChange={e => setGamerName(e.target.value)}
                  placeholder="जैसे: Rahul Kumar"
                  className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#2874f0] focus:outline-none text-xs sm:text-sm font-medium bg-[#f9fafb] focus:bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  नाम एक जैसा हो सकता है — आपकी User ID हमेशा यूनिक मिलेगी।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  यूनिक यूजरनेम (Unique @Username, Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#2874f0]">@</span>
                  <input
                    type="text"
                    value={gamerUsername}
                    maxLength={24}
                    onChange={e => setGamerUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())}
                    placeholder="rahulkumar01 (बिना symbol)"
                    className="w-full pl-7 pr-3.5 py-2.5 rounded border border-slate-300 focus:border-[#2874f0] focus:outline-none text-xs sm:text-sm font-mono font-medium bg-[#f9fafb] focus:bg-white"
                  />
                </div>
                {regUsernameCheck.message ? (
                  <p
                    className={`text-[10px] font-bold mt-1 ${
                      regUsernameCheck.status === 'available'
                        ? 'text-emerald-600'
                        : regUsernameCheck.status === 'checking'
                        ? 'text-slate-500'
                        : 'text-rose-600'
                    }`}
                  >
                    {regUsernameCheck.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    दो लोगों का @Username एक जैसा नहीं हो सकता।
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                रेफरल स्पॉन्सर ID या @Username (Optional Sponsor)
              </label>
              <input
                type="text"
                value={gamerSponsorId}
                onChange={e => setGamerSponsorId(e.target.value.replace(/^@+/, ''))}
                placeholder="ESPGTRK01, EMORKESP01 या rahulkumar01"
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#2874f0] focus:outline-none text-xs sm:text-sm font-mono font-medium bg-[#f9fafb] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  मोबाइल नंबर (10-Digit Mobile Number) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={gamerPhone}
                  onChange={e => setGamerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#2874f0] focus:outline-none text-xs sm:text-sm font-mono font-semibold bg-[#f9fafb] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  ईमेल पता (Email Address) *
                </label>
                <input
                  type="email"
                  required
                  value={gamerEmail}
                  onChange={e => setGamerEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#2874f0] focus:outline-none text-xs sm:text-sm font-medium bg-[#f9fafb] focus:bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  एक मोबाइल और ईमेल से केवल 1 अकाउंट बन सकता है।
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                पासवर्ड बनाएं (Create Password - Min 6 characters) *
              </label>
              <input
                type="password"
                required
                value={gamerPassword}
                onChange={e => setGamerPassword(e.target.value)}
                placeholder="कम से कम 6 अक्षरों का पासवर्ड"
                className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#2874f0] focus:outline-none text-xs sm:text-sm font-medium bg-[#f9fafb] focus:bg-white"
              />
            </div>

            {/* Verification Security Code */}
            <div className="bg-[#f9fafb] p-3.5 rounded border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">सुरक्षा कोड दर्ज करें:</span>
                <span className="font-mono font-black text-sm tracking-widest bg-blue-50 text-[#2874f0] px-3 py-1 rounded border border-blue-200 select-none">
                  {securityCode}
                </span>
                <button
                  type="button"
                  onClick={refreshSecurityCode}
                  className="p-1 text-slate-500 hover:text-[#2874f0] cursor-pointer"
                  title="कोड बदलें"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={inputSecurityCode}
                onChange={e => setInputSecurityCode(e.target.value.trim())}
                placeholder="6-अंक कोड"
                className="w-full sm:w-32 px-3 py-1.5 rounded border border-slate-300 focus:border-[#2874f0] text-center font-mono font-bold text-xs bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={gamerLoading}
              className="w-full py-3.5 rounded-sm font-bold text-sm text-white bg-[#fb641b] hover:bg-[#e5530d] shadow-xs transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{gamerLoading ? 'खाता तैयार हो रहा है...' : 'तुरंत फ्री गेमर खाता बनाएं (0 Coins Start)'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ===================== BUSINESS INCOME REGISTRATION FLOW ===================== */}
      {registrationType === 'business' && (
        <>
          {/* 3 Step Progress Bar */}
          <div className="bg-white rounded-md p-4 border border-slate-200 mb-5 shadow-2xs">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-8 right-8 h-1 bg-slate-200 z-0"></div>
              <div
                className="absolute top-4 left-8 h-1 bg-[#2874f0] z-0 transition-all duration-300"
                style={{ width: step === 1 ? '0%' : step === 2 ? '48%' : 'calc(100% - 64px)' }}
              ></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step >= 1 ? 'bg-[#2874f0] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}>
                  1
                </div>
                <span className="text-[11px] font-bold text-[#212121] mt-1">Personal Details</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step >= 2 ? 'bg-[#2874f0] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}>
                  2
                </div>
                <span className="text-[11px] font-bold text-[#212121] mt-1">Sponsor &amp; Service</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step >= 3 ? 'bg-[#388e3c] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}>
                  3
                </div>
                <span className="text-[11px] font-bold text-[#212121] mt-1">Payment Proof</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded p-3.5 flex items-center space-x-3 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-white rounded-md p-5 sm:p-7 border border-slate-200 shadow-xs text-[#212121]">
            {/* ===================== STEP 1 ===================== */}
            {step === 1 && (
          <div className="space-y-4">
            {/* Security Assurance Strip */}
            <div className="bg-[#f5f8ff] p-3 rounded border border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded bg-[#2874f0]/10 text-[#2874f0] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-[#212121]">256-Bit SSL सुरक्षित पंजीकरण</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#388e3c] text-white uppercase">SECURE</span>
                  </div>
                  <p className="text-[11px] text-slate-600">आपका डेटा और बैंक/UPI विवरण 100% सुरक्षित और गोपनीय हैं।</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-1 text-[11px] text-[#388e3c] font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <Lock className="w-3 h-3" />
                <span>Verified Guard</span>
              </div>
            </div>

            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base sm:text-lg font-extrabold text-[#212121] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2874f0]" />
                Step 1: व्यक्तिगत विवरण (Personal Details)
              </h2>
              <p className="text-xs text-slate-600">अपनी सही जानकारी दर्ज करें ताकि आपका आधिकारिक डिजिटल ID कार्ड व रोल नंबर जारी किया जा सके।</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  YOUR NAME (आपका पूरा नाम) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. Rahul Kumar"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none font-medium transition"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  नाम एक जैसा हो सकता है, लेकिन आपकी User ID और @Username हमेशा यूनिक रहेंगे।
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  UNIQUE @USERNAME (वैकल्पिक — बिना Symbol)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#2874f0]">@</span>
                  <input
                    type="text"
                    maxLength={24}
                    placeholder="उदा. rahulkumar01 (केवल a-z, 0-9)"
                    value={formData.username}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
                      })
                    }
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded pl-7 pr-3.5 py-2.5 text-xs font-mono text-[#212121] outline-none font-medium transition"
                  />
                </div>
                {regUsernameCheck.message && (
                  <p
                    className={`text-[10px] font-bold mt-1 ${
                      regUsernameCheck.status === 'available'
                        ? 'text-emerald-600'
                        : regUsernameCheck.status === 'checking'
                        ? 'text-slate-500'
                        : 'text-rose-600'
                    }`}
                  >
                    {regUsernameCheck.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#212121]">
                    YOUR PHONE / WhatsApp NUMBER <span className="text-rose-600">*</span>
                  </label>
                  {formData.phone.length === 10 && /^[6-9]/.test(formData.phone) && (
                    <span className="text-[10px] font-bold text-[#388e3c] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 10-अंक मान्य
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="10 अंकों का मोबाइल नंबर (6-9 से शुरू)"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none font-medium pr-8 transition"
                    required
                  />
                  <Smartphone className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  Email address (ईमेल पता) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  YOUR FULL ADDRESS (पूरा पता)
                </label>
                <input
                  type="text"
                  placeholder="ग्राम/शहर, जिला, राज्य, पिन कोड"
                  value={formData.fullAddress}
                  onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none font-medium transition"
                />
              </div>
            </div>

            <div className="bg-[#f9fafb] p-4 rounded border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-[#212121] flex items-center justify-between">
                <span>YOUR PAYMENT ADDRESS (भुगतान का पता) <span className="text-rose-600">*</span></span>
                <span className="text-[10px] text-[#388e3c] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">त्वरित विथड्रॉल सक्रिय</span>
              </label>
              <p className="text-[11px] text-slate-600">
                यहाँ पर आप अपना UPI ID डालें (PhonePe / GPay / Paytm) ताकि तुरंत डायरेक्ट पेआउट मिल सके।
              </p>
              <input
                type="text"
                placeholder="उदा. yourname@oksbi / yourname@paytm"
                value={formData.paymentAddress}
                onChange={e => setFormData({ ...formData, paymentAddress: e.target.value })}
                className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none font-mono font-bold"
                required
              />
            </div>

            {/* PASSWORD AND STRENGTH METER */}
            <div className="bg-[#f9fafb] p-4 rounded border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#212121]">
                      Create Password (लॉगिन पासवर्ड) <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-slate-500">कम से कम 6 अक्षर</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="कम से कम 6 अक्षर व अंक"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#212121]">
                      Confirm Password (पासवर्ड दोबारा डालें) <span className="text-rose-600">*</span>
                    </label>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <span className="text-[10px] font-bold text-[#388e3c] flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> मैच हुआ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="वही पासवर्ड दोबारा डालें"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {formData.password && (
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">पासवर्ड सुरक्षा स्तर:</span>
                    <span className={`font-bold ${getPasswordStrength(formData.password).text}`}>
                      {getPasswordStrength(formData.password).label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex space-x-1">
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          idx <= getPasswordStrength(formData.password).score
                            ? getPasswordStrength(formData.password).color
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6-DIGIT SECURITY VERIFICATION CODE */}
            <div className="bg-[#f5f8ff] p-4 rounded border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#2874f0]" />
                  <span className="text-xs font-bold text-[#212121]">सुरक्षा सत्यापन कोड (Security Captcha PIN)</span>
                </div>
                <button
                  type="button"
                  onClick={refreshSecurityCode}
                  className="text-xs text-[#2874f0] hover:underline font-bold flex items-center space-x-1 bg-white px-2.5 py-1 rounded border border-blue-200 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>नया कोड</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="select-none bg-[#2874f0] p-3 rounded border border-blue-700 flex items-center justify-center space-x-2">
                  {securityCode.split('').map((digit: string, i: number) => (
                    <span
                      key={i}
                      className="font-mono text-2xl font-black text-[#ffe500] tracking-widest inline-block"
                      style={{
                        transform: `rotate(${(i % 2 === 0 ? 1 : -1) * ((i * 3) % 7)}deg)`,
                      }}
                    >
                      {digit}
                    </span>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="ऊपर दिख रहा 6 अंकों का कोड डालें"
                    value={inputSecurityCode}
                    onChange={e => setInputSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2.5 text-xs text-[#212121] outline-none font-mono font-bold tracking-widest text-center"
                    required
                  />
                  {inputSecurityCode === securityCode && (
                    <div className="absolute right-3 top-2.5 text-[#388e3c] flex items-center space-x-1 text-[11px] font-bold">
                      <Check className="w-4 h-4" />
                      <span>वेरिफाइड</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="pt-1">
              <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#2874f0] focus:ring-[#2874f0] cursor-pointer"
                />
                <span>
                  मैं EARNING SYSTEM PLATFORM (ESP) और ESP GAMING TIME के <strong>सुरक्षित नियम व गोपनीयता नीति</strong> से पूर्णतः सहमत हूँ।
                </span>
              </label>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                disabled={step1Checking}
                onClick={async () => {
                  if (!validateStep1()) return;
                  setStep1Checking(true);
                  try {
                    const cleanUname = formData.username.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || undefined;
                    const dupCheck = await api.checkIdentityAvailability({
                      phone: formData.phone.trim(),
                      email: formData.email.trim().toLowerCase(),
                      username: cleanUname,
                    });
                    if (!dupCheck.available) {
                      setErrorMsg(dupCheck.message || 'यह मोबाइल नंबर या ईमेल पहले से पंजीकृत है।');
                      return;
                    }
                    setStep(2);
                  } finally {
                    setStep1Checking(false);
                  }
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-sm font-bold text-xs text-white bg-[#2874f0] hover:bg-blue-700 transition cursor-pointer shadow-xs disabled:opacity-60"
              >
                <span>{step1Checking ? 'मोबाइल व ईमेल जांचा जा रहा है...' : 'Continue to Step 2 (Sponsor & Service) →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== STEP 2 ===================== */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base sm:text-lg font-extrabold text-[#212121] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2874f0]" />
                Step 2: स्पॉन्सर एवं सर्विस चयन (Sponsor &amp; Service)
              </h2>
            </div>

            <div className="bg-[#f5f8ff] border border-blue-200 rounded p-3 sm:p-4 text-xs text-[#212121] leading-relaxed space-y-1">
              <p className="font-extrabold text-[#2874f0]">
                OWNER NAME: {settings.ownerName} | DEFAULT SPONSOR ID: {settings.ownerSponsorId}
              </p>
              <p className="text-[11px] text-slate-600">
                अगर आपका कोई Upline Member नहीं है तो आप डिफ़ॉल्ट Sponsor ID ({settings.ownerSponsorId}) का उपयोग कर सकते हैं।
              </p>
            </div>

            {/* Sponsor Preview ID Card Toggle */}
            <div className="bg-[#f9fafb] p-3 rounded border border-slate-200 flex items-center justify-between gap-2">
              <div className="text-xs">
                <span className="text-slate-500 block text-[10px] font-bold">CURRENT SPONSOR:</span>
                <span className="font-extrabold text-[#212121]">{sponsorDetails.sponsorName}</span>{' '}
                <span className="font-mono text-[#2874f0] font-bold">({sponsorDetails.sponsorId})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSponsorCard(!showSponsorCard)}
                className="text-xs font-bold text-[#2874f0] hover:bg-blue-50 flex items-center gap-1 bg-white px-3 py-1.5 rounded border border-blue-200 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showSponsorCard ? 'Hide Sponsor ID' : 'View Sponsor ID Card'}</span>
              </button>
            </div>

            {showSponsorCard && (
              <div className="p-3 bg-[#f9fafb] rounded border border-slate-200 flex flex-col items-center">
                <DigitalIdCard
                  user={sponsorPreviewProfile}
                  settings={settings}
                  compact={false}
                  isVisitorPreview={true}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  UPLINE SPONSOR ID या @USERNAME <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="EMORKESP01 / ESPGTRK01 / rahulkumar01"
                  value={formData.sponsorId}
                  onChange={e => setFormData({ ...formData, sponsorId: e.target.value.replace(/^@+/, '').trim() })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#2874f0] font-mono font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  UPLINE SPONSOR NAME <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="SANTOSH KUMAR"
                  value={formData.sponsorName}
                  onChange={e => setFormData({ ...formData, sponsorName: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  JOINING DATE (Today) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  CHOOSE YOUR SERVICE <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.chosenServiceCode}
                  onChange={e => {
                    const code = e.target.value;
                    const s = services.find(x => x.code === code);
                    setFormData({
                      ...formData,
                      chosenServiceCode: code,
                      joiningFee: s?.defaultFee || 10,
                    });
                  }}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] font-bold outline-none"
                >
                  {services.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name} ({s.hindiName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Joining Fee Tiers */}
            <div className="bg-[#f9fafb] p-4 rounded border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-[#212121] block">
                CHOOSE YOUR JOINING CHARGE (जॉइनिंग चार्ज चुनें) <span className="text-rose-600">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {currentService?.joiningFeeTiers.map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setFormData({ ...formData, joiningFee: tier })}
                    className={`py-2.5 px-2 rounded text-xs font-bold transition cursor-pointer text-center border ${
                      formData.joiningFee === tier
                        ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                        : 'bg-white text-[#212121] border-slate-300 hover:border-[#2874f0]'
                    }`}
                  >
                    <span className="block text-base font-extrabold tabular-nums">₹{tier}</span>
                    <span className="text-[10px] opacity-85">Plan Fee</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center space-x-1 px-4 py-2 rounded-sm font-bold text-xs text-[#212121] bg-white hover:bg-slate-50 border border-slate-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-sm font-bold text-xs text-white bg-[#2874f0] hover:bg-blue-700 transition cursor-pointer shadow-xs"
              >
                <span>Continue to Step 3 (Payment Proof) &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== STEP 3 ===================== */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base sm:text-lg font-extrabold text-[#212121] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2874f0]" />
                Step 3: भुगतान एवं स्क्रीनशॉट अपलोड (Payment &amp; Proof)
              </h2>
            </div>

            <div className="bg-[#2874f0] p-4 sm:p-5 rounded-md text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
              <div className="space-y-2.5 flex-1 text-center md:text-left">
                <div>
                  <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">OFFICIAL RECIPIENT</span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {settings.adminPayeeName} <span className="text-blue-100 text-xs font-normal">(ESP Administrator)</span>
                  </h3>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-blue-100 uppercase font-bold">OFFICIAL UPI ID:</span>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <span className="font-mono font-black text-sm text-[#212121] bg-white px-3 py-1 rounded select-all shadow-xs">
                      {settings.adminUpiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1.5 rounded bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#ffe500]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-blue-100">
                  <span>Payable Amount: </span>
                  <span className="font-mono font-black text-xl text-[#ffe500] ml-1 tabular-nums">₹{formData.joiningFee}</span>
                  <span className="text-[11px] text-blue-100 ml-1">({formData.chosenServiceCode} Plan)</span>
                </div>

                <div className="pt-1">
                  <a
                    href={`upi://pay?pa=${settings.adminUpiId}&pn=${encodeURIComponent(
                      settings.adminPayeeName
                    )}&am=${formData.joiningFee}&cu=INR`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#212121] bg-[#ffe500] hover:bg-yellow-300 px-3.5 py-2 rounded-sm transition shadow-xs"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open UPI App (GPay / PhonePe / Paytm)</span>
                  </a>
                </div>
              </div>

              {paymentQrUrl && (
                <div className="bg-white p-2.5 rounded shadow-xs flex flex-col items-center shrink-0">
                  <img src={paymentQrUrl} alt="UPI QR Code" className="w-32 h-32 sm:w-36 sm:h-36" />
                  <span className="text-[10px] font-bold text-[#212121] mt-1">Scan &amp; Pay ₹{formData.joiningFee}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#212121] block">
                  UPI Transaction UTR / Ref Number <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. 407812938471 (12 अंक)"
                  value={formData.paymentUtr}
                  onChange={e => setFormData({ ...formData, paymentUtr: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] focus:bg-white rounded px-3.5 py-2.5 text-xs text-[#212121] font-mono font-bold outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#212121] block">
                  Payment Screenshot Proof (वैकल्पिक)
                </label>
                <label className="flex items-center justify-center space-x-2 bg-[#f9fafb] border border-dashed border-slate-300 hover:border-[#2874f0] rounded px-3 py-2.5 text-xs text-slate-700 hover:text-[#212121] cursor-pointer transition">
                  <Upload className="w-4 h-4 text-[#388e3c]" />
                  <span className="truncate font-semibold">
                    {formData.paymentScreenshot ? 'Screenshot Selected ✓' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center space-x-1 px-4 py-2 rounded-sm font-bold text-xs text-[#212121] bg-white hover:bg-slate-50 border border-slate-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-8 py-3 rounded-sm font-bold text-xs sm:text-sm text-white bg-[#fb641b] hover:bg-[#e5530d] transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing Registration...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>पंजीकरण पूरा करें व रोल नंबर पाएं &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      </>
      )}
    </div>
  );
};
