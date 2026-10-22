/**
 * Synthesizes soft, pleasant audio notifications using Web Audio API.
 * 100% self-contained, offline-compatible, no external audio files required.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays an interview alert chime: an energetic ascending major triad (C5 -> E5 -> G5)
 */
export function playInterviewChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, duration: 0.18, gain: 0.08 }, // C5
      { freq: 659.25, time: 0.12, duration: 0.22, gain: 0.09 }, // E5
      { freq: 783.99, time: 0.24, duration: 0.45, gain: 0.1 }, // G5
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(gain, now + time);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    // Autoplay restrictions or unsupported environment
  }
}

/**
 * Plays a deadline alert chime: crisp, clear double tap (A4 -> D5)
 */
export function playDeadlineChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 440.0, time: 0, duration: 0.15, gain: 0.07 }, // A4
      { freq: 587.33, time: 0.1, duration: 0.35, gain: 0.09 }, // D5
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(gain, now + time);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    // Autoplay restrictions or unsupported environment
  }
}

/**
 * Plays a subtle check/success chime
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {}
}
