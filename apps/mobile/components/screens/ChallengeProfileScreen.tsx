import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import {
    getLevelProgress, getChallengeDay, CHALLENGE_DURATION_DAYS,
    calculatePillarLevel, ALL_PILLARS,
} from '@limit-break/core';
import type { Pillar } from '@limit-break/core';
import { useRouter } from 'expo-router';
import { RadarChart } from '@/components/RadarChart';
import Svg, { Circle } from 'react-native-svg';

const RING_SIZE = 160;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PILLAR_COLORS: Record<Pillar, string> = {
    physical: '#ff0055',
    mental: '#00ccff',
    wealth: '#ffaa00',
    vitality: '#10b981',
};

// Level progress bar colors (gradient feel via discrete steps)
const LEVEL_COLOR = (level: number) => {
    if (level <= 4) return '#10b981';
    if (level <= 8) return '#3b82f6';
    if (level <= 12) return '#f59e0b';
    if (level <= 15) return '#ef4444';
    return '#9333ea';
};

// Avatar images (same mapping as ChallengeHubScreen)
const AVATAR_IMAGES: Record<number, any> = {
    1: require('@/assets/challenge-avatar/1.webp'),
    2: require('@/assets/challenge-avatar/2.webp'),
    3: require('@/assets/challenge-avatar/3.webp'),
    4: require('@/assets/challenge-avatar/4.webp'),
    5: require('@/assets/challenge-avatar/5.webp'),
    6: require('@/assets/challenge-avatar/6.webp'),
    7: require('@/assets/challenge-avatar/7.webp'),
    8: require('@/assets/challenge-avatar/8.webp'),
    9: require('@/assets/challenge-avatar/9.webp'),
    10: require('@/assets/challenge-avatar/10.webp'),
    11: require('@/assets/challenge-avatar/11.webp'),
    12: require('@/assets/challenge-avatar/12.webp'),
    13: require('@/assets/challenge-avatar/13.webp'),
    14: require('@/assets/challenge-avatar/14.webp'),
    15: require('@/assets/challenge-avatar/15.webp'),
    16: require('@/assets/challenge-avatar/17.webp'),
    17: require('@/assets/challenge-avatar/18.webp'),
};

