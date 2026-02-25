import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/stores/useStore';
import { MOCK_WORKOUTS, MOCK_EXERCISES } from '@limit-break/core';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { CustomSlider } from '@/components/CustomSlider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SessionPhase = 'select' | 'exercise-intro' | 'ready' | 'performing' | 'resting' | 'encounter' | 'finished';

const MOTIVATIONAL_QUOTES = [
    "Pain is just weakness leaving the body.",
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Fall seven times, stand up eight.",
    "Today's pain is tomorrow's power.",
    "Discipline is choosing between what you want NOW and what you want MOST.",
    "The last three or four reps is what makes the muscle grow.",
    "Suffer the pain of discipline or suffer the pain of regret.",
    "No shortcuts. No excuses. Just results.",
    "You don't have to be extreme, just consistent."
];

function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

// ── Native RestTimer Component ──
function NativeRestTimer({ durationSec, onComplete }: { durationSec: number, onComplete: () => void }) {
    const [timeLeft, setTimeLeft] = useState(durationSec);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setTimeLeft(durationSec);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [durationSec, onComplete]);

    const progress = timeLeft / durationSec;
    return (
        <View style={{ alignItems: 'center', flex: 1, width: '100%', justifyContent: 'center' }}>
            <MotiView
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1000, loop: true, type: 'timing' }}
            >
                <Text style={{ fontSize: 72, fontWeight: '900', color: '#00f0ff', fontVariant: ['tabular-nums'] }}>
                    {formatTime(timeLeft)}
                </Text>
            </MotiView>
            <View style={{ height: 6, width: 250, backgroundColor: '#1a1a2e', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
                <MotiView animate={{ width: progress * 250 }} transition={{ type: 'timing', duration: 1000 }} style={{ height: '100%', backgroundColor: '#00f0ff' }} />
            </View>
        </View>
    );
}

