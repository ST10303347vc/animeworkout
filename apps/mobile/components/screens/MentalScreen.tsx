import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { MotiView, AnimatePresence as MotiAnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { TaskTimerModal } from '@/components/TaskTimerModal';
import { CustomSlider } from '@/components/CustomSlider';
import type { CustomTask } from '@limit-break/core';

export default function MentalScreen() {
    const user = useStore(s => s.user);
    const addCustomTask = useStore(s => s.addCustomTask);
    const addCustomTaskWithChapters = useStore(s => s.addCustomTaskWithChapters);
    const completeCustomTask = useStore(s => s.completeCustomTask);
    const deleteCustomTask = useStore(s => s.deleteCustomTask);
    const completeTaskChapter = useStore(s => s.completeTaskChapter);

    const [addingTask, setAddingTask] = useState(false);
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState(5);
    const [chapters, setChapters] = useState<{ id: string, title: string }[]>([]);

    const [timerTask, setTimerTask] = useState<{ task: CustomTask, chapterId?: string } | null>(null);

    if (!user) return null;

    const mentalTasks = (user.customTasks || []).filter(t => t.pillar === 'mental' && t.status === 'active');

    const handleAdd = () => {
        if (!title.trim()) return;
        if (chapters.length > 0) {
            addCustomTaskWithChapters(title.trim(), 'mental', difficulty, chapters);
        } else {
            addCustomTask(title.trim(), 'mental', difficulty);
        }
        setTitle('');
        setDifficulty(5);
        setChapters([]);
        setAddingTask(false);
    };

    const addChapter = () => {
        setChapters([...chapters, { id: `chap-${Date.now()}`, title: `Chapter ${chapters.length + 1}` }]);
    };

    const updateChapter = (id: string, newTitle: string) => {
        setChapters(chapters.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    const removeChapter = (id: string) => {
        setChapters(chapters.filter(c => c.id !== id));
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500 }}>
                    <View style={styles.headerRow}>
                        <Ionicons name="bulb" size={28} color="#00f0ff" />
                        <Text style={[styles.pageTitle, { color: '#00f0ff' }]}>THE SAGE</Text>
                    </View>
                    <Text style={styles.subtitle}>Train your mind, focus deep, achieve enlightenment</Text>
                </MotiView>

                {/* Add Quest Form via FAB Toggle */}
                <MotiAnimatePresence>
                    {addingTask && (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            style={styles.formCard}
                        >
                            <Text style={styles.formTitle}>NEW SAGE QUEST</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="What will you learn?"
                                placeholderTextColor="#555"
                            />

                            <View style={styles.diffRow}>
                                <Text style={styles.diffLabel}>DIFFICULTY</Text>
                                <Text style={styles.diffValue}>{difficulty}/10</Text>
                            </View>
                            <CustomSlider
                                value={difficulty}
                                onValueChange={setDifficulty}
                                min={1} max={10} step={1}
                                activeColor="#00f0ff"
                            />

                            {/* Spacing for next section */}
                            <View style={{ height: 20 }} />

                            <View style={styles.chapterHeader}>
                                <Text style={styles.diffLabel}>CHAPTERS (OPTIONAL)</Text>
                                <Pressable style={styles.addChapBtn} onPress={addChapter}>
                                    <Text style={styles.addChapText}>+ ADD</Text>
                                </Pressable>
                            </View>

                            {chapters.map((chap, i) => (
                                <View key={chap.id} style={styles.chapterRow}>
                                    <TextInput
                                        style={styles.chapterInput}
                                        value={chap.title}
                                        onChangeText={(t) => updateChapter(chap.id, t)}
                                    />
                                    <Pressable onPress={() => removeChapter(chap.id)}>
                                        <Ionicons name="close-circle" size={20} color="#ff3333" />
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable style={styles.submitBtn} onPress={handleAdd} disabled={!title.trim()}>
                                <Text style={styles.submitText}>ADD QUEST</Text>
                            </Pressable>
                        </MotiView>
                    )}
                </MotiAnimatePresence>

                {/* Active Quests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🧠 ACTIVE SAGE QUESTS ({mentalTasks.length})</Text>
                    {mentalTasks.length === 0 && !addingTask && (
                        <Text style={styles.emptyText}>Tap the + to log a new mental quest.</Text>
                    )}
                    {mentalTasks.map((task, i) => (
                        <MotiView
                            key={task.id}
                            from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 300, delay: i * 50 }}
                            style={styles.taskCard}
                        >
                            <View style={styles.taskHeader}>
                                <Pressable style={[styles.taskCheck, { borderColor: '#00f0ff' }]} onPress={() => completeCustomTask(task.id)} />
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={[styles.taskXp, { color: '#00f0ff' }]}>+{task.xpReward} XP</Text>
                                </View>
                                <Pressable style={styles.timerBtn} onPress={() => setTimerTask({ task })}>
                                    <Ionicons name="timer-outline" size={20} color="#fff" />
                                </Pressable>
                                <Pressable style={{ marginLeft: 12 }} onPress={() => deleteCustomTask(task.id)}>
                                    <Ionicons name="trash-outline" size={18} color="#555" />
                                </Pressable>
                            </View>

                            {/* Render Chapters if exist */}
                            {(task.chapters || []).length > 0 && (
                                <View style={styles.chaptersList}>
                                    {task.chapters!.map((chap) => (
                                        <View key={chap.id} style={[styles.chapItem, chap.isCompleted && styles.chapCompleted]}>
                                            <Pressable style={[styles.chapCheck, chap.isCompleted && { backgroundColor: '#00f0ff' }]} onPress={() => !chap.isCompleted && completeTaskChapter(task.id, chap.id)} />
                                            <Text style={[styles.chapTitle, chap.isCompleted && styles.chapTitleCompleted]}>{chap.title}</Text>
                                            {!chap.isCompleted && (
                                                <Pressable style={styles.chapTimerBtn} onPress={() => setTimerTask({ task, chapterId: chap.id })}>
                                                    <Ionicons name="play" size={12} color="#00f0ff" />
                                                </Pressable>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </MotiView>
                    ))}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <FloatingActionButton
                mainColor="#00f0ff"
                actions={[
                    {
                        icon: 'add',
                        label: 'Add Quest',
                        color: '#00f0ff',
                        onPress: () => setAddingTask(prev => !prev)
                    }
                ]}
            />

            {/* Timer Modal Overlay */}
            {timerTask && (
                <TaskTimerModal
                    task={timerTask.task}
                    chapterId={timerTask.chapterId}
                    onComplete={(taskId, chapId, notes) => {
                        if (chapId) completeTaskChapter(taskId, chapId, notes);
                        else completeCustomTask(taskId, notes);
                    }}
                    onClose={() => setTimerTask(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { paddingTop: 60, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pageTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 4 },
    subtitle: { color: '#555', fontSize: 12, marginTop: 4, marginBottom: 24 },
    formCard: { backgroundColor: '#1a1a2e', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#00f0ff', marginBottom: 24 },
    formTitle: { color: '#00f0ff', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 16 },
    input: { backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14, color: '#fff', fontSize: 16, marginBottom: 16 },
    diffRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    diffLabel: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    diffValue: { color: '#00f0ff', fontSize: 14, fontWeight: '900' },
    diffDots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
    diffDot: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#2a2a3e' },
    chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    addChapBtn: { backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    addChapText: { color: '#00f0ff', fontSize: 10, fontWeight: '900' },
    chapterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    chapterInput: { flex: 1, backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 10, color: '#ddd' },
    submitBtn: { backgroundColor: '#00f0ff', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
    submitText: { color: '#000', fontWeight: '900', letterSpacing: 2 },
    section: { marginTop: 10 },
    sectionTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
    emptyText: { color: '#555', fontStyle: 'italic' },
    taskCard: { backgroundColor: '#1a1a2e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a3e', marginBottom: 12, overflow: 'hidden' },
    taskHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, marginRight: 12 },
    taskInfo: { flex: 1 },
    taskTitle: { color: '#ddd', fontSize: 15, fontWeight: '600' },
    taskXp: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    timerBtn: { backgroundColor: 'rgba(0,240,255,0.1)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    chaptersList: { backgroundColor: '#0f0f1e', padding: 12, borderTopWidth: 1, borderTopColor: '#2a2a3e' },
    chapItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    chapCompleted: { opacity: 0.5 },
    chapCheck: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: '#00f0ff', marginRight: 10 },
    chapTitle: { flex: 1, color: '#aaa', fontSize: 13 },
    chapTitleCompleted: { textDecorationLine: 'line-through' },
    chapTimerBtn: { backgroundColor: 'rgba(0,240,255,0.1)', padding: 6, borderRadius: 6 }
});
