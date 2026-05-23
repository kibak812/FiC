import { useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@/types';

export type SoundCue =
  | 'ui'
  | 'start'
  | 'slot'
  | 'craft'
  | 'hit'
  | 'block'
  | 'reward'
  | 'bad'
  | 'win'
  | 'lose';

const clampVolume = (value: number): number => Math.min(1, Math.max(0, value));

const melody = [196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63];

export const useAudioEngine = (settings: GameSettings) => {
  const settingsRef = useRef(settings);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const musicStepRef = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const ensureAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!audioContextRef.current) {
      const AudioContextCtor = window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return null;
      audioContextRef.current = new AudioContextCtor();
    }

    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0
  ) => {
    const audioContext = ensureAudioContext();
    if (!audioContext || volume <= 0) return;

    const startTime = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.03);
  }, [ensureAudioContext]);

  const playNoise = useCallback((duration: number, volume: number) => {
    const audioContext = ensureAudioContext();
    if (!audioContext || volume <= 0) return;

    const sampleCount = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const buffer = audioContext.createBuffer(1, sampleCount, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }

    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audioContext.destination);
    source.start();
    source.stop(audioContext.currentTime + duration);
  }, [ensureAudioContext]);

  const resumeAudio = useCallback(() => {
    const audioContext = ensureAudioContext();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
  }, [ensureAudioContext]);

  const playSound = useCallback((cue: SoundCue) => {
    const currentSettings = settingsRef.current;
    if (!currentSettings.soundEnabled) return;

    resumeAudio();
    const volume = clampVolume(currentSettings.masterVolume) * clampVolume(currentSettings.sfxVolume);
    if (volume <= 0) return;

    switch (cue) {
      case 'ui':
        playTone(440, 0.06, 'square', volume * 0.18);
        break;
      case 'start':
        playTone(196, 0.08, 'triangle', volume * 0.2);
        playTone(293.66, 0.08, 'triangle', volume * 0.2, 0.08);
        playTone(392, 0.12, 'triangle', volume * 0.22, 0.16);
        break;
      case 'slot':
        playTone(523.25, 0.05, 'square', volume * 0.16);
        playTone(659.25, 0.05, 'square', volume * 0.13, 0.04);
        break;
      case 'craft':
        playNoise(0.08, volume * 0.18);
        playTone(146.83, 0.1, 'sawtooth', volume * 0.2);
        playTone(392, 0.08, 'square', volume * 0.14, 0.08);
        break;
      case 'hit':
        playNoise(0.12, volume * 0.22);
        playTone(110, 0.12, 'sawtooth', volume * 0.16);
        break;
      case 'block':
        playTone(164.81, 0.08, 'triangle', volume * 0.18);
        playTone(220, 0.12, 'triangle', volume * 0.16, 0.06);
        break;
      case 'reward':
        playTone(523.25, 0.08, 'triangle', volume * 0.18);
        playTone(659.25, 0.08, 'triangle', volume * 0.18, 0.08);
        playTone(783.99, 0.14, 'triangle', volume * 0.2, 0.16);
        break;
      case 'bad':
        playTone(220, 0.09, 'sawtooth', volume * 0.16);
        playTone(164.81, 0.12, 'sawtooth', volume * 0.14, 0.08);
        break;
      case 'win':
        playTone(392, 0.1, 'triangle', volume * 0.2);
        playTone(493.88, 0.1, 'triangle', volume * 0.2, 0.1);
        playTone(587.33, 0.12, 'triangle', volume * 0.2, 0.2);
        playTone(783.99, 0.18, 'triangle', volume * 0.22, 0.32);
        break;
      case 'lose':
        playTone(196, 0.14, 'sawtooth', volume * 0.16);
        playTone(164.81, 0.18, 'sawtooth', volume * 0.14, 0.14);
        playTone(130.81, 0.26, 'sawtooth', volume * 0.12, 0.32);
        break;
    }
  }, [playNoise, playTone, resumeAudio]);

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current) {
      clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }, []);

  const scheduleMusicNote = useCallback(() => {
    const currentSettings = settingsRef.current;
    if (!currentSettings.soundEnabled || !currentSettings.musicEnabled) return;

    const volume = clampVolume(currentSettings.masterVolume) * clampVolume(currentSettings.musicVolume);
    if (volume <= 0) return;

    const note = melody[musicStepRef.current % melody.length];
    musicStepRef.current += 1;
    playTone(note, 0.38, 'triangle', volume * 0.045);
    playTone(note / 2, 0.5, 'sine', volume * 0.025);
  }, [playTone]);

  const startMusic = useCallback(() => {
    const currentSettings = settingsRef.current;
    if (!currentSettings.soundEnabled || !currentSettings.musicEnabled) return;
    if (musicTimerRef.current) return;

    resumeAudio();
    scheduleMusicNote();
    musicTimerRef.current = setInterval(scheduleMusicNote, 720);
  }, [resumeAudio, scheduleMusicNote]);

  useEffect(() => {
    if (!settings.soundEnabled || !settings.musicEnabled || settings.masterVolume <= 0 || settings.musicVolume <= 0) {
      stopMusic();
      return;
    }

    if (audioContextRef.current) {
      startMusic();
    }
  }, [settings.soundEnabled, settings.musicEnabled, settings.masterVolume, settings.musicVolume, startMusic, stopMusic]);

  useEffect(() => stopMusic, [stopMusic]);

  return {
    playSound,
    startMusic,
    stopMusic
  };
};
