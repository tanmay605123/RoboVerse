'use client';

/**
 * Web Audio Synthesizer for Realistic RoboVerse Lab Acoustics
 * Provides procedural synthesis for buzzers, motor hum, clicks,
 * and overcurrent burnout pop sounds.
 */

class LabAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private buzzerOscillator: OscillatorNode | null = null;
  private buzzerGain: GainNode | null = null;
  private motorOscillator: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play haptic snap/click sound when inserting jumper wire or component pin
   */
  public playSnapSound(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  public playWireSnap(): void {
    this.playSnapSound();
  }

  public playClick(): void {
    this.playButtonClick(true);
  }

  /**
   * Play tactile push button click (press & release)
   */
  public playButtonClick(isPress: boolean): void {
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const freq = isPress ? 440 : 520;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  }

  /**
   * Start or update continuous buzzer sound (e.g. 2.5kHz active buzzer or tone())
   */
  public startBuzzer(freqHz: number = 2500, volume: number = 0.15): void {
    const ctx = this.initContext();
    if (!ctx) return;

    if (!this.buzzerOscillator) {
      this.buzzerOscillator = ctx.createOscillator();
      this.buzzerGain = ctx.createGain();

      this.buzzerOscillator.type = 'square';
      this.buzzerOscillator.frequency.setValueAtTime(freqHz, ctx.currentTime);

      this.buzzerGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.buzzerGain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);

      this.buzzerOscillator.connect(this.buzzerGain);
      this.buzzerGain.connect(ctx.destination);

      this.buzzerOscillator.start();
    } else if (this.buzzerOscillator && this.buzzerGain) {
      this.buzzerOscillator.frequency.setTargetAtTime(freqHz, ctx.currentTime, 0.01);
      this.buzzerGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.01);
    }
  }

  public stopBuzzer(): void {
    if (this.buzzerOscillator && this.buzzerGain && this.ctx) {
      try {
        this.buzzerGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
        const osc = this.buzzerOscillator;
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_) {}
        }, 30);
      } catch (_) {}
      this.buzzerOscillator = null;
      this.buzzerGain = null;
    }
  }

  /**
   * Play catastrophic LED/Component Overcurrent Burnout Pop sound
   */
  public playBurnoutPop(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    // Fast white-noise burst + low frequency thud
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }
}

export const labAudio = new LabAudioSynthesizer();
