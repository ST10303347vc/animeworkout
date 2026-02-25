import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from '@/stores/useStore';

// Keep splash screen visible while we hydrate
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrate = useStore(s => s.hydrate);
  const isHydrated = useStore(s => s.isHydrated);
  const user = useStore(s => s.user);
  const segments = useSegments();
  const router = useRouter();

  // Hydrate store from SQLite on mount
  useEffect(() => {
    hydrate();
  }, []);

  // Hide splash once hydrated
  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  // Auth-based routing
  useEffect(() => {
    if (!isHydrated) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not logged in → go to login
      router.replace('/(auth)/login' as any);
    } else if (user && !user.senseiId && segs[1] !== 'select-sensei') {
      // Logged in but no sensei → go to select sensei
      router.replace('/(auth)/select-sensei' as any);
    } else if (user && user.senseiId && !user.settings?.appMode && segs[1] !== 'app-mode') {
      // Logged in, has sensei, NO app mode -> go to app mode selection
      router.replace('/(auth)/app-mode' as any);
    } else if (user && user.senseiId && user.settings?.appMode && inAuthGroup) {
      // Fully set up → go to root and let index.tsx route to correct tab
      router.replace('/' as any);
    }
  }, [isHydrated, user, segments]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff0055" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a14' }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a14' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout-builder" options={{ presentation: 'formSheet' }} />
        <Stack.Screen name="workout-session" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a14',
  },
});
