import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import { loadPreferences } from "../lib/preferences";
import { applyAudioPreferences, AudioEffects } from "../lib/audio";

// ==========================================
// CONSTANTS
// ==========================================

const WORDS = [
  "Pressure",
  "Frustration",
  "Expectations",
  "Worry",
  "Impatience",
  "Tension",
];

const TOTAL_BUBBLES = WORDS.length;

// ==========================================
// BUBBLE COMPONENT
// ==========================================

type BubbleProps = {
  word: string;
  index: number;
  animation: Animated.Value;
  released: boolean;
  reducedMotion: boolean;
  onRelease: (index: number) => void;
};

const Bubble = memo(function Bubble({
  word,
  index,
  animation,
  released,
  reducedMotion,
  onRelease,
}: BubbleProps) {
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10 - (index % 3) * 4],
  });

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        !reducedMotion && {
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          released ? `${word}, released` : `Release ${word} bubble`
        }
        accessibilityState={{ disabled: released }}
        disabled={released}
        onPress={() => onRelease(index)}
        style={[styles.bubble, released && styles.popped]}
      >
        <Text style={styles.bubbleIcon}>{released ? "✓" : "◌"}</Text>

        <Text style={styles.word}>{released ? "Released" : word}</Text>
      </Pressable>
    </Animated.View>
  );
});

// ==========================================
// MAIN SCREEN
// ==========================================

export default function Bubbles() {
  const [done, setDone] = useState<number[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [focused, setFocused] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const hapticsEnabled = useRef(false);
  const startedAt = useRef(Date.now());
  const finished = useRef(false);

  // Create animation values only once.
  const floats = useRef(WORDS.map(() => new Animated.Value(0))).current;

  const floatAnimations = useRef<(Animated.CompositeAnimation | null)[]>([]);

  // ========================================
  // LOAD USER PREFERENCES
  // ========================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setFocused(true);
      setPreferencesLoaded(false);

      const initialize = async () => {
        try {
          const preferences = await loadPreferences();

          if (!active) return;

          setReducedMotion(preferences.reducedMotion);
          hapticsEnabled.current = preferences.hapticsEnabled;

          await applyAudioPreferences(preferences);
        } catch (error) {
          console.warn("Could not load bubble preferences:", error);
        } finally {
          if (active) {
            setPreferencesLoaded(true);
          }
        }
      };

      initialize();

      return () => {
        active = false;
        setFocused(false);
      };
    }, []),
  );

  // ========================================
  // FLOATING ANIMATIONS
  // ========================================

  useEffect(() => {
    if (!focused || !preferencesLoaded) {
      return;
    }

    if (reducedMotion) {
      floats.forEach((value) => value.setValue(0));
      return;
    }

    const animations = floats.map((value, index) => {
      if (done.includes(index)) {
        return null;
      }

      const duration = 1800 + index * 180;

      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 170),

          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),

          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    });

    floatAnimations.current = animations;

animations.forEach((animation) => {
  animation?.start();
});

    return () => {
      animations.forEach((animation) => animation?.stop());
      floatAnimations.current = [];
    };
  }, [floats, reducedMotion, focused, preferencesLoaded, done]);

  // ========================================
  // RELEASE BUBBLE
  // ========================================

  const release = useCallback((index: number) => {
    setDone((previous) => {
      if (previous.includes(index)) {
        return previous;
      }

      return [...previous, index];
    });

    floatAnimations.current[index]?.stop();

    AudioEffects.bubblePop();

    if (hapticsEnabled.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  // ========================================
  // FINISH SESSION
  // ========================================

  const finish = useCallback(() => {
    if (finished.current) return;

    finished.current = true;

    const duration = Math.max(
      1,
      Math.round((Date.now() - startedAt.current) / 1000),
    );

    AudioEffects.transition();

    router.replace({
      pathname: "/complete",
      params: {
        activity: "Bubble Ocean",
        duration: String(duration),
      },
    });
  }, []);

  // ========================================
  // RENDER
  // ========================================

  return (
    <LinearGradient
      colors={["#102F4B", "#164A63", "#1C6170"]}
      style={styles.page}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Exit bubble activity"
        onPress={() => router.back()}
      >
        <Text style={styles.back}>← EXIT</Text>
      </Pressable>

      <Text style={styles.eyebrow}>THE BUBBLE OCEAN</Text>

      <Text style={styles.title}>Let thoughts float away.</Text>

      <Text style={styles.sub}>
        Tap a bubble when you are ready. There is no rush, and you do not need
        to force a feeling away.
      </Text>

      <View style={styles.grid}>
        {WORDS.map((word, index) => (
          <Bubble
            key={word}
            word={word}
            index={index}
            animation={floats[index]}
            released={done.includes(index)}
            reducedMotion={reducedMotion}
            onRelease={release}
          />
        ))}
      </View>

      <Text style={styles.count}>
        {done.length}/{TOTAL_BUBBLES} bubbles released
      </Text>

      {done.length === TOTAL_BUBBLES && (
        <Pressable
          accessibilityRole="button"
          onPress={finish}
          style={styles.button}
        >
          <Text style={styles.buttonText}>FINISH MY JOURNEY →</Text>
        </Pressable>
      )}

      <Text style={styles.footnote}>
        You can stop at any time. This is a reflection activity, not a test.
      </Text>
    </LinearGradient>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
  },

  back: {
    color: "#B9E9F4",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 28,
  },

  eyebrow: {
    color: "#B9E9F4",
    letterSpacing: 2,
    fontWeight: "700",
    fontSize: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },

  sub: {
    color: "#C6E8F3",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 22,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 35,
  },

  bubbleContainer: {
    width: "30%",
  },

  bubble: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: "#5F9CB5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#B9E9F4",
  },

  popped: {
    backgroundColor: "#28576B",
    opacity: 0.75,
  },

  bubbleIcon: {
    fontSize: 25,
    color: "#FFFFFF",
  },

  word: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },

  count: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 15,
  },

  button: {
    backgroundColor: "#A8C9FF",
    padding: 17,
    borderRadius: 15,
    marginTop: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#10203A",
    fontWeight: "800",
  },

  footnote: {
    color: "#A9D1DD",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 18,
  },
});
