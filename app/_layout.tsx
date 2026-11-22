import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { loadPreferences } from '../lib/preferences';

import {
  applyAudioPreferences,
  cleanupAudio,
} from '../lib/audio';

export default function RootLayout() {
  useEffect(() => {
    let mounted = true;

    async function initializeApp() {
      try {
        const preferences = await loadPreferences();

        if (mounted) {
          await applyAudioPreferences(preferences);
        }
      } catch (error) {
        console.warn('App initialization failed:', error);
      }
    }

    initializeApp();

    return () => {
      mounted = false;
      cleanupAudio();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </>
  );
}