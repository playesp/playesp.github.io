import React from 'react';
import { X, Sparkles } from 'lucide-react';
import {
  CHARM_TIER_TABLE,
  resolveCharmTier,
  type CharmCategory,
} from '../config/charmTiers.ts';

export const CharmTierEmblem: React.FC<{
  category: CharmCategory;
  tier: number;
  size?: 'xs' | 'sm' | 'md';
}> = ({ category, tier, size = 'sm' }) => {
  const dim =
    size === 'xs'
      ? 'w-4 h-4'
      : size === 'md'
        ? 'w-7 h-7'
        : 'w-5 h-5';
  const numCls =
    size === 'xs'
      ? 'text-[7px] px-1 min-w-[11px] h-[11px]'
      : size === 'md'
        ? 'text-[10px] px-1 min-w-[16px] h-[16px]'
        : 'text-[8px] px-1 min-w-[13px] h-[13px]';

  return (
    <span className="relative inline-flex items-center justify-center shrink-0">
      {category === 'diamond' ? (
        <svg viewBox="0 0 32 32" className={`${dim} drop-shadow-xs`} aria-hidden="true">
          <defs>
            <linearGradient id="espDiamondGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <polygon
            points="7,5 25,5 30,13 16,28 2,13"
            fill="url(#espDiamondGrad)"
            stroke="#e0f2fe"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon points="7,5 16,13 25,5" fill="#e0f2fe" fillOpacity="0.65" />
          <polygon points="2,13 16,13 16,28" fill="#0369a1" fillOpacity="0.35" />
        </svg>
      ) : category === 'crown' ? (
        <svg viewBox="0 0 32 32" className={`${dim} drop-shadow-xs`} aria-hidden="true">
          <defs>
            <linearGradient id="espCrownGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <path
            d="M3 24L5 9L11.5 15L16 6L20.5 15L27 9L29 24H3Z"
            fill="url(#espCrownGrad)"
            stroke="#fef08a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="4" y="24" width="24" height="3.5" rx="1.5" fill="#b91c1c" stroke="#fde047" strokeWidth="1" />
          <circle cx="16" cy="18" r="2.2" fill="#ef4444" stroke="#fef08a" strokeWidth="0.8" />
        </svg>
      ) : category === 'emperor' ? (
        <svg viewBox="0 0 32 32" className={`${dim} drop-shadow-xs`} aria-hidden="true">
          <defs>
            <linearGradient id="espEmperorGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>
          <path
            d="M3 24L5 8L11.5 15L16 5L20.5 15L27 8L29 24H3Z"
            fill="url(#espEmperorGrad)"
            stroke="#fef9c3"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="4" y="24" width="24" height="3.5" rx="1.5" fill="#6b21a8" stroke="#fde047" strokeWidth="1" />
          <circle cx="16" cy="17.5" r="2.5" fill="#c084fc" stroke="#fef08a" strokeWidth="0.9" />
        </svg>
      ) : (
        <svg viewBox="0 0 32 32" className={`${dim} drop-shadow-xs`} aria-hidden="true">
          <defs>
            <linearGradient id="espStarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path
            d="M16 3L19.9 11L28.7 12.3L22.3 18.5L23.8 27.3L16 23.1L8.2 27.3L9.7 18.5L3.3 12.3L12.1 11L16 3Z"
            fill="url(#espStarGrad)"
            stroke="#fef9c3"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {tier > 0 && (
        <span
          className={`absolute -bottom-0.5 -right-1 rounded-full font-black leading-none flex items-center justify-center border border-white shadow-2xs tabular-nums ${numCls} ${
            category === 'diamond'
              ? 'bg-sky-700 text-white'
              : category === 'crown'
                ? 'bg-rose-700 text-amber-200'
                : category === 'emperor'
                  ? 'bg-purple-800 text-amber-200'
                  : 'bg-amber-500 text-amber-950'
          }`}
        >
          {tier}
        </span>
      )}
    </span>
  );
};

export const CharmTierChartModal: React.FC<{
  isOpen: boolean;
  charms: number;
  playerName?: string;
  onClose: () => void;
}> = ({ isOpen, charms, playerName, onClose }) => {
  if (!isOpen) return null;
  const { current, next, progressPercent, charms: safeCharms } = resolveCharmTier(charms);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[75] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[88dvh] flex flex-col text-slate-900"
      >
        <div className="px-4 py-3.5 bg-gradient-to-r from-[#2874f0] via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <CharmTierEmblem category={current.category} tier={current.tier} size="md" />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate">
                ESP Charm Star, Diamond &amp; Crown
              </h3>
              <p className="text-[11px] text-blue-100 truncate">
                {playerName ? `${playerName} · ` : ''}
                {safeCharms.toLocaleString('en-IN')} Charms ({current.label})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Progress Banner */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${current.pillGradient} border ${current.pillBorder} text-white shadow-sm`}
            >
              <CharmTierEmblem category={current.category} tier={current.tier} size="sm" />
              <span className="text-sm font-black tabular-nums tracking-wide">
                {safeCharms.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right text-[11px]">
              {next ? (
                <>
                  <div className="font-bold text-slate-700">
                    Next: {next.label} ({next.shortThreshold})
                  </div>
                  <div className="text-slate-500 font-semibold tabular-nums">
                    {(next.minCharms - safeCharms).toLocaleString('en-IN')} Charms बाकी
                  </div>
                </>
              ) : (
                <div className="font-black text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Max Emperor Crown!</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${current.pillGradient} transition-all duration-300`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Charm Milestone Table (Exact 1,000 -> 1m+ Icons Table) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          <div className="px-4 py-2 bg-slate-100/80 flex items-center justify-between text-[11px] font-black text-slate-600 sticky top-0 z-10">
            <span>Charm</span>
            <span>Icon &amp; Badge</span>
          </div>
          {CHARM_TIER_TABLE.map((row) => {
            const unlocked = safeCharms >= row.minCharms;
            const isActive = current.tier === row.tier;
            return (
              <div
                key={row.tier}
                className={`px-4 py-2.5 flex items-center justify-between text-xs transition ${
                  isActive
                    ? 'bg-blue-50/85'
                    : unlocked
                      ? 'bg-white'
                      : 'bg-white opacity-70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 tabular-nums w-14">
                    {row.shortThreshold}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {row.label}
                  </span>
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded bg-[#2874f0] text-white text-[9px] font-black">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r ${row.pillGradient} border ${row.pillBorder} text-white shadow-2xs`}
                  >
                    <CharmTierEmblem category={row.category} tier={row.tier} size="xs" />
                    <span className="text-[10px] font-black tabular-nums">
                      {row.minCharms.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
