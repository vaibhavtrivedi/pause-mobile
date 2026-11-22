import { useCallback, useRef, useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { loadPreferences } from '../lib/preferences';

import {
  applyAudioPreferences,
  AudioEffects,
} from '../lib/audio';

import {
  BREATHING_TECHNIQUES,
  BreathingTechnique,
} from '../lib/breathingTechniques';

const TECHNIQUE_ICONS: Record<string, string> = {
  '478': '🌙',
  box: '▦',
  coherence: '〰',
  slow: '🌿',
  'pursed-lip': '💨',
  'ready-to-learn': '☀️',
  custom: '✦',
};

export default function BreathingTechniquesScreen() {
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
            'Could not load Breathing Techniques preferences:',
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

  const selectTechnique = (technique: BreathingTechnique) => {
    AudioEffects.transition();

    if (hapticsEnabled.current) {
      Haptics.selectionAsync().catch(() => {});
    }

    if (technique.id === 'custom') {
      router.push('/custom-breathing');
      return;
    }

    router.push({
      pathname: '/breathing',
      params: {
        technique: technique.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>PAUSE YOUR MOMENT</Text>

        <Text style={styles.title}>
          Choose your{'\n'}breathing rhythm
        </Text>

        <Text style={styles.subtitle}>
          Different rhythms for different moments.
          Find one that feels comfortable for you.
        </Text>

        <View style={styles.list}>
          {BREATHING_TECHNIQUES.map((technique) => (
            <Pressable
              key={technique.id}
              onPress={() => selectTechnique(technique)}
              style={({ pressed }) => [
                styles.card,
                pressed &&
                  (reducedMotion
                    ? styles.cardPressedReduced
                    : styles.cardPressed),
              ]}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {TECHNIQUE_ICONS[technique.id]}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  {technique.name}
                </Text>

                <Text style={styles.cardSubtitle}>
                  {technique.subtitle}
                </Text>

                <Text style={styles.cardDescription}>
                  {technique.description}
                </Text>

                <Text style={styles.purpose}>
                  {technique.purpose}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footer}>
          Breathe gently. Never force your breath or hold it
          longer than feels comfortable. Stop if you feel
          dizzy or uncomfortable.
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
    paddingBottom: 40,
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
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 30,
  },
  list: {
    gap: 13,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10223B',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#203B58',
    padding: 16,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  cardPressedReduced: {
    opacity: 0.85,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#1B3853',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  icon: {
    fontSize: 23,
    color: '#8EDCE5',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#F3F7FF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#8EDCE5',
    fontSize: 12,
    marginBottom: 7,
  },
  cardDescription: {
    color: '#B5C5D9',
    fontSize: 12,
    lineHeight: 18,
  },
  purpose: {
    color: '#7E9AB8',
    fontSize: 11,
    marginTop: 8,
  },
  arrow: {
    color: '#8EDCE5',
    fontSize: 27,
    marginLeft: 8,
  },
  footer: {
    color: '#71869F',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 28,
    paddingHorizontal: 10,
  },
});