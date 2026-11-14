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
}

export const sound8D = new Sound8DService();
