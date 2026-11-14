import React, { useState } from 'react';
import { 
  Mic, Volume2, Sparkles, X, Check, Play, 
  Radio, Disc, Bot, Waves, Shield
} from 'lucide-react';

export type VoiceEffectType = 'normal' | 'robot' | 'deep' | 'chipmunk' | 'radio' | 'echo';

export interface VoiceEffectConfig {
  id: VoiceEffectType;
  name: string;
  hindiName: string;
  icon: string;
  description: string;
  hindiDescription: string;
  ttsPitch: number;
  ttsRate: number;
  samplePhrase: string;
  colorGradient: string;
  badge: string;
}

export const VOICE_EFFECTS: VoiceEffectConfig[] = [
  {
    id: 'normal',
    name: 'Natural Voice',
    hindiName: 'प्राकृतिक आवाज़',
    icon: '🎙️',
    description: 'Clean, unaltered original voice',
    hindiDescription: 'आपकी स्वाभाविक व स्पष्ट मूल आवाज़',
    ttsPitch: 1.0,
    ttsRate: 1.0,
    samplePhrase: 'नमस्ते दोस्तों! यह मेरी सामान्य प्राकृतिक आवाज़ है।',
    colorGradient: 'from-blue-50 to-white border-[#2874f0]',
    badge: 'ORIGINAL',
  },
  {
    id: 'robot',
    name: 'Robot Mech',
    hindiName: 'रोबोटिक आवाज़',
    icon: '🤖',
    description: 'Futuristic metallic synthetic android',
    hindiDescription: 'साइ-फ़ाई मेटैलिक मैकेनिकल रोबोटिक साउंड',
    ttsPitch: 0.45,
    ttsRate: 0.88,
    samplePhrase: 'सिस्टम एक्टिवेटेड। बीप बूप! मैं एक अत्याधुनिक गेमिंग रोबोट हूँ।',
    colorGradient: 'from-amber-50 to-white border-amber-400',
    badge: 'ROBOTIC',
  },
  {
    id: 'deep',
    name: 'Deep Bass',
    hindiName: 'गंभीर / भारी आवाज़',
    icon: '🐻',
    description: 'Deep, resonant bass radio announcer',
    hindiDescription: 'दमदार, भारी बेस और गंभीर आवाज़',
    ttsPitch: 0.58,
    ttsRate: 0.82,
    samplePhrase: 'सुनिए जनाब! यह है एक गहरी और दमदार आवाज़ का असर।',
    colorGradient: 'from-purple-50 to-white border-purple-400',
    badge: 'HEAVY BASS',
  },
  {
    id: 'chipmunk',
    name: 'Funny Chipmunk',
    hindiName: 'चिपमंक / कार्टून',
    icon: '🐿️',
    description: 'High-pitched funny cartoon squeak',
    hindiDescription: 'मज़ेदार, तीखी और कार्टून जैसी फनी आवाज़',
    ttsPitch: 1.85,
    ttsRate: 1.35,
    samplePhrase: 'अरे वाह! मैं तो छोटा सा नटखट चिपमंक बन गया! हाहाहा!',
    colorGradient: 'from-pink-50 to-white border-pink-400',
    badge: 'HIGH PITCH',
  },
  {
    id: 'radio',
    name: 'Walkie Radio',
    hindiName: 'वॉकी-टॉकी रेडियो',
    icon: '📻',
    description: 'Military comms bandpass squelch',
    hindiDescription: 'मिलिट्री कमांड व वॉकी-टॉकी रेडियो फ़िल्टर',
    ttsPitch: 1.15,
    ttsRate: 1.1,
    samplePhrase: 'अल्फा टू चार्ली... क्या आपको संदेश मिल रहा है? ओवर एंड आउट!',
    colorGradient: 'from-emerald-50 to-white border-emerald-500',
    badge: 'RADIO COMMS',
  },
  {
    id: 'echo',
    name: 'Stadium Echo',
    hindiName: 'स्टेडियम गूंज',
    icon: '🏟️',
    description: 'Grand arena reverberation & echo',
    hindiDescription: 'बड़े स्टेडियम और हॉल जैसी भव्य गूंज',
    ttsPitch: 0.95,
    ttsRate: 0.95,
    samplePhrase: 'स्वागत है आपका! पूरे स्टेडियम में गूंज रही है यह आवाज़!',
    colorGradient: 'from-indigo-50 to-white border-indigo-400',
    badge: 'ARENA ECHO',
  },
];

