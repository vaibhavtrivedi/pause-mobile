import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import {
  loadPreferences,
  UserPreferences,
  OrbTheme,
  DEFAULT_PREFERENCES,
} from '../lib/preferences';

import {
  applyAudioPreferences,
  AudioEffects,
} from '../lib/audio';

import type { ColorValue } from 'react-native';

const SESSION_SECONDS = 60;
const INHALE_SECONDS = 4;
const EXHALE_SECONDS = 6;
const BREATH_CYCLE_SECONDS = 10;

type Phase = 'inhale' | 'exhale';

const THEMES: Record<
  OrbTheme,
  {
    background: readonly [ColorValue, ColorValue, ...ColorValue[]];
    primary: string;
    secondary: string;
    core: string;
    glow: string;
    particle: string;
    label: string;
  }
> = {
  energy: {
    background: ['#050E20', '#0B1D38', '#142B49'],
    primary: '#416FAE',
    secondary: '#83B9F5',
    core: '#D9EDFF',
    glow: '#77B9FF',
    particle: '#C5E5FF',
    label: 'LIVING ENERGY',
  },

  aurora: {
    background: ['#091528', '#102E3E', '#172C4D'],
    primary: '#387E86',
    secondary: '#75C9B1',
    core: '#D0FFE9',
    glow: '#5CE2C1',
    particle: '#B5FFE8',
    label: 'AURORA',
  },

  ripple: {
    background: ['#07192B', '#103B55', '#142F4A'],
    primary: '#327DAB',
    secondary: '#7ACCEB',
    core: '#D8F6FF',
    glow: '#72D7FF',
    particle: '#B8F0FF',
    label: 'WATER RIPPLE',
  },

  solar: {
    background: ['#171329', '#392849', '#493044'],
    primary: '#A66A3C',
    secondary: '#F0B66B',
    core: '#FFF0C7',
    glow: '#FFC36F',
    particle: '#FFE2A8',
    label: 'SOLAR GLOW',
  },
};

const PARTICLES = [
  { x: -105, y: -75, size: 5 },
  { x: 100, y: -100, size: 4 },
  { x: -125, y: 35, size: 3 },
  { x: 115, y: 45, size: 5 },
  { x: -70, y: 105, size: 4 },
  { x: 75, y: 115, size: 3 },
  { x: 0, y: -125, size: 4 },
  { x: 130, y: -30, size: 3 },
];

export default function Breathing() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [loaded, setLoaded] = useState(false);
  const [orbReady, setOrbReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  const scale = useRef(new Animated.Value(0.82)).current;
  const glow = useRef(new Animated.Value(0.25)).current;
  const particleMotion = useRef(new Animated.Value(0)).current;

  const cycle = useRef<Animated.CompositeAnimation | null>(null);

  const phaseRef = useRef<Phase>('inhale');
  const phaseRemainingMsRef = useRef(INHALE_SECONDS * 1000);
  const phaseStartedAtRef = useRef(0);

  const elapsedRef = useRef(0);
  const runningRef = useRef(true);
  const finishedRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const lastPhase = useRef<Phase>('inhale');
  const completionPlayed = useRef(false);

  const theme =
    THEMES[preferences.orbTheme] || THEMES.energy;

  const currentPhase: Phase =
    elapsed % BREATH_CYCLE_SECONDS < INHALE_SECONDS
      ? 'inhale'
      : 'exhale';

  // ========================================
  // THEME ANIMATION VALUES
  // ========================================

  const themeRotation = particleMotion.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseRotation = particleMotion.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const rippleOpacity = particleMotion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.65, 0.3, 0.02],
  });

  const energyHighlightX = particleMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [-13, 13],
  });

  const energyHighlightY = particleMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 10],
  });

  const energyPulse = particleMotion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.65, 1, 0.65],
  });

  // ========================================
  // PREFERENCES
  // ========================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSettings() {
        try {
          const saved = await loadPreferences();

          if (!active) return;

          setPreferences(saved);
          reducedMotionRef.current = saved.reducedMotion;

          await applyAudioPreferences(saved);

          if (active) {
            setLoaded(true);
          }
        } catch (error) {
          console.warn('Could not load preferences:', error);

          if (active) {
            setLoaded(true);
          }
        }
      }

      loadSettings();

      return () => {
        active = false;
      };
    }, [])
  );

  // ========================================
// ANIMATION CONTROL
// ========================================

