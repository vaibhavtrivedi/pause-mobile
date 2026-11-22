import { Audio } from 'expo-av';
import {
  SoundTheme,
  UserPreferences,
} from './preferences';

// ==========================================
// AUDIO ASSETS
// ==========================================

const AMBIENT_TRACKS: Partial<Record<SoundTheme, number>> = {
  ocean: require('../assets/audio/ambient/ocean.mp3'),
  rain: require('../assets/audio/ambient/rain.mp3'),
  forest: require('../assets/audio/ambient/forest.mp3'),
  meditation: require('../assets/audio/ambient/meditation.mp3'),
};

const EFFECTS = {
  bubblePop: require('../assets/audio/effects/bubble-pop.mp3'),
  transition: require('../assets/audio/effects/transition.mp3'),
  completion: require('../assets/audio/effects/completion.mp3'),
};

// ==========================================
// AUDIO STATE
// ==========================================

let ambientSound: Audio.Sound | null = null;
let effectSound: Audio.Sound | null = null;

let currentTheme: SoundTheme = 'silent';

let musicVolume = 0.6;
let effectsVolume = 0.7;

let musicEnabled = false;
let effectsEnabled = true;

let audioInitialized = false;

// ==========================================
// INITIALIZATION
// ==========================================

export async function initializeAudio(): Promise<void> {
  if (audioInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    audioInitialized = true;
  } catch (error) {
    console.warn('Audio initialization failed:', error);
  }
}

// ==========================================
// PREFERENCES
// ==========================================

export function configureAudio(
  preferences: UserPreferences
): void {
  musicEnabled = preferences.musicEnabled;
  effectsEnabled = preferences.effectsEnabled;

  musicVolume = Math.max(
    0,
    Math.min(1, preferences.musicVolume / 100)
  );

  effectsVolume = Math.max(
    0,
    Math.min(1, preferences.effectsVolume / 100)
  );

  currentTheme = preferences.soundTheme;
}

// ==========================================
// AMBIENT MUSIC
// ==========================================

export async function playAmbient(
  theme: SoundTheme = currentTheme
): Promise<void> {
  await initializeAudio();

  if (!musicEnabled || theme === 'silent') {
    await stopAmbient();
    return;
  }

  const source = AMBIENT_TRACKS[theme];

  if (!source) return;

  // Reuse existing track when possible
  if (ambientSound && currentTheme === theme) {
    try {
      const status = await ambientSound.getStatusAsync();

      if (status.isLoaded) {
        await ambientSound.setVolumeAsync(musicVolume);

        if (!status.isPlaying) {
          await ambientSound.playAsync();
        }

        return;
      }
    } catch {
      await stopAmbient();
    }
  }

  await stopAmbient();

  try {
    const { sound } = await Audio.Sound.createAsync(
      source,
      {
        shouldPlay: true,
        isLooping: true,
        volume: musicVolume,
      }
    );

    ambientSound = sound;
    currentTheme = theme;

  } catch (error) {
    console.warn('Ambient playback failed:', error);
  }
}

export async function pauseAmbient(): Promise<void> {
  if (!ambientSound) return;

  try {
    const status = await ambientSound.getStatusAsync();

    if (status.isLoaded && status.isPlaying) {
      await ambientSound.pauseAsync();
    }
  } catch (error) {
    console.warn('Could not pause ambient audio:', error);
  }
}

export async function resumeAmbient(): Promise<void> {
  if (!ambientSound || !musicEnabled) return;

  try {
    const status = await ambientSound.getStatusAsync();

    if (status.isLoaded && !status.isPlaying) {
      await ambientSound.playAsync();
    }
  } catch (error) {
    console.warn('Could not resume ambient audio:', error);
  }
}

export async function stopAmbient(): Promise<void> {
  if (!ambientSound) return;

  const sound = ambientSound;
  ambientSound = null;

  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch {
    // Sound may already be unloaded.
  }
}

// ==========================================
// SOUND EFFECTS
// ==========================================

export async function playEffect(
  effect: keyof typeof EFFECTS
): Promise<void> {
  if (!effectsEnabled) return;

  await initializeAudio();

  try {
    if (effectSound) {
      await effectSound.unloadAsync();
      effectSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      EFFECTS[effect],
      {
        shouldPlay: true,
        volume: effectsVolume,
      }
    );

    effectSound = sound;

    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});

        if (effectSound === sound) {
          effectSound = null;
        }
      }
    });

  } catch (error) {
    console.warn('Sound effect playback failed:', error);
  }
}

// ==========================================
// VOLUME CONTROLS
// ==========================================

export async function updateMusicVolume(
  volume: number
): Promise<void> {
  musicVolume = Math.max(0, Math.min(1, volume));

  if (!ambientSound) return;

  try {
    await ambientSound.setVolumeAsync(musicVolume);
  } catch (error) {
    console.warn('Music volume update failed:', error);
  }
}

export async function updateEffectsVolume(
  volume: number
): Promise<void> {
  effectsVolume = Math.max(0, Math.min(1, volume));
}

// ==========================================
// APPLY USER PREFERENCES
// ==========================================

export async function applyAudioPreferences(
  preferences: UserPreferences
): Promise<void> {
  configureAudio(preferences);

  if (
    !preferences.musicEnabled ||
    preferences.soundTheme === 'silent'
  ) {
    await stopAmbient();
    return;
  }

  await playAmbient(preferences.soundTheme);
}

// ==========================================
// CLEANUP
// ==========================================

export async function cleanupAudio(): Promise<void> {
  await stopAmbient();

  if (effectSound) {
    const sound = effectSound;
    effectSound = null;

    try {
      await sound.unloadAsync();
    } catch {
      // Already unloaded.
    }
  }
}

// ==========================================
// EASY-TO-USE EFFECT SHORTCUTS
// ==========================================

export const AudioEffects = {
  bubblePop: () => playEffect('bubblePop'),
  transition: () => playEffect('transition'),
  completion: () => playEffect('completion'),
};