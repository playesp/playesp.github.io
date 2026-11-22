import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Gift,
  Send,
  Coins,
  Volume2,
  SlidersHorizontal,
  Sparkles,
  Flame,
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { ALL_GIFTS_CATALOG, type GiftCatalogItem } from '../../config/giftCatalog.ts';
import { sound8D } from '../../services/sound8d.ts';

export type AppGiftItem = GiftCatalogItem;
export const ALL_APP_GIFTS: AppGiftItem[] = ALL_GIFTS_CATALOG;

export const COMBO_MULTIPLIERS = [1, 10, 66, 99, 188, 520, 1314];

export interface GiftComboSettings {
  showRapidButton: boolean;
  windowSeconds: number;
  soundEnabled: boolean;
}

interface WePlayAppGiftModalProps {
  user: UserProfile;
  seats: Array<{ seatNumber: number; userName?: string; userAvatar?: string; userId?: string }>;
  initialGiftId?: string;
  initialTargetName?: string;
  initialTargetUserId?: string;
  initialCategory?: 'diwali' | 'popular' | 'romance' | 'luxury' | 'mythic' | 'packets';
  comboSettings?: GiftComboSettings;
  onUpdateComboSettings?: (next: GiftComboSettings) => void;
  onDropPacket?: (packetType: 'red' | 'blue', totalCoins: number, maxClaims: number, message: string) => Promise<void> | void;
  onClose: () => void;
  onSendGift: (
    gift: AppGiftItem,
    comboCount: number,
    targetName: string,
    coinsBackWon: number,
    targetUserId?: string,
    comboSettingsUsed?: GiftComboSettings
  ) => void;
  onOpenBuyCoins?: () => void;
}

