import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Tv, Music, Gamepad2, Disc, Sparkles, Maximize2, 
  RotateCw, Radio, Flame, Crown, Heart, Sliders, ChevronDown, ChevronUp
} from 'lucide-react';

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  hindiCategory: string;
  duration: string;
  genre: 'party' | 'dhol' | 'lofi' | 'royal' | 'gaming' | 'acoustic';
  bpm: number;
  coverGradient: string;
  visualTheme: 'neon_disco' | 'arcade_retro' | 'cosmic_star' | 'laser_edm';
}

export const STAGE_PLAYLIST: MediaTrack[] = [
  {
    id: 'track-1',
    title: 'Bollywood Disco Night',
    artist: 'ESP Club DJ Remix',
    hindiCategory: 'पार्टी डीजे रीमिक्स',
    duration: '3:45',
    genre: 'party',
    bpm: 128,
    coverGradient: 'from-pink-600 via-rose-600 to-amber-500',
    visualTheme: 'neon_disco',
  },
  {
    id: 'track-2',
    title: 'Punjabi Dhol Beats',
    artist: 'Bhangra Energy King',
    hindiCategory: 'पंजाबी ढोल बीट्स',
    duration: '4:10',
    genre: 'dhol',
    bpm: 135,
    coverGradient: 'from-amber-500 via-orange-600 to-red-600',
    visualTheme: 'laser_edm',
  },
  {
    id: 'track-3',
    title: 'Late Night Lofi Chai',
    artist: 'ChitChat Chill Vibes',
    hindiCategory: 'लो-फाई रिलैक्स',
    duration: '3:15',
    genre: 'lofi',
    bpm: 85,
    coverGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    visualTheme: 'cosmic_star',
  },
  {
    id: 'track-4',
    title: 'Sharma Ji Royal Entry',
    artist: 'ESP PLAY Emperor Symphony',
    hindiCategory: 'शाही राजदरबार थीम',
    duration: '2:50',
    genre: 'royal',
    bpm: 110,
    coverGradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    visualTheme: 'neon_disco',
  },
  {
    id: 'track-5',
    title: 'ESP PLAY Cyber Gaming Anthem',
    artist: 'Electro Bass Surge',
    hindiCategory: 'ई-स्पोर्ट्स गेमिंग साउंडट्रैक',
    duration: '3:30',
    genre: 'gaming',
    bpm: 140,
    coverGradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    visualTheme: 'arcade_retro',
  },
  {
    id: 'track-6',
    title: 'Desi Acoustic Melody',
    artist: 'Acoustic Guitar Strings',
    hindiCategory: 'देसी मेलोडी अनप्लग्ड',
    duration: '3:05',
    genre: 'acoustic',
    bpm: 95,
    coverGradient: 'from-teal-500 via-emerald-600 to-cyan-700',
    visualTheme: 'cosmic_star',
  },
];

interface VoiceRoomMediaStageProps {
  isHost: boolean;
  onOpenSpyGame: () => void;
  onOpenWerewolfGame: () => void;
  onOpenDailySpin: () => void;
  onOpenStageGameOverlay: () => void;
  onSoundboardEffect: (emoji: string, label: string) => void;
}

