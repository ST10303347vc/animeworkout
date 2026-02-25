import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';

const PILLARS: Record<string, { label: string; color: string; icon: any }> = {
    physical: { label: 'Physical', color: '#E63946', icon: 'barbell' },
    mental: { label: 'Mental', color: '#4A90E2', icon: 'bulb' },
    wealth: { label: 'Wealth', color: '#E88C30', icon: 'wallet' },
    vitality: { label: 'Vitality', color: '#2A9D8F', icon: 'heart' },
};

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

export default function ChallengeTasksTab() {
    const user = useStore(s => s.user);
    const quests = useStore(s => s.quests);
    const completeQuest = useStore(s => s.completeQuest);
    const addDailyHabit = useStore(s => s.addDailyHabit);
    const completeDailyHabit = useStore(s => s.completeDailyHabit);
    const deleteDailyHabit = useStore(s => s.deleteDailyHabit);

    const failDailyHabit = useStore(s => s.failDailyHabit);
    const [isAddingHabit, setIsAddingHabit] = useState(false);
    const [habit1, setHabit1] = useState('');

    if (!user) return null;

    const habits = user.dailyHabits || [];
    const today = getTodayStr();

    const handleAddHabit = () => {
        if (habit1.trim()) addDailyHabit(habit1.trim(), 'general', 10);
        setHabit1('');
        setIsAddingHabit(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header */}
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                    style={styles.header}
                >
                    <Text style={styles.pageTitle}>DAILY TASKS</Text>
                    <Text style={styles.subtitle}>Complete to level up</Text>
                </MotiView>

                {/* Quests Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 15-DAY CHALLENGE CORE QUESTS</Text>
                    {quests.map((quest, i) => {
                        const config = PILLARS[quest.pillar] || PILLARS['physical'];
                        return (
                            <MotiView
                                key={quest.id}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 300, delay: i * 80 }}
                            >
                                <Pressable
                                    onPress={() => !quest.isCompleted && completeQuest(quest.id)}
                                    disabled={quest.isCompleted}
                                >
                                    <View style={[styles.card, quest.isCompleted && styles.completedCard]}>
                                        <View style={[styles.pillarDot, { backgroundColor: config.color }]} />
                                        <View style={styles.info}>
                                            <Text style={[styles.cardTitle, quest.isCompleted && styles.completedText]}>
                                                {quest.questDescription}
                                            </Text>
                                            <Text style={[styles.xpText, { color: config.color }]}>
                                                +{quest.xpReward} XP
                                            </Text>
                                        </View>
                                        {quest.isCompleted && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
                                    </View>
                                </Pressable>
                            </MotiView>
                        );
                    })}
                </View>

                {/* Quitting / Daily Habit Section */}
                <View style={[styles.section, { marginTop: 40 }]}>
                    <Text style={styles.sectionTitle}>🚭 QUITTING A HABIT (STREAK TRACKER)</Text>
                    <Text style={styles.sectionSubtitle}>
                        Add up to 2 habits to avoid (e.g., "Stop Smoking"). Checking it off builds a streak for bonus XP. Slipping up resets your streak to 0!
                    </Text>

                    {habits.map((habit, i) => {
                        const isDoneToday = habit.lastCompletedDate === today;
                        const streak = habit.streak || 0;
                        const nextXp = habit.xpReward + (streak * 5);

                        return (
                            <MotiView
                                key={habit.id}
                                from={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'timing', duration: 300, delay: i * 50 }}
                            >
                                <View style={[styles.card, isDoneToday && styles.completedCard, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                                    <View style={{ flexDirection: 'row', width: '100%', marginBottom: 12 }}>
                                        <View style={styles.info}>
                                            <Text style={[styles.cardTitle, isDoneToday && styles.completedText]}>
                                                {habit.title}
                                            </Text>
                                            <Text style={styles.streakText}>
                                                🔥 {streak} Day Streak
                                            </Text>
                                            <Text style={[styles.xpText, { color: '#F4D03F', marginTop: 4 }]}>
                                                {isDoneToday ? `Acted today! Come back tomorrow.` : `Avoid today for +${nextXp} XP`}
                                            </Text>
                                        </View>
                                        <Pressable style={{ marginLeft: 16 }} onPress={() => deleteDailyHabit(habit.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#555" />
                                        </Pressable>
                                    </View>

                                    {!isDoneToday ? (
                                        <View style={styles.habitActionRow}>
                                            <Pressable style={styles.avoidBtn} onPress={() => completeDailyHabit(habit.id)}>
                                                <Ionicons name="shield-checkmark" size={16} color="#000" style={{ marginRight: 6 }} />
                                                <Text style={styles.avoidBtnText}>I AVOIDED IT</Text>
                                            </Pressable>
                                            <Pressable style={styles.slipBtn} onPress={() => failDailyHabit(habit.id)}>
                                                <Ionicons name="close-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                                                <Text style={styles.slipBtnText}>I SLIPPED UP</Text>
                                            </Pressable>
                                        </View>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name={streak > 0 ? "checkmark-circle" : "close-circle"} size={24} color={streak > 0 ? "#10b981" : "#ef4444"} />
                                            <Text style={{ color: '#888', marginLeft: 8, fontSize: 13, fontWeight: '700' }}>
                                                {streak > 0 ? "Avoided ✅" : "Slipped up ❌"}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </MotiView>
                        );
                    })}

                    {habits.length < 2 && !isAddingHabit && (
                        <Pressable style={styles.yellowAddButton} onPress={() => setIsAddingHabit(true)}>
                            <Ionicons name="add" size={24} color="#000" />
                            <Text style={styles.yellowAddButtonText}>
                                {habits.length === 0 ? "ADD HABITS TO QUIT" : "ADD ANOTHER HABIT"}
                            </Text>
                        </Pressable>
                    )}

                    {isAddingHabit && habits.length < 2 && (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={styles.addForm}
                        >
                            <TextInput
                                style={styles.inputForm}
                                value={habit1}
                                onChangeText={setHabit1}
                                placeholder="I will not..."
                                placeholderTextColor="#555"
                            />
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                <Pressable
                                    style={[styles.addButton, { flex: 1, opacity: !habit1.trim() ? 0.5 : 1 }]}
                                    onPress={handleAddHabit}
                                    disabled={!habit1.trim()}
                                >
                                    <Text style={styles.addButtonText}>START TRACKING</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.addButton, { backgroundColor: '#2a2a3e' }]}
                                    onPress={() => setIsAddingHabit(false)}
                                >
                                    <Text style={[styles.addButtonText, { color: '#fff' }]}>CANCEL</Text>
                                </Pressable>
                            </View>
                        </MotiView>
                    )}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
    header: { marginBottom: 32 },
    pageTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 4 },
    subtitle: { color: '#666', fontSize: 13, marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: { color: '#888', fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
    sectionSubtitle: { color: '#555', fontSize: 12, marginBottom: 16 },
    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e',
        borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a3e',
    },
    completedCard: { opacity: 0.6, borderColor: '#10b98144' },
    pillarDot: { width: 8, height: 8, borderRadius: 4, marginRight: 14 },
    info: { flex: 1 },
    cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
    completedText: { textDecorationLine: 'line-through', color: '#888' },
    xpText: { fontSize: 12, fontWeight: '800', marginTop: 4 },
    streakText: { color: '#ff9800', fontSize: 12, fontWeight: '800', marginTop: 4 },
    // Buttons and Inputs for Habit section
    addHabitContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    input: {
        flex: 1, backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333',
        borderRadius: 10, paddingHorizontal: 16, color: '#fff', fontSize: 15,
    },
    addButton: { backgroundColor: '#F4D03F', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    addButtonText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
    completeBtn: { backgroundColor: '#2a2a3e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    completeBtnText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 1 },

    // New Habit Add/Edit UI
    yellowAddButton: {
        backgroundColor: '#F4D03F', borderRadius: 12, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8, gap: 8,
    },
    yellowAddButtonText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
    addForm: {
        backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#333', borderRadius: 12,
        padding: 16, marginTop: 8,
    },
    inputForm: {
        backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333',
        borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 15,
    },

    // Slipped up / Avoided UI
    habitActionRow: { flexDirection: 'row', gap: 8, width: '100%' },
    avoidBtn: {
        backgroundColor: '#10b981', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 8,
    },
    avoidBtnText: { color: '#000', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
    slipBtn: {
        backgroundColor: '#ef4444', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 8,
    },
    slipBtnText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
});
