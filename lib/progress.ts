import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PauseSession } from './sessions';

const PROGRESS_KEY = '@pause/progress-v1';

export type DailyProgress = {
  activityCount: number;
  durationSeconds: number;
  activities: string[];
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
};

export type ProgressData = {
  totalActivities: number;
  totalDurationSeconds: number;
  activityTypes: string[];
  days: Record<string, DailyProgress>;
  processedSessionIds: string[];
  unlockedAchievements: Record<string, string>;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_pause',
    title: 'First Pause',
    description: 'Complete your first activity.',
    icon: '🌱',
    requirement: '1 activity',
  },
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Complete 5 activities.',
    icon: '🌿',
    requirement: '5 activities',
  },
  {
    id: 'calm_explorer',
    title: 'Calm Explorer',
    description: 'Try 3 different activity types.',
    icon: '🧭',
    requirement: '3 activity types',
  },
  {
    id: 'building_consistency',
    title: 'Building Consistency',
    description: 'Practise on 3 different days.',
    icon: '⭐',
    requirement: '3 active days',
  },
  {
    id: 'seven_day_journey',
    title: 'Seven-Day Journey',
    description: 'Practise for 7 consecutive days.',
    icon: '🏅',
    requirement: '7-day streak',
  },
  {
    id: 'dedicated_mind',
    title: 'Dedicated Mind',
    description: 'Complete 25 activities.',
    icon: '🏆',
    requirement: '25 activities',
  },
  {
    id: 'mindful_month',
    title: 'Mindful Month',
    description: 'Practise on 20 different days.',
    icon: '💎',
    requirement: '20 active days',
  },
];

function createEmptyProgress(): ProgressData {
  return {
    totalActivities: 0,
    totalDurationSeconds: 0,
    activityTypes: [],
    days: {},
    processedSessionIds: [],
    unlockedAchievements: {},
  };
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);

  return new Date(year, month - 1, day);
}

async function readProgress(): Promise<ProgressData> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);

    if (!raw) {
      return createEmptyProgress();
    }

    const parsed = JSON.parse(raw) as ProgressData;

    if (
      typeof parsed.totalActivities !== 'number' ||
      !parsed.days ||
      !Array.isArray(parsed.processedSessionIds) ||
      !parsed.unlockedAchievements
    ) {
      return createEmptyProgress();
    }

    return {
      ...createEmptyProgress(),
      ...parsed,
    };
  } catch (error) {
    console.error('Unable to read progress:', error);
    return createEmptyProgress();
  }
}

async function writeProgress(
  progress: ProgressData,
): Promise<void> {
  await AsyncStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify(progress),
  );
}

// Serialize updates so simultaneous completions cannot overwrite each other.
let updateQueue: Promise<unknown> = Promise.resolve();

export async function getProgress(): Promise<ProgressData> {
  await updateQueue;
  return readProgress();
}

export async function recordProgress(
  session: PauseSession,
): Promise<string[]> {
  const operation = updateQueue.then(async () => {
    const progress = await readProgress();

    // Prevent the same session from being counted twice.
    if (progress.processedSessionIds.includes(session.id)) {
      return [];
    }

    const sessionDate = new Date(session.date);

    if (Number.isNaN(sessionDate.getTime())) {
      throw new Error('Invalid session date.');
    }

    const dateKey = getLocalDateKey(sessionDate);

    const activity = session.activity.trim() || 'Other';

    const duration = Math.max(
      0,
      Number(session.durationSeconds) || 0,
    );

    progress.totalActivities += 1;
    progress.totalDurationSeconds += duration;

    if (!progress.activityTypes.includes(activity)) {
      progress.activityTypes.push(activity);
    }

    if (!progress.days[dateKey]) {
      progress.days[dateKey] = {
        activityCount: 0,
        durationSeconds: 0,
        activities: [],
      };
    }

    const day = progress.days[dateKey];

    day.activityCount += 1;
    day.durationSeconds += duration;

    if (!day.activities.includes(activity)) {
      day.activities.push(activity);
    }

    progress.processedSessionIds.push(session.id);

    // Check for newly unlocked achievements.
    const newlyUnlocked: string[] = [];

    const activeDays = Object.keys(progress.days).length;

    const streak = calculateCurrentStreak(progress.days);

    for (const achievement of ACHIEVEMENTS) {
      if (progress.unlockedAchievements[achievement.id]) {
        continue;
      }

      const unlocked =
        (achievement.id === 'first_pause' &&
          progress.totalActivities >= 1) ||
        (achievement.id === 'getting_started' &&
          progress.totalActivities >= 5) ||
        (achievement.id === 'calm_explorer' &&
          progress.activityTypes.length >= 3) ||
        (achievement.id === 'building_consistency' &&
          activeDays >= 3) ||
        (achievement.id === 'seven_day_journey' &&
          streak >= 7) ||
        (achievement.id === 'dedicated_mind' &&
          progress.totalActivities >= 25) ||
        (achievement.id === 'mindful_month' &&
          activeDays >= 20);

      if (unlocked) {
        progress.unlockedAchievements[achievement.id] =
          new Date().toISOString();

        newlyUnlocked.push(achievement.id);
      }
    }

    await writeProgress(progress);

    return newlyUnlocked;
  });

  updateQueue = operation.catch(() => {});

  return operation;
}

export function calculateCurrentStreak(
  days: Record<string, DailyProgress>,
): number {
  const activeDates = Object.keys(days).sort();

  if (activeDates.length === 0) {
    return 0;
  }

  const today = getLocalDateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const yesterday = getLocalDateKey(yesterdayDate);

  let currentDate = today;

  // A streak remains active if the user last practised yesterday.
  if (!days[today] && days[yesterday]) {
    currentDate = yesterday;
  } else if (!days[today]) {
    return 0;
  }

  let streak = 0;

  while (days[currentDate]) {
    streak += 1;

    const previousDate = getDateFromKey(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    currentDate = getLocalDateKey(previousDate);
  }

  return streak;
}

export function getTodayProgress(
  progress: ProgressData,
): DailyProgress {
  const today = getLocalDateKey(new Date());

  return (
    progress.days[today] || {
      activityCount: 0,
      durationSeconds: 0,
      activities: [],
    }
  );
}

export function getUnlockedAchievements(
  progress: ProgressData,
): Achievement[] {
  return ACHIEVEMENTS.filter(
    achievement =>
      !!progress.unlockedAchievements[achievement.id],
  );
}