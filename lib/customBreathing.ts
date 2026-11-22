import AsyncStorage from '@react-native-async-storage/async-storage';

import { BreathingPattern } from './breathingTechniques';

export type CustomBreathingRoutine = {
  id: string;
  name: string;
  pattern: BreathingPattern;
  cycles: number;
  createdAt: number;
};

const STORAGE_KEY = 'pause_custom_breathing_routines_v1';

export async function getCustomRoutines(): Promise<
  CustomBreathingRoutine[]
> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    return JSON.parse(saved) as CustomBreathingRoutine[];
  } catch (error) {
    console.error('Unable to load custom breathing routines:', error);
    return [];
  }
}

export async function saveCustomRoutine(
  routine: CustomBreathingRoutine
): Promise<void> {
  const routines = await getCustomRoutines();

  const updated = [
    ...routines.filter(item => item.id !== routine.id),
    routine,
  ];

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );
}

export async function deleteCustomRoutine(
  id: string
): Promise<void> {
  const routines = await getCustomRoutines();

  const updated = routines.filter(item => item.id !== id);

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );
}