import { useState, useMemo, lazy, Suspense } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MotiView, AnimatePresence as MotiAnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { TaskTimerModal } from '@/components/TaskTimerModal';
import { CustomSlider } from '@/components/CustomSlider';
const PdfReaderModal = lazy(() => import('@/components/PdfReaderModal').then(module => ({ default: module.PdfReaderModal })));
import type { CustomTask, TaskChapter } from '@limit-break/core';
import { ATOMIC_HABITS_SECTIONS, getAtomicHabitsChapters, TOTAL_BOOK_XP, PDF_ASSETS } from '@/constants/atomicHabitsData';

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
    const [readingTask, setReadingTask] = useState<{ task: CustomTask, chapterId: string, chapterTitle: string, pdfFile: string, xpReward: number } | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    if (!user) return null;

    const mentalTasks = (user.customTasks || []).filter(t => t.pillar === 'mental' && t.status === 'active');
    const atomicHabitsTask = mentalTasks.find(t => t.title === 'Atomic Habits');

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

    const handleAddAtomicHabits = () => {
        const chaptersData = getAtomicHabitsChapters().map(ch => ({
            id: ch.id,
            title: ch.title,
            xpReward: ch.xpReward,
            pdfFile: ch.pdfFile,
        }));
        addCustomTaskWithChapters('Atomic Habits', 'mental', 8, chaptersData);
        setAddingTask(false);
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) next.delete(sectionId);
            else next.add(sectionId);
            return next;
        });
    };

    // Calculate book-level progress
    const bookProgress = useMemo(() => {
        if (!atomicHabitsTask?.chapters) return { completed: 0, total: 0, xpEarned: 0, xpTotal: 0 };
        const total = atomicHabitsTask.chapters.length;
        const completed = atomicHabitsTask.chapters.filter(c => c.isCompleted).length;
        const xpEarned = atomicHabitsTask.chapters
            .filter(c => c.isCompleted)
            .reduce((sum, c) => sum + (c.xpReward || 0), 0);
        const xpTotal = atomicHabitsTask.chapters.reduce((sum, c) => sum + (c.xpReward || 0), 0);
        return { completed, total, xpEarned, xpTotal };
    }, [atomicHabitsTask]);

    const otherTasks = mentalTasks.filter(t => t.title !== 'Atomic Habits');

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* ── Header ───────────────────────────── */}
                <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500 }}>
                    <View style={styles.headerRow}>
                        <Ionicons name="bulb" size={28} color="#00f0ff" />
                        <Text style={[styles.pageTitle, { color: '#00f0ff' }]}>THE SAGE</Text>
                    </View>
                    <Text style={styles.subtitle}>Train your mind, focus deep, achieve enlightenment</Text>
                </MotiView>

                {/* ── Add Quest Form ───────────────────── */}
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

                            <View style={{ height: 20 }} />

                            <View style={styles.chapterHeader}>
                                <Text style={styles.diffLabel}>CHAPTERS (OPTIONAL)</Text>
                                <Pressable style={styles.addChapBtn} onPress={addChapter}>
                                    <Text style={styles.addChapText}>+ ADD</Text>
                                </Pressable>
                            </View>

                            {chapters.map((chap) => (
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

                            {/* Book shortcut button */}
                            {!atomicHabitsTask && (
                                <Pressable style={styles.bookBtn} onPress={handleAddAtomicHabits}>
                                    <Ionicons name="book" size={20} color="#00f0ff" />
                                    <Text style={styles.bookBtnText}>📖  Start: Atomic Habits</Text>
                                </Pressable>
                            )}
                        </MotiView>
                    )}
                </MotiAnimatePresence>

                {/* ═══════════════════════════════════════ */}
                {/* ── ATOMIC HABITS BOOK VIEW ─────────── */}
                {/* ═══════════════════════════════════════ */}
                {atomicHabitsTask && (
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400 }}
                        style={styles.bookCard}
                    >
                        {/* Book Header */}
                        <View style={styles.bookHeader}>
                            <View style={styles.bookTitleRow}>
                                <Text style={styles.bookIcon}>📖</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.bookTitle}>ATOMIC HABITS</Text>
                                    <Text style={styles.bookAuthor}>James Clear</Text>
                                </View>
                                <Pressable style={{ padding: 4 }} onPress={() => deleteCustomTask(atomicHabitsTask.id)}>
                                    <Ionicons name="trash-outline" size={16} color="#444" />
                                </Pressable>
                            </View>

                            {/* Overall Progress */}
                            <View style={styles.bookProgressContainer}>
                                <View style={styles.bookProgressTrack}>
                                    <MotiView
                                        animate={{ width: `${bookProgress.total > 0 ? (bookProgress.completed / bookProgress.total) * 100 : 0}%` as any }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        style={styles.bookProgressFill}
                                    />
                                </View>
                                <View style={styles.bookProgressStats}>
                                    <Text style={styles.bookProgressText}>
                                        {bookProgress.completed}/{bookProgress.total} chapters
                                    </Text>
                                    <Text style={styles.bookXpText}>
                                        {bookProgress.xpEarned}/{bookProgress.xpTotal} XP
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* ── Sections & Chapters ─────────────── */}
                        {ATOMIC_HABITS_SECTIONS.map((section, sectionIdx) => {
                            const isExpanded = expandedSections.has(section.id);
                            const sectionChapters = section.chapters.map(sch =>
                                atomicHabitsTask.chapters?.find(c => c.id === sch.id)
                            ).filter(Boolean) as TaskChapter[];
                            const sectionCompleted = sectionChapters.filter(c => c.isCompleted).length;
                            const sectionTotal = sectionChapters.length;
                            const sectionDone = sectionCompleted === sectionTotal && sectionTotal > 0;

                            return (
                                <View key={section.id}>
                                    {/* Section Header */}
                                    <Pressable
                                        style={[styles.sectionHeader, sectionIdx === 0 && { borderTopWidth: 0 }]}
                                        onPress={() => toggleSection(section.id)}
                                    >
                                        <View style={styles.sectionLeft}>
                                            <View style={[styles.sectionDot, sectionDone && styles.sectionDotDone]} />
                                            <Text style={[styles.sectionTitle, sectionDone && styles.sectionTitleDone]}>
                                                {section.title}
                                            </Text>
                                        </View>
                                        <View style={styles.sectionRight}>
                                            <Text style={styles.sectionCount}>
                                                {sectionCompleted}/{sectionTotal}
                                            </Text>
                                            <Ionicons
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                size={16}
                                                color="#555"
                                            />
                                        </View>
                                    </Pressable>

                                    {/* Chapter List (expandable) */}
                                    {isExpanded && (
                                        <MotiView
                                            from={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ type: 'timing', duration: 200 }}
                                            style={styles.chaptersList}
                                        >
                                            {section.chapters.map((sch) => {
                                                const taskChap = atomicHabitsTask.chapters?.find(c => c.id === sch.id);
                                                if (!taskChap) return null;
                                                const isDone = taskChap.isCompleted;

                                                return (
                                                    <View key={sch.id} style={[styles.chapItem, isDone && styles.chapCompleted]}>
                                                        {/* Completion check */}
                                                        <Pressable
                                                            style={[styles.chapCheck, isDone && styles.chapCheckDone]}
                                                            onPress={() => !isDone && completeTaskChapter(atomicHabitsTask.id, sch.id)}
                                                        >
                                                            {isDone && <Ionicons name="checkmark" size={10} color="#000" />}
                                                        </Pressable>

                                                        {/* Title + XP */}
                                                        <View style={styles.chapInfo}>
                                                            <Text style={[styles.chapTitle, isDone && styles.chapTitleDone]} numberOfLines={2}>
                                                                {sch.title}
                                                            </Text>
                                                            <Text style={[styles.chapXp, isDone && styles.chapXpDone]}>
                                                                +{sch.xpReward} XP
                                                            </Text>
                                                        </View>

                                                        {/* Read button */}
                                                        {!isDone && (
                                                            <Pressable
                                                                style={styles.readBtn}
                                                                onPress={() => setReadingTask({
                                                                    task: atomicHabitsTask,
                                                                    chapterId: sch.id,
                                                                    chapterTitle: sch.title,
                                                                    pdfFile: sch.pdfFile,
                                                                    xpReward: sch.xpReward,
                                                                })}
                                                            >
                                                                <Ionicons name="book-outline" size={14} color="#00f0ff" />
                                                                <Text style={styles.readBtnText}>READ</Text>
                                                            </Pressable>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </MotiView>
                                    )}
                                </View>
                            );
                        })}
                    </MotiView>
                )}

                {/* ═══════════════════════════════════════ */}
                {/* ── OTHER CUSTOM QUESTS ─────────────── */}
                {/* ═══════════════════════════════════════ */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>🧠 SAGE QUESTS ({otherTasks.length})</Text>
                    {otherTasks.length === 0 && !addingTask && !atomicHabitsTask && (
                        <Text style={styles.emptyText}>Tap the + to log a new mental quest.</Text>
                    )}
                    {otherTasks.map((task, i) => (
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
                                <View style={styles.genericChaptersList}>
                                    {task.chapters!.map((chap) => (
                                        <View key={chap.id} style={[styles.genericChapItem, chap.isCompleted && styles.chapCompleted]}>
                                            <Pressable style={[styles.chapCheck, chap.isCompleted && styles.chapCheckDone]} onPress={() => !chap.isCompleted && completeTaskChapter(task.id, chap.id)}>
                                                {chap.isCompleted && <Ionicons name="checkmark" size={10} color="#000" />}
                                            </Pressable>
                                            <Text style={[styles.chapTitle, chap.isCompleted && styles.chapTitleDone]}>{chap.title}</Text>
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

            {/* PDF Reader Modal Overlay */}
            {readingTask && (
                <Suspense fallback={
                    <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                        <ActivityIndicator size="large" color="#00f0ff" />
                        <Text style={{ color: '#00f0ff', marginTop: 10, letterSpacing: 2, fontSize: 12 }}>LOADING KNOWLEDGE...</Text>
                    </View>
                }>
                    <PdfReaderModal
                        chapterTitle={readingTask.chapterTitle}
                        xpReward={readingTask.xpReward}
                        pdfSource={PDF_ASSETS[readingTask.pdfFile]}
                        onComplete={() => {
                            completeTaskChapter(readingTask.task.id, readingTask.chapterId);
                            setReadingTask(null);
                        }}
                        onClose={() => setReadingTask(null)}
                    />
                </Suspense>
            )}
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════
// ── STYLES ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { paddingTop: 60, paddingHorizontal: 16 },

    // ── Header
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pageTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 4 },
    subtitle: { color: '#555', fontSize: 12, marginTop: 4, marginBottom: 24 },

    // ── Form
    formCard: { backgroundColor: '#1a1a2e', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#00f0ff', marginBottom: 24 },
    formTitle: { color: '#00f0ff', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 16 },
    input: { backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14, color: '#fff', fontSize: 16, marginBottom: 16 },
    diffRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    diffLabel: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    diffValue: { color: '#00f0ff', fontSize: 14, fontWeight: '900' },
    chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    addChapBtn: { backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    addChapText: { color: '#00f0ff', fontSize: 10, fontWeight: '900' },
    chapterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    chapterInput: { flex: 1, backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 10, color: '#ddd' },
    submitBtn: { backgroundColor: '#00f0ff', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
    submitText: { color: '#000', fontWeight: '900', letterSpacing: 2 },
    bookBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(0, 240, 255, 0.08)', paddingVertical: 14, borderRadius: 12,
        marginTop: 12, borderWidth: 1.5, borderColor: '#00f0ff50', borderStyle: 'dashed',
    },
    bookBtnText: { color: '#00f0ff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },

    // ── Book Card
    bookCard: {
        backgroundColor: '#111126',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#00f0ff30',
        marginBottom: 20,
        overflow: 'hidden',
    },
    bookHeader: {
        padding: 16,
        backgroundColor: '#0d0d1c',
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a3a',
    },
    bookTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    bookIcon: { fontSize: 28 },
    bookTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
    bookAuthor: { color: '#666', fontSize: 11, marginTop: 2, letterSpacing: 1 },

    // ── Book Progress
    bookProgressContainer: { gap: 6 },
    bookProgressTrack: {
        height: 6,
        backgroundColor: '#1a1a3a',
        borderRadius: 3,
        overflow: 'hidden',
    },
    bookProgressFill: {
        height: '100%',
        backgroundColor: '#00f0ff',
        borderRadius: 3,
        minWidth: 2,
    },
    bookProgressStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bookProgressText: { color: '#777', fontSize: 11, fontWeight: '600' },
    bookXpText: { color: '#00f0ff', fontSize: 11, fontWeight: '800' },

    // ── Section Headers
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#1a1a3a',
    },
    sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#333',
    },
    sectionDotDone: { backgroundColor: '#00f0ff' },
    sectionTitle: {
        color: '#ccc',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        flex: 1,
    },
    sectionTitleDone: { color: '#00f0ff' },
    sectionCount: { color: '#555', fontSize: 11, fontWeight: '600' },

    // ── Chapter Items (inside book)
    chaptersList: {
        backgroundColor: '#0a0a18',
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 8,
    },
    chapItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#151530',
    },
    chapCompleted: { opacity: 0.5 },
    chapCheck: {
        width: 18, height: 18, borderRadius: 5,
        borderWidth: 1.5, borderColor: '#00f0ff50',
        marginRight: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    chapCheckDone: { backgroundColor: '#00f0ff', borderColor: '#00f0ff' },
    chapInfo: { flex: 1, marginRight: 8 },
    chapTitle: { color: '#bbb', fontSize: 13, fontWeight: '500', lineHeight: 18 },
    chapTitleDone: { textDecorationLine: 'line-through', color: '#666' },
    chapXp: { color: '#00f0ff80', fontSize: 10, fontWeight: '700', marginTop: 2 },
    chapXpDone: { color: '#333' },
    readBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0, 240, 255, 0.08)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00f0ff30',
    },
    readBtnText: { color: '#00f0ff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

    // ── Generic quests
    section: { marginTop: 10 },
    sectionLabel: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
    emptyText: { color: '#555', fontStyle: 'italic' },
    taskCard: { backgroundColor: '#1a1a2e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a3e', marginBottom: 12, overflow: 'hidden' },
    taskHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, marginRight: 12 },
    taskInfo: { flex: 1 },
    taskTitle: { color: '#ddd', fontSize: 15, fontWeight: '600' },
    taskXp: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    timerBtn: { backgroundColor: 'rgba(0,240,255,0.1)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    genericChaptersList: { backgroundColor: '#0f0f1e', padding: 12, borderTopWidth: 1, borderTopColor: '#2a2a3e' },
    genericChapItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    chapTimerBtn: { backgroundColor: 'rgba(0,240,255,0.1)', padding: 6, borderRadius: 6 },
});
