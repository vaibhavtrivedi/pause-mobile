import { useCallback, useRef, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';

import {
  getProgress,
  getTodayProgress,
  calculateCurrentStreak,
  ACHIEVEMENTS,
  ProgressData,
} from '../lib/progress';

import { loadPreferences } from '../lib/preferences';
import { applyAudioPreferences, AudioEffects } from '../lib/audio';

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getWeekDays = () => {
  const today = new Date();
  const day = today.getDay();

  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return date;
  });
};

export default function Progress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const hapticsEnabled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refresh = async () => {
        setLoading(true);

        try {
          const [data, preferences] = await Promise.all([
            getProgress(),
            loadPreferences(),
          ]);

          if (active) {
            setProgress(data);
            hapticsEnabled.current = preferences.hapticsEnabled;
            applyAudioPreferences(preferences);
          }
        } catch (error) {
          console.error('Unable to load progress:', error);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      refresh();

      return () => {
        active = false;
      };
    }, []),
  );

  const goBack = () => {
    if (hapticsEnabled.current) {
      Haptics.selectionAsync();
    }

    AudioEffects.transition();
    router.back();
  };

  const today = progress
    ? getTodayProgress(progress)
    : null;

  const streak = progress
    ? calculateCurrentStreak(progress.days)
    : 0;

  const unlockedCount = progress
    ? Object.keys(progress.unlockedAchievements).length
    : 0;

  const weekDays = getWeekDays();

  return (
    <LinearGradient
      colors={['#091326', '#142C4C']}
      style={s.page}
    >
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={goBack}>
          <Text style={s.back}>← BACK</Text>
        </Pressable>

        <Text style={s.title}>My Progress</Text>

        <Text style={s.subtitle}>
          Every small pause is progress.
        </Text>

        {loading || !progress ? (
          <Text style={s.loading}>
            Loading your progress...
          </Text>
        ) : (
          <>
            {/* TODAY */}

            <View style={s.todayCard}>
              <Text style={s.sectionLabel}>
                TODAY'S PROGRESS
              </Text>

              <Text style={s.todayNumber}>
                {today?.activityCount || 0}
              </Text>

              <Text style={s.todayDescription}>
                activities completed today
              </Text>

              <View style={s.divider} />

              <View style={s.todayBottom}>
                <View>
                  <Text style={s.statValue}>
                    {formatDuration(today?.durationSeconds || 0)}
                  </Text>

                  <Text style={s.statLabel}>
                    Practice time
                  </Text>
                </View>

                <View>
                  <Text style={s.statValue}>
                    {today?.activities.length || 0}
                  </Text>

                  <Text style={s.statLabel}>
                    Activity types
                  </Text>
                </View>
              </View>
            </View>

            {/* STREAK */}

            <View style={s.streakCard}>
              <Text style={s.streakIcon}>🔥</Text>

              <View style={{ flex: 1 }}>
                <Text style={s.streakNumber}>
                  {streak} {streak === 1 ? 'Day' : 'Days'}
                </Text>

                <Text style={s.streakDescription}>
                  Current practice streak
                </Text>
              </View>

              <Text style={s.streakStar}>✦</Text>
            </View>

            {/* LIFETIME */}

            <Text style={s.heading}>
              Your Journey
            </Text>

            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statIcon}>🌿</Text>

                <Text style={s.statValue}>
                  {progress.totalActivities}
                </Text>

                <Text style={s.statLabel}>
                  Total activities
                </Text>
              </View>

              <View style={s.statCard}>
                <Text style={s.statIcon}>⏳</Text>

                <Text style={s.statValue}>
                  {formatDuration(progress.totalDurationSeconds)}
                </Text>

                <Text style={s.statLabel}>
                  Total practice
                </Text>
              </View>
            </View>

            {/* WEEKLY CALENDAR */}

            <Text style={s.heading}>
              This Week
            </Text>

            <View style={s.calendar}>
              {weekDays.map(date => {
                const key = getDateKey(date);
                const active = !!progress.days[key];

                const isToday =
                  key === getDateKey(new Date());

                return (
                  <View
                    key={key}
                    style={s.calendarDay}
                  >
                    <Text style={s.dayName}>
                      {date.toLocaleDateString([], {
                        weekday: 'short',
                      })}
                    </Text>

                    <View
                      style={[
                        s.dayCircle,
                        active && s.dayActive,
                        isToday && s.dayToday,
                      ]}
                    >
                      <Text
                        style={[
                          s.dayNumber,
                          active && s.dayNumberActive,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>

                    <Text style={s.dayCheck}>
                      {active ? '✦' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* ACHIEVEMENTS */}

            <View style={s.achievementHeader}>
              <View>
                <Text style={s.heading}>
                  Achievements
                </Text>

                <Text style={s.achievementSubtitle}>
                  Celebrate every milestone.
                </Text>
              </View>

              <Text style={s.achievementCount}>
                {unlockedCount}/{ACHIEVEMENTS.length}
              </Text>
            </View>

            {ACHIEVEMENTS.map(achievement => {
              const unlocked =
                !!progress.unlockedAchievements[achievement.id];

              return (
                <View
                  key={achievement.id}
                  style={[
                    s.achievementCard,
                    unlocked && s.achievementUnlocked,
                  ]}
                >
                  <View
                    style={[
                      s.trophy,
                      !unlocked && s.trophyLocked,
                    ]}
                  >
                    <Text style={s.trophyIcon}>
                      {unlocked ? achievement.icon : '🔒'}
                    </Text>
                  </View>

                  <View style={s.achievementInfo}>
                    <Text style={s.achievementTitle}>
                      {achievement.title}
                    </Text>

                    <Text style={s.achievementDescription}>
                      {achievement.description}
                    </Text>

                    <Text style={s.requirement}>
                      {achievement.requirement}
                    </Text>
                  </View>

                  {unlocked && (
                    <Text style={s.unlockedMark}>
                      ✓
                    </Text>
                  )}
                </View>
              );
            })}

            <Text style={s.footer}>
              Progress is personal. There is no perfect streak
              and no pressure to practise every day.
            </Text>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 50,
  },
  back: {
    color: '#AFC8EC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F5F7FF',
  },
  subtitle: {
    color: '#B8C6DF',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 25,
  },
  loading: {
    color: '#B8C6DF',
    marginTop: 30,
  },
  todayCard: {
    backgroundColor: '#1B3558',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#36567D',
  },
  sectionLabel: {
    color: '#AFC8EC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  todayNumber: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '800',
    marginTop: 12,
  },
  todayDescription: {
    color: '#C5D9FF',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#405A7B',
    marginVertical: 20,
  },
  todayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
  statLabel: {
    color: '#B8C6DF',
    fontSize: 11,
    marginTop: 5,
  },
  streakCard: {
    backgroundColor: '#263B56',
    borderRadius: 18,
    padding: 19,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#52617A',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  streakNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
  streakDescription: {
    color: '#B8C6DF',
    fontSize: 12,
    marginTop: 4,
  },
  streakStar: {
    color: '#F4CB82',
    fontSize: 27,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 30,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#142442',
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: '#2B4263',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#142442',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#2B4263',
  },
  calendarDay: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    color: '#AFC8EC',
    fontSize: 10,
    marginBottom: 12,
  },
  dayCircle: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: '#263B56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: {
    backgroundColor: '#A8C9FF',
  },
  dayToday: {
    borderWidth: 2,
    borderColor: '#E5C78C',
  },
  dayNumber: {
    color: '#B8C6DF',
    fontSize: 12,
    fontWeight: '700',
  },
  dayNumberActive: {
    color: '#10203A',
  },
  dayCheck: {
    color: '#F4CB82',
    fontSize: 12,
    height: 17,
    marginTop: 5,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  achievementSubtitle: {
    color: '#B8C6DF',
    fontSize: 12,
    marginTop: -9,
  },
  achievementCount: {
    color: '#C5D9FF',
    fontSize: 15,
    fontWeight: '800',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#142442',
    borderRadius: 17,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2B4263',
  },
  achievementUnlocked: {
    borderColor: '#A8C9FF',
    backgroundColor: '#1B3558',
  },
  trophy: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#314D70',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  trophyLocked: {
    backgroundColor: '#26364D',
  },
  trophyIcon: {
    fontSize: 23,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  achievementDescription: {
    color: '#B8C6DF',
    fontSize: 11,
    marginTop: 4,
  },
  requirement: {
    color: '#A8C9FF',
    fontSize: 10,
    marginTop: 5,
  },
  unlockedMark: {
    color: '#A8DDB7',
    fontSize: 21,
    fontWeight: '800',
    marginLeft: 8,
  },
  footer: {
    color: '#91A8C8',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 25,
  },
});