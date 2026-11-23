export type CharmCategory = 'starter' | 'star' | 'diamond' | 'crown' | 'emperor';

export interface CharmTierSpec {
  tier: number;
  category: CharmCategory;
  label: string;
  shortThreshold: string;
  minCharms: number;
  pillGradient: string;
  pillBorder: string;
  textColor: string;
  badgeBg: string;
}

export const CHARM_TIER_TABLE: CharmTierSpec[] = [
  {
    tier: 1,
    category: 'star',
    label: 'Star 1',
    shortThreshold: '1,000',
    minCharms: 1_000,
    pillGradient: 'from-[#a59de8] via-[#8e84dc] to-[#7467cc]',
    pillBorder: 'border-[#c8c2f4]/80',
    textColor: 'text-white',
    badgeBg: 'bg-amber-400 text-amber-950',
  },
  {
    tier: 2,
    category: 'star',
    label: 'Star 2',
    shortThreshold: '4,000',
    minCharms: 4_000,
    pillGradient: 'from-[#9e94e4] via-[#867ad7] to-[#6b5dc4]',
    pillBorder: 'border-[#c4bdf5]/80',
    textColor: 'text-white',
    badgeBg: 'bg-amber-400 text-amber-950',
  },
  {
    tier: 3,
    category: 'star',
    label: 'Star 3',
    shortThreshold: '12k',
    minCharms: 12_000,
    pillGradient: 'from-[#9388df] via-[#7c6ed0] to-[#5f50bb]',
    pillBorder: 'border-[#c4bdf5]/80',
    textColor: 'text-white',
    badgeBg: 'bg-amber-400 text-amber-950',
  },
  {
    tier: 4,
    category: 'diamond',
    label: 'Diamond 4',
    shortThreshold: '30k',
    minCharms: 30_000,
    pillGradient: 'from-[#38caff] via-[#14b8fa] to-[#0284c7]',
    pillBorder: 'border-cyan-200/85',
    textColor: 'text-white',
    badgeBg: 'bg-sky-100 text-sky-900',
  },
  {
    tier: 5,
    category: 'diamond',
    label: 'Diamond 5',
    shortThreshold: '80k',
    minCharms: 80_000,
    pillGradient: 'from-[#2ec5ff] via-[#0ea5e9] to-[#0369a1]',
    pillBorder: 'border-cyan-200/85',
    textColor: 'text-white',
    badgeBg: 'bg-sky-100 text-sky-900',
  },
  {
    tier: 6,
    category: 'diamond',
    label: 'Diamond 6',
    shortThreshold: '160k',
    minCharms: 160_000,
    pillGradient: 'from-[#22d3ee] via-[#0ea5e9] to-[#1d4ed8]',
    pillBorder: 'border-cyan-200/90',
    textColor: 'text-white',
    badgeBg: 'bg-sky-100 text-sky-900',
  },
  {
    tier: 7,
    category: 'crown',
    label: 'Crown 7',
    shortThreshold: '300k',
    minCharms: 300_000,
    pillGradient: 'from-[#ff5a76] via-[#f42b4d] to-[#c91839]',
    pillBorder: 'border-rose-200/85',
    textColor: 'text-white',
    badgeBg: 'bg-amber-300 text-rose-950',
  },
  {
    tier: 8,
    category: 'crown',
    label: 'Crown 8',
    shortThreshold: '500k',
    minCharms: 500_000,
    pillGradient: 'from-[#ff4b6b] via-[#ef233c] to-[#b91c1c]',
    pillBorder: 'border-rose-200/85',
    textColor: 'text-white',
    badgeBg: 'bg-amber-300 text-rose-950',
  },
  {
    tier: 9,
    category: 'crown',
    label: 'Crown 9',
    shortThreshold: '1m',
    minCharms: 1_000_000,
    pillGradient: 'from-[#ff3b5c] via-[#e11d48] to-[#9f1239]',
    pillBorder: 'border-amber-200/85',
    textColor: 'text-white',
    badgeBg: 'bg-amber-300 text-rose-950',
  },
  {
    tier: 10,
    category: 'crown',
    label: 'Crown 10',
    shortThreshold: '2m',
    minCharms: 2_000_000,
    pillGradient: 'from-[#ff3355] via-[#dc2626] to-[#881337]',
    pillBorder: 'border-amber-300/90',
    textColor: 'text-white',
    badgeBg: 'bg-amber-300 text-rose-950',
  },
  {
    tier: 11,
    category: 'emperor',
    label: 'Emperor 11',
    shortThreshold: '3m',
    minCharms: 3_000_000,
    pillGradient: 'from-[#a855f7] via-[#7c3aed] to-[#5b21b6]',
    pillBorder: 'border-fuchsia-200/85',
    textColor: 'text-white',
    badgeBg: 'bg-amber-300 text-purple-950',
  },
  {
    tier: 12,
    category: 'emperor',
    label: 'Emperor 12',
    shortThreshold: '5m',
    minCharms: 5_000_000,
    pillGradient: 'from-[#9333ea] via-[#7e22ce] to-[#4c1d95]',
    pillBorder: 'border-fuchsia-200/90',
    textColor: 'text-white',
    badgeBg: 'bg-amber-300 text-purple-950',
  },
  {
    tier: 15,
    category: 'emperor',
    label: 'Emperor 15',
    shortThreshold: '15m+',
    minCharms: 15_000_000,
    pillGradient: 'from-[#a855f7] via-[#8b5cf6] to-[#6d28d9]',
    pillBorder: 'border-amber-300/95',
    textColor: 'text-white',
    badgeBg: 'bg-amber-300 text-purple-950',
  },
];

const STARTER_SPEC: CharmTierSpec = {
  tier: 0,
  category: 'starter',
  label: 'Rising Star',
  shortThreshold: '0',
  minCharms: 0,
  pillGradient: 'from-[#8f88c9] via-[#7870b8] to-[#5f579f]',
  pillBorder: 'border-indigo-200/80',
  textColor: 'text-white',
  badgeBg: 'bg-amber-300 text-slate-900',
};

export function resolveCharmTier(charmsValue: number): {
  current: CharmTierSpec;
  next: CharmTierSpec | null;
  progressPercent: number;
  charms: number;
} {
  const safeCharms = Math.max(0, Math.floor(Number(charmsValue) || 0));
  let matched = STARTER_SPEC;
  let nextTier: CharmTierSpec | null = CHARM_TIER_TABLE[0];

  for (let i = 0; i < CHARM_TIER_TABLE.length; i++) {
    if (safeCharms >= CHARM_TIER_TABLE[i].minCharms) {
      matched = CHARM_TIER_TABLE[i];
      nextTier = CHARM_TIER_TABLE[i + 1] || null;
    } else {
      break;
    }
  }

  let progressPercent = 100;
  if (nextTier) {
    const span = Math.max(1, nextTier.minCharms - matched.minCharms);
    const done = Math.max(0, safeCharms - matched.minCharms);
    progressPercent = Math.min(100, Math.max(4, Math.round((done / span) * 100)));
  }

  return {
    current: matched,
    next: nextTier,
    progressPercent,
    charms: safeCharms,
  };
}
