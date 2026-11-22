import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pause/session-history-v1';
export type PauseSession = { id: string; activity: string; date: string; durationSeconds: number; feeling: number | null };
export async function getSessions(): Promise<PauseSession[]> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) as PauseSession[] : []; } catch { return []; }
}
export async function saveSession(session: PauseSession): Promise<void> {
  const sessions = await getSessions();
  await AsyncStorage.setItem(KEY, JSON.stringify([session, ...sessions].slice(0, 100)));
}
export async function clearSessions(): Promise<void> { await AsyncStorage.removeItem(KEY); }
