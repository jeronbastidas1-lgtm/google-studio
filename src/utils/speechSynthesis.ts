import { VoiceSettings } from '../types/bank';
import { playTransactionChime, triggerVibration, unlockAudio } from './soundEffects';

type SpeechStatusListener = (isSpeaking: boolean, currentText?: string) => void;

class VoiceManager {
  private listeners: Set<SpeechStatusListener> = new Set();
  private queue: string[] = [];
  private isProcessing = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    this.cachedVoices = window.speechSynthesis.getVoices();
    return this.cachedVoices;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0) {
      return this.loadVoices();
    }
    return this.cachedVoices;
  }

  public getSpanishVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    const spanish = all.filter(v => v.lang.toLowerCase().startsWith('es'));
    return spanish.length > 0 ? spanish : all;
  }

  public subscribe(listener: SpeechStatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(isSpeaking: boolean, text?: string) {
    this.listeners.forEach(fn => fn(isSpeaking, text));
  }

  /**
   * Speak a phrase immediately or enqueue it
   */
  public async speak(
    text: string,
    settings: VoiceSettings,
    playChimeFirst = true
  ): Promise<void> {
    if (!settings.enabled || !text.trim()) return;

    unlockAudio();

    if (settings.vibrationEnabled) {
      triggerVibration([120, 60, 120]);
    }

    if (playChimeFirst && settings.chimeEnabled && settings.chimeType !== 'none') {
      await playTransactionChime(settings.chimeType);
      // Brief pause for chime to ring before speech begins
      await new Promise(r => setTimeout(r, 450));
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported on this browser');
      return;
    }

    this.queue.push(text);
    if (!this.isProcessing) {
      this.processQueue(settings);
    }
  }

  private processQueue(settings: VoiceSettings) {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      this.notify(false);
      return;
    }

    this.isProcessing = true;
    const textToSpeak = this.queue.shift()!;

    // Cancel any stuck previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.currentUtterance = utterance;

    // Configure voice properties
    utterance.rate = Math.max(0.5, Math.min(2.0, settings.rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, settings.pitch));
    utterance.volume = Math.max(0, Math.min(1.0, settings.volume));

    // Match voice by URI or fallback to primary Spanish voice
    const voices = this.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (settings.voiceUri) {
      selectedVoice = voices.find(v => v.voiceURI === settings.voiceUri);
    }

    if (!selectedVoice) {
      // Find default Spanish voice (preferably Colombia, Mexico, Spain, or Latin America)
      selectedVoice = voices.find(v => v.lang === 'es-CO' || v.lang === 'es-MX' || v.lang === 'es-ES' || v.lang.startsWith('es'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'es-ES';
    }

    utterance.onstart = () => {
      this.notify(true, textToSpeak);
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      // Slight gap between queued items
      setTimeout(() => {
        this.processQueue(settings);
      }, 300);
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      // In headless browser environments or when canceled mid-speech, log as debug info
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis notice:', e.error || 'audio output unavailable in headless environment');
      }
      this.currentUtterance = null;
      setTimeout(() => {
        this.processQueue(settings);
      }, 100);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to speak utterance:', err);
      this.isProcessing = false;
      this.notify(false);
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.queue = [];
    this.isProcessing = false;
    this.notify(false);
  }
}

export const voiceManager = new VoiceManager();
