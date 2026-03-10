import { Tabs } from 'expo-router';
import { Platform, Dimensions, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/stores/useStore';
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring,
    runOnJS, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import ChallengeHubScreen from '@/components/screens/ChallengeHubScreen';
import ChallengeProfileScreen from '@/components/screens/ChallengeProfileScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

export default function ChallengeTabLayout() {
    const user = useStore(s => s.user);
    const enabledPillars = user?.settings?.enabledPillars || [];

    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate((event) => {
            const newTranslateX = contextX.value + event.translationX;
            translateX.value = Math.max(-SCREEN_WIDTH * 2, Math.min(0, newTranslateX));
        })
        .onEnd((event) => {
            const targetX = contextX.value + event.translationX + (event.velocityX * 0.2);
            let snapPoint = -SCREEN_WIDTH;

            if (targetX > -SCREEN_WIDTH / 2) {
                snapPoint = 0;
            } else if (targetX < -SCREEN_WIDTH * 1.5) {
                snapPoint = -SCREEN_WIDTH * 2;
            }

            translateX.value = withSpring(snapPoint, {
                mass: 0.8, damping: 15, stiffness: 150,
            });

            if (snapPoint !== contextX.value) {
                runOnJS(Haptics.selectionAsync)();
            }
        });

    const tabsStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value + SCREEN_WIDTH }],
    }));

    const hubStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [-SCREEN_WIDTH, 0], [0, 1], Extrapolation.CLAMP);
        const scale = interpolate(translateX.value, [-SCREEN_WIDTH, 0], [0.94, 1], Extrapolation.CLAMP);
        const tx = interpolate(translateX.value, [-SCREEN_WIDTH, 0], [-SCREEN_WIDTH * 0.25, 0], Extrapolation.CLAMP);
        return { opacity, transform: [{ translateX: tx }, { scale }] };
    });

    const profileStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [-SCREEN_WIDTH, -SCREEN_WIDTH * 2], [0, 1], Extrapolation.CLAMP);
        const scale = interpolate(translateX.value, [-SCREEN_WIDTH, -SCREEN_WIDTH * 2], [0.94, 1], Extrapolation.CLAMP);
        const tx = interpolate(translateX.value, [-SCREEN_WIDTH, -SCREEN_WIDTH * 2], [SCREEN_WIDTH * 0.25, 0], Extrapolation.CLAMP);
        return { opacity, transform: [{ translateX: tx }, { scale }] };
    });

    const goToProfile = () => {
        translateX.value = withSpring(-SCREEN_WIDTH * 2, { mass: 0.8, damping: 15, stiffness: 150 });
        Haptics.selectionAsync();
    };

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={styles.pager}>
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]} />

                    {/* Left: Challenge Hub */}
                    <Animated.View style={[styles.page, { backgroundColor: '#0a0a14', position: 'absolute', left: 0, zIndex: 1 }, hubStyle]}>
                        <ChallengeHubScreen onProfilePress={goToProfile} />
                    </Animated.View>

                    {/* Right: Profile */}
                    <Animated.View style={[styles.page, { backgroundColor: '#021a10', position: 'absolute', left: 0, zIndex: 1 }, profileStyle]}>
                        <ChallengeProfileScreen />
                    </Animated.View>

                    {/* Center: Tabs */}
                    <Animated.View style={[styles.page, {
                        backgroundColor: '#0a0a14',
                        position: 'absolute', left: 0, zIndex: 10,
                        shadowColor: '#000', shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.7, shadowRadius: 25, elevation: 25,
                    }, tabsStyle]}>
                        <Tabs
                            screenOptions={{
                                headerShown: false,
                                tabBarActiveTintColor: '#ff0055',
                                tabBarInactiveTintColor: '#555',
                                tabBarLabelStyle: {
                                    fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase',
                                },
                                tabBarStyle: {
                                    position: 'absolute',
                                    backgroundColor: 'rgba(10, 10, 20, 0.85)',
                                    borderTopColor: 'rgba(255, 255, 255, 0.08)',
                                    borderTopWidth: 1,
                                    height: TAB_BAR_HEIGHT,
                                    paddingTop: 8,
                                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                                },
                                tabBarItemStyle: { paddingVertical: 4 },
                            }}
                        >
                            <Tabs.Screen
                                name="tasks"
                                options={{
                                    title: 'DAILY CHALLENGES',
                                    tabBarActiveTintColor: '#ff0055',
                                    tabBarIcon: ({ color, size }) => (
                                        <Ionicons name="list" size={size} color={color} />
                                    ),
                                }}
                                listeners={{ tabPress: () => Haptics.selectionAsync() }}
                            />
                            <Tabs.Screen
                                name="reading"
                                options={{
                                    title: 'READING',
                                    tabBarActiveTintColor: '#00f0ff',
                                    tabBarIcon: ({ color, size }) => (
                                        <Ionicons name="book" size={size} color={color} />
                                    ),
                                }}
                                listeners={{ tabPress: () => Haptics.selectionAsync() }}
                            />
                            <Tabs.Screen
                                name="main-tasks"
                                options={{
                                    title: 'MAIN TASKS',
                                    tabBarActiveTintColor: '#ffaa00',
                                    tabBarIcon: ({ color, size }) => (
                                        <Ionicons name="star" size={size} color={color} />
                                    ),
                                }}
                                listeners={{ tabPress: () => Haptics.selectionAsync() }}
                            />
                        </Tabs>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    pager: { flex: 1, position: 'relative', width: SCREEN_WIDTH },
    page: { width: SCREEN_WIDTH, height: '100%' },
});
