import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from '@/stores/useStore';
import { LevelUpModal } from '@/components/LevelUpModal';

SplashScreen.preventAutoHideAsync();

export default function ChallengeRootLayout() {
    const hydrate = useStore(s => s.hydrate);
    const isHydrated = useStore(s => s.isHydrated);
    const user = useStore(s => s.user);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        hydrate();
    }, []);

    useEffect(() => {
        if (isHydrated) {
            SplashScreen.hideAsync();
        }
    }, [isHydrated]);

    // Auth-based routing for challenge app
    useEffect(() => {
        if (!isHydrated) return;

        const segs = segments as string[];
        const inAuthGroup = segs[0] === '(auth)';
        const isSelectMode = segs[1] === 'select-mode';

        if (!user && !inAuthGroup) {
            // No user → go to select mode directly instead of intro video
            router.replace('/(auth)/select-mode' as any);
        } else if (user && !user.settings?.appMode && !isSelectMode) {
            // Has user but no mode selected → select mode
            router.replace('/(auth)/select-mode' as any);
        } else if (user && user.settings?.appMode && inAuthGroup && !isSelectMode) {
            // Fully set up → go to main app unless they are explicitly choosing a path
            router.replace('/(tabs)/tasks' as any);
        }
    }, [isHydrated, user, segments]);

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
                <Stack.Screen name="skill-tree/[slug]" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style="light" />
            <LevelUpModal />
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
