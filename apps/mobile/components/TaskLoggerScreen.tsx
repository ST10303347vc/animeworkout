import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import type { Pillar } from '@limit-break/core';

interface TaskLoggerProps {
    pillar: Pillar;
    color: string;
    title: string;
    icon: string;
}

export function TaskLoggerScreen({ pillar, color, title, icon }: TaskLoggerProps) {
    const user = useStore(s => s.user);
    const addCustomTask = useStore(s => s.addCustomTask);
    const completeCustomTask = useStore(s => s.completeCustomTask);
    const deleteCustomTask = useStore(s => s.deleteCustomTask);
    const [newTitle, setNewTitle] = useState('');
    const [difficulty, setDifficulty] = useState(5);

    if (!user) return null;
    const tasks = (user.customTasks || []).filter(t => t.pillar === pillar);
    const activeTasks = tasks.filter(t => t.status === 'active');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        addCustomTask(newTitle.trim(), pillar, difficulty);
        setNewTitle('');
        setDifficulty(5);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
            >
                <View style={styles.headerRow}>
                    <Ionicons name={icon as any} size={28} color={color} />
                    <Text style={[styles.pageTitle, { color }]}>{title}</Text>
                </View>
                <Text style={styles.subtitle}>Manage your {pillar} quests</Text>
            </MotiView>

            {/* Add Task Form */}
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 500, delay: 200 }}
                style={styles.addForm}
            >
                <TextInput
                    style={styles.input}
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="New quest title..."
                    placeholderTextColor="#555"
                    returnKeyType="done"
                    onSubmitEditing={handleAdd}
                />
                <View style={styles.difficultyRow}>
                    <Text style={styles.diffLabel}>DIFFICULTY</Text>
                    <View style={styles.diffDots}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                            <Pressable key={d} onPress={() => setDifficulty(d)}>
                                <View style={[
                                    styles.diffDot,
                                    d <= difficulty && { backgroundColor: color },
                                ]} />
                            </Pressable>
                        ))}
                    </View>
                    <Text style={[styles.diffValue, { color }]}>{difficulty}</Text>
                </View>
                <Pressable
                    style={[styles.addButton, { backgroundColor: color }]}
                    onPress={handleAdd}
                    disabled={!newTitle.trim()}
                >
                    <Text style={styles.addButtonText}>+ ADD QUEST</Text>
                </Pressable>
            </MotiView>

            {/* Active Tasks */}
            {activeTasks.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚔️ ACTIVE ({activeTasks.length})</Text>
                    {activeTasks.map((task, i) => (
                        <MotiView
                            key={task.id}
                            from={{ opacity: 0, translateX: -10 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'timing', duration: 300, delay: i * 50 }}
                        >
                            <View style={styles.taskCard}>
                                <Pressable
                                    style={[styles.taskCheck, { borderColor: color }]}
                                    onPress={() => completeCustomTask(task.id)}
                                />
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={[styles.taskXp, { color }]}>
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
                                    <Ionicons name="trash-outline" size={18} color="#555" />
                                </Pressable>
                            </View>
                        </MotiView>
                    ))}
                </View>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ COMPLETED ({completedTasks.length})</Text>
                    {completedTasks.slice(0, 5).map(task => (
                        <View key={task.id} style={[styles.taskCard, { opacity: 0.4 }]}>
                            <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                            <View style={[styles.taskInfo, { marginLeft: 8 }]}>
                                <Text style={[styles.taskTitle, { textDecorationLine: 'line-through', color: '#555' }]}>
                                    {task.title}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Empty state */}
            {activeTasks.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🎯</Text>
                    <Text style={styles.emptyText}>No active quests</Text>
                    <Text style={styles.emptySubtext}>Add your first {pillar} quest above</Text>
                </View>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { paddingTop: 60, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pageTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 4 },
    subtitle: { color: '#555', fontSize: 12, marginTop: 4, marginBottom: 24 },
    addForm: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 20 },
    input: {
        backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333',
        borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 16, color: '#fff', marginBottom: 12,
    },
    difficultyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    diffLabel: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginRight: 10 },
    diffDots: { flexDirection: 'row', gap: 4, flex: 1 },
    diffDot: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#2a2a3e', borderWidth: 1, borderColor: '#333',
    },
    diffValue: { fontSize: 18, fontWeight: '900', marginLeft: 10 },
    addButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    addButtonText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 2 },
    section: { marginTop: 16 },
    sectionTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
    taskCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e',
        borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a2a3e',
    },
    taskCheck: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2,
        marginRight: 12,
    },
    taskInfo: { flex: 1 },
    taskTitle: { color: '#ddd', fontSize: 15, fontWeight: '600' },
    taskXp: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 8 },
    emptyText: { color: '#555', fontSize: 16, fontWeight: '700' },
    emptySubtext: { color: '#444', fontSize: 12, marginTop: 4 },
});
