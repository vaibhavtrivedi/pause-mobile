import {
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';

import type { AudioPlayer } from 'expo-audio';

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

let ambientSound: AudioPlayer | null = null;

const activeEffects = new Map<AudioPlayer, () => void>();

let currentTheme: SoundTheme = 'silent';

let musicVolume = 0.4;
let effectsVolume = 0.7;

let musicEnabled = true;
let effectsEnabled = true;

let audioInitialized = false;
let initializationPromise: Promise<void> | null = null;

let ambientRequestId = 0;
let cleanupGeneration = 0;

// ==========================================
// INITIALIZATION
// ==========================================

export async function initializeAudio(): Promise<void> {
  if (audioInitialized) return;

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
      });

      audioInitialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
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

  if (!effectsEnabled) {
    stopActiveEffects();
  }

  if (!musicEnabled) {
    stopAmbient();
  }
}

// ==========================================
// INTERNAL CLEANUP
// ==========================================

function unloadPlayer(player: AudioPlayer): void {
  try {
    player.pause();
    player.remove();
  } catch (error) {
    console.warn('Audio player cleanup failed:', error);
  }
}

function stopActiveEffects(): void {
  const players = Array.from(activeEffects.entries());

  activeEffects.clear();

  players.forEach(([player, removeListener]) => {
    try {
      removeListener();
    } catch {}

    unloadPlayer(player);
  });
}

async function unloadAmbient(): Promise<void> {
  const player = ambientSound;

  ambientSound = null;
  currentTheme = 'silent';

  if (player) {
    unloadPlayer(player);
  }
}

// ==========================================
// AMBIENT MUSIC
// ==========================================

export async function playAmbient(
  theme: SoundTheme = currentTheme
): Promise<void> {
  const requestId = ++ambientRequestId;
  const generation = cleanupGeneration;

  await initializeAudio();

  if (
    requestId !== ambientRequestId ||
    generation !== cleanupGeneration
  ) {
    return;
  }

  if (!audioInitialized || !musicEnabled || theme === 'silent') {
    await stopAmbient();
    return;
  }

  const source = AMBIENT_TRACKS[theme];

  if (!source) {
    console.warn('Ambient track not found:', theme);
    return;
  }

  if (ambientSound && currentTheme === theme) {
    if (ambientSound.isLoaded) {
      ambientSound.volume = musicVolume;

      if (ambientSound.paused) {
        ambientSound.play();
      }

      return;
    }
  }

  await unloadAmbient();

  if (
    requestId !== ambientRequestId ||
    generation !== cleanupGeneration
  ) {
    return;
  }

  try {
    const player = createAudioPlayer(source, {
      updateInterval: 250,
    });

    player.loop = true;
    player.volume = musicVolume;

    if (
      requestId !== ambientRequestId ||
      generation !== cleanupGeneration
    ) {
      player.remove();
      return;
    }

    ambientSound = player;
    currentTheme = theme;

    player.play();

  } catch (error) {
    console.warn('Ambient playback failed:', error);
  }
}

export async function pauseAmbient(): Promise<void> {
  if (!ambientSound) return;

  try {
    ambientSound.pause();
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
    if (ambientSound.isLoaded && ambientSound.paused) {
      ambientSound.play();
    }
  } catch (error) {
    console.warn('Could not resume ambient audio:', error);
  }
}

export async function stopAmbient(): Promise<void> {
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

  const generation = cleanupGeneration;

  await initializeAudio();

  if (
    !audioInitialized ||
    !effectsEnabled ||
    generation !== cleanupGeneration
  ) {
    return;
  }

  let player: AudioPlayer | null = null;

  try {
    player = createAudioPlayer(EFFECTS[effect], {
      updateInterval: 100,
    });

    player.volume = effectsVolume;

    const activePlayer = player;

    const subscription = player.addListener(
      'playbackStatusUpdate',
      status => {
        if (status.didJustFinish) {
          const removeListener = activeEffects.get(activePlayer);

          activeEffects.delete(activePlayer);

          removeListener?.();

          unloadPlayer(activePlayer);
        }
      }
    );

    activeEffects.set(player, () => subscription.remove());

    player.play();

  } catch (error) {
    if (player) {
      const removeListener = activeEffects.get(player);

      activeEffects.delete(player);

      removeListener?.();

      unloadPlayer(player);
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
    ambientSound.volume = musicVolume;
  } catch (error) {
    console.warn('Music volume update failed:', error);
  }
}

export async function updateEffectsVolume(
  volume: number
): Promise<void> {
  effectsVolume = Math.max(0, Math.min(1, volume));

  activeEffects.forEach((_removeListener, player) => {
    try {
      player.volume = effectsVolume;
    } catch (error) {
      console.warn('Effects volume update failed:', error);
    }
  });
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
  cleanupGeneration++;

  await stopAmbient();

  stopActiveEffects();
}

// ==========================================
// EASY-TO-USE EFFECT SHORTCUTS
// ==========================================

export const AudioEffects = {
  bubblePop: () => playEffect('bubblePop'),
  transition: () => playEffect('transition'),
  completion: () => playEffect('completion'),
};