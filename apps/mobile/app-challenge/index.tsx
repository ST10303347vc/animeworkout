import { Redirect } from 'expo-router';
import { useStore } from '@/stores/useStore';

export default function ChallengeIndex() {
    const user = useStore(s => s.user);

    if (!user) {
        return <Redirect href="/(auth)/intro-video" />;
    }

    if (!user.settings?.appMode) {
        return <Redirect href="/(auth)/select-mode" />;
    }

    return <Redirect href="/(tabs)/tasks" />;
}
