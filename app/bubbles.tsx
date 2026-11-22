import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { loadPreferences, UserPreferences } from '../lib/preferences';

const words = [
  'Pressure',
  'Frustration',
  'Worry',
  'Impatience',
  'Expectations',
  'Tension',
];

export default function Bubbles() {
  const [done, setDone] = useState<number[]>([]);
  const [preferences, setPreferences] =
    useState<UserPreferences | null>(null);

  const startedAt = useRef(Date.now());

  const floats = useRef(
    words.map(() => new Animated.Value(0))
  ).current;

  const scales = useRef(
    words.map(() => new Animated.Value(1))
  ).current;

  const opacities = useRef(
    words.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    loadPreferences().then(setPreferences);
  }, []);

  useEffect(() => {
    const loops = floats.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 180),
          Animated.timing(value, {
            toValue: 1,
            duration: 2000 + index * 180,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 2000 + index * 180,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );

    loops.forEach(loop => loop.start());

    return () => loops.forEach(loop => loop.stop());
  }, [floats]);

  const release = async (index: number) => {
    if (done.includes(index)) return;

    if (preferences?.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setDone(previous => [...previous, index]);

    Animated.parallel([
      Animated.timing(scales[index], {
        toValue: 1.35,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacities[index], {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const finish = () => {
    const duration = Math.max(
      1,
      Math.round((Date.now() - startedAt.current) / 1000)
    );

    router.replace({
      pathname: '/complete',
      params: {
        activity: 'Bubble Ocean',
        duration: String(duration),
      },
    });
  };

  return (
    <LinearGradient
      colors={['#071C35', '#103C59', '#14566A', '#102F4B']}
      style={styles.page}
    >
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowTwo} />

      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← EXIT</Text>
      </Pressable>

      <Text style={styles.eyebrow}>THE BUBBLE OCEAN</Text>

      <Text style={styles.title}>
        Let it float away.
      </Text>

      <Text style={styles.subtitle}>
        Some thoughts don't need an answer right now.
        {'\n'}
        Release them, one bubble at a time.
      </Text>

      <View style={styles.instruction}>
        <Text style={styles.instructionText}>
          ✦  Tap a bubble when you feel ready
        </Text>
      </View>

      <View style={styles.grid}>
        {words.map((word, index) => {
          const translateY = floats[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -14 - (index % 3) * 5],
          });

          const released = done.includes(index);

          return (
            <Animated.View
              key={word}
              style={[
                styles.bubbleWrapper,
                {
                  opacity: opacities[index],
                  transform: [
                    { translateY },
                    { scale: scales[index] },
                  ],
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Release ${word}`}
                disabled={released}
                onPress={() => release(index)}
                style={[
                  styles.bubble,
                  index % 2 === 0
                    ? styles.bubbleLarge
                    : styles.bubbleSmall,
                ]}
              >
                <View style={styles.bubbleHighlight} />

                <Text style={styles.bubbleIcon}>✧</Text>
                <Text style={styles.word}>{word}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.progressArea}>
        <Text style={styles.progress}>
          {done.length} of {words.length} released
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(done.length / words.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {done.length === words.length ? (
        <Pressable style={styles.finishButton} onPress={finish}>
          <Text style={styles.finishText}>
            COMPLETE MY JOURNEY →
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.footer}>
          There is no rush. Take your time.
        </Text>
      )}

      <Text style={styles.disclaimer}>
        You don't have to force any feeling away.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 62,
    overflow: 'hidden',
  },

  backgroundGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#1C7890',
    opacity: 0.12,
    top: 180,
    right: -120,
  },

  backgroundGlowTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#668DCE',
    opacity: 0.10,
    bottom: 80,
    left: -110,
  },

  back: {
    color: '#B9E9F4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 30,
  },

  eyebrow: {
    color: '#8DD9E8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 12,
  },

  subtitle: {
    color: '#C2DDE9',
    fontSize: 14,
    lineHeight: 23,
    marginTop: 10,
  },

  instruction: {
    marginTop: 22,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF12',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  instructionText: {
    color: '#BCEAF2',
    fontSize: 11,
    fontWeight: '600',
  },

  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'center',
    marginTop: 10,
  },

  bubbleWrapper: {
    width: '32%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },

  bubble: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#B9F4FF90',
    backgroundColor: '#75C5DF35',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#75DFFF',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },

  bubbleLarge: {
    backgroundColor: '#65B9D940',
  },

  bubbleSmall: {
    backgroundColor: '#9BCBEA30',
  },

  bubbleHighlight: {
    position: 'absolute',
    width: '38%',
    height: '20%',
    borderRadius: 50,
    backgroundColor: '#FFFFFF35',
    top: '17%',
    left: '17%',
    transform: [{ rotate: '-35deg' }],
  },

  bubbleIcon: {
    color: '#FFFFFF',
    fontSize: 25,
  },

  word: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },

  progressArea: {
    marginBottom: 18,
  },

  progress: {
    color: '#D8F2F8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  progressTrack: {
    height: 5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF25',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#8DE3E8',
    borderRadius: 10,
  },

  finishButton: {
    backgroundColor: '#B5DDF5',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },

  finishText: {
    color: '#102F4B',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },

  footer: {
    color: '#C2E5EE',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
  },

  disclaimer: {
    color: '#91B9C8',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
});