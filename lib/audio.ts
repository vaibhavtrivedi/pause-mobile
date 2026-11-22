import { Audio } from 'expo-av';
import {
  SoundTheme,
  UserPreferences,
} from './preferences';

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

let ambientSound: Audio.Sound | null = null;
let effectSound: Audio.Sound | null = null;

let currentTheme: SoundTheme = 'silent';
let musicVolume = 0.6;
let effectsVolume = 0.7;
let musicEnabled = false;
let effectsEnabled = true;
let audioInitialized = false;

async function initializeAudio() {
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

export function configureAudio(preferences: UserPreferences) {
  musicEnabled = preferences.musicEnabled;
  effectsEnabled = preferences.effectsEnabled;
  musicVolume = preferences.musicVolume / 100;
  effectsVolume = preferences.effectsVolume / 100;
}

export async function playAmbient(
  theme: SoundTheme = currentTheme
) {
  await initializeAudio();

  if (!musicEnabled || theme === 'silent') {
    await stopAmbient();
    return;
  }

  const source = AMBIENT_TRACKS[theme];

  if (!source) return;

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
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      isLooping: true,
      volume: musicVolume,
    });

    ambientSound = sound;
    currentTheme = theme;
  } catch (error) {
    console.warn('Ambient playback failed:', error);
  }
}

export async function pauseAmbient() {
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

export async function resumeAmbient() {
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

export async function stopAmbient() {
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

export async function playEffect(
  effect: keyof typeof EFFECTS
) {
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
    console.warn('Sound effect failed:', error);
  }
}

export async function updateMusicVolume(volume: number) {
  musicVolume = Math.max(0, Math.min(1, volume));

  if (ambientSound) {
    try {
      await ambientSound.setVolumeAsync(musicVolume);
    } catch (error) {
      console.warn('Music volume update failed:', error);
    }
  }
}

export async function updateEffectsVolume(volume: number) {
  effectsVolume = Math.max(0, Math.min(1, volume));
}

export async function applyAudioPreferences(
  preferences: UserPreferences
) {
  configureAudio(preferences);

  if (!preferences.musicEnabled ||
      preferences.soundTheme === 'silent') {
    await stopAmbient();
    return;
  }

  await playAmbient(preferences.soundTheme);
}

export async function cleanupAudio() {
  await stopAmbient();

  if (effectSound) {
    try {
      await effectSound.unloadAsync();
    } catch {
      // Already unloaded.
    }

    effectSound = null;
  }
}

export const AudioEffects = {
  bubblePop: () => playEffect('bubblePop'),
  transition: () => playEffect('transition'),
  completion: () => playEffect('completion'),
};