const stopAnimation = useCallback(() => {
  if (cycle.current && phaseStartedAtRef.current) {
    const elapsedMs =
      Date.now() - phaseStartedAtRef.current;

    phaseRemainingMsRef.current = Math.max(
      0,
      phaseRemainingMsRef.current - elapsedMs
    );
  }

  cycle.current?.stop();
  cycle.current = null;
  phaseStartedAtRef.current = 0;
}, []);

const startOrbAnimation = useCallback(() => {
  if (
    !runningRef.current ||
    finishedRef.current ||
    !loaded ||
    !orbReady
  ) {
    return;
  }

  const inhale = phaseRef.current === 'inhale';

  const phaseDuration = inhale
    ? INHALE_SECONDS * 1000
    : EXHALE_SECONDS * 1000;

  const remainingDuration = Math.max(
    1,
    Math.min(
      phaseRemainingMsRef.current,
      phaseDuration
    )
  );

  const progress =
    1 - remainingDuration / phaseDuration;

  const fromScale = inhale
    ? 0.82 + progress * 0.30
    : 1.12 - progress * 0.30;

  const toScale = inhale ? 1.12 : 0.82;

  const fromGlow = inhale
    ? 0.25 + progress * 0.65
    : 0.90 - progress * 0.65;

  const toGlow = inhale ? 0.90 : 0.25;

  // Keep orbital rotation synchronized with breathing.
  const cyclePosition = inhale
  ? 1 - progress * 0.6
  : 0.4 + progress * 0.6;

  scale.setValue(fromScale);
  glow.setValue(fromGlow);
  particleMotion.setValue(cyclePosition);

  phaseStartedAtRef.current = Date.now();

  const animations = [
    Animated.timing(scale, {
      toValue: toScale,
      duration: remainingDuration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),

    Animated.timing(glow, {
      toValue: toGlow,
      duration: remainingDuration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
  ];

  if (!reducedMotionRef.current) {
    animations.push(
      Animated.timing(particleMotion, {
        toValue: inhale ? 0.4 : 1,
        duration: remainingDuration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
  }

  const animation = Animated.parallel(animations);

  cycle.current = animation;

  animation.start(({ finished: completed }) => {
    cycle.current = null;
    phaseStartedAtRef.current = 0;

    if (
      !completed ||
      !runningRef.current ||
      finishedRef.current
    ) {
      return;
    }

    // Move to the next breathing phase.
    if (phaseRef.current === 'inhale') {
      phaseRef.current = 'exhale';

      phaseRemainingMsRef.current =
        EXHALE_SECONDS * 1000;
    } else {
      phaseRef.current = 'inhale';

      phaseRemainingMsRef.current =
        INHALE_SECONDS * 1000;
    }

    startOrbAnimation();
  });
}, [
  loaded,
  orbReady,
  scale,
  glow,
  particleMotion,
]);

// Wait until the orb has rendered before starting its animation.
useEffect(() => {
  if (!loaded || !orbReady || !running || finished) {
    stopAnimation();
    return;
  }

  let firstFrame = 0;
  let secondFrame = 0;

  firstFrame = requestAnimationFrame(() => {
    secondFrame = requestAnimationFrame(() => {
      startOrbAnimation();
    });
  });

  return () => {
    cancelAnimationFrame(firstFrame);
    cancelAnimationFrame(secondFrame);
    stopAnimation();
  };
}, [
  loaded,
  orbReady,
  running,
  finished,
  startOrbAnimation,
  stopAnimation,
]);

  // ========================================
  // SESSION TIMER
  // ========================================

  useEffect(() => {
    if (!loaded || !running || finished) return;

    const timer = setInterval(() => {
      setElapsed(previous => {
        const next = previous + 1;

        elapsedRef.current = next;

        if (next >= SESSION_SECONDS) {
          finishedRef.current = true;
          runningRef.current = false;

          setRunning(false);
          setFinished(true);

          return SESSION_SECONDS;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loaded, running, finished]);

  // ========================================
  // BREATHING PHASE FEEDBACK
  // ========================================

  useEffect(() => {
    if (
      loaded &&
      running &&
      currentPhase !== lastPhase.current &&
      preferences.hapticsEnabled
    ) {
      Haptics.selectionAsync().catch(() => {});
    }

    lastPhase.current = currentPhase;
  }, [
    currentPhase,
    loaded,
    running,
    preferences.hapticsEnabled,
  ]);


  // ========================================
  // SESSION CONTROLS
  // ========================================

  const togglePause = () => {
    if (runningRef.current) {
      runningRef.current = false;

      setRunning(false);
      stopAnimation();
    } else {
      runningRef.current = true;

      setRunning(true);
    }
  };

  const reset = () => {
  const wasAlreadyRunning =
    runningRef.current && !finishedRef.current;

  stopAnimation();

  elapsedRef.current = 0;
  runningRef.current = true;
  finishedRef.current = false;

  setElapsed(0);
  setFinished(false);
  setRunning(true);

  phaseRef.current = 'inhale';
  phaseRemainingMsRef.current = INHALE_SECONDS * 1000;
  phaseStartedAtRef.current = 0;

  particleMotion.setValue(1);

  lastPhase.current = 'inhale';
  completionPlayed.current = false;

  scale.setValue(0.82);
  glow.setValue(0.25);

  // Restart explicitly when resetting an active session.
  if (wasAlreadyRunning && loaded && orbReady) {
    requestAnimationFrame(() => {
      startOrbAnimation();
    });
  }
};

  const leave = () => {
    stopAnimation();
    router.replace('/choose');
  };

  // ========================================
  // COMPLETION
  // ========================================

  useEffect(() => {
    if (finished && !completionPlayed.current) {
      completionPlayed.current = true;
      AudioEffects.completion();
    }
  }, [finished]);

  useEffect(() => {
    return () => {
      stopAnimation();
      particleMotion.stopAnimation();
    };
  }, [stopAnimation, particleMotion]);

  // ========================================
  // DISPLAY VALUES
  // ========================================

  const remaining = Math.max(
    0,
    SESSION_SECONDS - elapsed
  );

  const progress = elapsed / SESSION_SECONDS;

  // ========================================
  // LOADING
  // ========================================

  if (!loaded) {
    return (
      <LinearGradient
        colors={theme.background}
        style={styles.page}
      />
    );
  }

  // ========================================
  // COMPLETION SCREEN
  // ========================================

  if (finished) {
    return (
      <LinearGradient
        colors={theme.background}
        style={styles.page}
      >
        <View style={styles.center}>
          <Text style={styles.completionStar}>✦</Text>

          <Text style={styles.title}>
            You made space for calm.
          </Text>

          <Text style={styles.subtitle}>
            You completed a minute of gentle breathing.
            Notice how you feel. There is no right answer.
          </Text>

          <Pressable
            style={styles.primary}
            onPress={() =>
              router.replace({
                pathname: '/complete',
                params: {
                  activity: 'Breathing Orb',
                  duration: '60',
                },
              })
            }
          >
            <Text style={styles.primaryText}>
              CONTINUE →
            </Text>
          </Pressable>

          <Pressable
            onPress={reset}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>
              Repeat breathing
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // ========================================
  // MAIN EXPERIENCE
  // ========================================

  return (
    <LinearGradient
      colors={theme.background}
      style={styles.page}
    >
      <View style={styles.header}>
        <Pressable onPress={leave}>
          <Text style={styles.back}>‹ EXIT</Text>
        </Pressable>

        <Text style={styles.themeLabel}>
          {theme.label}
        </Text>

        <Pressable
          onPress={() => router.push('/preferences')}
        >
          <Text style={styles.settings}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={styles.eyebrow}>
          PAUSE · BREATHING EXPERIENCE
        </Text>

        <Text style={styles.title}>
          Follow the light.
        </Text>

        <Text style={styles.subtitle}>
          Breathe gently, at a pace that feels comfortable.
        </Text>

        {/* THEME-SPECIFIC ORB STAGE */}

        <View
          style={styles.orbStage}
          onLayout={() => setOrbReady(true)}
        >
          {!preferences.reducedMotion && (
            <Animated.View
              style={[
                styles.outerGlow,
                {
                  backgroundColor: theme.glow,
                  opacity: glow.interpolate({
                    inputRange: [0.25, 0.9],
                    outputRange: [0.10, 0.30],
                  }),
                  transform: [{ scale }],
                },
              ]}
            />
          )}

          {/* ENERGY THEME */}

          {preferences.orbTheme === 'energy' && (
            <>
              {/* Atmospheric halo */}

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.energyHalo,
                  {
                    opacity: preferences.reducedMotion
                      ? 0.45
                      : energyPulse,
                    transform: [{ scale }],
                  },
                ]}
              />

              {/* Rotating orbital glass rings */}

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.energyOrbit,
                  styles.energyOrbitOuter,
                  {
                    borderColor: '#75BFFF',
                    opacity: 0.55,
                    transform: [
                      { rotate: themeRotation },
                    ],
                  },
                ]}
              >
                <View style={styles.energyOrbitNode} />
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.energyOrbit,
                  styles.energyOrbitInner,
                  {
                    borderColor: '#C0E7FF',
                    opacity: 0.65,
                    transform: [
                      { rotate: reverseRotation },
                    ],
                  },
                ]}
              >
                <View style={styles.energyOrbitNodeSmall} />
              </Animated.View>

              {/* Floating energy particles */}

              {PARTICLES.map((particle, index) => (
                <Animated.View
                  key={index}
                  pointerEvents="none"
                  style={[
                    styles.energyParticle,
                    {
                      width: particle.size + 2,
                      height: particle.size + 2,
                      left: '50%',
                      top: '50%',
                      backgroundColor: theme.particle,
                      opacity: preferences.reducedMotion
                        ? 0.5
                        : particleMotion.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.2, 1],
                          }),
                      transform: [
                        { translateX: particle.x },
                        {
                          translateY: preferences.reducedMotion
                            ? particle.y
                            : particleMotion.interpolate({
                                inputRange: [0, 1],
                                outputRange: [
                                  particle.y,
                                  particle.y - 20,
                                ],
                              }),
                        },
                      ],
                    },
                  ]}
                />
              ))}

              {/* Main breathing sphere */}

              <Animated.View
                style={[
                  styles.energyOrbAssembly,
                  {
                    transform: [{ scale }],
                  },
                ]}
              >
                {/* Outer glass shell */}

                <View style={styles.energyShell}>
                  <LinearGradient
                    colors={[
                      'rgba(191,226,255,0.38)',
                      'rgba(67,130,193,0.16)',
                      'rgba(17,48,87,0.58)',
                    ]}
                    style={styles.energyShellGradient}
                  >
                    {/* Inner luminous sphere */}

                    <View style={styles.energyInnerSphere}>
                      <LinearGradient
                        colors={[
                          '#EAF8FF',
                          '#A7D8FF',
                          '#5596D7',
                          '#1E4D83',
                        ]}
                        locations={[0, 0.25, 0.65, 1]}
                        style={styles.energyInnerGradient}
                      >
                        {/* Bright inner core */}

                        <View style={styles.energyCore}>
                          <LinearGradient
                            colors={[
                              '#FFFFFF',
                              '#D7F0FF',
                              '#91CCFF',
                            ]}
                            style={styles.energyCoreGradient}
                          />
                        </View>

                        {/* Moving reflective highlight */}

                        {!preferences.reducedMotion && (
                          <Animated.View
                            pointerEvents="none"
                            style={[
                              styles.energyHighlight,
                              {
                                transform: [
                                  { translateX: energyHighlightX },
                                  { translateY: energyHighlightY },
                                ],
                              },
                            ]}
                          />
                        )}

                        <View style={styles.energyLowerShade} />
                      </LinearGradient>
                    </View>

                    {/* Glass reflection */}

                    <View style={styles.energyGlassReflection} />
                  </LinearGradient>
                </View>

                {/* Outer luminous edge */}

                <View style={styles.energyRim} />
              </Animated.View>
            </>
          )}

          {/* AURORA THEME */}

          {preferences.orbTheme === 'aurora' && (
            <>
              <Animated.View
                style={[
                  styles.auroraRibbon,
                  {
                    borderColor: '#72F5D0',
                    transform: [{ rotate: themeRotation }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.auroraRibbon,
                  styles.auroraRibbonTwo,
                  {
                    borderColor: '#A1A8FF',
                    transform: [{ rotate: reverseRotation }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.auroraRibbon,
                  styles.auroraRibbonThree,
                  {
                    borderColor: '#65D9F2',
                    transform: [{ rotate: themeRotation }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.auroraCore,
                  { transform: [{ scale }] },
                ]}
              >
                <LinearGradient
                  colors={['#D6FFF0', '#62DDBB', '#246E83']}
                  style={styles.auroraGradient}
                >
                  <View style={styles.auroraHighlight} />
                </LinearGradient>
              </Animated.View>
            </>
          )}

          {/* RIPPLE THEME */}

          {preferences.orbTheme === 'ripple' && (
            <>
              {[0, 1, 2].map(index => (
                <Animated.View
                  key={index}
                  style={[
                    styles.rippleRing,
                    {
                      borderColor: theme.secondary,
                      opacity: preferences.reducedMotion
                        ? 0.35
                        : rippleOpacity,
                      transform: [
                        {
                          scale: preferences.reducedMotion
                            ? 0.85 + index * 0.3
                            : particleMotion.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [
                                  0.65 + index * 0.25,
                                  1.15 + index * 0.25,
                                  1.65 + index * 0.25,
                                ],
                              }),
                        },
                      ],
                    },
                  ]}
                />
              ))}

              <Animated.View
                style={[
                  styles.waterOrb,
                  { transform: [{ scale }] },
                ]}
              >
                <LinearGradient
                  colors={['#D8FAFF', '#69C7E8', '#155578']}
                  style={styles.waterGradient}
                >
                  <View style={styles.waterHighlight} />
                  <View style={styles.waterHighlightTwo} />
                </LinearGradient>
              </Animated.View>
            </>
          )}

          {/* SOLAR THEME */}

          {preferences.orbTheme === 'solar' && (
            <>
              <Animated.View
                style={[
                  styles.solarRays,
                  {
                    transform: [
                      { rotate: themeRotation },
                      { scale },
                    ],
                  },
                ]}
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.solarRay,
                      {
                        transform: [
                          { rotate: `${index * 30}deg` },
                        ],
                      },
                    ]}
                  />
                ))}
              </Animated.View>

              <Animated.View
                style={[
                  styles.solarOrb,
                  { transform: [{ scale }] },
                ]}
              >
                <LinearGradient
                  colors={['#FFF8D7', '#FFC66F', '#D87935']}
                  style={styles.solarGradient}
                >
                  <View style={styles.solarHighlight} />
                </LinearGradient>
              </Animated.View>
            </>
          )}
        </View>

        <Text style={styles.phase}>
          {!running
            ? 'Take your time'
            : currentPhase === 'inhale'
              ? 'Breathe in gently'
              : 'Breathe out slowly'}
        </Text>

        <Text style={styles.hint}>
          {!running
            ? 'Paused. Resume when you feel ready.'
            : currentPhase === 'inhale'
              ? 'Let the light grow.'
              : 'Let the light soften.'}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.time}>
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, '0')} remaining
          </Text>

          <Text style={styles.time}>
            1 minute
          </Text>
        </View>

        <Pressable
          style={styles.primary}
          onPress={togglePause}
        >
          <Text style={styles.primaryText}>
            {running ? 'PAUSE SESSION' : 'RESUME SESSION'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={reset}
        >
          <Text style={styles.secondaryText}>
            Start again
          </Text>
        </Pressable>

        <Text style={styles.footnote}>
          No breath-holding. If this rhythm feels
          uncomfortable, return to your natural breathing
          or stop.
        </Text>
      </View>
    </LinearGradient>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  back: {
    color: '#C4D8F4',
    fontSize: 14,
    fontWeight: '800',
  },

  themeLabel: {
    color: '#AFC8EC',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '800',
  },

  settings: {
    color: '#C4D8F4',
    fontSize: 22,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyebrow: {
    color: '#AFC8EC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },

  title: {
    color: '#F6F8FF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },

  subtitle: {
    color: '#B9C9E0',
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 9,
    maxWidth: 300,
  },

  orbStage: {
    height: 300,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  outerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 150,
  },

  // ENERGY

  energyHalo: {
    position: 'absolute',
    width: 255,
    height: 255,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: '#73BFFF',
    backgroundColor: 'rgba(49,125,194,0.07)',
  },

  energyOrbit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 150,
  },

  energyOrbitOuter: {
    width: 255,
    height: 175,
  },

  energyOrbitInner: {
    width: 225,
    height: 205,
    borderWidth: 1,
  },

  energyOrbitNode: {
    width: 9,
    height: 9,
    borderRadius: 6,
    backgroundColor: '#C8EBFF',
    marginTop: -5,
    shadowColor: '#8DCFFF',
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },

  energyOrbitNodeSmall: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginTop: -3,
    shadowColor: '#B5E5FF',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },

  energyParticle: {
    position: 'absolute',
    borderRadius: 20,
    marginLeft: -3,
    marginTop: -3,
    elevation: 8,
    shadowColor: '#A5D9FF',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  energyOrbAssembly: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },

  energyShell: {
    width: 190,
    height: 190,
    borderRadius: 100,
    padding: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(191,226,255,0.85)',
    backgroundColor: 'rgba(103,167,224,0.16)',
    shadowColor: '#78BDFF',
    shadowOpacity: 0.85,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 22,
  },

  energyShellGradient: {
    flex: 1,
    borderRadius: 100,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(219,242,255,0.55)',
  },

  energyInnerSphere: {
    flex: 1,
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(222,244,255,0.7)',
  },

  energyInnerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  energyCore: {
    width: 75,
    height: 75,
    borderRadius: 45,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.32)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },

  energyCoreGradient: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
  },

  energyHighlight: {
    position: 'absolute',
    width: 95,
    height: 42,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.55)',
    top: 24,
    left: 30,
    transform: [{ rotate: '-38deg' }],
  },

  energyLowerShade: {
    position: 'absolute',
    width: 160,
    height: 65,
    borderRadius: 100,
    backgroundColor: 'rgba(5,35,75,0.22)',
    bottom: -32,
  },

  energyGlassReflection: {
    position: 'absolute',
    width: 50,
    height: 115,
    borderRadius: 40,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.55)',
    top: 15,
    left: 12,
    transform: [{ rotate: '18deg' }],
  },

  energyRim: {
    position: 'absolute',
    width: 177,
    height: 177,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(229,246,255,0.55)',
  },

  // AURORA

  auroraRibbon: {
    position: 'absolute',
    width: 155,
    height: 245,
    borderWidth: 5,
    borderRadius: 130,
    opacity: 0.65,
  },

  auroraRibbonTwo: {
    width: 190,
    height: 225,
    borderWidth: 4,
    opacity: 0.55,
  },

  auroraRibbonThree: {
    width: 220,
    height: 175,
    borderWidth: 3,
    opacity: 0.4,
  },

  auroraCore: {
    width: 145,
    height: 145,
    borderRadius: 90,
    overflow: 'hidden',
    elevation: 15,
  },

  auroraGradient: {
    flex: 1,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  auroraHighlight: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.35,
    transform: [{ translateY: -15 }],
  },

  // RIPPLE

  rippleRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 100,
    borderWidth: 2,
  },

  waterOrb: {
    width: 155,
    height: 155,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#A5ECFF',
    elevation: 20,
  },

  waterGradient: {
    flex: 1,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  waterHighlight: {
    position: 'absolute',
    width: 95,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    opacity: 0.35,
    top: 28,
    left: 25,
    transform: [{ rotate: '-35deg' }],
  },

  waterHighlightTwo: {
    position: 'absolute',
    width: 50,
    height: 15,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
    bottom: 35,
    right: 25,
  },

  // SOLAR

  solarRays: {
    position: 'absolute',
    width: 245,
    height: 245,
    alignItems: 'center',
    justifyContent: 'center',
  },

  solarRay: {
    position: 'absolute',
    width: 9,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#FFC978',
    top: 0,
    opacity: 0.85,
  },

  solarOrb: {
    width: 155,
    height: 155,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFE6A5',
    elevation: 25,
    shadowColor: '#FFB34F',
    shadowOpacity: 0.9,
    shadowRadius: 35,
  },

  solarGradient: {
    flex: 1,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  solarHighlight: {
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    transform: [{ translateY: -18 }],
  },

  // SESSION UI

  phase: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },

  hint: {
    color: '#C2D2E9',
    fontSize: 12,
    marginTop: 7,
  },

  progressTrack: {
    height: 5,
    width: '100%',
    backgroundColor: '#314764',
    borderRadius: 8,
    marginTop: 25,
    overflow: 'hidden',
  },

  progressFill: {
    height: 5,
    backgroundColor: '#B7D3FF',
    borderRadius: 8,
  },

  timeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  time: {
    color: '#AFC1DA',
    fontSize: 11,
  },

  primary: {
    backgroundColor: '#B7D3FF',
    paddingVertical: 16,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 25,
  },

  primaryText: {
    color: '#10213B',
    fontWeight: '900',
    letterSpacing: 1,
  },

  secondary: {
    padding: 12,
    marginTop: 4,
  },

  secondaryText: {
    color: '#C2D6F2',
    fontWeight: '600',
  },

  footnote: {
    color: '#92A8C8',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 7,
  },

  completionStar: {
    color: '#C5DFFF',
    fontSize: 55,
    marginBottom: 20,
  },
});