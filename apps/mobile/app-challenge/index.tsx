import { Redirect } from 'expo-router';
import { useStore } from '@/stores/useStore';

export default function Index() {
    const isHydrated = useStore(s => s.isHydrated);
    const user = useStore(s => s.user);

    if (!isHydrated) return null;

    if (!user) {
        return <Redirect href="/(auth)/select-mode" />;
    }

    if (user && !user.settings?.appMode) {
        return <Redirect href="/(auth)/select-mode" />;
    }

    return <Redirect href="/(tabs)/tasks" />;
}
