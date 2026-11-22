import { useCallback, useRef, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { saveSession } from '../lib/sessions';
import { recordProgress } from '../lib/progress';
import { loadPreferences } from '../lib/preferences';
import { applyAudioPreferences, AudioEffects } from '../lib/audio';

export default function Complete() {
  const params = useLocalSearchParams<{
    activity?: string;
    duration?: string;
  }>();

  const [score, setScore] = useState(4);
  const [saving, setSaving] = useState(false);

  const savingRef = useRef(false);
  const hapticsEnabled = useRef(false);
  const completionPlayed = useRef(false);
  const sessionId = useRef(`${Date.now()}-${Math.random()}`);

  const activity =
    typeof params.activity === 'string'
      ? params.activity
      : 'Calm moment';

  const duration = Math.max(
    0,
    Number(params.duration) || 0,
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadSettings = async () => {
        try {
          const preferences = await loadPreferences();

          if (!active) return;

          hapticsEnabled.current = preferences.hapticsEnabled;

          applyAudioPreferences(preferences);

          if (!completionPlayed.current) {
            AudioEffects.completion();
            completionPlayed.current = true;
          }
        } catch (error) {
          console.warn('Unable to load completion settings:', error);
        }
      };

      loadSettings();

      return () => {
        active = false;
      };
    }, []),
  );

  const selectScore = (value: number) => {
    if (hapticsEnabled.current) {
      Haptics.selectionAsync();
    }

    setScore(value);
  };

  const finish = async () => {
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);

    const session = {
      id: sessionId.current,
      activity,
      date: new Date().toISOString(),
      durationSeconds: duration,
      feeling: score,
    };

    try {
      if (hapticsEnabled.current) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }

      await saveSession(session);

      try {
        const newlyUnlocked = await recordProgress(session);

        if (newlyUnlocked.length > 0) {
          console.log(
            'New achievements unlocked:',
            newlyUnlocked,
          );
        }
      } catch (error) {
        console.error('Progress update failed:', error);

        Alert.alert(
          'Progress update delayed',
          'Your session was saved to history, but your progress could not be updated. Please try again later.',
        );
      }

      router.replace('/');
    } catch (error) {
      console.error('Unable to save session:', error);

      savingRef.current = false;
      setSaving(false);

      Alert.alert(
        'Could not save',
        'Your session is still meaningful. You can return home.',
        [
          {
            text: 'Return Home',
            onPress: () => router.replace('/'),
          },
        ],
      );
    }
  };

  return (
    <LinearGradient
      colors={['#152A43', '#203B5C']}
      style={s.page}
    >
      <View style={s.center}>
        <Text style={s.spark}>✦</Text>

        <Text style={s.title}>
          You made space for calm.
        </Text>

        <Text style={s.sub}>
          Taking a moment to pause is a meaningful step.
          You do not have to feel different for this moment
          to count.
        </Text>

        <Text style={s.question}>
          How are you feeling now?
        </Text>

        <Text style={s.score}>
          {score}/10
        </Text>

        <Text style={s.sub}>
          0 = settled · 10 = very intense
        </Text>

        <View style={s.row}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: score === n }}
              accessibilityLabel={`Feeling intensity ${n}`}
              key={n}
              onPress={() => selectScore(n)}
              style={[
                s.number,
                score === n && s.active,
              ]}
            >
              <Text
                style={[
                  s.numberText,
                  score === n && { color: '#10203A' },
                ]}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[s.button, saving && s.disabled]}
          onPress={finish}
          disabled={saving}
        >
          <Text style={s.buttonText}>
            {saving ? 'SAVING...' : 'SAVE & RETURN HOME'}
          </Text>
        </Pressable>

        <Text style={s.note}>
          Your history stays on this device in this prototype.
        </Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  spark: {
    fontSize: 55,
    color: '#C5D9FF',
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 15,
  },
  sub: {
    color: '#C6D7EF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  question: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
    marginTop: 32,
  },
  score: {
    fontSize: 46,
    color: '#C5D9FF',
    fontWeight: '800',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  number: {
    width: 27,
    height: 35,
    borderRadius: 8,
    backgroundColor: '#344E70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: '#A8C9FF',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#A8C9FF',
    padding: 17,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#10203A',
    fontWeight: '800',
    letterSpacing: 1,
  },
  note: {
    color: '#AFC1DA',
    fontSize: 11,
    marginTop: 14,
  },
});