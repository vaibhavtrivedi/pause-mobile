import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  resetPreferences,
  UserPreferences,
  OrbTheme,
  SoundTheme,
} from '../lib/preferences';

import {
  applyAudioPreferences,
} from '../lib/audio';

const ORBS: {
  id: OrbTheme;
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    id: 'energy',
    name: 'Living Energy',
    icon: '✨',
    description: 'Luminous energy sphere',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    icon: '🌌',
    description: 'Flowing colourful lights',
  },
  {
    id: 'ripple',
    name: 'Water Ripple',
    icon: '🌊',
    description: 'Gentle expanding waves',
  },
  {
    id: 'solar',
    name: 'Solar Glow',
    icon: '☀️',
    description: 'Warm golden radiance',
  },
];

const SOUNDS: {
  id: SoundTheme;
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    id: 'silent',
    name: 'Silent',
    icon: '🔇',
    description: 'No ambient music',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: '🌊',
    description: 'Gentle flowing waves',
  },
  {
    id: 'rain',
    name: 'Rainfall',
    icon: '🌧️',
    description: 'Peaceful rain sounds',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌿',
    description: 'Nature and birdsong',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    icon: '🎵',
    description: 'Soft ambient music',
  },
];

export default function Preferences() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ========================================
  // LOAD PREFERENCES
  // ========================================

  useEffect(() => {
    let active = true;

    async function load() {
      const saved = await loadPreferences();

      if (active) {
        setPreferences(saved);
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // UPDATE PREFERENCES + AUDIO
  // ========================================

  const updatePreference = async (
    changes: Partial<UserPreferences>
  ) => {
    const updated = {
      ...preferences,
      ...changes,
    };

    setPreferences(updated);
    setSaving(true);

    try {
      await savePreferences(updated);

      // Apply audio changes immediately.
      await applyAudioPreferences(updated);

    } catch (error) {
      console.warn('Preference update failed:', error);

      Alert.alert(
        'Unable to save',
        'Your preference could not be saved. Please try again.'
      );

    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // SELECT AMBIENT SOUND
  // ========================================

  const selectSound = async (sound: SoundTheme) => {
    await updatePreference({
      soundTheme: sound,
      musicEnabled: sound !== 'silent',
    });
  };

  // ========================================
  // RESTORE DEFAULTS
  // ========================================

  const restoreDefaults = () => {
    Alert.alert(
      'Restore defaults?',
      'This will reset all your personalisation settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetPreferences();

              setPreferences(DEFAULT_PREFERENCES);

              await applyAudioPreferences(
                DEFAULT_PREFERENCES
              );

            } catch (error) {
              console.warn('Reset failed:', error);

              Alert.alert(
                'Unable to reset',
                'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  // ========================================
  // VOLUME CONTROL
  // ========================================

  const volumeControl = (
    label: string,
    value: number,
    onChange: (value: number) => void
  ) => (
    <View style={styles.volumeRow}>
      <Text style={styles.volumeLabel}>
        {label}
      </Text>

      <View style={styles.volumeControls}>
        <Pressable
          style={styles.volumeButton}
          onPress={() =>
            onChange(Math.max(0, value - 10))
          }
        >
          <Text style={styles.volumeButtonText}>
            −
          </Text>
        </Pressable>

        <Text style={styles.volumeValue}>
          {value}%
        </Text>

        <Pressable
          style={styles.volumeButton}
          onPress={() =>
            onChange(Math.min(100, value + 10))
          }
        >
          <Text style={styles.volumeButtonText}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <LinearGradient
        colors={['#081326', '#102747', '#173653']}
        style={styles.page}
      >
        <ActivityIndicator
          color="#B7D3FF"
          size="large"
        />
      </LinearGradient>
    );
  }

  // ========================================
  // MAIN SCREEN
  // ========================================

  return (
    <LinearGradient
      colors={['#081326', '#102747', '#173653']}
      style={styles.page}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>
              ‹ BACK
            </Text>
          </Pressable>

          <Text style={styles.headerLabel}>
            PERSONALISE
          </Text>
        </View>

        <Text style={styles.title}>
          Make PAUSE yours.
        </Text>

        <Text style={styles.subtitle}>
          Create an experience that feels comfortable,
          peaceful and personal to you.
        </Text>

        {/* ORB APPEARANCE */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ✨ Orb appearance
          </Text>

          <Text style={styles.sectionDescription}>
            Choose the visual experience you enjoy most.
          </Text>

          {ORBS.map((orb) => {
            const selected =
              preferences.orbTheme === orb.id;

            return (
              <Pressable
                key={orb.id}
                onPress={() =>
                  updatePreference({
                    orbTheme: orb.id,
                  })
                }
                style={[
                  styles.option,
                  selected && styles.selectedOption,
                ]}
              >
                <Text style={styles.optionIcon}>
                  {orb.icon}
                </Text>

                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>
                    {orb.name}
                  </Text>

                  <Text style={styles.optionDescription}>
                    {orb.description}
                  </Text>
                </View>

                <Text style={styles.check}>
                  {selected ? '●' : '○'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* AMBIENT SOUNDS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎵 Ambient sounds
          </Text>

          <Text style={styles.sectionDescription}>
            Tap a sound to select and start playing it.
          </Text>

          {SOUNDS.map((sound) => {
            const selected =
              preferences.soundTheme === sound.id;

            return (
              <Pressable
                key={sound.id}
                onPress={() => selectSound(sound.id)}
                style={[
                  styles.option,
                  selected && styles.selectedOption,
                ]}
              >
                <Text style={styles.optionIcon}>
                  {sound.icon}
                </Text>

                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>
                    {sound.name}
                  </Text>

                  <Text style={styles.optionDescription}>
                    {sound.description}
                  </Text>
                </View>

                <Text style={styles.check}>
                  {selected ? '●' : '○'}
                </Text>
              </Pressable>
            );
          })}

          {preferences.musicEnabled &&
            preferences.soundTheme !== 'silent' && (
              <Text style={styles.playingStatus}>
                ♪ Ambient sound enabled
              </Text>
            )}
        </View>

        {/* SOUND CONTROLS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔊 Sound controls
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.optionTitle}>
                Ambient music
              </Text>

              <Text style={styles.optionDescription}>
                Enable background sounds
              </Text>
            </View>

            <Switch
              value={preferences.musicEnabled}
              onValueChange={(value) =>
                updatePreference({
                  musicEnabled: value,
                })
              }
              trackColor={{
                false: '#40516B',
                true: '#638FC7',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {volumeControl(
            'Music volume',
            preferences.musicVolume,
            (value) =>
              updatePreference({
                musicVolume: value,
              })
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.optionTitle}>
                Sound effects
              </Text>

              <Text style={styles.optionDescription}>
                Enable gentle transition sounds
              </Text>
            </View>

            <Switch
              value={preferences.effectsEnabled}
              onValueChange={(value) =>
                updatePreference({
                  effectsEnabled: value,
                })
              }
              trackColor={{
                false: '#40516B',
                true: '#638FC7',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {volumeControl(
            'Effects volume',
            preferences.effectsVolume,
            (value) =>
              updatePreference({
                effectsVolume: value,
              })
          )}
        </View>

        {/* EXPERIENCE */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🌙 Experience
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.optionTitle}>
                Haptic feedback
              </Text>

              <Text style={styles.optionDescription}>
                Gentle vibration cues
              </Text>
            </View>

            <Switch
              value={preferences.hapticsEnabled}
              onValueChange={(value) =>
                updatePreference({
                  hapticsEnabled: value,
                })
              }
              trackColor={{
                false: '#40516B',
                true: '#638FC7',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.optionTitle}>
                Reduced motion
              </Text>

              <Text style={styles.optionDescription}>
                Softer and less movement
              </Text>
            </View>

            <Switch
              value={preferences.reducedMotion}
              onValueChange={(value) =>
                updatePreference({
                  reducedMotion: value,
                })
              }
              trackColor={{
                false: '#40516B',
                true: '#638FC7',
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SAVE STATUS */}

        <Text style={styles.saveStatus}>
          {saving
            ? 'Saving preferences...'
            : '✓ Preferences saved on this device'}
        </Text>

        <Pressable
          onPress={restoreDefaults}
          style={styles.resetButton}
        >
          <Text style={styles.resetText}>
            RESTORE DEFAULTS
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          PAUSE · Your space. Your pace.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  content: {
    padding: 22,
    paddingTop: 60,
    paddingBottom: 45,
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

  headerLabel: {
    color: '#AFC8EC',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
  },

  title: {
    color: '#F6F8FF',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 30,
  },

  subtitle: {
    color: '#B9C9E0',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 20,
  },

  section: {
    backgroundColor: '#132541',
    borderRadius: 20,
    padding: 17,
    marginTop: 17,
    borderWidth: 1,
    borderColor: '#294363',
  },

  sectionTitle: {
    color: '#F3F6FF',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionDescription: {
    color: '#AFC1DA',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 13,
    backgroundColor: '#1A304D',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#294363',
  },

  selectedOption: {
    borderColor: '#A8C9FF',
    backgroundColor: '#263F60',
  },

  optionIcon: {
    fontSize: 25,
    marginRight: 13,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    color: '#F3F6FF',
    fontSize: 13,
    fontWeight: '700',
  },

  optionDescription: {
    color: '#AFC1DA',
    fontSize: 11,
    marginTop: 4,
  },

  check: {
    color: '#B7D3FF',
    fontSize: 19,
    marginLeft: 8,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#294363',
  },

  settingText: {
    flex: 1,
    marginRight: 12,
  },

  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#294363',
  },

  volumeLabel: {
    color: '#DCE8FA',
    fontSize: 12,
    fontWeight: '600',
  },

  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  volumeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#294363',
    alignItems: 'center',
    justifyContent: 'center',
  },

  volumeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },

  volumeValue: {
    color: '#FFFFFF',
    width: 48,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },

  playingStatus: {
    color: '#9FE4CA',
    fontSize: 11,
    marginTop: 13,
    textAlign: 'center',
  },

  saveStatus: {
    color: '#AFC8EC',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 24,
  },

  resetButton: {
    borderWidth: 1,
    borderColor: '#6383A9',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },

  resetText: {
    color: '#D2E1F5',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  footer: {
    color: '#829BB9',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 25,
  },
});