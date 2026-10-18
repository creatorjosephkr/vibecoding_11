/**
 * Pure Web Audio API Sound Synthesizer
 * Generates beeps, transition tones, and celebratory fanfares without external audio files.
 */
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('pulse_is_muted') === 'true';
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('pulse_is_muted', String(muted));
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // 3, 2, 1 Warning Beep (880Hz / A5, short pulse)
  playWarningBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, this.audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.15);
  }

  // Transition Tone (1760Hz / A6, longer solid tone)
  playTransitionTone() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1760, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, this.audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.6);
  }

  // Work Started (Upbeat dual chirp)
  playWorkChirp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(1174.66, this.audioCtx.currentTime + 0.2); // D6

    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, this.audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }

  // Rest Started (Low dual pulse)
  playRestTone() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(329.63, this.audioCtx.currentTime + 0.25); // E4

    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, this.audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.32);
  }

  // Stage Completed / Waiting for Next Stage (Pleasant double ding: C6 -> E6)
  playStageCompleteTone() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [1046.50, 1318.51]; // C6, E6
    const startTime = this.audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.16);

      const noteStart = startTime + idx * 0.16;
      const duration = idx === 1 ? 0.6 : 0.18;

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.35, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + duration + 0.05);
    });
  }

  // Routine Completed (C Major Arpeggio Fanfare: C5 -> E5 -> G5 -> C6)
  playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = this.audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = idx === 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.15);

      const noteStart = startTime + idx * 0.15;
      const duration = idx === 3 ? 0.8 : 0.2;

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.35, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + duration + 0.05);
    });
  }
}

export const soundEngine = new SoundEngine();
