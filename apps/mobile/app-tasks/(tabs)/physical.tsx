import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BlurView } from 'expo-blur';
import { useStore } from '@/stores/useStore';
import { useRouter } from 'expo-router';

export default function PhysicalScreen() {
    const user = useStore(s => s.user);
    const completeCustomTask = useStore(s => s.completeCustomTask);
    const deleteCustomTask = useStore(s => s.deleteCustomTask);
    const router = useRouter();

    const [timerActive, setTimerActive] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Timer effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timerActive) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    if (!user) return null;

    const physicalTasks = (user.customTasks || []).filter(t => t.pillar === 'physical' && t.status === 'active');

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <View style={styles.headerRow}>
                        <Ionicons name="barbell" size={28} color="#ff0055" />
                        <Text style={[styles.pageTitle, { color: '#ff0055' }]}>THE VANGUARD</Text>
                    </View>
                    <Text style={styles.subtitle}>Manage your physical quests and workouts</Text>
                </MotiView>

                {/* Session Timer */}
                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 500, delay: 100 }}
                    style={styles.statsCardContainer}
                >
                    <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                        <Text style={styles.statsTitle}>CURRENT SESSION</Text>
                        {timerActive || timeElapsed > 0 ? (
                            <View style={styles.timerRow}>
                                <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
                                <Pressable
                                    style={[styles.actionBtn, timerActive ? { backgroundColor: '#ff3333' } : { backgroundColor: '#10b981' }]}
                                    onPress={() => setTimerActive(!timerActive)}
                                >
                                    <Ionicons name={timerActive ? 'pause' : 'play'} size={20} color="#fff" />
                                </Pressable>
                                {timeElapsed > 0 && !timerActive && (
                                    <Pressable
                                        style={[styles.actionBtn, { backgroundColor: '#555', marginLeft: 8 }]}
                                        onPress={() => setTimeElapsed(0)}
                                    >
                                        <Ionicons name="refresh" size={20} color="#fff" />
                                    </Pressable>
                                )}
                            </View>
                        ) : (
                            <Text style={styles.noSession}>No active workout. Tap + to begin.</Text>
                        )}
                    </BlurView>
                </MotiView>

                {/* Active Quests */}
                {physicalTasks.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚔️ ACTIVE QUESTS ({physicalTasks.length})</Text>
                        {physicalTasks.map((task, i) => (
                            <MotiView
                                key={task.id}
                                from={{ opacity: 0, translateX: -10 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ type: 'timing', duration: 300, delay: i * 50 }}
                            >
                                <View style={styles.taskCardContainer}>
                                    <BlurView intensity={15} tint="dark" style={styles.glassCardTask}>
                                        <Pressable
                                            style={[styles.taskCheck, { borderColor: '#ff0055' }]}
                                            onPress={() => completeCustomTask(task.id)}
                                        />
                                        <View style={styles.taskInfo}>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <Text style={[styles.taskXp, { color: '#ff0055' }]}>
                                                +{task.xpReward} XP • Difficulty {task.difficulty}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => {
                                                Alert.alert('Delete Quest', 'Are you sure?', [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'Delete', style: 'destructive', onPress: () => deleteCustomTask(task.id) },
                                                ]);
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#aaa" />
                                        </Pressable>
                                    </BlurView>
                                </View>
                            </MotiView>
                        ))}
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            <FloatingActionButton
                mainColor="#ff0055"
                actions={[
                    {
                        icon: 'play',
                        label: 'Start Workout',
                        color: '#ff0055',
                        onPress: () => {
                            router.push('/workout-session' as any);
                        }
                    },
                    {
                        icon: 'add',
                        label: 'Build Custom Workout',
                        color: '#ff0055',
                        onPress: () => {
                            router.push('/workout-builder' as any);
                        }
                    }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#05050A' },
    content: { paddingTop: 60, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pageTitle: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 4,
        textShadowColor: 'rgba(255, 0, 85, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10
    },
    subtitle: { color: '#888', fontSize: 13, fontWeight: '500', letterSpacing: 1, marginTop: 4, marginBottom: 28 },
    statsCardContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 0, 85, 0.4)' },
    glassCard: { padding: 24, backgroundColor: 'rgba(25, 10, 15, 0.7)' },
    statsTitle: { color: '#ff0055', fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 14, opacity: 0.9 },
    noSession: { color: '#666', fontStyle: 'italic', marginTop: 10, letterSpacing: 1 },
    timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
    timerText: {
        color: '#fff',
        fontSize: 38,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        flex: 1,
        textShadowColor: 'rgba(255, 0, 85, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8
    },
    actionBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 5 },
    section: { marginTop: 32 },
    sectionTitle: { color: '#ff0055', fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 14, opacity: 0.8 },
    taskCardContainer: {
        borderRadius: 12, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 0, 85, 0.25)',
    },
    glassCardTask: {
        flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(25, 10, 15, 0.6)',
    },
    taskCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 14 },
    taskInfo: { flex: 1 },
    taskTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    taskXp: { fontSize: 12, fontWeight: '800', marginTop: 4, opacity: 0.9 },
});
