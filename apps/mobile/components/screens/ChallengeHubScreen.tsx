import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';
import {
    getLevelProgress, getChallengeDay, getLevelMessage,
    CHALLENGE_DURATION_DAYS, TOTAL_AVATAR_LEVELS, AVATAR_LEVELS,
} from '@limit-break/core';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Avatar images map — require() needs static strings, so we map them manually
// Actual files: 1.jpeg, 2-15.png, 17.jpeg, 18.jpeg (no file named 16)
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

// Level progress bar colors (gradient feel via discrete steps)
const LEVEL_COLOR = (level: number) => {
    if (level <= 4) return '#10b981';  // Green — easy
    if (level <= 8) return '#3b82f6';  // Blue — moderate
    if (level <= 12) return '#f59e0b'; // Amber — challenging
    if (level <= 15) return '#ef4444'; // Red — hard
    return '#9333ea';                 // Purple — mastery
};

interface ChallengeHubScreenProps {
    onProfilePress?: () => void;
}

export default function ChallengeHubScreen({ onProfilePress }: ChallengeHubScreenProps) {
    const user = useStore(s => s.user);
    const quests = useStore(s => s.quests);
    const completeQuest = useStore(s => s.completeQuest);

    if (!user) return null;

    const totalXp = user.globalXp || 0;
    const progress = getLevelProgress(totalXp);
    const challengeDay = getChallengeDay(user.challengeStartDate || null);
    const levelMessage = getLevelMessage(progress.currentLevel);
    const levelColor = LEVEL_COLOR(progress.currentLevel);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Day Counter ───────────────────────────────── */}
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <Text style={styles.dayCounter}>
                        DAY {Math.min(challengeDay, CHALLENGE_DURATION_DAYS)}
                    </Text>
                    {challengeDay > CHALLENGE_DURATION_DAYS && (
                        <Text style={styles.completeBadge}>🏆 CHALLENGE COMPLETE!</Text>
                    )}
                </MotiView>

                {/* ── Avatar Image ───────────────────────────────── */}
                <Pressable onPress={onProfilePress} style={{ width: '100%', marginBottom: 24, alignItems: 'center' }}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 700, delay: 100 }}
                        style={[
                            styles.heroImageContainer,
                            {
                                borderColor: levelColor,
                                shadowColor: levelColor,
                                shadowOpacity: 0.6,
                                shadowRadius: 15,
                                elevation: 20
                            }
                        ]}
                    >
                        <Image
                            source={AVATAR_IMAGES[progress.currentLevel] || AVATAR_IMAGES[1]}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    </MotiView>
                </Pressable>

                {/* ── User Info ─────────────────────────────────── */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500, delay: 300 }}
                >
                    <Text style={styles.username}>
                        {user.displayName?.toUpperCase() === 'CHALLENGER' ? 'XANDER VOLT' : user.displayName?.toUpperCase()}
                    </Text>
                    <Text style={[styles.levelText, { color: levelColor }]}>
                        LEVEL {progress.currentLevel} / {TOTAL_AVATAR_LEVELS}
                    </Text>
                    <Text style={styles.mottoText}>{levelMessage}</Text>
                </MotiView>

                {/* ── XP Progress Card ──────────────────────────── */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 500, delay: 450 }}
                    style={{ width: '100%' }}
                >
                    <View style={[
                        styles.xpCard,
                        {
                            borderColor: levelColor,
                            borderWidth: 2,
                            shadowColor: levelColor,
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                            elevation: 10
                        }
                    ]}>
                        <View style={styles.xpCardHeader}>
                            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                                <Text style={styles.levelBadgeText}>{progress.currentLevel}</Text>
                            </View>
                            <Text style={styles.xpLabel}>EVOLUTION PROGRESS</Text>
                            {!progress.isMaxLevel && (
                                <Text style={[styles.xpPercent, { color: levelColor }]}>
                                    {progress.progressPercent.toFixed(1)}%
                                </Text>
                            )}
                        </View>

                        <View style={styles.xpTrack}>
                            <View style={[styles.xpFill, {
                                width: `${Math.max(2, progress.progressPercent)}%`,
                                backgroundColor: levelColor,
                            }]} />
                        </View>

                        {progress.isMaxLevel ? (
                            <Text style={[styles.xpSubtext, { color: levelColor }]}>🏆 MAX EVOLUTION REACHED</Text>
                        ) : (
                            <Text style={styles.xpSubtext}>
                                {progress.xpInLevel} / {progress.xpToNextLevel} XP to Level {progress.nextLevel}
                            </Text>
                        )}
                    </View>
                </MotiView>

                {/* ── Level Progress Timeline ─────────────────── */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 500, delay: 550 }}
                    style={{ width: '100%' }}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚡ EVOLUTION TIMELINE</Text>
                        <View style={[
                            styles.timeline,
                            {
                                borderColor: levelColor,
                                borderWidth: 2,
                                shadowColor: levelColor,
                                shadowOpacity: 0.4,
                                shadowRadius: 10,
                                elevation: 10
                            }
                        ]}>
                            {AVATAR_LEVELS.map((s, i) => {
                                const isReached = progress.currentLevel >= s.level;
                                const isCurrent = progress.currentLevel === s.level;
                                return (
                                    <View key={s.level} style={styles.timelineDot}>
                                        <View style={[
                                            styles.dot,
                                            isReached && { backgroundColor: LEVEL_COLOR(s.level) },
                                            isCurrent && { borderWidth: 2, borderColor: '#fff', transform: [{ scale: 1.3 }] },
                                        ]} />
                                        {isCurrent && (
                                            <Text style={[styles.dotLabel, { color: LEVEL_COLOR(s.level) }]}>{s.level}</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </MotiView>

                {/* Daily Challenges were moved entirely to the dedicated tab */}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    scrollView: { flex: 1 },
    content: { paddingTop: 60, paddingHorizontal: 20, alignItems: 'center' },

    // Day Counter
    dayCounter: {
        fontSize: 12, fontWeight: '800', color: '#888',
        letterSpacing: 3, textAlign: 'center', marginBottom: 4,
    },
    completeBadge: {
        fontSize: 14, fontWeight: '900', color: '#f59e0b',
        textAlign: 'center', marginBottom: 8,
    },

    // Hero Image
    heroImageContainer: {
        width: SCREEN_WIDTH - 40,
        aspectRatio: 1, // square image
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#2a2a3e',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    heroImage: {
        width: '100%', height: '100%',
    },

    // User Info
    username: {
        fontSize: 24, fontWeight: '900', color: '#fff',
        textAlign: 'center', letterSpacing: 4,
    },
    levelText: {
        fontSize: 12, fontWeight: '800', textAlign: 'center',
        letterSpacing: 2, marginTop: 4,
    },
    mottoText: {
        fontSize: 13, color: '#666', textAlign: 'center',
        marginTop: 6, fontStyle: 'italic',
    },

    // XP Card
    xpCard: {
        width: '100%', backgroundColor: '#1a1a2e',
        borderRadius: 16, padding: 24, marginTop: 24,
        borderWidth: 1, borderColor: '#2a2a3e',
    },
    xpCardHeader: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    },
    levelBadge: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    levelBadgeText: { color: '#fff', fontWeight: '900', fontSize: 17 },
    xpLabel: {
        color: '#fff', fontWeight: '800', fontSize: 14,
        letterSpacing: 2, flex: 1,
    },
    xpPercent: { fontWeight: '900', fontSize: 18 },
    xpTrack: {
        height: 10, backgroundColor: '#0f0f1e',
        borderRadius: 5, overflow: 'hidden',
    },
    xpFill: { height: '100%', borderRadius: 5 },
    xpSubtext: { color: '#555', fontSize: 12, marginTop: 12 },

    // Timeline
    section: { width: '100%', marginTop: 28 },
    sectionTitle: {
        color: '#888', fontSize: 12, fontWeight: '800',
        letterSpacing: 2, marginBottom: 12,
    },
    timeline: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 4,
        backgroundColor: '#1a1a2e', borderRadius: 12,
        paddingVertical: 16, borderWidth: 1, borderColor: '#2a2a3e',
    },
    timelineDot: { alignItems: 'center', flex: 1 },
    dot: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#2a2a3e',
    },
    dotLabel: {
        fontSize: 9, fontWeight: '800', marginTop: 4,
    },

    // Quests
    questCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1a1a2e', borderRadius: 14,
        padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: '#2a2a3e',
    },
    questCompleted: { opacity: 0.35 },
    questDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    questInfo: { flex: 1 },
    questText: { color: '#ddd', fontSize: 14, fontWeight: '600' },
    questTextDone: { textDecorationLine: 'line-through', color: '#555' },
    questXp: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
