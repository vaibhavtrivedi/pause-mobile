import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';

import * as Haptics from 'expo-haptics';

import { loadPreferences } from '../lib/preferences';
import {
  applyAudioPreferences,
  AudioEffects,
} from '../lib/audio';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';

import {
  ResponseScenario,
} from '../lib/responseScenarios';

import {
  getNextResponseSession,
  completeResponseSession,
} from '../lib/responseSession';

export default function Response() {
  const [scenarios, setScenarios] = useState<ResponseScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hapticsEnabled = useRef(false);

useFocusEffect(
  useCallback(() => {
    let active = true;

    async function initializePreferences() {
      try {
        const preferences = await loadPreferences();

        if (!active) return;

        hapticsEnabled.current = preferences.hapticsEnabled;

        await applyAudioPreferences(preferences);
      } catch (error) {
        console.warn(
          'Could not load Response Challenge preferences:',
          error
        );
      }
    }

    initializePreferences();

    return () => {
      active = false;
    };
  }, [])
);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const session = await getNextResponseSession();

        if (mounted) {
          setScenarios(session);
        }
      } catch (error) {
        console.error('Unable to load response session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const scenario = scenarios[currentIndex];

  const choice = scenario?.options.find(
    option => option.id === selected
  );

  const finishSession = async () => {
    if (saving) return;

    setSaving(true);

    try {
      await completeResponseSession(
        scenarios.map(item => item.id)
      );

      AudioEffects.completion();

      router.replace({
        pathname: '/complete',
        params: {
          activity: 'Response Challenge',
          duration: '90',
        },
      });
    } catch (error) {
      console.error('Unable to save response session:', error);
      setSaving(false);
    }
  };

  const continueSession = async () => {
    if (!choice) return;

    if (currentIndex === scenarios.length - 1) {
      await finishSession();
      return;
    }

    AudioEffects.transition();

if (hapticsEnabled.current) {
  Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Light
  ).catch(() => {});
}

setCurrentIndex(previous => previous + 1);
setSelected('');
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0B1428', '#142C4C']}
        style={styles.loading}
      >
        <ActivityIndicator size="large" color="#A8C9FF" />
        <Text style={styles.loadingText}>
          Preparing your scenarios...
        </Text>
      </LinearGradient>
    );
  }

  if (!scenario) {
    return (
      <LinearGradient
        colors={['#0B1428', '#142C4C']}
        style={styles.loading}
      >
        <Text style={styles.loadingText}>
          Unable to load your session.
        </Text>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>GO BACK</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0B1428', '#142C4C']}
      style={styles.page}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← EXIT</Text>
        </Pressable>

        <View style={styles.progressHeader}>
          <Text style={styles.eyebrow}>
            THE RESPONSE CHALLENGE
          </Text>

          <Text style={styles.progressText}>
            {currentIndex + 1} OF {scenarios.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentIndex + 1) / scenarios.length) * 100
                }%`,
              },
            ]}
          />
        </View>

        <View style={styles.category}>
          <Text style={styles.categoryText}>
            {scenario.category.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>
          {scenario.situation}
        </Text>

        <Text style={styles.question}>
          {scenario.question}
        </Text>

        {scenario.options.map(option => {
          const isSelected = selected === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => {
  setSelected(option.id);

  if (hapticsEnabled.current) {
    Haptics.selectionAsync().catch(() => {});
  }
}}
              style={[
                styles.option,
                isSelected && styles.selected,
              ]}
            >
              <View style={styles.optionHeader}>
                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <Text style={styles.optionTitle}>
                  {option.title}
                </Text>
              </View>

              <Text style={styles.desc}>
                {option.desc}
              </Text>
            </Pressable>
          );
        })}

        {choice && (
          <View style={styles.feedback}>
            <Text style={styles.feedbackTitle}>
              A MOMENT TO REFLECT
            </Text>

            <Text style={styles.feedbackText}>
              {choice.feedback}
            </Text>
          </View>
        )}

        {choice && (
          <Pressable
            style={[
              styles.button,
              saving && styles.buttonDisabled,
            ]}
            onPress={continueSession}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving
                ? 'SAVING...'
                : currentIndex === scenarios.length - 1
                  ? 'COMPLETE SESSION →'
                  : 'NEXT SCENARIO →'}
            </Text>
          </Pressable>
        )}

        <Text style={styles.footer}>
          There are no perfect answers. This is a space to
          explore how you respond.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 45,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#D0DEF1',
    marginTop: 16,
    fontSize: 14,
  },

  back: {
    color: '#AFC8EC',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 30,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  eyebrow: {
    color: '#B9CFFF',
    letterSpacing: 2,
    fontSize: 10,
    fontWeight: '700',
  },

  progressText: {
    color: '#AFC8EC',
    fontSize: 11,
    fontWeight: '800',
  },

  progressTrack: {
    height: 5,
    backgroundColor: '#263A57',
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 28,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#A8C9FF',
    borderRadius: 10,
  },

  category: {
    alignSelf: 'flex-start',
    backgroundColor: '#263F62',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 18,
  },

  categoryText: {
    color: '#B9D2FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 36,
  },

  question: {
    color: '#D0DEF1',
    fontSize: 15,
    marginTop: 25,
    marginBottom: 14,
  },

  option: {
    padding: 17,
    borderRadius: 16,
    backgroundColor: '#142442',
    borderWidth: 1,
    borderColor: '#2B4263',
    marginBottom: 12,
  },

  selected: {
    borderColor: '#A8C9FF',
    backgroundColor: '#263F62',
  },

  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#8298B8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioSelected: {
    borderColor: '#A8C9FF',
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#A8C9FF',
  },

  optionTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },

  desc: {
    color: '#B8C6DF',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
    marginLeft: 31,
  },

  feedback: {
    backgroundColor: '#203A5B',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
  },

  feedbackTitle: {
    color: '#A8C9FF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.3,
  },

  feedbackText: {
    color: '#E0EAF9',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },

  button: {
    backgroundColor: '#A8C9FF',
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#10203A',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },

  footer: {
    color: '#8298B8',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 25,
  },
});