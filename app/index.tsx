import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const C = {
  text: '#F5F7FF',
  muted: '#B8C6DF',
  blue: '#B7D3FF',
  border: '#304967',
};

export default function Home() {
  return (
    <LinearGradient
      colors={['#071326', '#102744', '#192F4B']}
      style={s.page}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* HEADER */}

        <View style={s.header}>
          <View>
            <Text style={s.brand}>PAUSE</Text>
            <Text style={s.tag}>
              FIND YOUR CALM. FIND YOUR CONTROL.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open preferences"
            style={s.settingsButton}
            onPress={() => router.push('/preferences')}
          >
            <Text style={s.settingsIcon}>⚙</Text>
            <Text style={s.settingsText}>SETTINGS</Text>
          </Pressable>
        </View>

        {/* HERO */}

        <View style={s.hero}>
          <Text style={s.eyebrow}>YOUR PERSONAL CALM SPACE</Text>

          <View style={s.orbStage}>
            <View style={s.orbGlow} />
            <View style={s.orbOuter}>
              <View style={s.orbMiddle}>
                <View style={s.orbInner}>
                  <Text style={s.star}>✦</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={s.title}>
            Take a moment for yourself.
          </Text>

          <Text style={s.body}>
            Whatever happened, you can choose what happens next.
          </Text>

          <Pressable
            accessibilityRole="button"
            style={s.primary}
            onPress={() => router.push('/choose')}
          >
            <Text style={s.primaryText}>
              START MY RESET  →
            </Text>
          </Pressable>

          <Text style={s.small}>
            No pressure. No judgement. Just you.
          </Text>
        </View>

        {/* QUICK ACTIVITIES */}

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Your calm journey</Text>
          <Text style={s.sectionSub}>Small moments matter.</Text>
        </View>

        <View style={s.activityRow}>
          <Pressable
            style={s.activityCard}
            onPress={() => router.push('/breathing')}
          >
            <Text style={s.activityIcon}>✨</Text>
            <Text style={s.activityTitle}>Breathe</Text>
            <Text style={s.activityDescription}>
              Find your rhythm
            </Text>
          </Pressable>

          <Pressable
            style={s.activityCard}
            onPress={() => router.push('/bubbles')}
          >
            <Text style={s.activityIcon}>🫧</Text>
            <Text style={s.activityTitle}>Release</Text>
            <Text style={s.activityDescription}>
              Let tension go
            </Text>
          </Pressable>
        </View>

        {/* CALM UNIVERSE */}

        <View style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.cardTitle}>Your Calm Universe</Text>
            <Text style={s.cardSymbol}>✧</Text>
          </View>

          <Text style={s.cardBody}>
            Every time you pause, you create space for a
            different response. Your journey grows one
            moment at a time.
          </Text>

          <Pressable
            onPress={() => router.push('/history')}
            style={s.historyButton}
          >
            <Text style={s.historyText}>
              VIEW MY PAUSE MOMENTS  →
            </Text>
          </Pressable>
        </View>

        {/* FOOTER */}

        <Text style={s.footer}>
          PAUSE · YOUR SPACE. YOUR PACE.
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
    padding: 22,
    paddingTop: 58,
    paddingBottom: 45,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  brand: {
    color: C.blue,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 6,
  },

  tag: {
    color: C.muted,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 5,
  },

  settingsButton: {
    backgroundColor: '#1A304D',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },

  settingsIcon: {
    color: C.blue,
    fontSize: 19,
  },

  settingsText: {
    color: C.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },

  hero: {
    backgroundColor: '#132744',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#304967',
  },

  eyebrow: {
    color: '#AFC8EC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },

  orbStage: {
    height: 210,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },

  orbGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: '#548BD0',
    opacity: 0.22,
  },

  orbOuter: {
    width: 165,
    height: 165,
    borderRadius: 100,
    backgroundColor: '#294A78',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#648FC4',
    elevation: 15,
  },

  orbMiddle: {
    width: 130,
    height: 130,
    borderRadius: 100,
    backgroundColor: '#5484BB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  orbInner: {
    width: 85,
    height: 85,
    borderRadius: 100,
    backgroundColor: '#D0E6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  star: {
    fontSize: 35,
    color: '#31547D',
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    lineHeight: 33,
  },

  body: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
  },

  primary: {
    backgroundColor: C.blue,
    paddingVertical: 17,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 23,
  },

  primaryText: {
    color: '#10203A',
    fontWeight: '900',
    letterSpacing: 1,
  },

  small: {
    color: '#AABBD5',
    fontSize: 11,
    marginTop: 13,
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 13,
  },

  sectionTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: '800',
  },

  sectionSub: {
    color: C.muted,
    fontSize: 12,
    marginTop: 5,
  },

  activityRow: {
    flexDirection: 'row',
    gap: 12,
  },

  activityCard: {
    flex: 1,
    backgroundColor: '#172E4A',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    padding: 17,
  },

  activityIcon: {
    fontSize: 27,
    marginBottom: 12,
  },

  activityTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: '800',
  },

  activityDescription: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },

  card: {
    backgroundColor: '#132744',
    borderRadius: 19,
    padding: 19,
    marginTop: 19,
    borderWidth: 1,
    borderColor: C.border,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardTitle: {
    color: C.text,
    fontWeight: '800',
    fontSize: 16,
  },

  cardSymbol: {
    color: C.blue,
    fontSize: 23,
  },

  cardBody: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 10,
  },

  historyButton: {
    marginTop: 17,
    paddingVertical: 10,
  },

  historyText: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  footer: {
    color: '#829BB9',
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 28,
  },
});