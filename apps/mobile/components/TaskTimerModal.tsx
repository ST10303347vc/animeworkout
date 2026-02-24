import { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, TextInput, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import type { CustomTask } from '@limit-break/core';

interface Props {
    task: CustomTask;
    chapterId?: string;
    onComplete: (taskId: string, chapterId?: string, notes?: string) => void;
    onClose: () => void;
    initialPhase?: 'setup' | 'done';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 240;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SAGE_QUOTES = [
    "The mind is not a vessel to be filled, but a fire to be kindled.",
    "He who has a why to live can bear almost any how.",
    "We suffer more often in imagination than in reality.",
    "It is not that we have a short time to live, but that we waste a lot of it.",
    "The happiness of your life depends upon the quality of your thoughts."
];

export function TaskTimerModal({ task, chapterId, onComplete, onClose, initialPhase = 'setup' }: Props) {
    const isMental = task.pillar === 'mental';
    const [phase, setPhase] = useState<'setup' | 'running' | 'paused' | 'done'>(initialPhase);
    const [quote] = useState(() => SAGE_QUOTES[Math.floor(Math.random() * SAGE_QUOTES.length)]);
    const [duration, setDuration] = useState(task.timerDuration || 15 * 60);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [eurekaNote, setEurekaNote] = useState('');
    const [timerMode, setTimerMode] = useState<'standard' | 'pomodoro'>('standard');
    const [workDuration, setWorkDuration] = useState(50 * 60);
    const [isBreak, setIsBreak] = useState(false);
    const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${String(sec).padStart(2, '0')}`;
    };

    const startTimer = () => {
        setTimeLeft(duration);
        setPhase('running');
    };

    const togglePause = () => setPhase(prev => (prev === 'running' ? 'paused' : 'running'));

    useEffect(() => {
        if (phase !== 'running') {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerMode === 'pomodoro') {
                        if (isBreak) {
                            setDuration(workDuration);
                            setIsBreak(false);
                            return workDuration;
                        } else {
                            setPomodorosCompleted(p => p + 1);
                            const breakTime = workDuration === 35 * 60 ? 5 * 60 : 10 * 60;
                            setDuration(breakTime);
                            setIsBreak(true);
                            return breakTime;
                        }
                    } else {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setPhase('done');
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase, timerMode, isBreak]);

    const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
    const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

    const ringColor = isBreak ? '#10b981' : (timerMode === 'pomodoro' ? '#10b981' : '#00f0ff');
    const titleText = chapterId ? 'CHAPTER COMPLETE!' : (isMental ? 'ENLIGHTENMENT ACHIEVED!' : 'TASK CLEAR!');

    return (
        <Modal transparent animationType="fade" visible={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                {phase === 'done' ? (
                    <MotiView from={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.doneCard}>
                        <View style={styles.doneIconWrap}>
                            <Ionicons name="checkmark-circle" size={80} color="#ffaa00" />
                        </View>
                        <Text style={styles.doneTitle}>{titleText}</Text>
                        <Text style={styles.doneDesc}>
                            {task.title} {chapterId && `- ${task.chapters?.find(c => c.id === chapterId)?.title}`}
                        </Text>

                        {isMental && !chapterId && (
                            <View style={styles.quoteBox}>
                                <Text style={styles.quoteText}>"{quote}"</Text>
                            </View>
                        )}

                        <Text style={styles.xpText}>+{task.xpReward} XP</Text>

                        {isMental && (
                            <TextInput
                                style={styles.notesInput}
                                value={eurekaNote}
                                onChangeText={setEurekaNote}
                                placeholder="Add notes (Optional)"
                                placeholderTextColor="#555"
                                multiline
                            />
                        )}

                        <Pressable
                            style={styles.collectBtn}
                            onPress={() => {
                                onComplete(task.id, chapterId, eurekaNote.trim() ? eurekaNote : undefined);
                                onClose();
                            }}
                        >
                            <Text style={styles.collectText}>COLLECT REWARDS</Text>
                        </Pressable>
                    </MotiView>
                ) : (
                    <View style={styles.modalContent}>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={28} color="#888" />
                        </Pressable>
                        <Text style={styles.taskLabel}>{task.title}</Text>

                        {phase === 'setup' ? (
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.setupContainer}>
                                <Text style={styles.header}>SET TIMER</Text>

                                {isMental && (
                                    <View style={styles.modeToggle}>
                                        {['standard', 'pomodoro'].map((mode) => (
                                            <Pressable
                                                key={mode}
                                                style={[styles.modeBtn, timerMode === mode && styles.modeBtnActive]}
                                                onPress={() => {
                                                    setTimerMode(mode as any);
                                                    setDuration(mode === 'standard' ? 15 * 60 : workDuration);
                                                }}
                                            >
                                                <Text style={[styles.modeText, timerMode === mode && styles.modeTextActive]}>
                                                    {mode.toUpperCase()}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}

                                <Text style={[styles.timeDisplay, { color: timerMode === 'pomodoro' ? '#10b981' : '#00f0ff' }]}>
                                    {formatTime(duration)}
                                </Text>

                                <View style={styles.durationOpts}>
                                    {(timerMode === 'standard' ? [5, 10, 15, 20, 30] : [35, 45, 50]).map(min => (
                                        <Pressable
                                            key={min}
                                            style={[styles.durBtn, (timerMode === 'standard' ? duration : workDuration) === min * 60 && styles.durBtnActive]}
                                            onPress={() => {
                                                setDuration(min * 60);
                                                if (timerMode === 'pomodoro') setWorkDuration(min * 60);
                                            }}
                                        >
                                            <Text style={styles.durText}>{min}m</Text>
                                        </Pressable>
                                    ))}
                                </View>

                                <Pressable style={[styles.startBtn, { backgroundColor: timerMode === 'pomodoro' ? '#10b981' : '#00f0ff' }]} onPress={startTimer}>
                                    <Ionicons name="play" size={20} color={timerMode === 'pomodoro' ? '#fff' : '#000'} />
                                    <Text style={[styles.startText, { color: timerMode === 'pomodoro' ? '#fff' : '#000' }]}>
                                        START {timerMode === 'pomodoro' ? 'SESSION' : ''}
                                    </Text>
                                </Pressable>
                            </MotiView>
                        ) : (
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.timerContainer}>
                                <View style={styles.ringContainer}>
                                    <Svg width={RING_SIZE} height={RING_SIZE}>
                                        <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke="#1a1a2e" strokeWidth={STROKE_WIDTH} fill="transparent" />
                                        <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke={ringColor} strokeWidth={STROKE_WIDTH} fill="transparent" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`} />
                                    </Svg>
                                    <View style={styles.timerCenter}>
                                        <Text style={[styles.timeDisplayRunning, { color: ringColor }]}>{formatTime(timeLeft)}</Text>
                                        <Text style={[styles.timerStatus, { color: ringColor }]}>{phase === 'paused' ? 'PAUSED' : (isBreak ? 'BREAK' : 'FOCUS')}</Text>
                                    </View>
                                </View>
                                <View style={styles.actionRow}>
                                    <Pressable style={styles.pauseBtn} onPress={togglePause}>
                                        <Ionicons name={phase === 'paused' ? 'play' : 'pause'} size={24} color="#fff" />
                                        <Text style={styles.pauseText}>{phase === 'paused' ? 'RESUME' : 'PAUSE'}</Text>
                                    </Pressable>
                                    <Pressable style={styles.finishBtn} onPress={() => { setPhase('done'); if (timerRef.current) clearInterval(timerRef.current); }}>
                                        <Text style={styles.finishText}>FINISH EARLY</Text>
                                    </Pressable>
                                </View>
                            </MotiView>
                        )}
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(10,10,20,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    doneCard: { width: '100%', maxWidth: 400, alignItems: 'center' },
    doneIconWrap: { marginBottom: 20 },
    doneTitle: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 2, marginBottom: 8 },
    doneDesc: { color: '#888', textAlign: 'center', marginBottom: 20 },
    quoteBox: { backgroundColor: 'rgba(0, 240, 255, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,240,255,0.3)', marginBottom: 20 },
    quoteText: { color: '#00f0ff', fontStyle: 'italic', textAlign: 'center', fontSize: 13 },
    xpText: { fontSize: 40, fontWeight: '900', color: '#ffaa00', marginBottom: 24 },
    notesInput: { width: '100%', backgroundColor: '#0f0f1e', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16, color: '#fff', minHeight: 100, marginBottom: 24, textAlignVertical: 'top' },
    collectBtn: { width: '100%', backgroundColor: '#fff', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    collectText: { color: '#000', fontWeight: '900', letterSpacing: 2 },
    modalContent: { width: '100%', maxWidth: 400, alignItems: 'center' },
    closeBtn: { position: 'absolute', top: 0, right: 0, zIndex: 10 },
    taskLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 },
    setupContainer: { width: '100%', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 4, marginBottom: 24 },
    modeToggle: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 10, padding: 4, marginBottom: 24 },
    modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    modeBtnActive: { backgroundColor: '#333' },
    modeText: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
    modeTextActive: { color: '#fff' },
    timeDisplay: { fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'], marginBottom: 30 },
    durationOpts: { flexDirection: 'row', gap: 10, marginBottom: 40 },
    durBtn: { backgroundColor: '#1a1a2e', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    durBtnActive: { backgroundColor: '#333' },
    durText: { color: '#ccc', fontWeight: '800' },
    startBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
    startText: { fontWeight: '900', letterSpacing: 2, marginLeft: 10 },
    timerContainer: { width: '100%', alignItems: 'center' },
    ringContainer: { width: RING_SIZE, height: RING_SIZE, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    timerCenter: { position: 'absolute', alignItems: 'center' },
    timeDisplayRunning: { fontSize: 52, fontWeight: '900', fontVariant: ['tabular-nums'] },
    timerStatus: { fontSize: 13, fontWeight: '800', letterSpacing: 3, marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
    pauseBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2a2a3e', borderRadius: 12, paddingVertical: 16 },
    pauseText: { color: '#fff', fontWeight: '800', letterSpacing: 2, marginLeft: 8 },
    finishBtn: { flex: 1, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderRadius: 12, paddingVertical: 16 },
    finishText: { color: '#fff', fontWeight: '900', letterSpacing: 2 }
});
