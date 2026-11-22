import AsyncStorage from '@react-native-async-storage/async-storage';

export type OrbTheme = 'energy' | 'aurora' | 'ripple' | 'solar';
export type SoundTheme = 'silent' | 'ocean' | 'rain' | 'forest' | 'meditation';

export type UserPreferences = {
  orbTheme: OrbTheme;
  soundTheme: SoundTheme;
  musicEnabled: boolean;
  effectsEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  orbTheme: 'energy',
  soundTheme: 'silent',
  musicEnabled: false,
  effectsEnabled: true,
  musicVolume: 60,
  effectsVolume: 70,
  hapticsEnabled: false,
  reducedMotion: false,
};

const STORAGE_KEY = 'pause_user_preferences_v1';

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_PREFERENCES;

    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(
  preferences: UserPreferences
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(preferences)
  );
}

export async function resetPreferences(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}