export default function ChallengeProfileScreen() {
    const router = useRouter();
    const user = useStore(s => s.user);
    const logout = useStore(s => s.logout);

    if (!user) return null;

    const totalXp = user.globalXp || 0;
    const progress = getLevelProgress(totalXp);
    const challengeDay = getChallengeDay(user.challengeStartDate || null);
    const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progress.progressPercent) / 100;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </Pressable>
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <Text style={styles.pageTitle}>PROFILE</Text>
                </MotiView>
            </View>

            {/* Profile Card */}
            <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 500, delay: 150 }}
                style={styles.profileCard}
            >
                <View style={styles.ringContainer}>
                    <Svg width={RING_SIZE} height={RING_SIZE}>
                        <Circle
                            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                            stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE_WIDTH} fill="transparent"
                        />
                        <Circle
                            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                            stroke={LEVEL_COLOR(progress.currentLevel)}
                            strokeWidth={STROKE_WIDTH}
                            fill="transparent"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                        />
                    </Svg>
                    <View style={[
                        styles.avatarContainer,
                        {
                            borderColor: LEVEL_COLOR(progress.currentLevel),
                            shadowColor: LEVEL_COLOR(progress.currentLevel)
                        }
                    ]}>
                        <Image
                            source={AVATAR_IMAGES[progress.currentLevel] || AVATAR_IMAGES[1]}
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    </View>
                </View>
                <Text style={styles.displayName}>
                    {user.displayName?.toUpperCase() === 'CHALLENGER' ? 'XANDER VOLT' : user.displayName?.toUpperCase()}
                </Text>
                <Text style={styles.levelText}>
                    LEVEL {progress.currentLevel} — DAY {Math.min(challengeDay, CHALLENGE_DURATION_DAYS)}
                </Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{progress.currentLevel}</Text>
                        <Text style={styles.statLabel}>LEVEL</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{totalXp}</Text>
                        <Text style={styles.statLabel}>TOTAL XP</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>🔥 {user.currentStreak || 0}</Text>
                        <Text style={styles.statLabel}>STREAK</Text>
                    </View>
                </View>
            </MotiView>

            {/* Radar Chart */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ SKILLS RADAR</Text>
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 500, delay: 350 }}
                    style={{ alignItems: 'center' }}
                >
                    <RadarChart
                        data={{
                            physical: user.pillarXp?.physical || 0,
                            mental: user.pillarXp?.mental || 0,
                            wealth: user.pillarXp?.wealth || 0,
                            vitality: user.pillarXp?.vitality || 0,
                        }}
                        size={280}
                    />
                </MotiView>
            </View>

            {/* Pillar Breakdown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 PILLAR BREAKDOWN</Text>
                {ALL_PILLARS.map(pillar => {
                    const xp = user.pillarXp?.[pillar] || 0;
                    const level = calculatePillarLevel(xp);
                    return (
                        <View key={pillar} style={styles.pillarRow}>
                            <View style={[styles.pillarDot, { backgroundColor: PILLAR_COLORS[pillar] }]} />
                            <Text style={styles.pillarName}>{pillar.toUpperCase()}</Text>
                            <Text style={[styles.pillarXp, { color: PILLAR_COLORS[pillar] }]}>
                                Lv.{level} • {xp} XP
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Daily Tasks Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 TODAY'S TASKS</Text>
                {(user.customTasks || []).filter(t => t.status === 'active').length === 0 ? (
                    <Text style={styles.emptyText}>No active tasks. Add some from the Tasks tab!</Text>
                ) : (
                    (user.customTasks || []).filter(t => t.status === 'active').slice(0, 5).map(task => (
                        <View key={task.id} style={styles.taskRow}>
                            <View style={[styles.taskDot, { backgroundColor: task.pillar === 'general' ? '#888' : PILLAR_COLORS[task.pillar] }]} />
                            <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                            <Text style={styles.taskXp}>+{task.xpReward} XP</Text>
                        </View>
                    ))
                )}
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ SETTINGS</Text>

                <Pressable
                    style={[styles.settingRow, { borderColor: '#888' }]}
                    onPress={() => router.replace('/(auth)/select-mode' as any)}
                >
                    <Ionicons name="arrow-back" size={20} color="#888" />
                    <Text style={[styles.settingLabel, { color: '#aaa' }]}>Return to Choose Your Path</Text>
                </Pressable>

                <Pressable
                    style={[styles.settingRow, { borderColor: '#ff3333' }]}
                    onPress={() => {
                        Alert.alert(
                            'Reset Challenge',
                            'This will delete all your progress and restart the challenge. Are you sure?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Reset & Logout',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await logout();
                                    },
                                },
                            ]
                        );
                    }}
                >
                    <Ionicons name="trash" size={20} color="#ff3333" />
                    <Text style={[styles.settingLabel, { color: '#ff3333' }]}>Reset Challenge & Logout</Text>
                </Pressable>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { paddingTop: 60, paddingHorizontal: 20 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, paddingLeft: 8, height: 40,
    },
    backButton: { position: 'absolute', left: 0, zIndex: 10, padding: 10, height: '100%', justifyContent: 'center' },
    pageTitle: {
        fontSize: 22, fontWeight: '900', color: '#fff',
        letterSpacing: 4, textAlign: 'center',
    },

    profileCard: {
        backgroundColor: '#1a1a2e', borderRadius: 16,
        padding: 24, alignItems: 'center',
        borderWidth: 1, borderColor: '#2a2a3e',
    },
    ringContainer: {
        width: RING_SIZE, height: RING_SIZE,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'absolute',
        width: RING_SIZE - STROKE_WIDTH * 4,
        height: RING_SIZE - STROKE_WIDTH * 4,
        borderRadius: (RING_SIZE - STROKE_WIDTH * 4) / 2,
        overflow: 'hidden',
        borderWidth: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 20,
        elevation: 15,
        backgroundColor: '#000',
    },
    avatarImage: { width: '100%', height: '100%' },
    displayName: {
        fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3,
    },
    levelText: {
        fontSize: 12, fontWeight: '700', color: '#888',
        letterSpacing: 2, marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: 20, width: '100%', justifyContent: 'space-around',
    },
    statItem: { alignItems: 'center' },
    statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
    statLabel: {
        color: '#555', fontSize: 9, fontWeight: '700',
        letterSpacing: 2, marginTop: 2,
    },
    statDivider: {
        width: 1, height: 30, backgroundColor: '#ff0055', opacity: 0.3,
    },

    section: { marginTop: 28 },
    sectionTitle: {
        color: '#888', fontSize: 11, fontWeight: '700',
        letterSpacing: 2, marginBottom: 12,
    },

    pillarRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
    },
    pillarDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    pillarName: {
        color: '#aaa', fontSize: 13, fontWeight: '700',
        letterSpacing: 2, flex: 1,
    },
    pillarXp: { fontSize: 13, fontWeight: '700' },

    emptyText: { color: '#555', fontSize: 13, fontStyle: 'italic' },
    taskRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1a1a2e', borderRadius: 10,
        padding: 12, marginBottom: 6,
        borderWidth: 1, borderColor: '#2a2a3e',
    },
    taskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    taskTitle: { color: '#ddd', fontSize: 14, fontWeight: '600', flex: 1 },
    taskXp: { color: '#ff0055', fontSize: 12, fontWeight: '700' },

    settingRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1a1a2e', borderRadius: 10,
        padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: '#2a2a3e', gap: 12,
    },
    settingLabel: { color: '#ddd', fontSize: 15, fontWeight: '600', flex: 1 },
});
