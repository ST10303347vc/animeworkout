import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import { PdfReaderModal } from '@/components/PdfReaderModal';
import type { CustomTask, TaskChapter } from '@limit-break/core';
import { ATOMIC_HABITS_SECTIONS, getAtomicHabitsChapters, TOTAL_BOOK_XP, PDF_ASSETS } from '@/constants/atomicHabitsData';

export default function ReadingTab() {
    const user = useStore(s => s.user);
    const addCustomTaskWithChapters = useStore(s => s.addCustomTaskWithChapters);
    const completeTaskChapter = useStore(s => s.completeTaskChapter);
    const deleteCustomTask = useStore(s => s.deleteCustomTask);

    const [readingTask, setReadingTask] = useState<{
        task: CustomTask; chapterId: string; chapterTitle: string; pdfFile: string; xpReward: number;
    } | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    if (!user) return null;

    const mentalTasks = (user.customTasks || []).filter(t => t.pillar === 'mental' && t.status === 'active');
    const atomicHabitsTask = mentalTasks.find(t => t.title === 'Atomic Habits');

    const handleStartBook = () => {
        const chaptersData = getAtomicHabitsChapters().map(ch => ({
            id: ch.id,
            title: ch.title,
            xpReward: ch.xpReward,
            pdfFile: ch.pdfFile,
        }));
        addCustomTaskWithChapters('Atomic Habits', 'mental', 8, chaptersData);
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) next.delete(sectionId);
            else next.add(sectionId);
            return next;
        });
    };

    // Book-level progress
    const bookProgress = useMemo(() => {
        if (!atomicHabitsTask?.chapters) return { completed: 0, total: 0, xpEarned: 0, xpTotal: 0, pct: 0 };
        const total = atomicHabitsTask.chapters.length;
        const completed = atomicHabitsTask.chapters.filter(c => c.isCompleted).length;
        const xpEarned = atomicHabitsTask.chapters
            .filter(c => c.isCompleted)
            .reduce((sum, c) => sum + (c.xpReward || 0), 0);
        const xpTotal = atomicHabitsTask.chapters.reduce((sum, c) => sum + (c.xpReward || 0), 0);
        return { completed, total, xpEarned, xpTotal, pct: total > 0 ? (completed / total) * 100 : 0 };
    }, [atomicHabitsTask]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* ── Header ───────────────────────── */}
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <Text style={styles.pageTitle}>📖 READING</Text>
                    <Text style={styles.subtitle}>Knowledge is the ultimate power-up</Text>
                </MotiView>

                {/* ══════════════════════════════════════ */}
                {/* ── START BOOK (if not started)  ───── */}
                {/* ══════════════════════════════════════ */}
                {!atomicHabitsTask && (
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 18, stiffness: 180 }}
                        style={styles.startCard}
                    >
                        <Text style={styles.startBookEmoji}>📕</Text>
                        <Text style={styles.startBookTitle}>ATOMIC HABITS</Text>
                        <Text style={styles.startBookAuthor}>James Clear</Text>
                        <Text style={styles.startBookDesc}>
                            Tiny changes, remarkable results. Read your way through 21 chapters across 6 sections and earn {TOTAL_BOOK_XP} XP.
                        </Text>
                        <Pressable
                            style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
                            onPress={handleStartBook}
                        >
                            <Ionicons name="book" size={18} color="#000" />
                            <Text style={styles.startBtnText}>START READING</Text>
                        </Pressable>
                    </MotiView>
                )}

                {/* ══════════════════════════════════════ */}
                {/* ── BOOK VIEW (if started) ──────────── */}
                {/* ══════════════════════════════════════ */}
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
                                        animate={{ width: `${bookProgress.pct}%` as any }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        style={styles.bookProgressFill}
                                    />
                                </View>
                                <View style={styles.bookProgressStats}>
                                    <Text style={styles.bookProgressText}>
                                        {bookProgress.completed}/{bookProgress.total} chapters
                                    </Text>
                                    <Text style={styles.bookXpText}>
                                        ⚡ {bookProgress.xpEarned}/{bookProgress.xpTotal} XP
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* ── Sections & Chapters ─────────── */}
                        {ATOMIC_HABITS_SECTIONS.map((section, sectionIdx) => {
                            const isExpanded = expandedSections.has(section.id);
                            const sectionChapters = section.chapters.map(sch =>
                                atomicHabitsTask.chapters?.find(c => c.id === sch.id)
                            ).filter(Boolean) as TaskChapter[];
                            const sectionCompleted = sectionChapters.filter(c => c.isCompleted).length;
                            const sectionTotal = sectionChapters.length;
                            const sectionDone = sectionCompleted === sectionTotal && sectionTotal > 0;
                            const sectionPct = sectionTotal > 0 ? (sectionCompleted / sectionTotal) * 100 : 0;

                            return (
                                <View key={section.id}>
                                    {/* Section Header */}
                                    <Pressable
                                        style={[styles.sectionHeader, sectionIdx === 0 && { borderTopWidth: 0 }]}
                                        onPress={() => toggleSection(section.id)}
                                    >
                                        <View style={styles.sectionLeft}>
                                            <View style={[styles.sectionDot, sectionDone && styles.sectionDotDone]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.sectionTitle, sectionDone && styles.sectionTitleDone]}>
                                                    {section.title}
                                                </Text>
                                                {/* Section mini progress bar */}
                                                <View style={styles.sectionProgressTrack}>
                                                    <View style={[styles.sectionProgressFill, { width: `${sectionPct}%` }]} />
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.sectionRight}>
                                            <Text style={[styles.sectionCount, sectionDone && { color: '#00f0ff' }]}>
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
                                            {section.chapters.map((sch, chIdx) => {
                                                const taskChap = atomicHabitsTask.chapters?.find(c => c.id === sch.id);
                                                if (!taskChap) return null;
                                                const isDone = taskChap.isCompleted;

                                                return (
                                                    <MotiView
                                                        key={sch.id}
                                                        from={{ opacity: 0, translateX: -8 }}
                                                        animate={{ opacity: 1, translateX: 0 }}
                                                        transition={{ type: 'timing', duration: 200, delay: chIdx * 40 }}
                                                        style={[styles.chapItem, isDone && styles.chapCompleted]}
                                                    >
                                                        {/* Check */}
                                                        <Pressable
                                                            style={[styles.chapCheck, isDone && styles.chapCheckDone]}
                                                            onPress={() => !isDone && completeTaskChapter(atomicHabitsTask.id, sch.id)}
                                                        >
                                                            {isDone && <Ionicons name="checkmark" size={11} color="#000" />}
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
                                                                style={({ pressed }) => [styles.readBtn, pressed && { backgroundColor: '#00f0ff18' }]}
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
                                                    </MotiView>
                                                );
                                            })}
                                        </MotiView>
                                    )}
                                </View>
                            );
                        })}
                    </MotiView>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {readingTask && (
                <PdfReaderModal
                    chapterTitle={readingTask.chapterTitle}
                    xpReward={readingTask.xpReward}
                    pdfSource={PDF_ASSETS[readingTask.pdfFile]}
                    pdfFilename={readingTask.pdfFile}
                    onComplete={() => {
                        completeTaskChapter(readingTask.task.id, readingTask.chapterId);
                        setReadingTask(null);
                    }}
                    onClose={() => setReadingTask(null)}
                />
            )}
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════
// ── STYLES ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },

    // ── Header
    pageTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 3 },
    subtitle: { color: '#555', fontSize: 12, marginTop: 4, marginBottom: 24, letterSpacing: 0.5 },

    // ── Start Card (before book is added)
    startCard: {
        backgroundColor: '#111126',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#00f0ff30',
    },
    startBookEmoji: { fontSize: 48, marginBottom: 14 },
    startBookTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 3 },
    startBookAuthor: { color: '#666', fontSize: 13, marginTop: 4, letterSpacing: 1 },
    startBookDesc: {
        color: '#888', fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 20,
        paddingHorizontal: 10,
    },
    startBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#00f0ff', paddingHorizontal: 28, paddingVertical: 14,
        borderRadius: 12, marginTop: 24,
    },
    startBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 2 },

    // ── Book Card
    bookCard: {
        backgroundColor: '#111126',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#00f0ff25',
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
        marginTop: 2,
    },
    sectionDotDone: { backgroundColor: '#00f0ff' },
    sectionTitle: {
        color: '#ccc',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    sectionTitleDone: { color: '#00f0ff' },
    sectionCount: { color: '#555', fontSize: 11, fontWeight: '600' },
    sectionProgressTrack: {
        height: 2,
        backgroundColor: '#1a1a3a',
        borderRadius: 1,
        marginTop: 6,
        overflow: 'hidden',
    },
    sectionProgressFill: {
        height: '100%',
        backgroundColor: '#00f0ff50',
        borderRadius: 1,
    },

    // ── Chapter Items
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
    chapCompleted: { opacity: 0.45 },
    chapCheck: {
        width: 20, height: 20, borderRadius: 6,
        borderWidth: 1.5, borderColor: '#00f0ff40',
        marginRight: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    chapCheckDone: { backgroundColor: '#00f0ff', borderColor: '#00f0ff' },
    chapInfo: { flex: 1, marginRight: 8 },
    chapTitle: { color: '#bbb', fontSize: 13, fontWeight: '500', lineHeight: 18 },
    chapTitleDone: { textDecorationLine: 'line-through', color: '#666' },
    chapXp: { color: '#00f0ff70', fontSize: 10, fontWeight: '700', marginTop: 2 },
    chapXpDone: { color: '#333' },
    readBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0, 240, 255, 0.06)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00f0ff25',
    },
    readBtnText: { color: '#00f0ff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});
