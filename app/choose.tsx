import { useCallback, useRef } from 'react';

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

import { loadPreferences } from '../lib/preferences';
import { applyAudioPreferences, AudioEffects } from '../lib/audio';

const items = [
  {
    title: 'Breathing Orb',
    sub: 'A gentle, guided breathing rhythm',
    icon: '◉',
    path: '/breathing-techniques',
    color: '#294B7B',
  },
  {
    title: 'Bubble Ocean',
    sub: 'Gently release floating bubbles',
    icon: '◌',
    path: '/bubbles',
    color: '#216174',
  },
  {
    title: 'Response Challenge',
    sub: 'Practice responding thoughtfully',
    icon: '✧',
    path: '/response',
    color: '#57457D',
  },
] as const;

export default function Choose() {
  const hapticsEnabled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadSettings = async () => {
        const preferences = await loadPreferences();

        if (active) {
          hapticsEnabled.current = preferences.hapticsEnabled;
          applyAudioPreferences(preferences);
        }
      };

      loadSettings();

      return () => {
        active = false;
      };
    }, []),
  );

  const navigate = (path: string) => {
    if (hapticsEnabled.current) {
      Haptics.selectionAsync();
    }

    AudioEffects.transition();
    router.push(path as any);
  };

  const goBack = () => {
    if (hapticsEnabled.current) {
      Haptics.selectionAsync();
    }

    AudioEffects.transition();
    router.back();
  };

  return (
    <LinearGradient
      colors={['#0B1428', '#142C4C']}
      style={s.page}
    >
      <ScrollView contentContainerStyle={s.content}>
        <Pressable onPress={goBack}>
          <Text style={s.back}>← BACK</Text>
        </Pressable>

        <Text style={s.title}>Choose your calm journey</Text>

        <Text style={s.sub}>
          Pick what feels comfortable right now. You can change
          activities anytime.
        </Text>

        {items.map(i => (
          <Pressable
            key={i.title}
            style={s.card}
            onPress={() => navigate(i.path)}
          >
            <View style={[s.icon, { backgroundColor: i.color }]}>
              <Text style={s.symbol}>{i.icon}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{i.title}</Text>
              <Text style={s.cardSub}>{i.sub}</Text>
            </View>

            <Text style={s.arrow}>›</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => navigate('/history')}
          style={s.history}
        >
          <Text style={s.historyText}>
            VIEW MY PAUSE MOMENTS →
          </Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 24, paddingTop: 64 },
  back: {
    color: '#AFC8EC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 30,
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
    marginBottom: 26,
  },
  card: {
    backgroundColor: '#142442',
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#2B4263',
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    color: '#E6F2FF',
    fontSize: 30,
  },
  cardTitle: {
    color: '#F5F7FF',
    fontWeight: '700',
    fontSize: 16,
  },
  cardSub: {
    color: '#B8C6DF',
    fontSize: 12,
    marginTop: 5,
  },
  arrow: {
    color: '#B8C6DF',
    fontSize: 27,
  },
  history: {
    padding: 14,
    alignItems: 'center',
  },
  historyText: {
    color: '#C5D9FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});