
import { useState, useCallback, useRef } from 'react';

interface SoundSettings {
  masterVolume: number;
  levelChangeSound: boolean;
  breakSound: boolean;
  lastMinuteSound: boolean;
  buttonClickSound: boolean;
  customSounds: {
    levelChange: string;
    breakStart: string;
    lastMinute: string;
    buttonClick: string;
  };
}

const defaultSoundSettings: SoundSettings = {
  masterVolume: 0.7,
  levelChangeSound: true,
  breakSound: true,
  lastMinuteSound: true,
  buttonClickSound: false,
  customSounds: {
    levelChange: '/sounds/level-change.mp3',
    breakStart: '/sounds/break-start.mp3',
    lastMinute: '/sounds/last-minute.mp3',
    buttonClick: '/sounds/button-click.mp3'
  }
};

export function useSoundSystem() {
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => {
    const saved = localStorage.getItem('tournamentSoundSettings');
    return saved ? { ...defaultSoundSettings, ...JSON.parse(saved) } : defaultSoundSettings;
  });

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const updateSoundSettings = useCallback((updates: Partial<SoundSettings>) => {
    setSoundSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('tournamentSoundSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const playSound = useCallback((soundType: keyof SoundSettings['customSounds']) => {
    if (!soundSettings[`${soundType}Sound` as keyof SoundSettings] && soundType !== 'buttonClick') return;
    if (soundType === 'buttonClick' && !soundSettings.buttonClickSound) return;

    const soundUrl = soundSettings.customSounds[soundType];
    
    if (!audioRefs.current[soundType]) {
      audioRefs.current[soundType] = new Audio(soundUrl);
    }

    const audio = audioRefs.current[soundType];
    audio.volume = soundSettings.masterVolume;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Create fallback beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = soundType === 'lastMinute' ? 800 : 400;
        gainNode.gain.setValueAtTime(soundSettings.masterVolume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        console.warn('Could not play sound:', e);
      }
    });
  }, [soundSettings]);

  return {
    soundSettings,
    updateSoundSettings,
    playSound
  };
}
