/**
 * 8D Spatial Audio Synthesizer using Web Audio API
 * Provides true binaural circular panning, stereo depth, and gaming sound effects.
 */

class Sound8DService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientPanner: StereoPannerNode | null = null;
  private panAngle: number = 0;
  private panInterval: number | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop8DAmbient();
    }
  }

  /**
   * Play an 8D chime with dynamic left-to-right stereo panning
   */
  public play8DChime(baseFreq = 440, type: 'win' | 'click' | 'roll' | 'spy' | 'mic' = 'click') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      const now = this.ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        if (panner) {
          panner.pan.setValueAtTime(-0.8, now);
          panner.pan.linearRampToValueAtTime(0.8, now + 0.15);
        }
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.setValueAtTime(baseFreq * 1.25, now + 0.1);
        osc.frequency.setValueAtTime(baseFreq * 1.5, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        if (panner) {
          panner.pan.setValueAtTime(-1, now);
          panner.pan.linearRampToValueAtTime(1, now + 0.2);
          panner.pan.linearRampToValueAtTime(0, now + 0.4);
        }
      } else if (type === 'roll') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        if (panner) {
          panner.pan.setValueAtTime(0.7, now);
          panner.pan.linearRampToValueAtTime(-0.7, now + 0.25);
        }
      } else if (type === 'spy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        if (panner) {
          panner.pan.setValueAtTime(-0.9, now);
          panner.pan.linearRampToValueAtTime(0.9, now + 0.35);
        }
      } else if (type === 'mic') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      }

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      // AudioContext policy safe catch
    }
  }

  /**
   * Start 8D rotating ambient audio background for gaming rooms
   */
  public start8DAmbient() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ambientOsc) return; // Already playing

      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      this.ambientPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(120, this.ctx.currentTime); // Relaxing warm bass hum
      this.ambientGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      if (this.ambientPanner) {
        this.ambientOsc.connect(this.ambientGain);
        this.ambientGain.connect(this.ambientPanner);
        this.ambientPanner.connect(this.ctx.destination);

        // Circular 8D Panning loop (rotates around your head every 4 seconds)
        this.panAngle = 0;
        this.panInterval = window.setInterval(() => {
          if (this.ambientPanner && this.ctx) {
            this.panAngle += 0.05;
            const panVal = Math.sin(this.panAngle);
            this.ambientPanner.pan.setValueAtTime(panVal, this.ctx.currentTime);
          }
        }, 50);
      } else {
        this.ambientOsc.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);
      }

      this.ambientOsc.start();
    } catch {}
  }

  public stop8DAmbient() {
    if (this.panInterval) {
      clearInterval(this.panInterval);
      this.panInterval = null;
    }
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {}
      this.ambientOsc = null;
    }
    this.ambientGain = null;
    this.ambientPanner = null;
  }

  /**
   * Play distinct synthesized 8D sound signature per Gift ID / Animation Type & Combo Level
   */
  public playGiftSound(giftKey: string, comboCount = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const pitchShift = Math.min(1.5, 1 + Math.max(0, comboCount - 1) * 0.055);
      const key = String(giftKey || '').toLowerCase();

      const scheduleTone = (
        freq: number,
        delaySec: number,
        durationSec: number,
        wave: OscillatorType = 'sine',
        vol = 0.2,
        panPos = 0,
        slideToFreq?: number
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        osc.type = wave;
        osc.frequency.setValueAtTime(freq * pitchShift, now + delaySec);
        if (slideToFreq) {
          osc.frequency.exponentialRampToValueAtTime(
            Math.max(40, slideToFreq * pitchShift),
            now + delaySec + durationSec
          );
        }
        gain.gain.setValueAtTime(0.001, now + delaySec);
        gain.gain.linearRampToValueAtTime(vol, now + delaySec + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delaySec + durationSec);

        if (panner) {
          panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panPos)), now + delaySec);
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(ctx.destination);
        } else {
          osc.connect(gain);
          gain.connect(ctx.destination);
        }
        osc.start(now + delaySec);
        osc.stop(now + delaySec + durationSec + 0.02);
      };

      if (key.includes('red_packet') || key.includes('blue_packet') || key.includes('packet')) {
        // Festive Coin Rain & Jingle
        const freqs = key.includes('blue')
          ? [659, 880, 1046, 1318, 1568, 1760]
          : [587, 784, 988, 1174, 1568, 1975];
        freqs.forEach((f, idx) => {
          scheduleTone(f, idx * 0.06, 0.22, 'triangle', 0.2, idx % 2 === 0 ? -0.75 : 0.75);
        });
      } else if (key.includes('ferrari') || key.includes('lux_1') || key.includes('car')) {
        // Sports car engine rev + horn double chime
        scheduleTone(95, 0, 0.28, 'sawtooth', 0.16, -0.7, 260);
        scheduleTone(160, 0.22, 0.32, 'sawtooth', 0.18, 0.7, 420);
        scheduleTone(660, 0.5, 0.12, 'triangle', 0.18, 0);
        scheduleTone(880, 0.63, 0.2, 'triangle', 0.2, 0);
      } else if (key.includes('helicopter') || key.includes('yacht') || key.includes('lux_4') || key.includes('lux_5')) {
        // Rotor pulse / Cruise horn
        for (let i = 0; i < 5; i++) {
          scheduleTone(130 + i * 18, i * 0.09, 0.08, 'sawtooth', 0.12, i % 2 === 0 ? -0.6 : 0.6);
        }
        scheduleTone(392, 0.48, 0.35, 'triangle', 0.22, 0);
        scheduleTone(523, 0.56, 0.4, 'sine', 0.2, 0);
      } else if (key.includes('rocket') || key.includes('firecracker') || key.includes('diwali_4') || key.includes('diwali_5')) {
        // Ascending rocket whistle + firework crackle bursts
        scheduleTone(280, 0, 0.35, 'sine', 0.2, -0.5, 1450);
        [180, 620, 310, 950, 440, 1280].forEach((f, i) => {
          scheduleTone(f, 0.36 + i * 0.055, 0.14, 'square', 0.12, (i % 2 === 0 ? -1 : 1) * 0.85, f * 0.5);
        });
      } else if (key.includes('diya') || key.includes('sparkler') || key.includes('chakri') || key.includes('diwali')) {
        // Sparkle festival sitar/bell shimmer
        [523, 659, 784, 1046, 1318].forEach((f, i) => {
          scheduleTone(f, i * 0.07, 0.25, 'sine', 0.18, -0.8 + i * 0.4);
        });
      } else if (key.includes('dragon') || key.includes('galaxy') || key.includes('throne') || key.includes('castle') || key.includes('myth') || key.includes('lux_3')) {
        // Mythic Emperor Brass & Cosmic Chord Swell
        scheduleTone(196, 0, 0.65, 'sawtooth', 0.13, -0.5);
        scheduleTone(293.6, 0.08, 0.6, 'triangle', 0.18, 0);
        scheduleTone(440, 0.16, 0.55, 'triangle', 0.2, 0.5);
        scheduleTone(587.3, 0.25, 0.5, 'sine', 0.22, 0);
        scheduleTone(880, 0.35, 0.48, 'sine', 0.18, -0.3);
      } else if (key.includes('crown') || key.includes('tiara') || key.includes('ring') || key.includes('lux_2') || key.includes('pop_5')) {
        // Diamond Crown Crystal Cascade
        [784, 988, 1175, 1568, 1975].forEach((f, i) => {
          scheduleTone(f, i * 0.055, 0.28, 'sine', 0.18, i % 2 === 0 ? -0.6 : 0.6);
        });
      } else if (key.includes('rose') || key.includes('letter') || key.includes('birds') || key.includes('teddy') || key.includes('rom')) {
        // Romance Harp Strum
        [440, 554.37, 659.25, 880].forEach((f, i) => {
          scheduleTone(f, i * 0.08, 0.34, 'sine', 0.17, -0.6 + i * 0.4);
        });
      } else if (key.includes('cake') || key.includes('chocolate') || key.includes('tea')) {
        // Cheerful Party Chord
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          scheduleTone(f, i * 0.075, 0.24, 'triangle', 0.19, (i - 1.5) * 0.45);
        });
      } else {
        // Candy / Popular Pop Sparkle
        scheduleTone(587, 0, 0.12, 'sine', 0.18, -0.6, 880);
        scheduleTone(880, 0.09, 0.18, 'triangle', 0.18, 0.6, 1174);
      }
    } catch {
      // Safe fallback under autoplay restrictions
    }
  }
}

export const sound8D = new Sound8DService();
