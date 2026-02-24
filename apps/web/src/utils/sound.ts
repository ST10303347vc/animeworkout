import { useStore } from '@/stores/useStore';

// In a real app we would have actual mp3/wav files in the public/audio folder.
// Since we don't have those, we will generate simple synthetic beeps for UI feedback using browser AudioContext
// Alternatively, Howler can use base64 data URIs. For Phase 3 simulation, we'll try to generate simple beeps.

class SoundManager {
    private ac: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        // We will init AudioContext on first interaction
    }

    private getContext(): AudioContext {
        if (!this.ac) {
            this.ac = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.ac;
    }

    public syncSettings() {
        this.enabled = useStore.getState().soundEnabled;
    }

    private playTone(frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error('Audio issue', e);
        }
    }

    playClick() {
        this.syncSettings();
        if (!this.enabled) return;
        // High pitched short beep
        this.playTone(800, 'sine', 0.1, 0.05);
    }

    playHover() {
        this.syncSettings();
        if (!this.enabled) return;
        // Soft low pop
        this.playTone(400, 'sine', 0.05, 0.02);
    }

    playLevelUp() {
        this.syncSettings();
        if (!this.enabled) return;
        // Arpeggio
        this.playTone(523.25, 'square', 0.2, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'square', 0.2, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'square', 0.4, 0.1), 200); // G5
        setTimeout(() => this.playTone(1046.50, 'square', 0.6, 0.15), 300); // C6
    }

    playTimerTick() {
        this.syncSettings();
        if (!this.enabled) return;
        this.playTone(600, 'triangle', 0.05, 0.05);
    }

    playTimerEnd() {
        this.syncSettings();
        if (!this.enabled) return;
        this.playTone(800, 'square', 0.5, 0.1);
        setTimeout(() => this.playTone(800, 'square', 0.5, 0.1), 600);
    }
}

export const soundFx = new SoundManager();