interface VoiceEffectSelectorProps {
  currentEffect: VoiceEffectType;
  onSelectEffect: (effect: VoiceEffectType) => void;
  isModal?: boolean;
  onClose?: () => void;
  onConfirmJoinSeat?: () => void;
  seatIndexToJoin?: number | null;
}

export const VoiceEffectSelector: React.FC<VoiceEffectSelectorProps> = ({
  currentEffect,
  onSelectEffect,
  isModal = false,
  onClose,
  onConfirmJoinSeat,
  seatIndexToJoin,
}) => {
  const [testingId, setTestingId] = useState<VoiceEffectType | null>(null);

  // Play a live simulated preview using Web Speech API + Web Audio Synthesizer
  const handleTestEffect = (config: VoiceEffectConfig, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTestingId(config.id);

    try {
      // 1. Play chime tuned to effect
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (config.id === 'robot') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(350, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        } else if (config.id === 'chipmunk') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.2);
        } else if (config.id === 'deep') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, ctx.currentTime);
        }

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }

      // 2. Play speech preview with exact modulated pitch & rate
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(config.samplePhrase);
        utter.pitch = config.ttsPitch;
        utter.rate = config.ttsRate;
        utter.lang = 'hi-IN';
        utter.onend = () => setTestingId(null);
        utter.onerror = () => setTestingId(null);
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => setTestingId(null), 2500);
      }
    } catch {
      setTestingId(null);
    }
  };

  const content = (
    <div className="space-y-3.5 text-[#212121]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-sm bg-[#f5f8ff] text-[#2874f0] border border-blue-200">
            <Waves className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#212121] flex items-center gap-1.5 flex-wrap">
              <span>वॉइस इफ़ेक्ट मॉडिफायर (Voice Effect Selector)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#388e3c] text-white font-mono font-bold">
                LIVE
              </span>
            </h4>
            <p className="text-[11px] text-slate-600">
              स्टेज पर बोलने से पहले अपनी आवाज़ का मनपसंद इफ़ेक्ट चुनें
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Effect Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {VOICE_EFFECTS.map((eff) => {
          const isSelected = currentEffect === eff.id;
          const isTesting = testingId === eff.id;

          return (
            <div
              key={eff.id}
              onClick={() => onSelectEffect(eff.id)}
              className={`p-3 rounded-md border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `bg-gradient-to-br ${eff.colorGradient} ring-1 ring-[#2874f0] shadow-xs scale-[1.02]`
                  : 'bg-white hover:bg-[#f9fafb] border-slate-200 hover:border-[#2874f0]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2874f0] text-white flex items-center justify-center text-[10px] shadow-2xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{eff.icon}</span>
                  <div>
                    <h5 className="text-xs font-black text-[#212121] leading-tight">{eff.name}</h5>
                    <span className="text-[9px] text-slate-500 block font-medium">{eff.hindiName}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                  {eff.hindiDescription}
                </p>
              </div>

              {/* Pitch bar & Test Button */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[#f5f8ff] text-[#2874f0] border border-blue-200">
                  {eff.badge}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleTestEffect(eff, e)}
                  className={`px-2 py-0.5 rounded-xs text-[9px] font-bold flex items-center space-x-1 transition cursor-pointer ${
                    isTesting
                      ? 'bg-[#ffe500] text-[#212121] animate-pulse font-black'
                      : 'bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300'
                  }`}
                  title="इस इफ़ेक्ट की आवाज़ सुनें"
                >
                  <Volume2 className="w-3 h-3 text-[#2874f0]" />
                  <span>{isTesting ? 'सुन रहे हैं...' : 'टेस्ट सुनें'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Pre-Join Confirmation Button */}
      {isModal && (
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-slate-600">
            चयनित: <strong className="text-[#2874f0] capitalize">{VOICE_EFFECTS.find(v => v.id === currentEffect)?.name} ({VOICE_EFFECTS.find(v => v.id === currentEffect)?.hindiName})</strong>
          </div>

          <div className="flex items-center space-x-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 text-[#212121] text-xs font-bold transition cursor-pointer"
              >
                रद्द करें
              </button>
            )}

            {onConfirmJoinSeat && (
              <button
                type="button"
                onClick={() => {
                  onConfirmJoinSeat();
                  if (onClose) onClose();
                }}
                className="px-4 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-white" />
                <span>
                  {typeof seatIndexToJoin === 'number'
                    ? `सीट #${seatIndexToJoin + 1} पर इफ़ेक्ट के साथ बैठें`
                    : 'इफ़ेक्ट लागू करें व माइक चालू करें'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 max-w-xl w-full shadow-xl relative text-[#212121] space-y-3">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-white rounded-md border border-slate-200 shadow-2xs">
      {content}
    </div>
  );
};
