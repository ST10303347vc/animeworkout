import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';

export default function VitalityScreen() {
    const user = useStore(s => s.user);
    const addDailyHabit = useStore(s => s.addDailyHabit);
    const completeDailyHabit = useStore(s => s.completeDailyHabit);
    const deleteDailyHabit = useStore(s => s.deleteDailyHabit);
    const [newTitle, setNewTitle] = useState('');

    if (!user) return null;
    const habits = user.dailyHabits || [];
    const today = new Date().toISOString().split('T')[0];

    const color = '#10b981';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500 }}>
                <View style={styles.headerRow}>
                    <Ionicons name="heart" size={28} color={color} />
                    <Text style={[styles.pageTitle, { color }]}>THE GUARDIAN</Text>
                </View>
                <Text style={styles.subtitle}>Daily habits for vitality</Text>
            </MotiView>

            {/* Add Habit */}
            <View style={styles.addForm}>
                <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle}
                    placeholder="New daily habit..." placeholderTextColor="#555" returnKeyType="done"
                    onSubmitEditing={() => { if (newTitle.trim()) { addDailyHabit(newTitle.trim(), 'vitality', 3); setNewTitle(''); } }}
                />
                <Pressable style={[styles.addButton, { backgroundColor: color }]}
                    onPress={() => { if (newTitle.trim()) { addDailyHabit(newTitle.trim(), 'vitality', 3); setNewTitle(''); } }}>
                    <Text style={styles.addButtonText}>+ ADD HABIT</Text>
                </Pressable>
            </View>

            {/* Habits */}
            {habits.map((habit, i) => {
                const isToday = habit.lastCompletedDate === today;
                return (
                    <MotiView key={habit.id} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 60 }}>
                        <View style={[styles.habitCard, isToday && styles.habitCompleted]}>
                            <Pressable
                                style={[styles.habitCheck, isToday ? { backgroundColor: color, borderColor: color } : { borderColor: color }]}
                                onPress={() => !isToday && completeDailyHabit(habit.id)}
                                disabled={isToday}
                            >
                                {isToday && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </Pressable>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.habitTitle, isToday && { color: '#555' }]}>{habit.title}</Text>
                                <Text style={[styles.habitXp, { color }]}>+{habit.xpReward} XP</Text>
                            </View>
                            <Pressable onPress={() => Alert.alert('Delete habit?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteDailyHabit(habit.id) }])}>
                                <Ionicons name="trash-outline" size={18} color="#555" />
                            </Pressable>
                        </View>
                    </MotiView>
                );
            })}

            {habits.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🌿</Text>
                    <Text style={styles.emptyText}>No habits yet</Text>
                    <Text style={styles.emptySubtext}>Add daily habits like hydration, sleep, or stretching</Text>
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
    input: { backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#fff', marginBottom: 12 },
    addButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    addButtonText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 2 },
    habitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a2a3e' },
    habitCompleted: { opacity: 0.5 },
    habitCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    habitTitle: { color: '#ddd', fontSize: 15, fontWeight: '600' },
    habitXp: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 8 },
    emptyText: { color: '#555', fontSize: 16, fontWeight: '700' },
    emptySubtext: { color: '#444', fontSize: 12, marginTop: 4 },
});
