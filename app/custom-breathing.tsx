import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as Haptics from 'expo-haptics';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BreathingPattern,
} from '../lib/breathingTechniques';

import {
  CustomBreathingRoutine,
  deleteCustomRoutine,
  getCustomRoutines,
  saveCustomRoutine,
} from '../lib/customBreathing';

import {
  loadPreferences,
} from '../lib/preferences';

import {
  applyAudioPreferences,
  AudioEffects,
} from '../lib/audio';

const DEFAULT_PATTERN: BreathingPattern = {
  inhale: 4,
  holdAfterInhale: 0,
  exhale: 6,
  holdAfterExhale: 0,
};

type TimingField = keyof BreathingPattern;

export default function CustomBreathingScreen() {
  const [name, setName] = useState('');
  const [pattern, setPattern] =
    useState<BreathingPattern>(DEFAULT_PATTERN);
  const [cycles, setCycles] = useState(5);
  const [routines, setRoutines] =
    useState<CustomBreathingRoutine[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const hapticsEnabled = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function initializePreferences() {
        try {
          const preferences = await loadPreferences();

          if (!active) return;

          hapticsEnabled.current = preferences.hapticsEnabled;
          setReducedMotion(preferences.reducedMotion);

          await applyAudioPreferences(preferences);
        } catch (error) {
          console.warn(
            'Could not load Custom Breathing preferences:',
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

  const provideHapticFeedback = () => {
    if (hapticsEnabled.current) {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const loadRoutines = useCallback(async () => {
    const saved = await getCustomRoutines();
    setRoutines(saved);
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const cycleDuration =
    pattern.inhale +
    pattern.holdAfterInhale +
    pattern.exhale +
    pattern.holdAfterExhale;

  const totalSeconds = cycleDuration * cycles;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    if (minutes === 0) {
      return `${remainingSeconds} seconds`;
    }

    return remainingSeconds === 0
      ? `${minutes} min`
      : `${minutes} min ${remainingSeconds} sec`;
  };

  const updateTiming = (
    field: TimingField,
    amount: number
  ) => {
    provideHapticFeedback();

    setPattern(previous => {
      const minimum =
        field === 'inhale' || field === 'exhale' ? 1 : 0;

      const maximum =
        field === 'exhale' ? 20 : 15;

      return {
        ...previous,
        [field]: Math.min(
          maximum,
          Math.max(minimum, previous[field] + amount)
        ),
      };
    });
  };

  const resetEditor = () => {
    setName('');
    setPattern(DEFAULT_PATTERN);
    setCycles(5);
    setEditingId(null);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        'Routine name required',
        'Please give your breathing routine a name.'
      );
      return;
    }

    const routine: CustomBreathingRoutine = {
      id: editingId || `custom-${Date.now()}`,
      name: trimmedName,
      pattern,
      cycles,
      createdAt: Date.now(),
    };

    try {
      await saveCustomRoutine(routine);
      await loadRoutines();
      resetEditor();

      AudioEffects.completion();

      if (hapticsEnabled.current) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }

      Alert.alert(
        'Routine saved',
        'Your breathing routine has been saved.'
      );
    } catch {
      Alert.alert(
        'Unable to save',
        'Please try saving your routine again.'
      );
    }
  };

  const editRoutine = (routine: CustomBreathingRoutine) => {
    provideHapticFeedback();

    setName(routine.name);
    setPattern(routine.pattern);
    setCycles(routine.cycles);
    setEditingId(routine.id);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete routine?',
      'This saved breathing routine will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCustomRoutine(id);
            await loadRoutines();

            if (editingId === id) {
              resetEditor();
            }

            provideHapticFeedback();
          },
        },
      ]
    );
  };

  const startRoutine = (routine: CustomBreathingRoutine) => {
    provideHapticFeedback();
    AudioEffects.transition();

    router.push({
      pathname: '/breathing',
      params: {
        technique: 'custom',
        customRoutineId: routine.id,
      },
    });
  };

  const renderTimingControl = (
    label: string,
    field: TimingField,
    description: string
  ) => (
    <View style={styles.timingRow} key={field}>
      <View style={styles.timingInfo}>
        <Text style={styles.timingLabel}>{label}</Text>
        <Text style={styles.timingDescription}>
          {description}
        </Text>
      </View>

      <View style={styles.stepper}>
        <Pressable
          style={styles.stepButton}
          onPress={() => updateTiming(field, -1)}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>

        <Text style={styles.timingValue}>
          {pattern[field]}s
        </Text>

        <Pressable
          style={styles.stepButton}
          onPress={() => updateTiming(field, 1)}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => {
            provideHapticFeedback();

            if (editingId) {
              resetEditor();
            } else {
              router.back();
            }
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>PERSONALISE YOUR PAUSE</Text>

        <Text style={styles.title}>
          Create your{'\n'}own rhythm
        </Text>

        <Text style={styles.subtitle}>
          Adjust each breathing phase and create a routine
          that feels comfortable for you.
        </Text>

        <Text style={styles.sectionTitle}>ROUTINE NAME</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. My Evening Pause"
          placeholderTextColor="#71869F"
          style={styles.input}
          maxLength={35}
        />

        <Text style={styles.sectionTitle}>
          BREATHING TIMINGS
        </Text>

        <View style={styles.panel}>
          {renderTimingControl(
            'Inhale',
            'inhale',
            'Breathe in gently'
          )}

          {renderTimingControl(
            'Hold after inhale',
            'holdAfterInhale',
            'Optional pause'
          )}

          {renderTimingControl(
            'Exhale',
            'exhale',
            'Breathe out gently'
          )}

          {renderTimingControl(
            'Hold after exhale',
            'holdAfterExhale',
            'Optional pause'
          )}
        </View>

        <Text style={styles.sectionTitle}>
          NUMBER OF CYCLES
        </Text>

        <View style={styles.panel}>
          <View style={styles.cycleRow}>
            <Text style={styles.timingLabel}>
              Complete breathing cycles
            </Text>

            <View style={styles.stepper}>
              <Pressable
                style={styles.stepButton}
                onPress={() => {
                  provideHapticFeedback();
                  setCycles(value => Math.max(5, value - 1));
                }}
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>

              <Text style={styles.timingValue}>
                {cycles}
              </Text>

              <Pressable
                style={styles.stepButton}
                onPress={() => {
                  provideHapticFeedback();
                  setCycles(value => Math.min(30, value + 1));
                }}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>
            ESTIMATED SESSION DURATION
          </Text>

          <Text style={styles.previewTime}>
            {formatDuration(totalSeconds)}
          </Text>

          <Text style={styles.previewDetails}>
            {cycleDuration} seconds per cycle × {cycles} cycles
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed &&
              (reducedMotion
                ? styles.buttonPressedReduced
                : styles.buttonPressed),
          ]}
        >
          <Text style={styles.saveButtonText}>
            {editingId ? 'Update Routine' : 'Save Routine'}
          </Text>
        </Pressable>

        {editingId && (
          <Pressable
            onPress={() => {
              provideHapticFeedback();
              resetEditor();
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>
              Cancel Editing
            </Text>
          </Pressable>
        )}

        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>
            YOUR SAVED ROUTINES
          </Text>

          {routines.length === 0 ? (
            <Text style={styles.emptyText}>
              Your saved routines will appear here.
            </Text>
          ) : (
            routines.map(routine => (
              <View
                key={routine.id}
                style={styles.savedCard}
              >
                <View style={styles.savedInfo}>
                  <Text style={styles.savedName}>
                    {routine.name}
                  </Text>

                  <Text style={styles.savedDetails}>
                    {routine.cycles} cycles ·{' '}
                    {formatDuration(
                      (
                        routine.pattern.inhale +
                        routine.pattern.holdAfterInhale +
                        routine.pattern.exhale +
                        routine.pattern.holdAfterExhale
                      ) * routine.cycles
                    )}
                  </Text>
                </View>

                <Pressable
                  onPress={() => startRoutine(routine)}
                  style={({ pressed }) => [
                    styles.smallButton,
                    pressed &&
                      (reducedMotion
                        ? styles.buttonPressedReduced
                        : styles.buttonPressed),
                  ]}
                >
                  <Text style={styles.smallButtonText}>
                    Start
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => editRoutine(routine)}
                  style={({ pressed }) => [
                    styles.smallButton,
                    pressed &&
                      (reducedMotion
                        ? styles.buttonPressedReduced
                        : styles.buttonPressed),
                  ]}
                >
                  <Text style={styles.smallButtonText}>
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => confirmDelete(routine.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>×</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Text style={styles.footer}>
          Keep every breath comfortable. Never force a breath
          hold. Stop if you feel dizzy or uncomfortable.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071326',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 45,
  },
  backButton: {
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#A9BCD5',
    fontSize: 16,
  },
  eyebrow: {
    color: '#75C9D8',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 14,
  },
  title: {
    color: '#F3F7FF',
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
    marginBottom: 14,
  },
  subtitle: {
    color: '#A9BCD5',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#75C9D8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#10223B',
    borderColor: '#29435F',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    color: '#F3F7FF',
    fontSize: 15,
  },
  panel: {
    backgroundColor: '#10223B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#203B58',
    paddingHorizontal: 16,
  },
  timingRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#203B58',
  },
  timingInfo: {
    flex: 1,
    paddingRight: 8,
  },
  timingLabel: {
    color: '#F3F7FF',
    fontSize: 14,
    fontWeight: '600',
  },
  timingDescription: {
    color: '#829BB5',
    fontSize: 11,
    marginTop: 5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#1B3853',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#8EDCE5',
    fontSize: 23,
  },
  timingValue: {
    color: '#F3F7FF',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  cycleRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    marginTop: 24,
    padding: 22,
    backgroundColor: '#14314A',
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#31566F',
  },
  previewLabel: {
    color: '#8EDCE5',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  previewTime: {
    color: '#F3F7FF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 10,
  },
  previewDetails: {
    color: '#A9BCD5',
    fontSize: 12,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#75C9D8',
    borderRadius: 15,
    padding: 17,
    alignItems: 'center',
    marginTop: 22,
  },
  saveButtonText: {
    color: '#071326',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
  buttonPressedReduced: {
    opacity: 0.85,
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#A9BCD5',
    fontSize: 13,
  },
  savedSection: {
    marginTop: 15,
  },
  emptyText: {
    color: '#829BB5',
    fontSize: 13,
    lineHeight: 20,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10223B',
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#203B58',
  },
  savedInfo: {
    flex: 1,
  },
  savedName: {
    color: '#F3F7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  savedDetails: {
    color: '#829BB5',
    fontSize: 11,
    marginTop: 5,
  },
  smallButton: {
    backgroundColor: '#1B3853',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    marginLeft: 8,
  },
  smallButtonText: {
    color: '#8EDCE5',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  deleteText: {
    color: '#F18D9A',
    fontSize: 23,
  },
  footer: {
    color: '#71869F',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
  },
});