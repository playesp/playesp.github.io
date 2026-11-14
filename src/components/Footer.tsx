import React from 'react';
import { ShieldCheck, MessageCircle, Mail, ExternalLink, MapPin } from 'lucide-react';
import type { PlatformSettings, UserProfile } from '../types/index.ts';

interface FooterProps {
  settings: PlatformSettings;
  currentUser: UserProfile | null;
  onSelectTab: (tab: string) => void;
  onOpenAdminLogin: () => void;
  onOpenLegalModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  currentUser,
  onSelectTab,
  onOpenAdminLogin,
  onOpenLegalModal,
}) => {
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${settings.whatsappNumber}&text=${encodeURIComponent(
    'नमस्ते, मुझे EARNING SYSTEM PLATFORM (ESP) के बारे में जानकारी चाहिए।'
  )}`;

  return (
    <footer className="bg-[#172337] border-t border-[#2a384e] text-white text-xs w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* ABOUT */}
          <div className="space-y-3">
            <h4 className="text-[#878787] text-[11px] font-bold uppercase tracking-wider">ABOUT ESP</h4>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-[#2874f0] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-white text-sm">ESP Platform</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              EARNING SYSTEM PLATFORM (ESP) — 10 पारदर्शी सर्विसेज, स्व-प्रचार, लाइव वॉइस गेम्स और सुरक्षित UPI पेआउट।
            </p>
            <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
              <p>Founder: <span className="text-white font-semibold">{settings.ownerName}</span></p>
              <p>Sponsor ID: <span className="text-[#ffe500] font-mono">{settings.ownerSponsorId}</span></p>
            </div>
          </div>

          {/* IMPORTANT LINKS */}
          <div className="space-y-2.5">
            <h4 className="text-[#878787] text-[11px] font-bold uppercase tracking-wider">PLATFORM LINKS</h4>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>
                <button type="button" onClick={() => onSelectTab('home')} className="hover:underline cursor-pointer">
                  ESP Overview (Home)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectTab('services')} className="hover:underline cursor-pointer">
                  All 10 Services Catalogue
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectTab('nwi')} className="hover:underline cursor-pointer">
                  NWI 3-Level Passive Income
                </button>
              </li>
              {onOpenLegalModal && (
                <li>
                  <button type="button" onClick={onOpenLegalModal} className="text-[#ffe500] hover:underline font-medium cursor-pointer">
                    Legal Rules & Compliance Audit
                  </button>
                </li>
              )}
              {currentUser ? (
                <li>
                  <button type="button" onClick={() => onSelectTab('dashboard')} className="text-emerald-400 hover:underline font-semibold cursor-pointer">
                    My Member Dashboard ({currentUser.userId})
                  </button>
                </li>
              ) : (
                <li>
                  <button type="button" onClick={() => onSelectTab('register')} className="text-[#ffe500] hover:underline font-semibold cursor-pointer">
                    New Admission Form (₹10+)
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* HELP & SUPPORT */}
          <div className="space-y-2.5">
            <h4 className="text-[#878787] text-[11px] font-bold uppercase tracking-wider">HELP & SUPPORT</h4>
            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2874f0] shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:underline truncate">
                  {settings.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:underline">
                  WhatsApp: +91 {settings.whatsappNumber}
                </a>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{settings.contactAddress}</span>
              </div>
              <div className="pt-1 flex items-center gap-3">
                <a
                  href="https://ioisplatform.github.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ffe500] hover:underline inline-flex items-center gap-1"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={settings.blogReferenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:underline inline-flex items-center gap-1"
                >
                  <span>Blog</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* VERIFIED PAYMENTS */}
          <div className="space-y-2.5 bg-[#1e2d45] p-4 rounded-sm border border-[#2d405e]">
            <h4 className="text-[#ffe500] text-[11px] font-bold uppercase tracking-wider">
              VERIFIED DIRECT UPI
            </h4>
            <p className="text-xs text-slate-300">
              Official Admin UPI ID:
              <span className="block font-mono font-bold text-white select-all mt-1 tabular-nums">
                {settings.adminUpiId}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Payee: {settings.adminPayeeName}
              </span>
            </p>
            <p className="text-[11px] text-slate-300 leading-snug border-t border-[#2d405e] pt-2">
              Minimum withdrawal ₹{settings.minWithdrawal} · Instant verified Digital ID Card on registration.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Seller/Admin Link */}
        <div className="border-t border-[#2a384e] pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} EARNING SYSTEM PLATFORM (ESP). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="text-slate-300 hover:text-[#ffe500] transition font-medium cursor-pointer"
            >
              System Admin
            </button>
            <span aria-hidden="true">·</span>
            <span>Founder: Santosh Kumar</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
