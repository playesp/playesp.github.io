import React, { useMemo, useState } from 'react';
import { X, Sparkles, Lock, Gift, CheckCircle2, Flame } from 'lucide-react';
import {
  ALL_GIFTS_CATALOG,
  GIFT_CATEGORY_META,
  resolveCanonicalGiftId,
  type GiftCatalogItem,
} from '../config/giftCatalog.ts';

export interface GiftWallEntry {
  id: string;
  name: string;
  icon: string;
  count: number;
  coinCost?: number;
  charmValue?: number;
  lastReceivedAt?: string;
  lastSenderName?: string;
}

interface GiftWallModalProps {
  isOpen: boolean;
  recipientName: string;
  recipientAvatar?: string;
  recipientRoomAddress?: string;
  isVipRoom?: boolean;
  giftWall: GiftWallEntry[];
  isOwnProfile: boolean;
  onClose: () => void;
  onSendCatalogGift?: (gift: GiftCatalogItem) => void;
}

export const GiftWallModal: React.FC<GiftWallModalProps> = ({
  isOpen,
  recipientName,
  recipientAvatar,
  recipientRoomAddress,
  isVipRoom,
  giftWall,
  isOwnProfile,
  onClose,
  onSendCatalogGift,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'lit' | 'unlit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GiftCatalogItem['category']>('all');

  const mergedCatalog = useMemo(() => {
    const receivedMap = new Map<
      string,
      { count: number; lastReceivedAt?: string; lastSenderName?: string; charmValue?: number }
    >();

    for (const entry of giftWall) {
      const canonicalId = resolveCanonicalGiftId(entry.id, entry.name);
      const prev = receivedMap.get(canonicalId);
      const addedCount = Math.max(0, Number(entry.count) || 0);
      receivedMap.set(canonicalId, {
        count: (prev?.count || 0) + addedCount,
        lastReceivedAt: entry.lastReceivedAt || prev?.lastReceivedAt,
        lastSenderName: entry.lastSenderName || prev?.lastSenderName,
        charmValue: entry.charmValue || prev?.charmValue,
      });
    }

    return ALL_GIFTS_CATALOG.map((item) => {
      const rec = receivedMap.get(item.id);
      const count = rec?.count || 0;
      return {
        ...item,
        count,
        isLit: count > 0,
        lastReceivedAt: rec?.lastReceivedAt,
        lastSenderName: rec?.lastSenderName,
      };
    });
  }, [giftWall]);

  const litUniqueCount = mergedCatalog.filter((g) => g.isLit).length;
  const unlitCount = mergedCatalog.length - litUniqueCount;
  const totalGiftsCount = mergedCatalog.reduce((sum, g) => sum + g.count, 0);
  const totalWallCharms = mergedCatalog.reduce((sum, g) => sum + g.count * g.charmValue, 0);
  const progressPct = Math.round((litUniqueCount / Math.max(1, mergedCatalog.length)) * 100);

  const visibleItems = useMemo(() => {
    return mergedCatalog.filter((g) => {
      if (statusFilter === 'lit' && !g.isLit) return false;
      if (statusFilter === 'unlit' && g.isLit) return false;
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
      return true;
    });
  }, [mergedCatalog, statusFilter, categoryFilter]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-[#212121]"
      >
        {/* Top WePlay Header */}
        <div className="bg-gradient-to-r from-[#2874f0] via-indigo-600 to-purple-700 px-4 sm:px-5 py-4 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={
                recipientAvatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(recipientName)}`
              }
              alt={recipientName}
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-300 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black truncate">
                  {recipientName}&apos;s Gift Wall
                </h3>
                {recipientRoomAddress && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black tabular-nums ${
                      isVipRoom
                        ? 'bg-amber-300 text-amber-950'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {isVipRoom ? '👑 VIP ' : 'ID:'}
                    {recipientRoomAddress}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Lit {litUniqueCount} / {mergedCatalog.length} Unique Gifts ({totalGiftsCount} Total Received)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gift Wall Progress & KPI Bar */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg border border-slate-200 py-2 px-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Lit Collection</div>
              <div className="text-sm font-black text-[#2874f0] tabular-nums mt-0.5">
                {litUniqueCount} / {mergedCatalog.length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 py-2 px-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total Gifts</div>
              <div className="text-sm font-black text-amber-600 tabular-nums mt-0.5">
                🎁 {totalGiftsCount.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 py-2 px-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Charms Value</div>
              <div className="text-sm font-black text-rose-600 tabular-nums mt-0.5">
                ✨ {totalWallCharms.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Collection Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
              <span>Gift Wall Completion</span>
              <span className="tabular-nums text-[#2874f0]">{progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#22c1f1] via-[#2874f0] to-purple-600 transition-all duration-300"
                style={{ width: `${Math.max(progressPct, litUniqueCount > 0 ? 6 : 0)}%` }}
              />
            </div>
          </div>

          {/* Filters: Status + Category */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              {[
                { id: 'all', label: `All (${mergedCatalog.length})` },
                { id: 'lit', label: `Lit ✓ (${litUniqueCount})` },
                { id: 'unlit', label: `Unlit (${unlitCount})` },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-2.5 py-1 rounded-md border transition cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[#2874f0] text-white border-[#2874f0]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md border shrink-0 transition cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✨ All Categories
            </button>
            {(Object.keys(GIFT_CATEGORY_META) as GiftCatalogItem['category'][]).map((catKey) => {
              const meta = GIFT_CATEGORY_META[catKey];
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategoryFilter(catKey)}
                  className={`px-2.5 py-1 rounded-md border shrink-0 transition cursor-pointer ${
                    categoryFilter === catKey
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gift Wall Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white">
          {visibleItems.length === 0 ? (
            <div className="py-14 text-center text-xs text-slate-500 space-y-2">
              <Gift className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">इस फ़िल्टर में कोई गिफ्ट नहीं मिला।</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {visibleItems.map((gift) => {
                const catMeta = GIFT_CATEGORY_META[gift.category];
                return (
                  <div
                    key={gift.id}
                    className={`relative rounded-xl border p-2.5 flex flex-col items-center justify-between text-center transition ${
                      gift.isLit
                        ? 'bg-gradient-to-b from-amber-50/70 via-white to-sky-50/60 border-amber-300 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    {/* Top Left Rarity Tag */}
                    <span
                      className={`self-start text-[8px] font-black px-1.5 py-0.5 rounded border ${
                        gift.isLit ? catMeta.badgeClass : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {gift.rarityLabel || catMeta.label}
                    </span>

                    {/* Top Right Lit Count OR Lock */}
                    {gift.isLit ? (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 text-[10px] font-black tabular-nums shadow-2xs">
                        x{gift.count}
                      </span>
                    ) : (
                      <span
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center"
                        title="Unlit Gift"
                      >
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {/* Gift Icon */}
                    <div
                      className={`w-14 h-14 my-2 rounded-2xl flex items-center justify-center text-3xl select-none transition ${
                        gift.isLit
                          ? `bg-gradient-to-br ${gift.gradient} text-white shadow-sm`
                          : 'bg-slate-200/80 grayscale opacity-60'
                      }`}
                    >
                      {gift.icon}
                    </div>

                    {/* Title & Coin Cost */}
                    <div className="w-full space-y-0.5">
                      <p className="text-[11px] font-black text-slate-900 truncate" title={gift.hindiName}>
                        {gift.name}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold tabular-nums">
                        <span className="text-amber-600">🪙 {gift.coinCost.toLocaleString()}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-rose-600">+{gift.charmValue.toLocaleString()}✨</span>
                      </div>
                    </div>

                    {/* Action / Status Footer */}
                    {gift.isLit ? (
                      <div className="w-full mt-2 space-y-1">
                        {gift.lastSenderName && (
                          <div className="text-[9px] text-slate-500 truncate">
                            From {gift.lastSenderName}
                          </div>
                        )}
                        {!isOwnProfile && onSendCatalogGift ? (
                          <button
                            type="button"
                            onClick={() => onSendCatalogGift(gift)}
                            className="w-full py-1 rounded-md bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Flame className="w-3 h-3" />
                            <span>+ Send More</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lit!</span>
                          </div>
                        )}
                      </div>
                    ) : !isOwnProfile && onSendCatalogGift ? (
                      <button
                        type="button"
                        onClick={() => onSendCatalogGift(gift)}
                        className="w-full mt-2 py-1.5 rounded-md bg-[#fb641b] hover:bg-[#e5530d] text-white text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Light Up</span>
                      </button>
                    ) : (
                      <div className="w-full mt-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold">
                        Unlit
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Note */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-600 shrink-0">
          {isOwnProfile
            ? 'वॉइस रूम या दोस्तों से गिफ्ट प्राप्त होते ही आपका Gift Wall अपने-आप चमक उठेगा!'
            : `कोई भी अनलिट गिफ्ट भेजकर ${recipientName} की Gift Wall रोशन करें!`}
        </div>
      </div>
    </div>
  );
};
