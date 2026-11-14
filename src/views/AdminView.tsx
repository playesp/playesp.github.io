import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Coins, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Save, 
  Settings, 
  FileText, 
  Eye, 
  Search, 
  ExternalLink,
  CreditCard,
  History,
  UserCheck,
  Clock,
  Filter,
  Image,
  UserPlus,
  Edit,
  Sparkles,
  X
} from 'lucide-react';
import type { PlatformSettings, ServiceItem, UserProfile, PayoutRequest, CoinRechargeRequest, HomeSliderPhoto, PlanUpgradeRequest } from '../types/index.ts';
import { api } from '../services/api.ts';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';
import { showToast } from '../services/toast.ts';

interface AdminViewProps {
  adminPassword: string;
  settings: PlatformSettings;
  onUpdateSettings: (newSettings: PlatformSettings) => void;
  onLogoutAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  adminPassword,
  settings,
  onUpdateSettings,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'services' | 'payouts' | 'coin_recharges' | 'settings' | 'audits' | 'slider_photos' | 'demo_users'>('members');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [coinRecharges, setCoinRecharges] = useState<CoinRechargeRequest[]>([]);
  const [rechargeProcessingId, setRechargeProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  
  const [selectedAuditUser, setSelectedAuditUser] = useState<any | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [viewingIdCardUser, setViewingIdCardUser] = useState<UserProfile | null>(null);

  // SWI 3.3% App Link Share & Plan Upgrades States
  const [planUpgrades, setPlanUpgrades] = useState<PlanUpgradeRequest[]>([]);
  const [upgradeProcessingId, setUpgradeProcessingId] = useState<string | null>(null);
  const [swiModalUser, setSwiModalUser] = useState<UserProfile | null>(null);
  const [swiAppUrlInput, setSwiAppUrlInput] = useState('');
  const [swiAppNoteInput, setSwiAppNoteInput] = useState('');
  const [swiSharing, setSwiSharing] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(settings);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Service Modal state
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    code: '',
    name: '',
    hindiName: '',
    description: '',
    hindiDescription: '',
    category: 'direct' as const,
    defaultFee: 50,
    dailyEarningEst: '₹25 - ₹250 / day',
    referralBonusPercent: 40,
  });

  // 7-Photo Slider & Home Popup Manager States (Max 7 photos)
  const [sliderPhotos, setSliderPhotos] = useState<HomeSliderPhoto[]>([]);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideLink, setNewSlideLink] = useState('');
  const [sliderSaving, setSliderSaving] = useState(false);

  // Demo User & Profile Editor States
  const [demoForm, setDemoForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    avatar: '',
    roleTitle: 'VIP Community Member',
    coins: 10000,
    charms: 500,
    gameLevel: 10,
    clanName: 'Royal Warriors ESP',
    houseName: '',
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [showAddDemoModal, setShowAddDemoModal] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOverview(adminPassword);
      if (data.success) {
        setStats(data.stats);
        setUsers(data.users || []);
        setServices(data.services || []);
        setPayouts(data.payouts || []);
        if (data.settings) {
          setSettingsForm(data.settings);
          onUpdateSettings(data.settings);
        }
      }

      // Load coin recharge requests
      try {
        const rcData = await api.getCoinRecharges(adminPassword);
        if (rcData.success) {
          setCoinRecharges(rcData.recharges || []);
        }
      } catch (err) {
        console.error('Failed to load coin recharges', err);
      }

      // Load slider photos
      try {
        const sp = await api.getHomeSliderPhotos();
        setSliderPhotos(sp);
      } catch (err) {
        console.error('Failed to load slider photos', err);
      }

      // Load Plan Upgrade Requests (₹100+)
      try {
        const upgData = await api.getPlanUpgrades(adminPassword);
        if (upgData.success) {
          setPlanUpgrades(upgData.upgrades || []);
        }
      } catch (err) {
        console.error('Failed to load plan upgrades', err);
      }
    } catch {
      showToast('एडमिन सुरक्षा सत्यापन विफल रहा।', 'error');
      onLogoutAdmin();
    } finally {
      setLoading(false);
    }
  };

  const handleAddSliderPhoto = async () => {
    if (!newSlideUrl.trim()) {
      showToast('कृपया फोटो का इमेज लिंक या अपलोड करें', 'error');
      return;
    }
    if (sliderPhotos.length >= 7) {
      showToast('अधिकतम 7 फोटो ही अपलोड कर सकते हैं', 'error');
      return;
    }
    const newPhoto: HomeSliderPhoto = {
      id: `SLIDE-${Date.now()}`,
      imageUrl: newSlideUrl.trim(),
      title: newSlideTitle.trim() || undefined,
      subtitle: newSlideSubtitle.trim() || undefined,
      linkUrl: newSlideLink.trim() || undefined,
      active: true,
      order: sliderPhotos.length + 1,
      createdAt: new Date().toISOString(),
    };
    const updated = [...sliderPhotos, newPhoto];
    setSliderSaving(true);
    try {
      const res = await api.saveHomeSliderPhotos(adminPassword, updated);
      if (res.success) {
        setSliderPhotos(res.photos);
        setNewSlideUrl('');
        setNewSlideTitle('');
        setNewSlideSubtitle('');
        setNewSlideLink('');
        showToast('स्लाइडर फोटो सफलतापूर्वक जोड़ी गई!', 'success');
      }
    } catch {
      showToast('फोटो सेव करने में त्रुटि हुई', 'error');
    } finally {
      setSliderSaving(false);
    }
  };

  const handleRemoveSliderPhoto = async (id: string) => {
    const updated = sliderPhotos.filter(p => p.id !== id);
    setSliderSaving(true);
    try {
      const res = await api.saveHomeSliderPhotos(adminPassword, updated);
      if (res.success) {
        setSliderPhotos(res.photos);
        showToast('फोटो हटा दी गई!', 'success');
      }
    } catch {
      showToast('त्रुटि हुई', 'error');
    } finally {
      setSliderSaving(false);
    }
  };

  const handleToggleSliderPhoto = async (id: string) => {
    const updated = sliderPhotos.map(p => p.id === id ? { ...p, active: !p.active } : p);
    try {
      const res = await api.saveHomeSliderPhotos(adminPassword, updated);
      if (res.success) {
        setSliderPhotos(res.photos);
      }
    } catch {}
  };

  const handleCreateDemoUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.fullName.trim()) {
      showToast('डेमो यूजर का नाम आवश्यक है', 'error');
      return;
    }
    setProfileSaving(true);
    try {
      const res = await api.createDemoUser(adminPassword, demoForm);
      if (res.success) {
        showToast('डेमो यूजर सफलतापूर्वक जोड़ा गया!', 'success');
        setUsers(prev => [res.user, ...prev]);
        setShowAddDemoModal(false);
        setDemoForm({
          fullName: '',
          phone: '',
          email: '',
          avatar: '',
          roleTitle: 'VIP Community Member',
          coins: 10000,
          charms: 500,
          gameLevel: 10,
          clanName: 'Royal Warriors ESP',
          houseName: '',
        });
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि हुई', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveEditUser = async (userId: string) => {
    setProfileSaving(true);
    try {
      const res = await api.editUserDetails(userId, adminPassword, editForm);
      if (res.success) {
        showToast('यूजर प्रोफाइल सफलतापूर्वक अपडेट हुई!', 'success');
        setUsers(prev => prev.map(u => u.userId === userId ? res.user : u));
        setEditingUserId(null);
      }
    } catch (err: any) {
      showToast(err.message || 'अपडेट विफल', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleApproveRecharge = async (id: string) => {
    if (!confirm('क्या आप पुष्टि करते हैं कि इस 12-अंक UPI UTR का बैंक खाते में सत्यापन हो गया है? स्वीकृति के बाद यूजर के प्रोफाइल में तुरंत कॉइन्स क्रेडिट हो जाएंगे।')) {
      return;
    }
    setRechargeProcessingId(id);
    try {
      const res = await api.approveCoinRecharge(id, adminPassword);
      if (res.success) {
        showToast('सफलता: कॉइन रिचार्ज स्वीकृत! यूजर के वॉलेट में कॉइन्स क्रेडिट कर दिए गए हैं।', 'success');
        setCoinRecharges(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        loadAdminData();
      } else {
        showToast(res.error || 'स्वीकृति विफल रही', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'त्रुटि आई', 'error');
    } finally {
      setRechargeProcessingId(null);
    }
  };

  const handleRejectRecharge = async (id: string) => {
    const reason = prompt('अस्वीकृति का कारण दर्ज करें (उदा. अमान्य/गलत UTR नंबर, पेमेंट प्राप्त नहीं हुआ):');
    if (reason === null) return;
    setRechargeProcessingId(id);
    try {
      const res = await api.rejectCoinRecharge(id, reason || 'गलत UTR अथवा पेमेंट बैंक खाते में प्राप्त नहीं हुआ', adminPassword);
      if (res.success) {
        showToast('कॉइन रिचार्ज अनुरोध अस्वीकृत कर दिया गया।', 'info');
        setCoinRecharges(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      } else {
        showToast(res.error || 'अस्वीकृति विफल रही', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'त्रुटि आई', 'error');
    } finally {
      setRechargeProcessingId(null);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleOpenUserAudit = async (userId: string) => {
    setAuditLoading(true);
    try {
      const data = await api.getUserFullAudit(userId, adminPassword);
      if (data.success) {
        setSelectedAuditUser(data);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load user audit', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, newStatus: 'active' | 'rejected') => {
    try {
      const res = await api.updateUserStatus(userId, newStatus, adminPassword);
      if (res.success) {
        setUsers(users.map(u => (u.userId === userId ? { ...u, status: newStatus, ...(res.user || {}) } : u)));
        if (selectedAuditUser && selectedAuditUser.user.userId === userId) {
          setSelectedAuditUser({
            ...selectedAuditUser,
            user: { ...selectedAuditUser.user, status: newStatus, ...(res.user || {}) },
          });
        }
        // Refresh overview stats
        api.getAdminOverview(adminPassword).then(d => {
          if (d.success) setStats(d.stats);
        });
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update user status', 'error');
    }
  };

  const handleOpenSwiShareModal = (u: UserProfile) => {
    setSwiModalUser(u);
    setSwiAppUrlInput(u.swiAppLink || settingsForm.swiSpecialAppLink || '');
    setSwiAppNoteInput(
      u.swiAppNote ||
        'आपका SWI 3.3% स्पेशल रिचार्ज ऐप लिंक सक्रिय हो गया है! ऊपर दिए लिंक से ऐप इंस्टॉल करें और हर रिचार्ज पर 3.3% कमीशन पाएं।'
    );
  };

  const handleShareSwiAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swiModalUser || !swiAppUrlInput.trim()) return;
    setSwiSharing(true);
    try {
      const res = await api.shareSwiAppLink(
        swiModalUser.userId,
        swiAppUrlInput.trim(),
        swiAppNoteInput.trim(),
        adminPassword
      );
      if (res.success) {
        showToast(`${swiModalUser.fullName} को 3.3% App Link डैशबोर्ड पर भेज दिया गया!`, 'success');
        setUsers(prev =>
          prev.map(u => (u.userId === swiModalUser.userId ? { ...u, ...(res.user || {}), swiAppLink: swiAppUrlInput.trim() } : u))
        );
        setSwiModalUser(null);
      } else {
        showToast(res.message || 'App Link शेयर करने में विफल', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि हुई', 'error');
    } finally {
      setSwiSharing(false);
    }
  };

  const handleApprovePlanUpgrade = async (upgradeId: string, status: 'approved' | 'rejected') => {
    const label = status === 'approved' ? 'स्वीकृत (Approve)' : 'अस्वीकृत (Reject)';
    if (!confirm(`क्या आप इस प्लान अपग्रेड अनुरोध को ${label} करना चाहते हैं?`)) return;
    setUpgradeProcessingId(upgradeId);
    try {
      const res = await api.approvePlanUpgrade(upgradeId, status, adminPassword);
      if (res.success) {
        showToast(
          status === 'approved' ? 'प्लान अपग्रेड स्वीकृत हो गया व स्पॉन्सर बोनस क्रेडिट हो गया!' : 'अपग्रेड अनुरोध रद्द किया गया।',
          'success'
        );
        setPlanUpgrades(prev => prev.map(u => (u.id === upgradeId ? { ...u, status } : u)));
        loadAdminData();
      } else {
        showToast(res.message || 'कार्रवाई विफल रही', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि हुई', 'error');
    } finally {
      setUpgradeProcessingId(null);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    const ref = prompt('Enter Bank / UPI Transaction UTR for this payout:');
    if (!ref) return;

    try {
      const res = await api.approvePayout(payoutId, ref, adminPassword);
      if (res.success) {
        setPayouts(payouts.map(p => (p.id === payoutId ? { ...p, status: 'approved', transactionRef: ref } : p)));
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to approve payout', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      const updated = await api.updateSettings(settingsForm, adminPassword);
      onUpdateSettings(updated);
      setSettingsMsg('Platform settings, UPI details & QR updated successfully!');
    } catch (err: any) {
      setSettingsMsg(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addService(newServiceForm, adminPassword);
      if (res.success) {
        setServices(res.services);
        setShowAddService(false);
        setNewServiceForm({
          code: '',
          name: '',
          hindiName: '',
          description: '',
          hindiDescription: '',
          category: 'direct',
          defaultFee: 50,
          dailyEarningEst: '₹25 - ₹250 / day',
          referralBonusPercent: 40,
        });
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to add service', 'error');
    }
  };

  const handleDeleteService = async (serviceId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the service "${name}"?`)) return;
    try {
      const res = await api.deleteService(serviceId, adminPassword);
      if (res.success) {
        setServices(res.services);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to delete service', 'error');
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm(prev => ({ ...prev, adminQrCodeUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = users.filter(u => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    const q = searchMember.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.paymentUtr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 py-5 pb-20 w-full overflow-x-hidden">
      {/* Admin Header */}
      <div className="bg-[#2874f0] rounded-md p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white/15 text-[#ffe500] flex items-center justify-center border border-white/25 shrink-0">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-xl font-bold text-white">ESP Master Admin Panel</h1>
              <span className="text-[10px] bg-[#ffe500] text-[#212121] font-bold px-2 py-0.5 rounded-sm">
                SECURE
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              User approvals, UTR proof verification, service manager &amp; permanent database
            </p>
          </div>
        </div>

        <button
          onClick={onLogoutAdmin}
          className="px-4 py-2 rounded-sm text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition cursor-pointer shadow-2xs"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Registrations</p>
            <p className="text-xl sm:text-2xl font-bold text-[#212121]">{stats.totalUsers}</p>
            <p className="text-[11px] text-[#388e3c] font-semibold mt-0.5">{stats.activeUsers} Approved Members</p>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-md border border-amber-200 shadow-2xs">
            <p className="text-[10px] text-amber-800 uppercase font-bold">Pending Review</p>
            <p className="text-xl sm:text-2xl font-bold text-[#fb641b]">{stats.pendingUsers}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Need UTR approval</p>
          </div>
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Volume</p>
            <p className="text-xl sm:text-2xl font-bold text-[#388e3c]">₹{stats.totalVolume}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">From approved members</p>
          </div>
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Active Services</p>
            <p className="text-xl sm:text-2xl font-bold text-[#2874f0]">{services.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Catalog</p>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white border border-slate-200 rounded-md p-2 flex overflow-x-auto gap-1.5 text-xs font-bold no-scrollbar shadow-2xs">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          Members Verification &amp; Audit ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          Services (Add / Remove)
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'payouts'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          UPI Payouts ({payouts.filter(p => p.status === 'pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('coin_recharges')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'coin_recharges'
              ? 'bg-[#2874f0] text-white'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <span>🪙 कॉइन रिचार्ज ऑर्डर्स ({coinRecharges.filter(r => r.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          UPI Gateway &amp; QR Settings
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'audits'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>User Profile Audits &amp; Modification Logs ({users.filter(u => u.editHistory && u.editHistory.length > 0).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slider_photos')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'slider_photos'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          <span>🖼️ होम पॉपअप 7-फोटो स्लाइडर ({sliderPhotos.length}/7)</span>
        </button>

        <button
          onClick={() => setActiveTab('demo_users')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'demo_users'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>👥 डेमो व प्रोफाइल एडिटर</span>
        </button>
      </div>

      {/* ===================== TAB 1: MEMBERS AUDIT ===================== */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-md border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search member, Roll No, UTR..."
                value={searchMember}
                onChange={e => setSearchMember(e.target.value)}
                className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm pl-9 pr-3.5 py-2 text-xs text-[#212121] outline-none focus:border-[#2874f0]"
              />
            </div>

            {/* Quick Status Filter Buttons */}
            <div className="flex items-center flex-wrap gap-1 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200 text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#2874f0] text-white' : 'text-slate-600 hover:text-[#212121]'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-[#fb641b] text-white' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Pending ({users.filter(u => u.status === 'pending').length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'active' ? 'bg-[#388e3c] text-white' : 'text-[#388e3c] hover:bg-emerald-50'
                }`}
              >
                Approved ({users.filter(u => u.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'rejected' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Member Name</th>
                    <th className="py-2.5 px-3">Plan &amp; Fee</th>
                    <th className="py-2.5 px-3">UTR Reference</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Approve / Reject Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#f5f8ff]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#2874f0]">{u.userId}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#212121] block">{u.fullName}</span>
                        <span className="text-[11px] text-slate-500">{u.phone}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[#388e3c] font-bold">{u.chosenServiceCode}</span>
                        <span className="text-slate-600 ml-1">(₹{u.joiningFee})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#212121] select-all font-semibold">
                        {u.paymentUtr}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : u.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end flex-wrap gap-1.5">
                          {u.status !== 'active' && (
                            <button
                              onClick={() => handleToggleUserStatus(u.userId, 'active')}
                              className="px-2.5 py-1 rounded-sm text-[10px] font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white transition cursor-pointer shadow-2xs"
                              title="Approve Member & Unlock ID Card"
                            >
                              Approve
                            </button>
                          )}
                          {u.status === 'active' && (
                            <button
                              onClick={() => handleOpenSwiShareModal(u)}
                              className={`px-2 py-1 rounded-sm text-[10px] font-bold transition cursor-pointer flex items-center space-x-1 border ${
                                u.swiAppLink
                                  ? 'bg-blue-50 text-[#2874f0] border-blue-200 hover:bg-blue-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                              title="Share 3.3% SWI Special App Link directly to user's Dashboard"
                            >
                              <span>{u.swiAppLink ? '📲 Link Sent ✓' : '📲 3.3% App Link'}</span>
                            </button>
                          )}
                          {u.status !== 'rejected' && (
                            <button
                              onClick={() => handleToggleUserStatus(u.userId, 'rejected')}
                              className="px-2 py-1 rounded-sm text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                              title="Reject Fake / Invalid Proof"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenUserAudit(u.userId)}
                            className="px-2 py-1 rounded-sm text-[10px] font-bold bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 transition cursor-pointer"
                          >
                            Audit
                          </button>
                          <button
                            onClick={() => setViewingIdCardUser(u)}
                            className="px-2 py-1 rounded-sm text-[10px] font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white transition cursor-pointer flex items-center space-x-1"
                            title="View Verified Digital ID Card"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>ID Card</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plan Upgrade Verification Section (₹100+ Self Upgrades) */}
          {planUpgrades.length > 0 && (
            <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#212121] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2874f0]" />
                    <span>प्लान अपग्रेड अनुरोध (Plan Upgrades ₹100+)</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Approve करने पर यूजर का नया प्लान सक्रिय होगा और स्पॉन्सर को 50% अपग्रेड कमीशन मिलेगा। SWI (₹300+) में डिफ़ॉल्ट 3.3% ऐप लिंक स्वतः जुड़ जाएगा।
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-sm bg-blue-50 text-[#2874f0] border border-blue-200">
                  {planUpgrades.filter(p => p.status === 'pending').length} Pending
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                      <th className="py-2 px-2">Member</th>
                      <th className="py-2 px-2">Plan Switch</th>
                      <th className="py-2 px-2">Fee</th>
                      <th className="py-2 px-2">UTR</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {planUpgrades.map(upg => (
                      <tr key={upg.id} className="hover:bg-[#f5f8ff]">
                        <td className="py-2 px-2">
                          <span className="font-bold text-[#212121] block">{upg.userName}</span>
                          <span className="font-mono text-[10px] text-[#2874f0] font-semibold">{upg.userId}</span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-slate-600">{upg.fromServiceCode} (₹{upg.fromFee})</span>
                          <span className="mx-1 text-[#fb641b] font-bold">&rarr;</span>
                          <strong className="text-[#388e3c]">{upg.targetServiceCode} (₹{upg.upgradeFee})</strong>
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-[#212121]">₹{upg.upgradeFee}</td>
                        <td className="py-2 px-2 font-mono text-[#212121] select-all">{upg.paymentUtr}</td>
                        <td className="py-2 px-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                            upg.status === 'approved'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : upg.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {upg.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          {upg.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprovePlanUpgrade(upg.id, 'approved')}
                                disabled={upgradeProcessingId === upg.id}
                                className="px-2.5 py-1 rounded-sm text-[10px] font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white cursor-pointer disabled:opacity-50"
                              >
                                Approve Upgrade
                              </button>
                              <button
                                onClick={() => handleApprovePlanUpgrade(upg.id, 'rejected')}
                                disabled={upgradeProcessingId === upg.id}
                                className="px-2 py-1 rounded-sm text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Full User Audit & Form Data Modal */}
          {selectedAuditUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-xl text-[#212121]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#212121] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#388e3c]" />
                      <span>
                        User Verification &amp; Audit: {selectedAuditUser.user.fullName} ({selectedAuditUser.user.userId})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sponsor: {selectedAuditUser.user.sponsorName} ({selectedAuditUser.user.sponsorId})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAuditUser(null)}
                    className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Form Data Originally Submitted */}
                <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-[#2874f0] uppercase text-[10px] tracking-wider">
                    1. Form Data Originally Submitted by User
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[#212121]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Full Name:</span>
                      <strong>{selectedAuditUser.user.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Mobile / WhatsApp:</span>
                      <strong>{selectedAuditUser.user.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Email:</span>
                      <span>{selectedAuditUser.user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Full Address:</span>
                      <span>{selectedAuditUser.user.fullAddress || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Payment UPI Address:</span>
                      <span className="font-mono text-[#388e3c] font-semibold">{selectedAuditUser.user.paymentAddress}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Payment UTR / Ref Number:</span>
                      <span className="font-mono text-[#fb641b] font-bold select-all text-sm">
                        {selectedAuditUser.user.paymentUtr}
                      </span>
                    </div>
                  </div>

                  {selectedAuditUser.user.paymentScreenshot && (
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[10px] mb-1">Attached Screenshot Proof:</span>
                      <img
                        src={selectedAuditUser.user.paymentScreenshot}
                        alt="Proof"
                        className="max-h-52 rounded-md border border-slate-300 object-contain bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* 2. User Profile Modification History (Audit Trail) */}
                <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#2874f0] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>2. User Profile Modification History ({selectedAuditUser.user.editHistory?.length || 0} Changes)</span>
                    </h4>
                  </div>

                  {(!selectedAuditUser.user.editHistory || selectedAuditUser.user.editHistory.length === 0) ? (
                    <p className="text-slate-500 text-[11px]">
                      यूजर ने अभी तक प्रोफाइल में कोई बदलाव नहीं किया है (मूल रजिस्ट्रेशन डेटा सक्रिय है)।
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 text-[9px] uppercase">
                            <th className="py-1.5 px-2">Timestamp</th>
                            <th className="py-1.5 px-2">Field</th>
                            <th className="py-1.5 px-2">Old Value</th>
                            <th className="py-1.5 px-2">New Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {selectedAuditUser.user.editHistory.map((h: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white">
                              <td className="py-1 px-2 text-slate-500 text-[10px]">
                                {new Date(h.date).toLocaleString('hi-IN')}
                              </td>
                              <td className="py-1 px-2 text-[#212121] font-sans font-bold uppercase text-[10px]">
                                {h.field}
                              </td>
                              <td className="py-1 px-2 text-rose-700 text-[10px]">
                                {h.oldValue || '—'}
                              </td>
                              <td className="py-1 px-2 text-[#388e3c] font-bold text-[10px]">
                                {h.newValue || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Downlines of this User */}
                <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-[#388e3c] uppercase text-[10px] tracking-wider">
                    3. Downline Referrals Created by this User ({selectedAuditUser.downline.length} Members)
                  </h4>
                  {selectedAuditUser.downline.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No downline members joined under this user yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 text-[9px]">
                            <th>Member Name</th>
                            <th>Roll No</th>
                            <th>Plan</th>
                            <th>Commission</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedAuditUser.downline.map((dl: any) => (
                            <tr key={dl.id}>
                              <td className="py-1 font-semibold text-[#212121]">{dl.downlineName}</td>
                              <td className="py-1 font-mono text-[#2874f0] font-semibold">{dl.downlineUserId}</td>
                              <td className="py-1 text-slate-600">₹{dl.joiningFee}</td>
                              <td className="py-1 font-bold text-[#388e3c]">+₹{dl.commissionAmount}</td>
                              <td className="py-1 text-slate-500">{dl.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Status Update Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-slate-200">
                  <div className="text-xs">
                    <span className="text-slate-500">Current Status: </span>
                    <strong className={`uppercase ${
                      selectedAuditUser.user.status === 'active' ? 'text-[#388e3c]' : 'text-[#fb641b]'
                    }`}>
                      {selectedAuditUser.user.status}
                    </strong>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(selectedAuditUser.user.userId, 'rejected')}
                      className="px-3.5 py-2 rounded-sm text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                    >
                      Reject Account
                    </button>
                    <button
                      onClick={() => handleToggleUserStatus(selectedAuditUser.user.userId, 'active')}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-white bg-[#388e3c] hover:bg-[#2e7d32] cursor-pointer shadow-2xs"
                    >
                      Approve &amp; Unlock Digital ID Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Digital ID Card Viewer Modal */}
          {viewingIdCardUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 max-w-xl w-full shadow-xl relative space-y-4 max-h-[95vh] overflow-y-auto text-[#212121]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#2874f0]" />
                      <span>वेरिफाइड डिजिटल आईडी कार्ड (Member Digital ID)</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Member: <strong className="text-[#212121]">{viewingIdCardUser.fullName}</strong> • Roll No: <span className="font-mono text-[#2874f0] font-semibold">{viewingIdCardUser.userId}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingIdCardUser(null)}
                    className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] transition cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-1 flex justify-center w-full">
                  <DigitalIdCard user={viewingIdCardUser} settings={settings} />
                </div>
              </div>
            </div>
          )}

          {/* Share 3.3% SWI Special Recharge App Link Modal */}
          {swiModalUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl text-[#212121]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#212121] flex items-center gap-2">
                      <span>📲 3.3% Special Recharge App Link शेयर करें</span>
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Member: <strong className="text-[#212121]">{swiModalUser.fullName}</strong> ({swiModalUser.userId}) • {swiModalUser.chosenServiceCode} ₹{swiModalUser.joiningFee}
                    </p>
                  </div>
                  <button
                    onClick={() => setSwiModalUser(null)}
                    className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleShareSwiAppSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#212121] block mb-1">
                      3.3% Commission App Download / APK / Web Link <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://play.google.com/... या https://your-recharge-app.link"
                      value={swiAppUrlInput}
                      onChange={e => setSwiAppUrlInput(e.target.value)}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#2874f0] font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#212121] block mb-1">
                      डैशबोर्ड संदेश / निर्देश (User Note)
                    </label>
                    <textarea
                      rows={3}
                      value={swiAppNoteInput}
                      onChange={e => setSwiAppNoteInput(e.target.value)}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSwiModalUser(null)}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={swiSharing}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {swiSharing ? 'Sending...' : '📲 Send App Link to Dashboard'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: SERVICES ===================== */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#212121]">ESP Services Catalog</h3>
              <p className="text-xs text-slate-600">Add, edit, or remove services from the platform.</p>
            </div>
            <button
              onClick={() => setShowAddService(true)}
              className="px-3.5 py-2 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(srv => (
              <div
                key={srv.id}
                className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#2874f0] text-xs bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                      {srv.code}
                    </span>
                    <button
                      onClick={() => handleDeleteService(srv.id, srv.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition cursor-pointer"
                      title="Remove Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-[#212121] text-base mt-1.5">{srv.name}</h4>
                  <p className="text-xs text-[#fb641b] font-semibold">{srv.hindiName}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{srv.description}</p>
                </div>

                <div className="bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Tiers:</span>
                    <span className="font-bold text-[#212121]">₹{srv.joiningFeeTiers.join(', ₹')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Commission:</span>
                    <span className="text-[#388e3c] font-bold">{srv.referralBonusPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddService && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-md p-6 max-w-lg w-full space-y-4 shadow-xl text-[#212121]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-[#212121]">Add New ESP Service</h3>
                  <button onClick={() => setShowAddService(false)} className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleAddServiceSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Code</label>
                      <input
                        type="text"
                        value={newServiceForm.code}
                        onChange={e => setNewServiceForm({ ...newServiceForm, code: e.target.value.toUpperCase() })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Service Name</label>
                      <input
                        type="text"
                        value={newServiceForm.name}
                        onChange={e => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#212121] block mb-1">Hindi Title</label>
                    <input
                      type="text"
                      value={newServiceForm.hindiName}
                      onChange={e => setNewServiceForm({ ...newServiceForm, hindiName: e.target.value })}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#212121] block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newServiceForm.description}
                      onChange={e => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Default Fee (₹)</label>
                      <input
                        type="number"
                        value={newServiceForm.defaultFee}
                        onChange={e => setNewServiceForm({ ...newServiceForm, defaultFee: Number(e.target.value) })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Referral %</label>
                      <input
                        type="number"
                        value={newServiceForm.referralBonusPercent}
                        onChange={e => setNewServiceForm({ ...newServiceForm, referralBonusPercent: Number(e.target.value) })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddService(false)}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-[#1e60d5] cursor-pointer"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: PAYOUTS ===================== */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-md p-5 border border-slate-200 space-y-4 shadow-2xs">
          <h3 className="text-sm sm:text-base font-bold text-[#212121]">Member UPI Withdrawal Requests</h3>

          {payouts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">कोई निकासी अनुरोध नहीं है।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Payout UPI ID</th>
                    <th className="py-2.5 px-3">Request Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payouts.map(po => (
                    <tr key={po.id} className="hover:bg-[#f5f8ff]">
                      <td className="py-2.5 px-3 font-bold text-[#212121]">{po.userName}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#2874f0]">{po.userId}</td>
                      <td className="py-2.5 px-3 font-bold text-[#388e3c]">₹{po.amount}</td>
                      <td className="py-2.5 px-3 font-mono text-[#212121] select-all">{po.payoutAddress}</td>
                      <td className="py-2.5 px-3 text-slate-600">{po.requestDate}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            po.status === 'approved'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {po.status === 'pending' && (
                          <button
                            onClick={() => handleApprovePayout(po.id)}
                            className="px-3 py-1 rounded-sm text-xs font-bold bg-[#388e3c] text-white hover:bg-[#2e7d32] cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: COIN RECHARGE ORDERS ===================== */}
      {activeTab === 'coin_recharges' && (
        <div className="bg-white rounded-md p-5 border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-[#212121] flex items-center space-x-2">
                <span className="text-xl">🪙</span>
                <span>रियल UPI कॉइन रिचार्ज सत्यापन (Live Coin Orders)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                यूजर द्वारा UPI ID (<span className="text-[#2874f0] font-mono font-bold">8877490845@SPICEPAY</span>) पर किए गए पेमेंट के 12-अंक UTR की जांच करें और स्वीकृत करें।
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-xs font-bold text-[#212121] border border-slate-300 transition self-start sm:self-auto cursor-pointer"
            >
              🔄 रीफ्रेश लिस्ट
            </button>
          </div>

          {coinRecharges.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Coins className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">कोई कॉइन रिचार्ज अनुरोध नहीं मिला।</p>
              <p className="text-xs text-slate-500">जब भी कोई यूजर UPI से कॉइन पैक खरीदेगा और UTR डालेगा, उसका अनुरोध यहाँ आएगा।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                    <th className="py-2.5 px-3">समय / दिनांक</th>
                    <th className="py-2.5 px-3">मेंबर नाम व रोल नं.</th>
                    <th className="py-2.5 px-3">पैक</th>
                    <th className="py-2.5 px-3">रुपये (₹)</th>
                    <th className="py-2.5 px-3">कुल कॉइन्स</th>
                    <th className="py-2.5 px-3">12-अंक UPI UTR</th>
                    <th className="py-2.5 px-3">स्थिति</th>
                    <th className="py-2.5 px-3 text-right">एडमिन एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {coinRecharges.map(rc => (
                    <tr key={rc.id} className="hover:bg-[#f5f8ff]">
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-mono text-[11px]">{rc.createdAt ? new Date(rc.createdAt).toLocaleDateString('hi-IN') : '-'}</div>
                        <div className="text-[10px] text-slate-500">{rc.createdAt ? new Date(rc.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#212121]">{rc.userName}</div>
                        <div className="font-mono text-[11px] text-[#2874f0] font-semibold">ID: {rc.userId}</div>
                        {rc.userPhone && <div className="text-[10px] text-slate-500">📞 {rc.userPhone}</div>}
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-800">
                        {rc.packId || 'Coin Pack'}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#388e3c] text-sm">
                        ₹{rc.amount}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-amber-700 text-sm flex items-center space-x-1">
                          <span>🪙 {rc.coins.toLocaleString()}</span>
                        </div>
                        {rc.bonusCoins > 0 && (
                          <div className="text-[10px] font-bold text-[#388e3c]">+{rc.bonusCoins} Bonus</div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#212121] select-all">
                        <span className="px-2 py-1 rounded-sm bg-[#f9fafb] border border-slate-300 block text-center text-xs tracking-wider">
                          {rc.paymentUtr}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-sm inline-block uppercase ${
                            rc.status === 'approved'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : rc.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {rc.status === 'approved' ? '✓ स्वीकृत' : rc.status === 'rejected' ? '✗ अस्वीकृत' : '⏳ पेंडिंग'}
                        </span>
                        {rc.rejectionReason && (
                          <div className="text-[10px] text-rose-600 mt-1 max-w-[150px] truncate" title={rc.rejectionReason}>
                            कारण: {rc.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {rc.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              disabled={rechargeProcessingId === rc.id}
                              onClick={() => handleApproveRecharge(rc.id)}
                              className="px-3 py-1.5 rounded-sm text-xs font-bold bg-[#388e3c] hover:bg-[#2e7d32] disabled:opacity-50 text-white shadow-2xs transition cursor-pointer flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>स्वीकृत करें (+कॉइन जोड़ें)</span>
                            </button>
                            <button
                              disabled={rechargeProcessingId === rc.id}
                              onClick={() => handleRejectRecharge(rc.id)}
                              className="px-2.5 py-1.5 rounded-sm text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer flex items-center space-x-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>रद्द</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {rc.status === 'approved' ? 'सफलतापूर्वक क्रेडिटेड' : 'खारिज'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 4: SETTINGS ===================== */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-md p-5 sm:p-6 border border-slate-200 space-y-5 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#2874f0]" />
              <span>Platform UPI Gateway, QR &amp; Contact Settings</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              यही UPI ID और QR कोड नए मेंबर्स को रजिस्ट्रेशन और पेमेंट के लिए दिखाई देगा।
            </p>
          </div>

          {settingsMsg && (
            <div className="p-3 rounded-sm text-xs bg-emerald-50 border border-emerald-200 text-[#388e3c] font-semibold">
              {settingsMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  Official Admin UPI ID <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.adminUpiId}
                  onChange={e => setSettingsForm({ ...settingsForm, adminUpiId: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#388e3c] font-mono font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  Admin Payee Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.adminPayeeName}
                  onChange={e => setSettingsForm({ ...settingsForm, adminPayeeName: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Owner / Founder Name
                </label>
                <input
                  type="text"
                  value={settingsForm.ownerName}
                  onChange={e => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Owner Default Sponsor ID
                </label>
                <input
                  type="text"
                  value={settingsForm.ownerSponsorId}
                  onChange={e => setSettingsForm({ ...settingsForm, ownerSponsorId: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#2874f0] font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Support WhatsApp Number (10 अंक)
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={e => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#212121] block mb-1">
                Official Contact Address
              </label>
              <input
                type="text"
                value={settingsForm.contactAddress}
                onChange={e => setSettingsForm({ ...settingsForm, contactAddress: e.target.value })}
                className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
              />
            </div>

            {/* Global Default 3.3% SWI Special Recharge App Link Settings */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[#2874f0]">
                  📲 SWI (₹300) 3.3% Commission Special App — Default Link Setup
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  जब भी कोई SWI ₹300 यूजर वेरिफाई (Approve) होगा, तो यह डिफ़ॉल्ट ऐप लिंक स्वतः उसके डैशबोर्ड पर जुड़ जाएगा (आप प्रति-यूजर भी अलग लिंक भेज सकते हैं)।
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    Special App Name
                  </label>
                  <input
                    type="text"
                    placeholder="ESP 3.3% Special Recharge App"
                    value={settingsForm.swiSpecialAppName || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, swiSpecialAppName: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    Default 3.3% App Link URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://play.google.com/... या APK लिंक"
                    value={settingsForm.swiSpecialAppLink || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, swiSpecialAppLink: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#2874f0] font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Custom Admin QR Code Upload */}
            <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-[#212121] block">
                Custom Admin UPI QR Code Image (वैकल्पिक)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 bg-white border border-dashed border-slate-400 hover:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] font-semibold cursor-pointer">
                  <Upload className="w-4 h-4 text-[#2874f0]" />
                  <span>Upload QR Image</span>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
                {settingsForm.adminQrCodeUrl && (
                  <span className="text-[11px] font-bold text-[#388e3c]">Custom QR Attached ✓</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={settingsSaving}
              className="px-5 py-2.5 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-2xs cursor-pointer"
            >
              {settingsSaving ? 'Saving Settings...' : 'Save & Publish Gateway Settings'}
            </button>
          </form>
        </div>
      )}

      {/* ===================== TAB 5: USER PROFILE AUDITS & MODIFICATION LOGS ===================== */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#2874f0]" />
                  <span>User Profile Audits &amp; Modification Tracking (एडिट लॉग्स)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  एडमिन के लिए संपूर्ण डैशबोर्ड: जब भी कोई यूजर अपना नाम, फोन, ईमेल, पता, UPI ID या पासवर्ड बदलता है, उसकी हर गतिविधि यहाँ समय के साथ सुरक्षित रहती है।
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="bg-blue-50 text-[#2874f0] border border-blue-200 px-3 py-1 rounded-sm text-xs font-mono font-bold">
                  {users.reduce((acc, u) => acc + (u.editHistory?.length || 0), 0)} Total Edits Tracked
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Users Registered</span>
                <p className="text-xl font-bold text-[#212121]">{users.length}</p>
                <p className="text-[11px] text-[#388e3c] font-semibold">All member profiles secured</p>
              </div>

              <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Users with Modified Profiles</span>
                <p className="text-xl font-bold text-[#2874f0]">
                  {users.filter(u => u.editHistory && u.editHistory.length > 0).length}
                </p>
                <p className="text-[11px] text-slate-500">Changed details post-registration</p>
              </div>

              <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Immutable Protected Fields</span>
                <p className="text-xl font-bold text-[#fb641b]">Roll No &amp; Sponsor ID</p>
                <p className="text-[11px] text-[#388e3c] font-semibold">100% Permanently Locked</p>
              </div>
            </div>
          </div>

          {/* Members Modification Table */}
          <div className="bg-white rounded-md p-5 border border-slate-200 space-y-4 shadow-2xs">
            <h4 className="text-sm font-bold text-[#212121] flex items-center justify-between">
              <span>Members Who Updated Their Profile Details</span>
              <span className="text-xs text-slate-500">पारदर्शी ऑडिट रिकॉर्ड</span>
            </h4>

            {users.filter(u => u.editHistory && u.editHistory.length > 0).length === 0 ? (
              <div className="text-center py-10 bg-[#f9fafb] rounded-md border border-slate-200 space-y-2">
                <p className="text-xs text-slate-600">
                  अभी तक किसी भी यूजर ने अपना प्रोफाइल एडिट नहीं किया है।
                </p>
                <p className="text-[11px] text-slate-500">
                  जैसे ही कोई सदस्य नाम, फोन, पता या UPI बदलेगा, उसका पूरा इतिहास यहाँ तुरंत दिखेगा।
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users
                  .filter(u => u.editHistory && u.editHistory.length > 0)
                  .map(member => (
                    <div 
                      key={member.userId}
                      className="bg-[#f9fafb] p-4 sm:p-5 rounded-md border border-slate-200 hover:border-[#2874f0] transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2874f0] flex items-center justify-center font-bold text-base border border-blue-200 overflow-hidden">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.fullName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              member.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-bold text-[#212121] text-sm">{member.fullName}</h5>
                              <span className="font-mono text-xs bg-white text-[#2874f0] border border-slate-200 px-2 py-0.5 rounded-sm font-bold">
                                {member.userId}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Phone: {member.phone} | Payout UPI: <span className="text-[#388e3c] font-mono font-semibold">{member.payoutUpiId || member.paymentAddress}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-50 text-[#2874f0] border border-blue-200 px-2.5 py-1 rounded-sm font-bold">
                            {member.editHistory?.length} Edit(s)
                          </span>
                          <button
                            onClick={() => handleOpenUserAudit(member.userId)}
                            className="px-3 py-1 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-[#1e60d5] transition cursor-pointer"
                          >
                            View Full Audit
                          </button>
                        </div>
                      </div>

                      {/* Modification Events List for this member */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                              <th className="py-1.5 px-3">Date &amp; Time</th>
                              <th className="py-1.5 px-3">Field Modified</th>
                              <th className="py-1.5 px-3">Previous Value (Old)</th>
                              <th className="py-1.5 px-3">Updated Value (New)</th>
                              <th className="py-1.5 px-3">Audit State</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {member.editHistory?.map((edit, idx) => (
                              <tr key={idx} className="hover:bg-white">
                                <td className="py-2 px-3 text-slate-600 text-[11px]">
                                  {new Date(edit.date).toLocaleString('hi-IN')}
                                </td>
                                <td className="py-2 px-3 font-bold text-[#2874f0] uppercase text-[10px]">
                                  {edit.field}
                                </td>
                                <td className="py-2 px-3 text-rose-700 font-mono text-[11px]">
                                  {edit.oldValue || '—'}
                                </td>
                                <td className="py-2 px-3 text-[#388e3c] font-mono text-[11px] font-bold">
                                  {edit.newValue || '—'}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="text-[10px] bg-emerald-50 text-[#388e3c] border border-emerald-200 px-2 py-0.5 rounded-sm font-bold">
                                    Audited ✓
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 7: 7-PHOTO HOME POPUP SLIDER ===================== */}
      {activeTab === 'slider_photos' && (
        <div className="space-y-4">
          {/* Explanation Header */}
          <div className="p-4 sm:p-5 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#2874f0] bg-blue-50 px-2.5 py-0.5 rounded-sm border border-blue-200">
                Home Page Popup Manager • अधिकतम 7 फोटो
              </span>
              <h3 className="text-base sm:text-xl font-bold text-[#212121]">
                होम पेज 7-फोटो पॉपअप स्लाइडर सिस्टम
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                यहाँ आप अधिकतम 7 तस्वीरें अपलोड कर सकते हैं। यूजर जब भी होम पेज पर आएगा, उसके सामने उसी साइज का शानदार ज़ूम-इन/आउट पॉपअप आएगा। यदि कोई फोटो एक्टिव नहीं होगी तो कोई पॉपअप नहीं आएगा।
              </p>
            </div>

            <div className="text-right shrink-0 bg-[#f9fafb] px-4 py-2 rounded-md border border-slate-200">
              <span className="text-2xl font-bold text-[#2874f0] font-mono">
                {sliderPhotos.length} / 7
              </span>
              <p className="text-[10px] text-slate-500 font-semibold">कुल सक्रिय स्लाइड्स</p>
            </div>
          </div>

          {/* Add New Photo Card */}
          {sliderPhotos.length < 7 && (
            <div className="p-4 sm:p-5 rounded-md bg-white border border-slate-200 space-y-4 shadow-2xs">
              <h4 className="font-bold text-xs sm:text-sm text-[#2874f0] flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>नई स्लाइड फोटो जोड़ें (Add Slide #{sliderPhotos.length + 1})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    इमेज लिंक / URL (या नीचे से फाइल चुनें) *
                  </label>
                  <input
                    type="url"
                    value={newSlideUrl}
                    onChange={e => setNewSlideUrl(e.target.value)}
                    placeholder="https://... (JPG, PNG, WebP)"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                  
                  {/* File Upload Alternative */}
                  <div className="mt-2 flex items-center space-x-2">
                    <label className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] text-xs font-bold border border-slate-300 cursor-pointer flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>गैलरी / कैमरा से फोटो अपलोड करें</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('फोटो का साइज 5MB से कम होना चाहिए', 'error');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = ev => {
                              if (ev.target?.result) setNewSlideUrl(ev.target.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    शीर्षक / टाइटल (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={newSlideTitle}
                    onChange={e => setNewSlideTitle(e.target.value)}
                    placeholder="e.g. 🎉 स्पेशल ऑफर या नया लूडो टूर्नामेंट"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    विवरण / सब-टाइटल (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={newSlideSubtitle}
                    onChange={e => setNewSlideSubtitle(e.target.value)}
                    placeholder="e.g. आज ही खेलें और जीतें 10,000 कॉइन्स"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    क्लिक करने पर खुलने वाला लिंक (वैकल्पिक)
                  </label>
                  <input
                    type="url"
                    value={newSlideLink}
                    onChange={e => setNewSlideLink(e.target.value)}
                    placeholder="https://... या खाली छोड़ें"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              {/* Preview if URL set */}
              {newSlideUrl && (
                <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 flex items-center space-x-3">
                  <img
                    src={newSlideUrl}
                    alt="Preview"
                    className="w-20 h-16 object-contain rounded-sm bg-white border border-slate-200 shrink-0"
                  />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-[#212121]">{newSlideTitle || 'शीर्षक नहीं'}</p>
                    <p className="text-[11px] text-slate-500">{newSlideSubtitle || 'सब-टाइटल नहीं'}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddSliderPhoto}
                  disabled={sliderSaving || !newSlideUrl.trim()}
                  className="px-6 py-2.5 rounded-sm font-bold text-xs bg-[#fb641b] hover:bg-[#e5530d] text-white shadow-2xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{sliderSaving ? 'जोड़ रहे हैं...' : 'स्लाइड फोटो सेव करें'}</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Uploaded Slides */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-[#212121]">
              वर्तमान अपलोड की गई स्लाइड्स ({sliderPhotos.length})
            </h4>

            {sliderPhotos.length === 0 ? (
              <div className="p-8 rounded-md bg-white border border-slate-200 text-center text-slate-500 space-y-2 shadow-2xs">
                <Image className="w-10 h-10 mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">अभी कोई स्लाइड फोटो अपलोड नहीं की गई है।</p>
                <p className="text-[11px] text-slate-500">
                  (जब तक फोटो अपलोड नहीं होगी, होम पेज पर कोई पॉपअप नहीं दिखेगा)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {sliderPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="p-3.5 rounded-md bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="space-y-2">
                      <div className="relative w-full h-36 bg-[#f9fafb] rounded-sm overflow-hidden flex items-center justify-center border border-slate-200">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title || 'Slide'}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute top-2 left-2 bg-[#2874f0] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                          #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-[#212121] truncate">
                          {photo.title || `स्लाइड #${idx + 1}`}
                        </h5>
                        {photo.subtitle && (
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            {photo.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <button
                        onClick={() => handleToggleSliderPhoto(photo.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-sm transition cursor-pointer ${
                          photo.active 
                            ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200' 
                            : 'bg-[#f1f3f6] text-slate-600 border border-slate-200'
                        }`}
                      >
                        {photo.active ? 'एक्टिव ✓' : 'निष्क्रिय ✗'}
                      </button>

                      <button
                        onClick={() => handleRemoveSliderPhoto(photo.id)}
                        className="p-1.5 rounded-sm text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 8: DEMO USERS & PROFILE EDITOR ===================== */}
      {activeTab === 'demo_users' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#2874f0] bg-blue-50 px-2.5 py-0.5 rounded-sm border border-blue-200">
                User Management &amp; Identity
              </span>
              <h3 className="text-base sm:text-xl font-bold text-[#212121]">
                डेमो यूजर बनाएं एवं किसी भी यूजर की प्रोफाइल एडिट करें
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                यहाँ से आप नए डेमो यूजर जोड़ सकते हैं, उनकी प्रोफाइल फोटो, नाम, कॉइन्स, गेम लेवल, हाउस नेम व अन्य विवरण बदल सकते हैं।
              </p>
            </div>

            <button
              onClick={() => setShowAddDemoModal(true)}
              className="px-5 py-2.5 rounded-sm font-bold text-xs bg-[#fb641b] hover:bg-[#e5530d] text-white shadow-2xs flex items-center space-x-1.5 transition cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ नया डेमो यूजर जोड़ें</span>
            </button>
          </div>

          {/* Members Profile List with Direct Edit */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-[#212121]">
              सभी रजिस्टर्ड व डेमो मेंबर्स ({users.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {users.map(u => (
                <div
                  key={u.id || u.userId}
                  className="p-4 rounded-md bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={u.fullName}
                        className="w-12 h-12 rounded-md object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <h5 className="font-bold text-xs sm:text-sm text-[#212121] truncate">
                            {u.fullName}
                          </h5>
                          {u.userId.startsWith('ESP-DEMO') && (
                            <span className="text-[9px] bg-blue-50 text-[#2874f0] border border-blue-200 px-1.5 py-0.2 rounded-sm font-bold">
                              DEMO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[#2874f0] font-semibold truncate">{u.userId}</p>
                        <p className="text-[10px] text-slate-500">{u.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Coins</span>
                        <span className="font-mono font-bold text-amber-700">🪙 {u.coins || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Level</span>
                        <span className="font-bold text-[#2874f0]">Lv. {u.gameLevel || 1}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Clan</span>
                        <span className="font-semibold text-[#212121] truncate block">{u.clanName || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Status</span>
                        <span className={`font-bold capitalize ${u.status === 'active' ? 'text-[#388e3c]' : 'text-[#fb641b]'}`}>
                          {u.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        setEditingUserId(u.userId);
                        setEditForm({
                          fullName: u.fullName,
                          avatar: u.avatar || '',
                          phone: u.phone,
                          email: u.email,
                          coins: u.coins || 0,
                          charms: u.charms || 0,
                          gameLevel: u.gameLevel || 1,
                          status: u.status,
                          clanName: u.clanName || '',
                          houseName: u.houseName || '',
                          bio: u.bio || '',
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white transition cursor-pointer flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>प्रोफाइल एडिट करें</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== ADD DEMO USER MODAL ===================== */}
      {showAddDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative max-w-lg w-full bg-white text-[#212121] rounded-md border border-slate-200 shadow-xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-base text-[#2874f0] flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>नया डेमो यूजर जोड़ें (Create Demo User)</span>
              </h4>
              <button
                onClick={() => setShowAddDemoModal(false)}
                className="w-8 h-8 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDemoUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#212121] mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={demoForm.fullName}
                  onChange={e => setDemoForm({ ...demoForm, fullName: e.target.value })}
                  placeholder="e.g. Rohit Sharma"
                  className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#212121] mb-1">
                  प्रोफाइल फोटो लिंक / कैमरा अपलोड
                </label>
                <input
                  type="text"
                  value={demoForm.avatar}
                  onChange={e => setDemoForm({ ...demoForm, avatar: e.target.value })}
                  placeholder="https://... या नीचे से फोटो चुनें"
                  className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                />
                <div className="mt-1.5 flex items-center space-x-2">
                  <label className="px-2.5 py-1 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] text-[11px] font-bold border border-slate-300 cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3 text-[#2874f0]" />
                    <span>फाइल चुनें</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            if (ev.target?.result) setDemoForm(prev => ({ ...prev, avatar: ev.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">मोबाइल नंबर</label>
                  <input
                    type="tel"
                    value={demoForm.phone}
                    onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">गेम लेवल</label>
                  <input
                    type="number"
                    value={demoForm.gameLevel}
                    onChange={e => setDemoForm({ ...demoForm, gameLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">कॉइन्स बैलेंस</label>
                  <input
                    type="number"
                    value={demoForm.coins}
                    onChange={e => setDemoForm({ ...demoForm, coins: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">क्लैन (Clan Name)</label>
                  <input
                    type="text"
                    value={demoForm.clanName}
                    onChange={e => setDemoForm({ ...demoForm, clanName: e.target.value })}
                    placeholder="Royal Warriors ESP"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddDemoModal(false)}
                  className="px-4 py-2 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] font-bold border border-slate-300 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-bold cursor-pointer"
                >
                  {profileSaving ? 'बन रहा है...' : 'डेमो यूजर जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT USER PROFILE MODAL ===================== */}
      {editingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative max-w-lg w-full bg-white text-[#212121] rounded-md border border-slate-200 shadow-xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-base text-[#2874f0] flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>यूजर प्रोफाइल विवरण एडिट करें ({editingUserId})</span>
              </h4>
              <button
                onClick={() => setEditingUserId(null)}
                className="w-8 h-8 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#212121] mb-1">पूरा नाम (Full Name)</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#212121] mb-1">
                  प्रोफाइल फोटो (Profile Pic Avatar)
                </label>
                <input
                  type="text"
                  value={editForm.avatar || ''}
                  onChange={e => setEditForm({ ...editForm, avatar: e.target.value })}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                />
                <div className="mt-1.5 flex items-center space-x-2">
                  <label className="px-2.5 py-1 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] text-[11px] font-bold border border-slate-300 cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3 text-[#2874f0]" />
                    <span>गैलरी / कैमरा से फोटो अपलोड करें</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            if (ev.target?.result) setEditForm((prev: any) => ({ ...prev, avatar: ev.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {editForm.avatar && (
                    <img
                      src={editForm.avatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-sm object-cover border border-[#2874f0]"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">मोबाइल नंबर</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">ईमेल</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">कॉइन्स (Coins)</label>
                  <input
                    type="number"
                    value={editForm.coins || 0}
                    onChange={e => setEditForm({ ...editForm, coins: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">चार्म्स (Charms)</label>
                  <input
                    type="number"
                    value={editForm.charms || 0}
                    onChange={e => setEditForm({ ...editForm, charms: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">गेम लेवल</label>
                  <input
                    type="number"
                    value={editForm.gameLevel || 1}
                    onChange={e => setEditForm({ ...editForm, gameLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">अकाउंट स्टेटस</label>
                  <select
                    value={editForm.status || 'active'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  >
                    <option value="active">Active (सक्रिय)</option>
                    <option value="pending">Pending (समीक्षाधीन)</option>
                    <option value="rejected">Rejected (अस्वीकृत)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">क्लैन का नाम</label>
                  <input
                    type="text"
                    value={editForm.clanName || ''}
                    onChange={e => setEditForm({ ...editForm, clanName: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="px-4 py-2 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] font-bold border border-slate-300 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEditUser(editingUserId)}
                  disabled={profileSaving}
                  className="px-6 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-bold shadow-2xs cursor-pointer"
                >
                  {profileSaving ? 'सेव हो रहा है...' : 'विवरण सेव करें ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
