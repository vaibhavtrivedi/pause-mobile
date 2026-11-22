import { useCallback, useRef, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';

import {
  clearSessions,
  getSessions,
  PauseSession,
} from '../lib/sessions';

import { loadPreferences } from '../lib/preferences';
import { applyAudioPreferences, AudioEffects } from '../lib/audio';

export default function History() {
  const [items, setItems] = useState<PauseSession[]>([]);
  const [loading, setLoading] = useState(true);

  const hapticsEnabled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refresh = async () => {
        setLoading(true);

        try {
          const [sessions, preferences] = await Promise.all([
            getSessions(),
            loadPreferences(),
          ]);

          if (active) {
            setItems(sessions);
            hapticsEnabled.current = preferences.hapticsEnabled;
            applyAudioPreferences(preferences);
          }
        } catch (error) {
          console.error('Unable to load history:', error);
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

  const clear = () =>
    Alert.alert(
      'Clear session history?',
      'This removes locally saved PAUSE sessions from this device.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              if (hapticsEnabled.current) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning,
                );
              }

              await clearSessions();
              setItems([]);
            } catch (error) {
              console.error('Unable to clear history:', error);

              Alert.alert(
                'Unable to clear history',
                'Please try again.',
              );
            }
          },
        },
      ],
    );

  const fmt = (d: string) =>
    new Date(d).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <LinearGradient
      colors={['#091326', '#142C4C']}
      style={s.page}
    >
      <ScrollView
        contentContainerStyle={s.content}
      >
        <Pressable onPress={goBack}>
          <Text style={s.back}>← BACK</Text>
        </Pressable>

        <Text style={s.title}>Your pause moments</Text>

        <Text style={s.sub}>
          A record of showing up for yourself—not a scorecard.
        </Text>

        {loading ? (
          <Text style={s.empty}>Loading your history…</Text>
        ) : items.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>
              Your story starts with one pause.
            </Text>

            <Text style={s.empty}>
              Completed sessions you choose to save will appear here.
            </Text>
          </View>
        ) : (
          items.map(x => (
            <View key={x.id} style={s.card}>
              <View style={s.row}>
                <Text style={s.activity}>
                  {x.activity}
                </Text>

                <Text style={s.duration}>
                  {x.durationSeconds
                    ? `${Math.round(x.durationSeconds / 60)} min`
                    : ''}
                </Text>
              </View>

              <Text style={s.date}>
                {fmt(x.date)}
              </Text>

              {x.feeling !== null && (
                <Text style={s.feeling}>
                  Your check-in: {x.feeling}/10
                </Text>
              )}
            </View>
          ))
        )}

        {items.length > 0 && (
          <Pressable
            onPress={clear}
            style={s.clear}
          >
            <Text style={s.clearText}>
              CLEAR HISTORY
            </Text>
          </Pressable>
        )}

        <Text style={s.privacy}>
          Stored locally on this device. No account or cloud sync is used.
        </Text>
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
    paddingBottom: 40,
  },
  back: {
    color: '#AFC8EC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 28,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#F5F7FF',
  },
  sub: {
    color: '#B8C6DF',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#142442',
    borderRadius: 17,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2B4263',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activity: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  duration: {
    color: '#C5D9FF',
    fontSize: 12,
  },
  date: {
    color: '#B8C6DF',
    fontSize: 12,
    marginTop: 8,
  },
  feeling: {
    color: '#C5D9FF',
    fontSize: 12,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#142442',
    padding: 22,
    borderRadius: 18,
    marginTop: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  empty: {
    color: '#B8C6DF',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8,
  },
  clear: {
    padding: 14,
    alignItems: 'center',
  },
  clearText: {
    color: '#D3A9B2',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },
  privacy: {
    color: '#91A8C8',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 22,
  },
});