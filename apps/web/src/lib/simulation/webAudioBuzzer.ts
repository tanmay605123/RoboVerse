'use client';

/**
 * RoboVerse Web Audio API Buzzer & Sound Synthesizer
 * Produces authentic square-wave tones when active buzzers or piezo elements
 * are energized during simulation, with pitch and volume control and a global mute toggle.
 */

class WebAudioBuzzerManager {
  private audioCtx: AudioContext | null = null;
  private activeOscillators: Map<string, { osc: OscillatorNode; gain: GainNode }> = new Map();
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.15, this.audioCtx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playTone(buzzerId: string, frequencyHz = 2500): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    if (this.activeOscillators.has(buzzerId)) {
      // Already buzzing, update frequency if needed
      const existing = this.activeOscillators.get(buzzerId)!;
      existing.osc.frequency.setValueAtTime(frequencyHz, ctx.currentTime);
      return;
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square'; // Authentic piezo buzzer timbre
      osc.frequency.setValueAtTime(frequencyHz, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeOscillators.set(buzzerId, { osc, gain });
    } catch (e) {
      console.warn('WebAudio buzzer start failed:', e);
    }
  }

  public stopTone(buzzerId: string): void {
    const existing = this.activeOscillators.get(buzzerId);
    if (!existing || !this.audioCtx) return;

    try {
      existing.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      existing.osc.stop(this.audioCtx.currentTime + 0.02);
      existing.osc.disconnect();
    } catch (e) {
      // Ignore if already stopped
    } finally {
      this.activeOscillators.delete(buzzerId);
    }
  }

  public stopAll(): void {
    this.activeOscillators.forEach((_, id) => this.stopTone(id));
    this.activeOscillators.clear();
  }
}

export const buzzerAudio = new WebAudioBuzzerManager();
