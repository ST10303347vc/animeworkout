import { Redirect } from 'expo-router';
import { useStore } from '@/stores/useStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const isHydrated = useStore(s => s.isHydrated);
    const user = useStore(s => s.user);

    if (!isHydrated) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0a0a14', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ff0055" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    if (!user.senseiId) {
        return <Redirect href="/(auth)/select-sensei" />;
    }

    const enabledPillars = user.settings?.enabledPillars || [];

    // Route to the first enabled pillar
    if (enabledPillars.includes('physical')) return <Redirect href="/(tabs)/physical" />;
    if (enabledPillars.includes('mental')) return <Redirect href="/(tabs)/mental" />;
    if (enabledPillars.includes('wealth')) return <Redirect href="/(tabs)/wealth" />;
    if (enabledPillars.includes('vitality')) return <Redirect href="/(tabs)/vitality" />;

    // Fallback to tasks-only mode Hub / Physical
    return <Redirect href="/(tabs)/physical" />;
}
