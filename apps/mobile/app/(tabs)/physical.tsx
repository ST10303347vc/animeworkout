import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FuturisticBackground } from '@/components/FuturisticBackground';
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
            <FuturisticBackground />
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
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { paddingTop: 60, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pageTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 4 },
    subtitle: { color: '#aaa', fontSize: 12, marginTop: 4, marginBottom: 24 },
    statsCardContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 0, 85, 0.3)' },
    glassCard: { padding: 20, backgroundColor: 'rgba(26, 26, 46, 0.4)' },
    statsTitle: { color: '#bbb', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
    noSession: { color: '#888', fontStyle: 'italic', marginTop: 10 },
    timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
    timerText: { color: '#fff', fontSize: 32, fontWeight: '900', fontVariant: ['tabular-nums'], flex: 1 },
    actionBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    section: { marginTop: 24 },
    sectionTitle: { color: '#bbb', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
    taskCardContainer: {
        borderRadius: 10, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(42, 42, 62, 0.5)',
    },
    glassCardTask: {
        flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(26, 26, 46, 0.4)',
    },
    taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, marginRight: 12 },
    taskInfo: { flex: 1 },
    taskTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
    taskXp: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
