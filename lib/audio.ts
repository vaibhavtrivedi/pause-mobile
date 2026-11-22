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
  bubblePop: require('../assets/audio/effects/bubble-pop.wav'),
  transition: require('../assets/audio/effects/transition.wav'),
  completion: require('../assets/audio/effects/completion.wav'),
};

// ==========================================
// AUDIO STATE
// ==========================================

let ambientSound: Audio.Sound | null = null;

const activeEffects = new Set<Audio.Sound>();

let currentTheme: SoundTheme = 'silent';

let musicVolume = 0.6;
let effectsVolume = 0.7;

let musicEnabled = false;
let effectsEnabled = true;

let audioInitialized = false;
let ambientRequestId = 0;

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

  // Do not update currentTheme here.
  // It must represent the track actually loaded.
}

// ==========================================
// INTERNAL CLEANUP
// ==========================================

async function unloadAmbient(): Promise<void> {
  const sound = ambientSound;

  ambientSound = null;
  currentTheme = 'silent';

  if (!sound) return;

  try {
    await sound.stopAsync();
  } catch {}

  try {
    await sound.unloadAsync();
  } catch {}
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

  if (!source) {
    console.warn('Ambient track not found:', theme);
    return;
  }

  const requestId = ++ambientRequestId;

  // Reuse only when the actual loaded track matches.
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
      await unloadAmbient();
    }
  }

  await unloadAmbient();

  try {
    const { sound } = await Audio.Sound.createAsync(
      source,
      {
        shouldPlay: true,
        isLooping: true,
        volume: musicVolume,
      }
    );

    // Ignore an outdated request if the user changed settings
    // while the previous track was loading.
    if (requestId !== ambientRequestId) {
      await sound.unloadAsync();
      return;
    }

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
  if (!musicEnabled) return;

  if (!ambientSound) {
    if (currentTheme !== 'silent') {
      await playAmbient(currentTheme);
    }
    return;
  }

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
  // Invalidate any track currently being loaded.
  ambientRequestId++;

  await unloadAmbient();
}

// ==========================================
// SOUND EFFECTS
// ==========================================

export async function playEffect(
  effect: keyof typeof EFFECTS
): Promise<void> {
  if (!effectsEnabled) return;

  await initializeAudio();

  let sound: Audio.Sound | null = null;

  try {
    const result = await Audio.Sound.createAsync(
      EFFECTS[effect],
      {
        shouldPlay: true,
        volume: effectsVolume,
      }
    );

    sound = result.sound;
    activeEffects.add(sound);

    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish && sound) {
        activeEffects.delete(sound);
        sound.unloadAsync().catch(() => {});
      }
    });

  } catch (error) {
    if (sound) {
      activeEffects.delete(sound);
      try {
        await sound.unloadAsync();
      } catch {}
    }

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

  const sounds = Array.from(activeEffects);
  activeEffects.clear();

  await Promise.all(
    sounds.map(async sound => {
      try {
        await sound.stopAsync();
      } catch {}

      try {
        await sound.unloadAsync();
      } catch {}
    })
  );
}

// ==========================================
// EASY-TO-USE EFFECT SHORTCUTS
// ==========================================

export const AudioEffects = {
  bubblePop: () => playEffect('bubblePop'),
  transition: () => playEffect('transition'),
  completion: () => playEffect('completion'),
};