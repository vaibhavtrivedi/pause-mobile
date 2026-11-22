import AsyncStorage from '@react-native-async-storage/async-storage';
import { RESPONSE_SCENARIOS } from './responseScenarios';

const STORAGE_KEY = 'pause_response_progress_v1';
const SESSION_SIZE = 5;

type ResponseProgress = {
  usedScenarioIds: string[];
  previousSessionIds: string[];
};

const DEFAULT_PROGRESS: ResponseProgress = {
  usedScenarioIds: [],
  previousSessionIds: [],
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

async function loadProgress(): Promise<ResponseProgress> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (!saved) return DEFAULT_PROGRESS;

    return {
      ...DEFAULT_PROGRESS,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export async function getNextResponseSession() {
  const progress = await loadProgress();

  let usedIds = progress.usedScenarioIds;

  let available = RESPONSE_SCENARIOS.filter(
    scenario => !usedIds.includes(scenario.id)
  );

  // Start a new cycle when fewer than five unused scenarios remain.
  if (available.length < SESSION_SIZE) {
    usedIds = [];

    available = RESPONSE_SCENARIOS.filter(
      scenario =>
        !progress.previousSessionIds.includes(scenario.id)
    );

    // Fallback if the bank is too small.
    if (available.length < SESSION_SIZE) {
      available = RESPONSE_SCENARIOS;
    }
  }

  return shuffle(available).slice(0, SESSION_SIZE);
}

export async function completeResponseSession(
  scenarioIds: string[]
): Promise<void> {
  const progress = await loadProgress();

  const usedIds = new Set(progress.usedScenarioIds);

  scenarioIds.forEach(id => usedIds.add(id));

  const updatedProgress: ResponseProgress = {
    usedScenarioIds: [...usedIds],
    previousSessionIds: scenarioIds,
  };

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProgress)
  );
}