import React from 'react';
import {
  Home,
  Layers,
  Gamepad2,
  Camera,
  MessageCircle,
  User,
  Sparkles,
  Radio,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';

export type GamingSubTabType =
  | 'games'
  | 'voice_room'
  | 'recharge_convert'
  | 'clan_friends'
  | 'rewards_tasks';

interface LockedFooterNavProps {
  currentTab: string;
  gamingSubTab: GamingSubTabType;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  onSelectTab: (tab: string) => void;
  onOpenMeMenu: () => void;
}

interface NavItemDef {
  id: string;
  label: string;
  subBadge?: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  glowGradient: string;
  auraBg: string;
  shadowClass: string;
  textActiveClass: string;
  dotBgClass: string;
  onClick: () => void;
}

export const LockedFooterNav: React.FC<LockedFooterNavProps> = ({
  currentTab,
  gamingSubTab,
  currentUser,
  isAdmin,
  onSelectTab,
  onOpenMeMenu,
}) => {
  const isGamer = currentUser?.accountType === 'gamer';

  const items: NavItemDef[] = isGamer
    ? [
        {
          id: 'games',
          label: 'Games',
          subBadge:
            currentTab === 'gaming-room' && gamingSubTab === 'recharge_convert'
              ? 'Coins'
              : currentTab === 'gaming-room' && gamingSubTab === 'rewards_tasks'
              ? 'Tasks'
              : undefined,
          icon: Gamepad2,
          isActive:
            currentTab === 'gaming-room' &&
            (gamingSubTab === 'games' ||
              gamingSubTab === 'recharge_convert' ||
              gamingSubTab === 'rewards_tasks'),
          glowGradient: 'from-[#fb641b] via-orange-500 to-amber-500',
          auraBg: 'bg-orange-400',
          shadowClass: 'shadow-[0_0_24px_rgba(251,100,27,0.75),0_8px_18px_rgba(234,88,12,0.5)]',
          textActiveClass: 'text-[#fb641b]',
          dotBgClass: 'bg-[#fb641b]',
          onClick: () => onSelectTab('gaming-room'),
        },
        {
          id: 'rooms',
          label: 'Rooms',
          subBadge:
            currentTab === 'gaming-room' && gamingSubTab === 'clan_friends' ? 'Family' : undefined,
          icon: Radio,
          isActive:
            currentTab === 'gaming-room' &&
            (gamingSubTab === 'voice_room' || gamingSubTab === 'clan_friends'),
          glowGradient: 'from-[#0ea5e9] via-[#2874f0] to-indigo-600',
          auraBg: 'bg-sky-400',
          shadowClass: 'shadow-[0_0_24px_rgba(14,165,233,0.75),0_8px_18px_rgba(37,99,235,0.5)]',
          textActiveClass: 'text-[#0284c7]',
          dotBgClass: 'bg-[#0284c7]',
          onClick: () => onSelectTab('gaming-voice'),
        },
        {
          id: 'chats',
          label: 'Chats',
          icon: MessageCircle,
          isActive: currentTab === 'chat-club',
          glowGradient: 'from-cyan-500 via-teal-500 to-emerald-500',
          auraBg: 'bg-cyan-400',
          shadowClass: 'shadow-[0_0_24px_rgba(6,182,212,0.75),0_8px_18px_rgba(13,148,136,0.5)]',
          textActiveClass: 'text-teal-700',
          dotBgClass: 'bg-teal-600',
          onClick: () => onSelectTab('chat-club'),
        },
        {
          id: 'moments',
          label: 'Moments',
          icon: Camera,
          isActive: currentTab === 'moments',
          glowGradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
          auraBg: 'bg-rose-400',
          shadowClass: 'shadow-[0_0_24px_rgba(244,63,94,0.75),0_8px_18px_rgba(225,29,72,0.5)]',
          textActiveClass: 'text-rose-600',
          dotBgClass: 'bg-rose-600',
          onClick: () => onSelectTab('moments'),
        },
        {
          id: 'earning',
          label: 'Earning',
          icon: Briefcase,
          isActive:
            currentTab === 'dashboard' ||
            currentTab === 'home' ||
            currentTab === 'services' ||
            currentTab === 'service-detail' ||
            currentTab === 'nwi',
          glowGradient: 'from-emerald-500 via-green-600 to-teal-600',
          auraBg: 'bg-emerald-400',
          shadowClass: 'shadow-[0_0_24px_rgba(16,185,129,0.75),0_8px_18px_rgba(5,150,105,0.5)]',
          textActiveClass: 'text-emerald-700',
          dotBgClass: 'bg-emerald-600',
          onClick: () => onSelectTab('dashboard'),
        },
        {
          id: 'me',
          label: currentTab === 'admin' ? 'Admin' : 'Me',
          icon: currentTab === 'admin' ? ShieldCheck : User,
          isActive: currentTab === 'me' || currentTab === 'admin',
          glowGradient: 'from-rose-500 via-pink-600 to-purple-600',
          auraBg: 'bg-pink-400',
          shadowClass: 'shadow-[0_0_24px_rgba(236,72,153,0.75),0_8px_18px_rgba(219,39,119,0.5)]',
          textActiveClass: 'text-rose-600',
          dotBgClass: 'bg-rose-500',
          onClick: () => {
            if (isAdmin && currentTab === 'admin') {
              onSelectTab('admin');
            } else {
              onOpenMeMenu();
            }
          },
        },
      ]
    : [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          isActive: currentTab === 'home' || currentTab === 'nwi',
          glowGradient: 'from-[#2874f0] via-blue-600 to-indigo-600',
          auraBg: 'bg-blue-400',
          shadowClass: 'shadow-[0_0_24px_rgba(40,116,240,0.75),0_8px_18px_rgba(37,99,235,0.5)]',
          textActiveClass: 'text-[#2874f0]',
          dotBgClass: 'bg-[#2874f0]',
          onClick: () => onSelectTab('home'),
        },
        {
          id: 'services',
          label: 'Services',
          icon: Layers,
          isActive: currentTab === 'services' || currentTab === 'service-detail',
          glowGradient: 'from-indigo-500 via-violet-600 to-purple-600',
          auraBg: 'bg-indigo-400',
          shadowClass: 'shadow-[0_0_24px_rgba(99,102,241,0.75),0_8px_18px_rgba(79,70,229,0.5)]',
          textActiveClass: 'text-indigo-700',
          dotBgClass: 'bg-indigo-600',
          onClick: () => onSelectTab('services'),
        },
        {
          id: 'gaming',
          label: 'Gaming',
          subBadge:
            currentTab === 'gaming-room'
              ? gamingSubTab === 'voice_room'
                ? 'Rooms'
                : gamingSubTab === 'recharge_convert'
                ? 'Coins'
                : undefined
              : undefined,
          icon: Gamepad2,
          isActive: currentTab === 'gaming-room',
          glowGradient: 'from-[#fb641b] via-orange-500 to-amber-500',
          auraBg: 'bg-orange-400',
          shadowClass: 'shadow-[0_0_24px_rgba(251,100,27,0.75),0_8px_18px_rgba(234,88,12,0.5)]',
          textActiveClass: 'text-[#fb641b]',
          dotBgClass: 'bg-[#fb641b]',
          onClick: () => onSelectTab('gaming-room'),
        },
        {
          id: 'moments',
          label: 'Moments',
          icon: Camera,
          isActive: currentTab === 'moments',
          glowGradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
          auraBg: 'bg-rose-400',
          shadowClass: 'shadow-[0_0_24px_rgba(244,63,94,0.75),0_8px_18px_rgba(225,29,72,0.5)]',
          textActiveClass: 'text-rose-600',
          dotBgClass: 'bg-rose-600',
          onClick: () => onSelectTab('moments'),
        },
        {
          id: 'chats',
          label: 'Chats',
          icon: MessageCircle,
          isActive: currentTab === 'chat-club',
          glowGradient: 'from-cyan-500 via-teal-500 to-emerald-500',
          auraBg: 'bg-cyan-400',
          shadowClass: 'shadow-[0_0_24px_rgba(6,182,212,0.75),0_8px_18px_rgba(13,148,136,0.5)]',
          textActiveClass: 'text-teal-700',
          dotBgClass: 'bg-teal-600',
          onClick: () => onSelectTab('chat-club'),
        },
        {
          id: 'account',
          label:
            currentTab === 'admin'
              ? 'Admin'
              : currentUser
              ? 'Account'
              : 'Join ₹10',
          icon:
            currentTab === 'admin'
              ? ShieldCheck
              : currentUser
              ? User
              : Sparkles,
          isActive:
            currentTab === 'dashboard' ||
            currentTab === 'register' ||
            currentTab === 'admin',
          glowGradient:
            currentTab === 'admin'
              ? 'from-amber-500 via-yellow-500 to-orange-500'
              : currentUser
              ? 'from-emerald-500 via-green-600 to-teal-600'
              : 'from-[#fb641b] via-amber-500 to-yellow-500',
          auraBg: currentTab === 'admin' ? 'bg-amber-400' : 'bg-emerald-400',
          shadowClass:
            currentTab === 'admin'
              ? 'shadow-[0_0_24px_rgba(245,158,11,0.75),0_8px_18px_rgba(217,119,6,0.5)]'
              : 'shadow-[0_0_24px_rgba(16,185,129,0.75),0_8px_18px_rgba(5,150,105,0.5)]',
          textActiveClass:
            currentTab === 'admin'
              ? 'text-amber-700'
              : currentUser
              ? 'text-emerald-700'
              : 'text-[#fb641b]',
          dotBgClass:
            currentTab === 'admin'
              ? 'bg-amber-500'
              : currentUser
              ? 'bg-emerald-600'
              : 'bg-[#fb641b]',
          onClick: () =>
            onSelectTab(
              currentTab === 'admin'
                ? 'admin'
                : currentUser
                ? 'dashboard'
                : 'register'
            ),
        },
      ];

  return (
    <nav
      aria-label="Locked Global Navigation Footer"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_28px_rgba(15,23,42,0.12)] safe-area-bottom"
    >
      <div className="max-w-3xl mx-auto px-1 sm:px-4 pt-1 pb-1.5 grid grid-cols-6 items-end gap-0.5 sm:gap-2">
        {items.map((item) => {
          const IconComponent = item.icon;
          if (item.isActive) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-current="page"
                className="relative w-full min-w-0 flex flex-col items-center justify-end pb-0.5 cursor-pointer group focus:outline-none"
              >
                <div className="relative -translate-y-2 min-[380px]:-translate-y-2.5 sm:-translate-y-3 transition-transform duration-200 group-hover:scale-105">
                  {/* Soft pulsing outer glow halo */}
                  <span
                    className={`absolute -inset-1 sm:-inset-1.5 rounded-2xl ${item.auraBg} blur-md opacity-70 animate-pulse pointer-events-none`}
                  />
                  {/* Big Glowing Active Icon Badge (Fluid scale across 320px->Desktop) */}
                  <div
                    className={`relative w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.glowGradient} text-white ring-[2.5px] sm:ring-[3px] ring-white ${item.shadowClass} flex items-center justify-center transition-all`}
                  >
                    <IconComponent className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 sm:w-7 sm:h-7 stroke-[2.4] drop-shadow-sm" />
                  </div>
                </div>

                <span
                  className={`-mt-1 sm:-mt-1.5 text-[10px] min-[380px]:text-[11px] font-black leading-none tracking-tight truncate max-w-full px-0.5 whitespace-nowrap ${item.textActiveClass}`}
                >
                  {item.subBadge || item.label}
                </span>
                <span className={`mt-1 w-3.5 sm:w-4 h-1 rounded-full ${item.dotBgClass} shadow-xs`} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="w-full min-w-0 flex flex-col items-center justify-end py-1 sm:py-1.5 px-0.5 text-slate-500 hover:text-slate-900 transition-all cursor-pointer group focus:outline-none"
            >
              <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition">
                <IconComponent className="w-[18px] h-[18px] min-[380px]:w-5 min-[380px]:h-5 stroke-[1.9]" />
              </div>
              <span className="text-[9.5px] min-[380px]:text-[10.5px] font-semibold mt-0.5 leading-none truncate max-w-full px-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