export const WePlayAppGiftModal: React.FC<WePlayAppGiftModalProps> = ({
  user,
  seats,
  initialGiftId,
  initialTargetName,
  initialTargetUserId,
  initialCategory,
  comboSettings: propComboSettings,
  onUpdateComboSettings,
  onDropPacket,
  onClose,
  onSendGift,
  onOpenBuyCoins,
}) => {
  const initialGiftObj = ALL_APP_GIFTS.find((g) => g.id === initialGiftId);
  const [activeCategory, setActiveCategory] = useState<'diwali' | 'popular' | 'romance' | 'luxury' | 'mythic' | 'packets'>(
    initialCategory || initialGiftObj?.category || 'popular'
  );
  const [selectedGiftId, setSelectedGiftId] = useState<string>(initialGiftObj?.id || 'pop_1');
  const [comboCount, setComboCount] = useState<number>(1);
  const [targetRecipient, setTargetRecipient] = useState<string>(
    initialTargetName || 'Entire Room (सभी को)'
  );
  const [targetUserIdState, setTargetUserIdState] = useState<string | undefined>(initialTargetUserId);
  const [showComboSettingsPanel, setShowComboSettingsPanel] = useState(false);

  const [localComboSettings, setLocalComboSettings] = useState<GiftComboSettings>(
    propComboSettings || {
      showRapidButton: true,
      windowSeconds: 12,
      soundEnabled: true,
    }
  );

  // Red & Blue Packet Rain Launcher State
  const [packetType, setPacketType] = useState<'red' | 'blue'>('red');
  const [packetCoins, setPacketCoins] = useState<number>(100);
  const [packetClaims, setPacketClaims] = useState<number>(5);
  const [packetMessage, setPacketMessage] = useState<string>('');
  const [droppingPacket, setDroppingPacket] = useState(false);

  useEffect(() => {
    if (propComboSettings) setLocalComboSettings(propComboSettings);
  }, [propComboSettings]);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    } else if (initialGiftId) {
      const g = ALL_APP_GIFTS.find((item) => item.id === initialGiftId);
      if (g) {
        setActiveCategory(g.category);
        setSelectedGiftId(g.id);
      }
    }
    if (initialTargetName) {
      setTargetRecipient(initialTargetName);
      setTargetUserIdState(initialTargetUserId);
    }
  }, [initialGiftId, initialTargetName, initialTargetUserId, initialCategory]);

  const updateComboSetting = (patch: Partial<GiftComboSettings>) => {
    const next = { ...localComboSettings, ...patch };
    setLocalComboSettings(next);
    onUpdateComboSettings?.(next);
  };

  const selectedGift = ALL_APP_GIFTS.find((g) => g.id === selectedGiftId) || ALL_APP_GIFTS[0];
  const totalCost = selectedGift.coinCost * comboCount;
  const totalCharms = selectedGift.charmValue * comboCount;
  const userCoins = user.coins || 0;
  const canAfford = userCoins >= totalCost;

  const categoryGifts =
    activeCategory === 'packets'
      ? []
      : ALL_APP_GIFTS.filter((g) => g.category === activeCategory);

  const handleSelectGift = (gift: AppGiftItem) => {
    setSelectedGiftId(gift.id);
    if (localComboSettings.soundEnabled) {
      sound8D.playGiftSound(gift.id || gift.animationType, 1);
    }
  };

  const handleSend = () => {
    if (!canAfford) return;
    if (localComboSettings.soundEnabled) {
      sound8D.playGiftSound(selectedGift.id || selectedGift.animationType, Math.min(8, comboCount > 1 ? 3 : 1));
    }
    onSendGift(selectedGift, comboCount, targetRecipient, 0, targetUserIdState, localComboSettings);
    confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
  };

  const handleLaunchPacketRain = async () => {
    if (!onDropPacket || userCoins < packetCoins) return;
    setDroppingPacket(true);
    try {
      if (localComboSettings.soundEnabled) {
        sound8D.playGiftSound(packetType === 'blue' ? 'blue_packet' : 'red_packet', 2);
      }
      await onDropPacket(
        packetType,
        packetCoins,
        packetClaims,
        packetMessage.trim() ||
          (packetType === 'red'
            ? '🧧 सबके लिए लकी लाल पैकेट बारिश!'
            : '💠 नीला VIP + EXP पैकेट बारिश!')
      );
      onClose();
    } finally {
      setDroppingPacket(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0f172a] via-[#131936] to-[#0b1024] rounded-t-2xl sm:rounded-2xl border border-indigo-500/35 shadow-[0_20px_70px_rgba(79,70,229,0.45)] text-white overflow-hidden">
        {/* Luxury Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-indigo-700/80 via-purple-700/80 to-fuchsia-700/80 border-b border-white/15">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <Gift className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>ESP PLAY Luxury Gift Box</span>
                <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-sm uppercase">
                  8D SFX
                </span>
              </h3>
              <p className="text-[10px] text-indigo-200">
                हर गिफ्ट की अलग साउंड • कॉम्बो सेटिंग्स • लाल व नीला पैकेट बारिश
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowComboSettingsPanel((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black border flex items-center gap-1 cursor-pointer transition ${
                showComboSettingsPanel
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="गिफ्ट भेजने से पहले कॉम्बो और साउंड सेटिंग्स"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Combo Setup</span>
            </button>

            <div className="flex items-center space-x-1 bg-amber-400 px-2.5 py-1 rounded-lg text-xs font-black text-slate-950 shadow">
              <span>🪙</span>
              <span className="tabular-nums">{userCoins.toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {/* Pre-Send Combo & Sound Settings Drawer */}
          {showComboSettingsPanel && (
            <div className="p-3 rounded-xl bg-indigo-950/90 border border-amber-400/40 space-y-2.5 text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>गिफ्ट भेजने से पहले Combo &amp; Sound Settings</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowComboSettingsPanel(false)}
                  className="text-[11px] text-indigo-200 hover:text-white cursor-pointer"
                >
                  Done ✓
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
                  <span className="text-[11px] font-bold">🔥 Rapid Combo Tap Button</span>
                  <input
                    type="checkbox"
                    checked={localComboSettings.showRapidButton}
                    onChange={(e) => updateComboSetting({ showRapidButton: e.target.checked })}
                    className="accent-amber-400 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
                  <span className="text-[11px] font-bold">🔊 Distinct Gift Sound FX</span>
                  <input
                    type="checkbox"
                    checked={localComboSettings.soundEnabled}
                    onChange={(e) => updateComboSetting({ soundEnabled: e.target.checked })}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>

                <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <span className="text-[11px] font-bold">⏱️ Combo Timer:</span>
                  <div className="flex items-center gap-1">
                    {[8, 12, 20].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => updateComboSetting({ windowSeconds: sec })}
                        className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                          localComboSettings.windowSeconds === sec
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipient Selector */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-indigo-200 font-bold text-[11px] shrink-0">भेजें (To):</span>
            {initialTargetName && !seats.some((s) => s.userId === initialTargetUserId) && (
              <button
                type="button"
                onClick={() => {
                  setTargetRecipient(initialTargetName);
                  setTargetUserIdState(initialTargetUserId);
                }}
                className={`px-3 py-1 rounded-full font-bold shrink-0 transition cursor-pointer text-xs border ${
                  targetRecipient === initialTargetName
                    ? 'bg-emerald-500 text-white border-emerald-300 shadow'
                    : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
                }`}
              >
                👤 {initialTargetName}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setTargetRecipient('Entire Room (सभी को)');
                setTargetUserIdState(undefined);
              }}
              className={`px-3 py-1 rounded-full font-bold shrink-0 transition cursor-pointer text-xs border ${
                targetRecipient === 'Entire Room (सभी को)'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-amber-200 shadow'
                  : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
              }`}
            >
              🌟 Entire Room
            </button>
            {seats
              .filter((s) => s.userName)
              .map((s) => (
                <button
                  key={s.seatNumber}
                  type="button"
                  onClick={() => {
                    setTargetRecipient(`${s.userName} (Seat #${s.seatNumber})`);
                    setTargetUserIdState(s.userId);
                  }}
                  className={`px-3 py-1 rounded-full font-bold shrink-0 transition cursor-pointer text-xs border ${
                    targetRecipient.includes(`Seat #${s.seatNumber}`) || (s.userId && targetUserIdState === s.userId)
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-200 shadow'
                      : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
                  }`}
                >
                  #{s.seatNumber}: {s.userName}
                </button>
              ))}
          </div>

          {/* Category Tabs (+ Red/Blue Packet Rain Tab) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {[
              { id: 'popular' as const, label: '🔥 लोकप्रिय', activeCls: 'bg-blue-600 text-white' },
              { id: 'diwali' as const, label: '🪔 दिवाली', activeCls: 'bg-orange-500 text-white' },
              { id: 'romance' as const, label: '💖 रोमांस', activeCls: 'bg-pink-600 text-white' },
              { id: 'luxury' as const, label: '👑 लक्ज़री', activeCls: 'bg-amber-400 text-slate-950' },
              { id: 'mythic' as const, label: '💎 मिथिक', activeCls: 'bg-purple-600 text-white' },
              { id: 'packets' as const, label: '🧧 पैकेट बारिश', activeCls: 'bg-gradient-to-r from-rose-600 to-cyan-600 text-white' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`py-1.5 px-1.5 rounded-lg font-black text-[10px] sm:text-[11px] truncate transition cursor-pointer text-center ${
                  activeCategory === cat.id
                    ? `${cat.activeCls} shadow`
                    : 'text-indigo-200 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: PACKET RAIN LAUNCHER OR LUXURY GIFT GRID */}
          {activeCategory === 'packets' ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/15 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPacketType('red');
                    sound8D.playGiftSound('red_packet', 1);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    packetType === 'red'
                      ? 'bg-gradient-to-br from-rose-600/90 to-red-800/90 border-yellow-300 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-1">🧧</div>
                  <div className="text-xs font-black text-white">लाल पैकेट बारिश (Red Packet)</div>
                  <div className="text-[10px] text-rose-100 mt-0.5">
                    रूम में ऊपर से कॉइन्स पैकेट बरसेंगे • सब लूट सकेंगे
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPacketType('blue');
                    sound8D.playGiftSound('blue_packet', 1);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    packetType === 'blue'
                      ? 'bg-gradient-to-br from-cyan-600/90 to-indigo-800/90 border-cyan-200 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-1">💠</div>
                  <div className="text-xs font-black text-white">नीला पैकेट बारिश (Blue VIP Packet)</div>
                  <div className="text-[10px] text-cyan-100 mt-0.5">
                    Coins के साथ +12 EXP लेवल बोनस भी हर लूटेरे को!
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                    पैकेट में कुल कॉइन्स (Total Coins Pool)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[50, 100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPacketCoins(amt)}
                        className={`px-2.5 py-1.5 rounded-lg font-mono font-black text-xs cursor-pointer border ${
                          packetCoins === amt
                            ? 'bg-amber-400 text-slate-950 border-amber-200'
                            : 'bg-white/10 text-white border-white/15'
                        }`}
                      >
                        🪙 {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                    कितने लोगों को मिलेगा (Packet Count)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[3, 5, 10, 15, 25].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setPacketClaims(cnt)}
                        className={`px-2.5 py-1.5 rounded-lg font-mono font-black text-xs cursor-pointer border ${
                          packetClaims === cnt
                            ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                            : 'bg-white/10 text-white border-white/15'
                        }`}
                      >
                        {cnt} लोग
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <input
                type="text"
                value={packetMessage}
                onChange={(e) => setPacketMessage(e.target.value)}
                placeholder="पैकेट संदेश लिखें (जैसे: सबको पार्टी की बधाई!)..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-indigo-200/70 outline-none focus:border-amber-300"
              />

              <div className="flex items-center justify-end gap-2">
                {userCoins >= packetCoins ? (
                  <button
                    type="button"
                    disabled={droppingPacket || !onDropPacket}
                    onClick={handleLaunchPacketRain}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs text-white shadow-xl cursor-pointer flex items-center justify-center gap-2 ${
                      packetType === 'red'
                        ? 'bg-gradient-to-r from-rose-500 via-red-600 to-amber-500'
                        : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {droppingPacket
                        ? 'पैकेट बारिश शुरू हो रही है...'
                        : `${packetType === 'red' ? '🧧 Red' : '💠 Blue'} Packet Rain शुरू करें (${packetCoins} 🪙)`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBuyCoins?.();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    🪙 कॉइन्स कम हैं — Buy Coins करें
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Selected Gift Live Preview + Distinct Sound Test Bar */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/15">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-3xl">{selectedGift.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">
                      {selectedGift.hindiName} ({selectedGift.name})
                    </div>
                    <div className="text-[10px] text-amber-300 font-bold">
                      🪙 {selectedGift.coinCost} Coins · ✨ +{selectedGift.charmValue} Charms · 🎵 Unique Sound FX
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => sound8D.playGiftSound(selectedGift.id || selectedGift.animationType, 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-[10px] font-black flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Sound Test</span>
                </button>
              </div>

              {/* Luxury Gifts Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {categoryGifts.map((gift) => {
                  const isSelected = selectedGiftId === gift.id;
                  return (
                    <div
                      key={gift.id}
                      onClick={() => handleSelectGift(gift)}
                      className={`relative p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center justify-between text-center ${
                        isSelected
                          ? 'bg-gradient-to-b from-indigo-600/50 to-purple-600/50 border-amber-400 ring-2 ring-amber-400/60 shadow-lg scale-[1.02]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-indigo-400/50'
                      }`}
                    >
                      {gift.isNew && (
                        <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded-sm bg-rose-500 text-white">
                          NEW
                        </span>
                      )}
                      <div className="text-3xl my-1 drop-shadow">{gift.icon}</div>
                      <p className="text-[11px] font-black text-white truncate max-w-full">
                        {gift.hindiName}
                      </p>
                      <div className="mt-1 flex items-center space-x-1 text-[11px] font-mono font-black text-amber-300">
                        <span>🪙</span>
                        <span>{gift.coinCost.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-pink-300 font-bold">
                        ✨ +{gift.charmValue.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Combo Presets & Send Action */}
              <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1 no-scrollbar">
                  <span className="text-[11px] text-indigo-200 shrink-0 font-bold mr-1">कॉम्बो:</span>
                  {COMBO_MULTIPLIERS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setComboCount(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shrink-0 border ${
                        comboCount === num
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-amber-200 shadow'
                          : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
                      }`}
                    >
                      x{num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="text-right shrink-0 pr-1">
                    <div className="text-xs font-mono font-black text-amber-300">
                      🪙 {totalCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-pink-300 font-bold">
                      ✨ +{totalCharms.toLocaleString()} Charms
                    </div>
                  </div>

                  {canAfford ? (
                    <button
                      type="button"
                      onClick={handleSend}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-xl cursor-pointer bg-gradient-to-r from-[#fb641b] via-rose-500 to-amber-500 hover:brightness-110 text-white"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>गिफ्ट भेजें (x{comboCount})</span>
                    </button>
                  ) : onOpenBuyCoins ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenBuyCoins();
                      }}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition shadow cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>🪙 Buy Coins ({totalCost}c)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-xs bg-slate-700 text-slate-400 cursor-not-allowed"
                    >
                      कॉइन्स कम हैं!
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