export const VoiceRoomMediaStage: React.FC<VoiceRoomMediaStageProps> = ({
  isHost,
  onOpenSpyGame,
  onOpenWerewolfGame,
  onOpenDailySpin,
  onOpenStageGameOverlay,
  onSoundboardEffect,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'music' | 'video' | 'games'>('music');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const beatTimerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentTrack = STAGE_PLAYLIST[currentTrackIndex];

  // Procedural Web Audio Beat Synthesizer (Ensures 100% reliable real audio without 404/CORS issues)
  const playSynthesizedBeat = (beatIndex: number) => {
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const effectiveVol = isMuted ? 0 : volume * 0.35;
      if (effectiveVol <= 0) return;

      const now = ctx.currentTime;
      const bpm = currentTrack.bpm;

      // 1. Bass drum / Kick on every quarter beat (0, 2)
      if (beatIndex % 2 === 0) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.connect(kickGain);
        kickGain.connect(ctx.destination);

        const startFreq = currentTrack.genre === 'dhol' ? 180 : currentTrack.genre === 'royal' ? 140 : 150;
        kickOsc.frequency.setValueAtTime(startFreq, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        kickGain.gain.setValueAtTime(effectiveVol, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        kickOsc.start(now);
        kickOsc.stop(now + 0.14);
      }

      // 2. Snare / Clap on beat 1, 3
      if (beatIndex % 2 === 1) {
        const snareOsc = ctx.createOscillator();
        const snareGain = ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.connect(snareGain);
        snareGain.connect(ctx.destination);

        snareOsc.frequency.setValueAtTime(250, now);
        snareOsc.frequency.linearRampToValueAtTime(100, now + 0.08);
        snareGain.gain.setValueAtTime(effectiveVol * 0.8, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        snareOsc.start(now);
        snareOsc.stop(now + 0.09);
      }

      // 3. Melodic Chord / Synth Lead
      const chordNotes = currentTrack.genre === 'royal' 
        ? [440, 554, 659, 880] 
        : currentTrack.genre === 'lofi' 
        ? [330, 392, 493, 587] 
        : [523, 659, 783, 1046];

      const note = chordNotes[beatIndex % chordNotes.length];
      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = currentTrack.genre === 'gaming' ? 'sawtooth' : 'sine';
      leadOsc.connect(leadGain);
      leadGain.connect(ctx.destination);

      leadOsc.frequency.setValueAtTime(note, now);
      leadGain.gain.setValueAtTime(effectiveVol * 0.45, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + (60 / bpm) * 0.7);
      leadOsc.start(now);
      leadOsc.stop(now + (60 / bpm) * 0.7);

    } catch (e) {
      // Audio synth note
    }
  };

  // Music Playback Beat Engine
  useEffect(() => {
    if (isPlaying) {
      let beat = 0;
      const bpm = currentTrack.bpm;
      const intervalMs = (60 / bpm) * 500; // 8th note interval

      beatTimerRef.current = setInterval(() => {
        playSynthesizedBeat(beat);
        beat = (beat + 1) % 16;
        setPlaybackProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
      }, intervalMs);

      return () => {
        if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      };
    } else {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    }
  }, [isPlaying, currentTrackIndex, volume, isMuted]);

  // Video / Visualizer Canvas Animation Loop (60 FPS Party Screen)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const renderVisualizer = () => {
      time += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic stage backdrop
      ctx.fillStyle = '#060a1c';
      ctx.fillRect(0, 0, w, h);

      if (currentTrack.visualTheme === 'neon_disco') {
        // Neon Disco Waves
        const bars = 28;
        const barW = w / bars;
        for (let i = 0; i < bars; i++) {
          const amp = isPlaying ? Math.sin(time * 3 + i * 0.4) * 0.5 + 0.5 : 0.15;
          const barH = amp * (h * 0.75);
          const hue = (time * 40 + i * 12) % 360;

          ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.85)`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `hsl(${hue}, 90%, 50%)`;
          ctx.fillRect(i * barW + 2, h - barH, barW - 4, barH);
        }
        ctx.shadowBlur = 0;
      } else if (currentTrack.visualTheme === 'laser_edm') {
        // Laser EDM Stage Light Beams
        const centerX = w / 2;
        const beamCount = 8;
        for (let i = 0; i < beamCount; i++) {
          const angle = (time * 1.5 + i * (Math.PI / 4)) % (Math.PI * 2);
          const x = centerX + Math.cos(angle) * (w * 0.48);
          const y = h * 0.85 + Math.sin(angle) * (h * 0.3);

          ctx.strokeStyle = i % 2 === 0 ? '#f59e0b' : '#ec4899';
          ctx.lineWidth = isPlaying ? 3 : 1;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#fbbf24';

          ctx.beginPath();
          ctx.moveTo(centerX, 20);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      } else if (currentTrack.visualTheme === 'cosmic_star') {
        // Cosmic Starfield with Pulse
        for (let i = 0; i < 40; i++) {
          const sx = (Math.sin(i * 17 + time * 0.5) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 23 + time * 0.3) * 0.5 + 0.5) * h;
          const size = ((i % 3) + 1) * (isPlaying ? 1.5 : 1);

          ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : i % 2 === 0 ? '#a855f7' : '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Arcade 8-Bit Grid Lines
        const gridLines = 14;
        for (let i = 0; i < gridLines; i++) {
          const y = (h / gridLines) * i;
          ctx.strokeStyle = `rgba(6, 182, 212, ${isPlaying ? 0.35 : 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        // Equalizer center wave
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x += 5) {
          const y = h / 2 + Math.sin(x * 0.05 + time * 4) * (isPlaying ? 25 : 5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(renderVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(renderVisualizer);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentTrackIndex]);

  const handleNextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % STAGE_PLAYLIST.length);
    setPlaybackProgress(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + STAGE_PLAYLIST.length) % STAGE_PLAYLIST.length);
    setPlaybackProgress(0);
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 p-3.5 sm:p-4 shadow-sm relative overflow-hidden text-[#212121] transition-all">
      {/* Top Media Center Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-[#2874f0] shadow-xs">
            <Tv className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-xs sm:text-sm text-[#212121] flex items-center gap-1.5">
                <span>ESP PLAY MULTIMEDIA STAGE</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-[#388e3c] font-bold border border-emerald-200">
                  {isPlaying ? 'ON AIR' : 'LIVE'}
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-[#878787]">
              गाने सुनें, वीडियो देखें और पार्टी गेम्स खेलें (Room BGM & Screen)
            </p>
          </div>
        </div>

        {/* Tab Switcher & Collapse */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => { setActiveMediaTab('music'); setIsCollapsed(false); }}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer ${
              activeMediaTab === 'music'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'bg-[#f1f3f6] text-[#212121] border border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Music className="w-3 h-3" />
            <span>म्यूज़िक (Music)</span>
          </button>

          <button
            onClick={() => { setActiveMediaTab('video'); setIsCollapsed(false); }}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer ${
              activeMediaTab === 'video'
                ? 'bg-[#fb641b] text-white shadow-xs'
                : 'bg-[#f1f3f6] text-[#212121] border border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span>वीडियो स्क्रीन (Video)</span>
          </button>

          <button
            onClick={() => { setActiveMediaTab('games'); setIsCollapsed(false); }}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer ${
              activeMediaTab === 'games'
                ? 'bg-[#388e3c] text-white shadow-xs'
                : 'bg-[#f1f3f6] text-[#212121] border border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Gamepad2 className="w-3 h-3" />
            <span>पार्टी गेम्स (Games)</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-500 hover:text-[#212121] hover:bg-[#f1f3f6] ml-1 cursor-pointer"
            title={isCollapsed ? 'विस्तार करें' : 'छोटा करें'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Expandable Body */}
      {!isCollapsed && (
        <div className="mt-3 space-y-3 animate-fadeIn">
          
          {/* TAB 1: MUSIC JUKEBOX & DJ DECK */}
          {activeMediaTab === 'music' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Left Col: Now Playing Disc & Track Info */}
              <div className="md:col-span-2 bg-[#f5f8ff] p-3.5 rounded-md border border-blue-200 flex flex-col justify-between space-y-2.5">
                <div className="flex items-center space-x-3">
                  {/* Rotating Vinyl Disc */}
                  <div className={`relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr ${currentTrack.coverGradient} shadow-sm shrink-0 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                    <div className="w-full h-full rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Disc className="w-6 h-6 text-[#ffe500]" />
                    </div>
                    <div className="absolute w-3 h-3 rounded-full bg-white shadow" />
                  </div>

                  {/* Track Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#212121] truncate">
                        {currentTrack.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffe500] text-[#212121] font-bold shrink-0">
                        {currentTrack.bpm} BPM
                      </span>
                    </div>
                    <div className="text-[11px] text-[#2874f0] font-semibold truncate">
                      {currentTrack.artist} • {currentTrack.hindiCategory}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-1.5 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#2874f0] transition-all duration-300" 
                        style={{ width: `${playbackProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Player Controls & Volume */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevTrack}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 text-[#212121] border border-slate-300 cursor-pointer"
                      title="पिछला गाना"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-4 py-1.5 rounded font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer ${
                        isPlaying 
                          ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                          : 'bg-[#fb641b] hover:bg-[#e8550f] text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'रोकें (Pause)' : 'बजाएं (Play)'}</span>
                    </button>

                    <button
                      onClick={handleNextTrack}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 text-[#212121] border border-slate-300 cursor-pointer"
                      title="अगला गाना"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center space-x-1.5 text-xs text-[#212121]">
                    <button 
                      onClick={() => setIsMuted(!isMuted)} 
                      className="text-slate-600 hover:text-[#2874f0] cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-[#2874f0]" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={e => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-16 sm:w-20 accent-[#2874f0] h-1 rounded-lg bg-slate-200"
                    />
                    <span className="font-mono text-[10px] w-6 text-[#555555]">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
                  </div>
                </div>
              </div>

              {/* Right Col: Playlist Selector */}
              <div className="bg-[#f9fafb] p-3 rounded-md border border-slate-200 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-[#555555] mb-1.5 flex items-center justify-between">
                  <span>रूम प्लेलिस्ट ({STAGE_PLAYLIST.length} ट्रैक्स):</span>
                  <span className="text-[#2874f0]">DJ Sync</span>
                </div>

                <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar pr-0.5">
                  {STAGE_PLAYLIST.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        setIsPlaying(true);
                        setPlaybackProgress(0);
                      }}
                      className={`w-full p-1.5 rounded text-left text-[11px] font-semibold flex items-center justify-between transition cursor-pointer ${
                        currentTrackIndex === idx
                          ? 'bg-[#2874f0] text-white font-bold'
                          : 'bg-white text-[#212121] border border-slate-200 hover:bg-[#f5f8ff]'
                      }`}
                    >
                      <div className="truncate flex items-center space-x-1.5">
                        <span className={currentTrackIndex === idx ? 'text-[#ffe500]' : 'text-[#fb641b]'}>{currentTrackIndex === idx && isPlaying ? '▶' : `${idx + 1}.`}</span>
                        <span className="truncate">{t.title}</span>
                      </div>
                      <span className={`font-mono text-[9px] shrink-0 ml-1 ${currentTrackIndex === idx ? 'text-blue-100' : 'text-[#878787]'}`}>{t.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYNCHRONIZED STAGE VIDEO SCREEN */}
          {activeMediaTab === 'video' && (
            <div className="space-y-2">
              <div className="relative w-full h-44 sm:h-56 rounded-md overflow-hidden border border-slate-300 bg-[#060a1c] shadow-inner flex flex-col items-center justify-center">
                {/* 60 FPS Visual Canvas Player */}
                <canvas 
                  ref={canvasRef} 
                  width={640} 
                  height={260} 
                  className="w-full h-full object-cover"
                />

                {/* Video Overlay Top Badge */}
                <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded bg-white/95 text-[#212121] text-[10px] font-bold border border-slate-200 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>STAGE SCREEN: {currentTrack.title}</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-bold shadow-sm">
                    {currentTrack.hindiCategory}
                  </span>
                </div>

                {/* Video Bottom Play Controls Bar */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between p-2 rounded bg-white/95 border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded bg-[#fb641b] text-white font-bold hover:bg-[#e8550f] transition cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[11px] font-bold text-[#212121]">
                      {isPlaying ? 'स्क्रीन लाइव चल रही है' : 'वीडियो रुका हुआ है'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleNextTrack}
                      className="px-2.5 py-1 rounded bg-[#2874f0] hover:bg-[#1c62d6] text-[10px] font-bold text-white cursor-pointer"
                    >
                      रील्स बदलें ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUICK PARTY GAMEPLAY LAUNCHER */}
          {activeMediaTab === 'games' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Game 1: Who is the Spy */}
              <div 
                onClick={onOpenSpyGame}
                className="bg-[#f5f8ff] p-3 rounded-md border border-blue-200 hover:border-[#2874f0] shadow-xs cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">🕵️</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#2874f0] text-white">
                      NEW ESP PLAY
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#212121]">
                    जासूस कौन है? (Who is the Spy?)
                  </div>
                  <p className="text-[11px] text-[#555555] mt-0.5">
                    गुप्त पहचान, शब्द के संकेत व वोटिंग से जासूस को बेनकाब करें!
                  </p>
                </div>
                <button className="mt-2 w-full py-1.5 rounded bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold text-[11px]">
                  अभी खेलें ➔
                </button>
              </div>

              {/* Game 2: Werewolf ESP PLAY */}
              <div 
                onClick={onOpenWerewolfGame}
                className="bg-purple-50 p-3 rounded-md border border-purple-200 hover:border-purple-500 shadow-xs cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">🐺</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white">
                      NIGHT PARTY
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#212121]">
                    भेड़िया गेम (Werewolf)
                  </div>
                  <p className="text-[11px] text-[#555555] mt-0.5">
                    रात में शिकार, दिन में अदालत! भेड़िया ढूंढें या गांव बचाएं!
                  </p>
                </div>
                <button className="mt-2 w-full py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px]">
                  भेड़िया रूम ➔
                </button>
              </div>

              {/* Game 3: Daily Lucky Spin */}
              <div 
                onClick={onOpenDailySpin}
                className="bg-amber-50 p-3 rounded-md border border-amber-200 hover:border-amber-500 shadow-xs cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">🎰</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#ffe500] text-[#212121]">
                      24H REWARD
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#212121]">
                    डेली लकी स्पिन (Lucky Wheel)
                  </div>
                  <p className="text-[11px] text-[#555555] mt-0.5">
                    50 कॉइन्स से घुमाएं और 500 कॉइन्स + चार्म्स जैकपॉट जीतें!
                  </p>
                </div>
                <button className="mt-2 w-full py-1.5 rounded bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-[11px]">
                  स्पिन व्हील ➔
                </button>
              </div>
            </div>
          )}

          {/* QUICK DJ SOUNDBOARD (Instant Room Sound Effects) */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[11px] text-[#555555] font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#fb641b]" />
              <span>DJ साउंडबोर्ड:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1">
              {[
                { emoji: '👏', label: 'ताली (Applause)' },
                { emoji: '📣', label: 'एयर हॉर्न (Air Horn)' },
                { emoji: '🥁', label: 'ड्रम रोल (Drumroll)' },
                { emoji: '🥳', label: 'चीयर्स (Cheer)' },
                { emoji: '🤣', label: 'हंसी (Laugh)' },
                { emoji: '🔔', label: 'घंटी (Chime)' },
              ].map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSoundboardEffect(s.emoji, s.label)}
                  className="px-2 py-0.5 rounded bg-[#f1f3f6] hover:bg-[#f5f8ff] border border-slate-300 hover:border-[#2874f0] text-[10px] font-semibold transition flex items-center space-x-1 cursor-pointer text-[#212121]"
                >
                  <span>{s.emoji}</span>
                  <span>{s.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