export default function WorkoutSessionScreen() {
    const router = useRouter();
    const user = useStore(state => state.user);
    const logWorkout = useStore(state => state.logWorkout);
    const addPillarXp = useStore(state => state.addPillarXp);

    const customWorkouts = user?.customWorkouts || [];
    const allWorkouts = useMemo(() => [...MOCK_WORKOUTS, ...customWorkouts], [customWorkouts]);

    // Session State
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [phase, setPhase] = useState<SessionPhase>('select');
    const [currentExIndex, setCurrentExIndex] = useState(0);
    const [setsCompleted, setSetsCompleted] = useState(0);
    const [restDuration, setRestDuration] = useState(90);

    // Tracking
    const [setLogs, setSetLogs] = useState<{ reps: number; xp: number }[]>([]);
    const [totalXpEarned, setTotalXpEarned] = useState(0);
    const [workoutStartTime] = useState(Date.now());
    const [comboCount, setComboCount] = useState(0);
    const [lastXpGain, setLastXpGain] = useState<number | null>(null);

    // In-set timer
    const [setTimerSec, setSetTimerSec] = useState(0);
    const setTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Encounter
    const [encounterXpBonus, setEncounterXpBonus] = useState(0);
    const [currentQuote, setCurrentQuote] = useState('');

    // Overall Timer
    const [elapsedSec, setElapsedSec] = useState(0);
    useEffect(() => {
        if (phase === 'select' || phase === 'finished') return;
        const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - workoutStartTime) / 1000)), 1000);
        return () => clearInterval(t);
    }, [phase, workoutStartTime]);

    const workout = allWorkouts.find(w => w.id === selectedWorkoutId);
    const exercises = useMemo(() => {
        if (!workout) return [];
        return workout.exercises.map(we => {
            if (we.exerciseId === 'custom') {
                return {
                    ...we,
                    details: {
                        id: 'custom',
                        name: we.customName || 'Custom Exercise',
                        muscleGroup: 'CUSTOM',
                        description: 'Custom exercise routine block.',
                        difficultyRank: 'C' as const
                    }
                }
            }
            return {
                ...we,
                details: MOCK_EXERCISES.find(e => e.id === we.exerciseId)
            }
        }).filter(e => e.details);
    }, [workout]);

    const currentExercise = exercises[currentExIndex];

    const startWorkout = useCallback((workoutId: string) => {
        setSelectedWorkoutId(workoutId);
        setCurrentExIndex(0);
        setSetsCompleted(0);
        setSetLogs([]);
        setTotalXpEarned(0);
        setComboCount(0);
        setPhase('exercise-intro');
    }, []);

    const handleStartSet = useCallback(() => {
        setSetTimerSec(0);
        setPhase('performing');
        setTimerRef.current = setInterval(() => setSetTimerSec(prev => prev + 1), 1000);
    }, []);

    const handleCompleteSet = useCallback(() => {
        if (setTimerRef.current) { clearInterval(setTimerRef.current); setTimerRef.current = null; }
        if (!currentExercise?.details) return;

        const difficultyMultipliers: Record<string, number> = { 'E': 1.0, 'D': 1.2, 'C': 1.5, 'B': 2.0, 'A': 2.5, 'S': 3.0 };
        const baseXP = 10;
        const mult = difficultyMultipliers[currentExercise.details.difficultyRank] || 1;
        const streakBonus = Math.min((user?.currentStreak || 0) * 0.05, 0.5);
        const comboBonus = Math.min(comboCount * 0.1, 0.5);
        const setXp = Math.round(baseXP * mult * (1 + streakBonus + comboBonus));

        setTotalXpEarned(prev => prev + setXp);
        setSetLogs(prev => [...prev, { reps: currentExercise.reps, xp: setXp }]);
        setLastXpGain(setXp);
        setComboCount(prev => prev + 1);
        setTimeout(() => setLastXpGain(null), 1500);

        const lastSet = setsCompleted >= currentExercise.sets - 1;
        const lastEx = currentExIndex >= exercises.length - 1;

        if (!(lastSet && lastEx) && Math.random() < 0.15) {
            setEncounterXpBonus(setXp);
            setPhase('encounter');
        } else if (lastSet && lastEx) {
            setSetsCompleted(prev => prev + 1);
            setTimeout(() => setPhase('finished'), 600);
        } else {
            setSetsCompleted(prev => prev + 1);
            setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
            setPhase('resting');
        }
    }, [currentExercise, setsCompleted, currentExIndex, exercises.length, user, comboCount]);

    const acceptEncounter = useCallback(() => {
        setTotalXpEarned(prev => prev + encounterXpBonus);
        setLastXpGain(encounterXpBonus);
        setTimeout(() => setLastXpGain(null), 1500);
        setComboCount(prev => prev + 2);
        setSetsCompleted(prev => prev + 1);
        setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
        setPhase('resting');
    }, [encounterXpBonus]);

    const declineEncounter = useCallback(() => {
        setSetsCompleted(prev => prev + 1);
        setComboCount(0);
        setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
        setPhase('resting');
    }, []);

    const finishRest = useCallback(() => {
        const lastSet = currentExercise ? setsCompleted >= currentExercise.sets : false;
        if (lastSet) {
            setCurrentExIndex(prev => prev + 1);
            setSetsCompleted(0);
            setSetLogs([]);
            setPhase('exercise-intro');
        } else {
            setPhase('ready');
        }
    }, [currentExercise, setsCompleted]);

    const finishWorkout = useCallback(() => {
        if (!workout) return;
        addPillarXp('physical', totalXpEarned);
        logWorkout(workout.name, totalXpEarned);
        router.back();
    }, [workout, totalXpEarned, logWorkout, router, addPillarXp]);

    useEffect(() => {
        return () => { if (setTimerRef.current) clearInterval(setTimerRef.current); };
    }, []);

    // ── SELECT PHASE ───────────────────────────────────────────
    if (phase === 'select') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}><Ionicons name="close" size={28} color="#888" /></Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>SELECT ROUTINE</Text>
                        <Text style={styles.subtitle}>Choose your battle</Text>
                    </View>
                </View>
                <View style={styles.restConfigPanel}>
                    <View style={styles.restHeader}>
                        <Ionicons name="timer-outline" size={16} color="#00f0ff" />
                        <Text style={styles.restLabel}>REST BETWEEN SETS</Text>
                        <Text style={styles.restValue}>{restDuration}s</Text>
                    </View>
                    <CustomSlider value={restDuration} onValueChange={setRestDuration} min={15} max={300} step={15} activeColor="#00f0ff" />
                </View>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {allWorkouts.map(w => {
                        const totalSets = w.exercises.reduce((sum, e) => sum + e.sets, 0);
                        return (
                            <Pressable key={w.id} onPress={() => startWorkout(w.id)} style={styles.workoutCard}>
                                <View style={styles.workoutIconBg}><Ionicons name="barbell" size={24} color="#ff0055" /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.workoutTitle}>{w.name}</Text>
                                    <View style={styles.workoutMeta}>
                                        <Text style={styles.workoutMetaText}>{w.exercises.length} exercises</Text>
                                        <Text style={styles.workoutMetaText}> • {totalSets} sets</Text>
                                    </View>
                                    {w.isCustom && <View style={styles.customBadge}><Text style={styles.customBadgeText}>CUSTOM</Text></View>}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#555" />
                            </Pressable>
                        )
                    })}
                </ScrollView>
            </View>
        );
    }

    // ── INTRO PHASE ────────────────────────────────────────────
    if (phase === 'exercise-intro') {
        const ex = exercises[currentExIndex];
        if (!ex?.details) return null;
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ alignItems: 'center', padding: 24 }}>
                    <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>RANK {ex.details.difficultyRank}</Text></View>
                    <Text style={styles.introTitle}>{ex.details.name}</Text>
                    <Text style={styles.introDesc} numberOfLines={3}>{ex.details.description}</Text>
                    <Text style={styles.introMeta}>{ex.sets} SETS × {ex.reps} REPS</Text>
                    <Pressable style={styles.actionBtn} onPress={() => setPhase('ready')}>
                        <Text style={styles.actionBtnText}>LET'S GO</Text>
                    </Pressable>
                </MotiView>
            </View>
        );
    }

    // ── FINISHED PHASE ─────────────────────────────────────────
    if (phase === 'finished') {
        const totalSets = exercises.reduce((sum, e) => sum + e.sets, 0);
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.finishCard}>
                    <Ionicons name="trophy" size={60} color="#ffaa00" style={{ alignSelf: 'center', marginBottom: 16 }} />
                    <Text style={styles.finishTitle}>SESSION CLEAR</Text>
                    <Text style={styles.finishSubtitle}>{workout?.name}</Text>

                    <View style={styles.xpBox}>
                        <Text style={styles.xpBoxLabel}>XP GAINED</Text>
                        <Text style={styles.xpBoxValue}>+{totalXpEarned}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}><Text style={styles.statLabel}>TIME</Text><Text style={styles.statValue}>{formatTime(elapsedSec)}</Text></View>
                        <View style={styles.statBox}><Text style={styles.statLabel}>SETS</Text><Text style={styles.statValue}>{totalSets}</Text></View>
                        <View style={styles.statBox}><Text style={styles.statLabel}>COMBO</Text><Text style={[styles.statValue, { color: '#ffaa00' }]}>{comboCount}x</Text></View>
                    </View>

                    <Pressable style={styles.actionBtn} onPress={finishWorkout}>
                        <Text style={styles.actionBtnText}>RETURN TO DUNGEON</Text>
                    </Pressable>
                </MotiView>
            </View>
        );
    }

    if (!currentExercise?.details) return null;
    const progressPercent = ((currentExIndex * 100) + ((setsCompleted / currentExercise.sets) * 100)) / exercises.length;

    // ── ACTIVE LOOP PHASES (READY/PERFORMING/RESTING/ENCOUNTER) ──
    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.activeTitle}>{workout?.name}</Text>
                    <Text style={styles.activeSubtitle}>Exercise {currentExIndex + 1} / {exercises.length}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Text style={styles.xpGainedText}>+{totalXpEarned} XP</Text>
                    <Text style={styles.timerText}>{formatTime(elapsedSec)}</Text>
                </View>
            </View>
            <View style={styles.progressBarBg}>
                <MotiView style={styles.progressBarFill} animate={{ width: `${progressPercent}%` }} transition={{ type: 'timing', duration: 300 }} />
            </View>

            <View style={styles.mainContent}>

                {/* Floating XP Gain Animation */}
                <AnimatePresence>
                    {lastXpGain !== null && (
                        <MotiView key={Date.now()} from={{ opacity: 1, translateY: 0 }} animate={{ opacity: 0, translateY: -50 }} transition={{ duration: 1000 }} style={styles.floatingXp}>
                            <Text style={styles.floatingXpText}>+{lastXpGain} XP</Text>
                        </MotiView>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {/* READY PHASE */}
                    {phase === 'ready' && (
                        <MotiView key="ready" from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} style={styles.phaseCard}>
                            <View style={styles.phaseTop}>
                                <Text style={styles.routineDetailName}>{currentExercise.details.name}</Text>
                                <Text style={styles.routineDetailDesc}>{currentExercise.details.description}</Text>
                            </View>
                            <View style={styles.phaseMiddle}>
                                <View style={styles.targetBox}>
                                    <Text style={styles.targetReps}>{currentExercise.reps}</Text>
                                    <Text style={styles.targetLabel}>TARGET REPS</Text>
                                </View>
                            </View>
                            <View style={styles.phaseBottom}>
                                <Text style={styles.setTracker}>SET {setsCompleted + 1} OF {currentExercise.sets}</Text>
                                <Pressable style={styles.startSetBtn} onPress={handleStartSet}>
                                    <Ionicons name="play" size={20} color="#fff" />
                                    <Text style={styles.startSetBtnText}>START SET</Text>
                                </Pressable>
                            </View>
                        </MotiView>
                    )}

                    {/* PERFORMING PHASE */}
                    {phase === 'performing' && (
                        <MotiView key="perf" from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} style={styles.phaseCard}>
                            <View style={styles.phaseTop}>
                                <Text style={styles.routineDetailName}>{currentExercise.details.name}</Text>
                                <Text style={styles.setTracker}>SET {setsCompleted + 1}</Text>
                            </View>
                            <View style={styles.phaseMiddle}>
                                <View style={styles.timerContainer}>
                                    <Text style={styles.bigTimer}>{formatTime(setTimerSec)}</Text>
                                    <Text style={styles.targetLabel}>TIME UNDER TENSION</Text>
                                </View>
                            </View>
                            <View style={styles.phaseBottom}>
                                <Pressable style={styles.completeSetBtn} onPress={handleCompleteSet}>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.completeSetBtnText}>COMPLETE SET</Text>
                                </Pressable>
                            </View>
                        </MotiView>
                    )}

                    {/* RESTING PHASE */}
                    {phase === 'resting' && (
                        <MotiView key="rest" from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} style={styles.phaseCard}>
                            <View style={styles.phaseTop}>
                                <Text style={styles.restTitle}>RECOVER</Text>
                                <Text style={styles.quoteText}>"{currentQuote}"</Text>
                            </View>
                            <View style={styles.phaseMiddle}>
                                <NativeRestTimer durationSec={restDuration} onComplete={finishRest} />
                            </View>
                            <View style={styles.phaseBottom}>
                                <Pressable onPress={finishRest} style={styles.skipRestBtn}>
                                    <Text style={styles.skipRestBtnText}>SKIP REST</Text>
                                </Pressable>
                            </View>
                        </MotiView>
                    )}

                    {/* ENCOUNTER PHASE */}
                    {phase === 'encounter' && (
                        <MotiView key="enc" from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} style={styles.encounterCard}>
                            <View style={styles.phaseTop}>
                                <Text style={styles.encounterTitle}>⚠️ ELITE FOE ⚠️</Text>
                            </View>
                            <View style={styles.phaseMiddle}>
                                <Text style={styles.encounterDesc}>Do 2 MORE REPS for DOUBLE XP!</Text>
                            </View>
                            <View style={styles.phaseBottom}>
                                <View style={styles.encounterBtns}>
                                    <Pressable style={styles.fleeBtn} onPress={declineEncounter}><Text style={styles.fleeText}>FLEE</Text></Pressable>
                                    <Pressable style={styles.fightBtn} onPress={acceptEncounter}>
                                        <Ionicons name="flash" size={16} color="#000" />
                                        <Text style={styles.fightText}>FIGHT (+{encounterXpBonus} XP)</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </MotiView>
                    )}
                </AnimatePresence>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14', paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    backBtn: { marginRight: 16 },
    title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
    subtitle: { color: '#888', fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
    restConfigPanel: { marginHorizontal: 20, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginBottom: 20 },
    restHeader: { flexDirection: 'row', alignItems: 'center' },
    restLabel: { color: '#aaa', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginLeft: 8, flex: 1 },
    restValue: { color: '#00f0ff', fontSize: 16, fontWeight: '900' },
    workoutCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a3e' },
    workoutIconBg: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(255,0,85,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    workoutTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
    workoutMeta: { flexDirection: 'row', marginTop: 4 },
    workoutMetaText: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    customBadge: { backgroundColor: 'rgba(255,170,0,0.1)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
    customBadgeText: { color: '#ffaa00', fontSize: 8, fontWeight: '900', letterSpacing: 1 },

    // Intro & Finish 
    rankBadge: { backgroundColor: 'rgba(0,240,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 16 },
    rankBadgeText: { color: '#00f0ff', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    introTitle: { color: '#fff', fontSize: 40, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginBottom: 12 },
    introDesc: { color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
    introMeta: { color: '#888', fontSize: 14, fontWeight: '900', letterSpacing: 3, marginBottom: 40 },
    actionBtn: { backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12, width: '100%', alignItems: 'center' },
    actionBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 2 },

    finishCard: { backgroundColor: '#1a1a2e', padding: 32, borderRadius: 24, width: '90%', alignItems: 'center', borderWidth: 1, borderColor: '#ffaa0055' },
    finishTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 4 },
    finishSubtitle: { color: '#aaa', fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 32 },
    xpBox: { backgroundColor: '#0a0a14', padding: 20, borderRadius: 16, width: '100%', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#ffaa0033' },
    xpBoxLabel: { color: '#888', fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
    xpBoxValue: { color: '#ffaa00', fontSize: 48, fontWeight: '900' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 32 },
    statBox: { backgroundColor: '#0a0a14', flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 12, alignItems: 'center' },
    statLabel: { color: '#555', fontSize: 8, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
    statValue: { color: '#fff', fontSize: 16, fontWeight: '900' },

    // Loop Shared
    topBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
    activeTitle: { color: '#fff', fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
    activeSubtitle: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
    xpGainedText: { color: '#ffaa00', fontSize: 14, fontWeight: '900' },
    timerText: { color: '#555', fontSize: 12, fontWeight: '900', fontVariant: ['tabular-nums'], marginTop: 4 },
    progressBarBg: { height: 4, backgroundColor: '#1a1a2e', marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#00f0ff' },

    mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    floatingXp: { position: 'absolute', top: '20%', zIndex: 10 },
    floatingXpText: { color: '#ffaa00', fontSize: 32, fontWeight: '900' },

    phaseCard: { position: 'absolute', backgroundColor: '#1a1a2e', width: '100%', padding: 24, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a3e', height: 460 },
    phaseTop: { alignItems: 'center', height: 100, justifyContent: 'flex-start', paddingTop: 8 },
    phaseMiddle: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    phaseBottom: { width: '100%', alignItems: 'center', height: 100, justifyContent: 'flex-end', paddingBottom: 8 },

    routineDetailName: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginBottom: 8 },
    routineDetailDesc: { color: '#888', fontSize: 13, textAlign: 'center' },
    targetBox: { alignItems: 'center' },
    targetReps: { color: '#00f0ff', fontSize: 80, fontWeight: '900' },
    targetLabel: { color: '#555', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    setTracker: { color: '#aaa', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
    startSetBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00f0ff', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, width: '100%', justifyContent: 'center' },
    startSetBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 2, marginLeft: 8 },

    timerContainer: { alignItems: 'center' },
    bigTimer: { color: '#00f0ff', fontSize: 80, fontWeight: '900', fontVariant: ['tabular-nums'], marginBottom: 8 },
    completeSetBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, width: '100%', justifyContent: 'center' },
    completeSetBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2, marginLeft: 8 },

    restTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 4, marginBottom: 8 },
    quoteText: { color: '#555', fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
    skipRestBtn: { width: '100%', paddingVertical: 16, paddingHorizontal: 32, borderWidth: 1, borderColor: '#00f0ff', borderRadius: 16, alignItems: 'center' },
    skipRestBtnText: { color: '#00f0ff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },

    encounterCard: { position: 'absolute', backgroundColor: '#2a0011', width: '100%', padding: 24, borderRadius: 24, alignItems: 'center', borderWidth: 2, borderColor: '#ff0055', height: 460 },
    encounterTitle: { color: '#ff0055', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
    encounterDesc: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
    encounterBtns: { flexDirection: 'row', gap: 12, width: '100%' },
    fleeBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ff005544', alignItems: 'center' },
    fleeText: { color: '#aaa', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
    fightBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff0055', paddingVertical: 16, borderRadius: 12 },
    fightText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1, marginLeft: 8 },
});
