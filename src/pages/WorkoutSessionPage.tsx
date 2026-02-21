import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { MOCK_WORKOUTS, MOCK_EXERCISES } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Award, ChevronLeft, Timer, Dumbbell, Zap, Flame, Play } from 'lucide-react';
import { RestTimer } from '@/components/workout/RestTimer';
import clsx from 'clsx';

// select → exercise-intro → ready → performing → resting → encounter → finished
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

export const WorkoutSessionPage = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const logWorkout = useStore(state => state.logWorkout);

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

    // In-set timer (counts UP)
    const [setTimerSec, setSetTimerSec] = useState(0);
    const setTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Encounter
    const [encounterXpBonus, setEncounterXpBonus] = useState(0);
    const [currentQuote, setCurrentQuote] = useState('');

    // Overall elapsed timer
    const [elapsedSec, setElapsedSec] = useState(0);
    useEffect(() => {
        if (phase === 'select' || phase === 'finished') return;
        const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - workoutStartTime) / 1000)), 1000);
        return () => clearInterval(t);
    }, [phase, workoutStartTime]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${String(sec).padStart(2, '0')}`;
    };

    // Derived
    const workout = allWorkouts.find(w => w.id === selectedWorkoutId);
    const exercises = useMemo(() => {
        if (!workout) return [];
        return workout.exercises.map(we => ({
            ...we,
            details: MOCK_EXERCISES.find(e => e.id === we.exerciseId)
        })).filter(e => e.details);
    }, [workout]);

    const currentExercise = exercises[currentExIndex];

    // ── Actions ────────────────────────────────────────────────────────

    const startWorkout = useCallback((workoutId: string) => {
        setSelectedWorkoutId(workoutId);
        setCurrentExIndex(0);
        setSetsCompleted(0);
        setSetLogs([]);
        setTotalXpEarned(0);
        setComboCount(0);
        setPhase('exercise-intro');
    }, []);

    // Start the set — begins the counting-up timer
    const handleStartSet = useCallback(() => {
        setSetTimerSec(0);
        setPhase('performing');
        setTimerRef.current = setInterval(() => {
            setSetTimerSec(prev => prev + 1);
        }, 1000);
    }, []);

    // Complete the set — stop the timer and award XP
    const handleCompleteSet = useCallback(() => {
        // Stop in-set timer
        if (setTimerRef.current) {
            clearInterval(setTimerRef.current);
            setTimerRef.current = null;
        }

        if (!currentExercise?.details) return;

        const difficultyMultipliers: Record<string, number> = {
            'E': 1.0, 'D': 1.2, 'C': 1.5, 'B': 2.0, 'A': 2.5, 'S': 3.0
        };
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

        // 15% random encounter chance
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
        useStore.getState().addPillarXp('physical', totalXpEarned);
        logWorkout(workout.name, totalXpEarned);
        navigate('/physical');
    }, [workout, totalXpEarned, logWorkout, navigate]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (setTimerRef.current) clearInterval(setTimerRef.current);
        };
    }, []);

    // ═══════════════════════════════════════════════════════════════════
    // PHASE: SELECT
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'select') {
        return (
            <div className="min-h-screen bg-bg-dark pt-12 pb-24 px-6">
                <header className="flex items-center mb-10">
                    <button onClick={() => navigate(-1)} className="mr-4 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-widest uppercase">Select Routine</h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Choose your battle</p>
                    </div>
                </header>

                <div className="mb-8 glass-panel p-6 max-w-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-zinc-300 font-bold uppercase tracking-widest text-sm">
                            <Timer size={18} className="mr-2 text-neon-blue" /> Rest Between Sets
                        </div>
                        <span className="text-neon-blue font-black text-xl">{restDuration}s</span>
                    </div>
                    <input type="range" min={15} max={300} step={15} value={restDuration}
                        onChange={e => setRestDuration(Number(e.target.value))} className="w-full accent-neon-blue" />
                    <div className="flex justify-between text-zinc-600 text-xs font-bold mt-1">
                        <span>15s</span><span>5min</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    {allWorkouts.map(w => {
                        const totalSets = w.exercises.reduce((sum, e) => sum + e.sets, 0);
                        return (
                            <button key={w.id} onClick={() => startWorkout(w.id)}
                                className="glass-panel p-6 text-left border border-white/5 hover:border-neon-pink/50 hover:scale-[1.02] active:scale-[0.98] transition-all group">
                                <div className="flex items-center mb-3">
                                    <div className="p-2 rounded-lg bg-neon-pink/10 mr-3 group-hover:bg-neon-pink transition-colors">
                                        <Dumbbell size={20} className="text-neon-pink group-hover:text-bg-dark" />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-wide text-white">{w.name}</h3>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{w.exercises.length} exercises</span>
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{totalSets} sets</span>
                                </div>
                                {w.isCustom && <span className="inline-block mt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-neon-gold/20 text-neon-gold rounded-full">Custom</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE: EXERCISE INTRO
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'exercise-intro') {
        const ex = exercises[currentExIndex];
        if (!ex?.details) { setPhase('ready'); return null; }
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
                <motion.div initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 20, opacity: 0 }}
                    transition={{ duration: 1.5 }} className="absolute w-20 h-20 rounded-full bg-neon-blue" />
                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }} className="text-center z-10">
                    <span className={clsx("inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-6",
                        ex.details.difficultyRank === 'E' ? 'bg-zinc-800 text-zinc-400' :
                            ex.details.difficultyRank === 'D' ? 'bg-neon-green/20 text-neon-green' :
                                ex.details.difficultyRank === 'C' ? 'bg-neon-blue/20 text-neon-blue' :
                                    ex.details.difficultyRank === 'B' ? 'bg-neon-purple/20 text-neon-purple' :
                                        ex.details.difficultyRank === 'A' ? 'bg-neon-pink/20 text-neon-pink' :
                                            'bg-neon-gold/20 text-neon-gold')}>
                        Rank {ex.details.difficultyRank}
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4">{ex.details.name}</h1>
                    <p className="text-zinc-400 text-lg mb-2">{ex.details.description}</p>
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm mb-8">{ex.sets} sets × {ex.reps} reps</p>
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                        onClick={() => setPhase('ready')}
                        className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-transform text-lg">
                        Let's Go
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE: FINISHED
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'finished') {
        const totalSets = exercises.reduce((sum, e) => sum + e.sets, 0);
        return (
            <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel max-w-md w-full p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-neon-gold/20 to-transparent blur-xl"></div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 bg-neon-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 text-neon-gold glow-gold relative z-10">
                        <Award size={40} />
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase mb-2 relative z-10">SESSION CLEAR!</h1>
                    <p className="text-zinc-400 font-bold tracking-widest uppercase text-sm mb-8 relative z-10">{workout?.name}</p>
                    <div className="bg-zinc-900/80 rounded-2xl p-6 mb-4 border border-white/5 relative z-10">
                        <span className="block text-zinc-500 text-xs font-bold tracking-widest uppercase mb-1">XP Gained</span>
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}
                            className="block text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-neon-gold to-white">
                            +{totalXpEarned}
                        </motion.span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
                        <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/5">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Duration</p>
                            <p className="text-white font-black text-lg">{formatTime(elapsedSec)}</p>
                        </div>
                        <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/5">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Sets</p>
                            <p className="text-white font-black text-lg">{totalSets}</p>
                        </div>
                        <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/5">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Combo</p>
                            <p className="text-neon-gold font-black text-lg">{comboCount}×</p>
                        </div>
                    </div>
                    <button onClick={finishWorkout}
                        className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors relative z-10">
                        Return to Dungeon
                    </button>
                </motion.div>
            </div>
        );
    }

    // ── Guard ──────────────────────────────────────────────────────────
    if (!currentExercise?.details) {
        return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-white"><p>Loading…</p></div>;
    }

    const progressPercent = ((currentExIndex * 100) + ((setsCompleted / currentExercise.sets) * 100)) / exercises.length;

    // ═══════════════════════════════════════════════════════════════════
    // PHASES: READY / PERFORMING / RESTING / ENCOUNTER
    // ═══════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-bg-dark flex flex-col pt-8">
            {/* Stats Header */}
            <header className="px-6 md:px-12 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-widest uppercase">{workout?.name}</h1>
                        <p className="text-zinc-500 font-bold text-xs tracking-widest mt-1">Exercise {currentExIndex + 1} / {exercises.length}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {comboCount > 1 && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neon-gold/20 border border-neon-gold/30">
                                <Flame size={14} className="text-neon-gold" />
                                <span className="text-neon-gold font-black text-sm">{comboCount}× COMBO</span>
                            </motion.div>
                        )}
                        <div className="text-right">
                            <p className="text-neon-gold font-black text-sm glow-gold">+{totalXpEarned} XP</p>
                            <p className="text-zinc-600 font-mono text-xs">{formatTime(elapsedSec)}</p>
                        </div>
                        <button onClick={() => navigate('/physical')}
                            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-zinc-500 hover:text-neon-pink transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                        animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 md:px-12 flex flex-col items-center justify-center pb-24 relative">

                {/* Floating XP Toast */}
                <AnimatePresence>
                    {lastXpGain !== null && (
                        <motion.div key={`xp-${Date.now()}`}
                            initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -80, scale: 1.5 }}
                            exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
                            className="absolute top-1/3 z-50 pointer-events-none">
                            <span className="text-4xl font-black text-neon-gold glow-gold">+{lastXpGain} XP</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">

                    {/* ── ENCOUNTER ──────────────── */}
                    {phase === 'encounter' && (
                        <motion.div key="encounter" initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full max-w-lg text-center">
                            <motion.div animate={{ borderColor: ['#ff005580', '#ff0055', '#ff005580'] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="bg-gradient-to-br from-red-900/40 to-black p-8 rounded-2xl border-2 border-neon-pink shadow-[0_0_40px_rgba(255,0,85,0.4)] relative overflow-hidden">
                                <motion.div animate={{ x: [-2, 2, -2] }} transition={{ duration: 0.1, repeat: 5 }}>
                                    <h2 className="text-3xl md:text-4xl font-black text-neon-pink tracking-tighter uppercase mb-4 drop-shadow-[0_0_10px_#ff0055]">
                                        ⚠️ ELITE FOE! ⚠️
                                    </h2>
                                </motion.div>
                                <p className="text-zinc-300 text-lg mb-8">
                                    Do <span className="text-white font-black text-2xl glow-white">2 MORE REPS</span> for DOUBLE XP!
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={declineEncounter}
                                        className="flex-1 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase hover:bg-white/5 transition-colors">
                                        Flee
                                    </button>
                                    <button onClick={acceptEncounter}
                                        className="flex-[2] py-4 rounded-xl bg-neon-pink text-bg-dark font-black uppercase tracking-widest shadow-[0_0_20px_#ff0055] hover:bg-white hover:scale-105 active:scale-95 transition-all">
                                        <Zap className="inline mr-2" size={18} /> Fight (+{encounterXpBonus} XP)
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ── RESTING ────────────────── */}
                    {phase === 'resting' && (
                        <motion.div key="resting" initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="w-full flex flex-col items-center">
                            <h2 className="text-2xl font-extrabold text-white tracking-widest uppercase mb-6">RECOVER</h2>
                            <RestTimer durationSec={restDuration} onComplete={finishRest} />
                            {currentQuote && (
                                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.6, y: 0 }}
                                    transition={{ delay: 1 }} className="mt-8 max-w-sm text-center text-zinc-500 italic text-sm font-medium">
                                    "{currentQuote}"
                                </motion.p>
                            )}
                        </motion.div>
                    )}

                    {/* ── READY (waiting to start set) ─── */}
                    {phase === 'ready' && (
                        <motion.div key={`ready_${currentExIndex}_${setsCompleted}`}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="w-full max-w-lg">
                            <div className="glass-panel p-6 md:p-8 text-center">
                                {/* Exercise Info */}
                                <span className={clsx("inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3",
                                    currentExercise.details.difficultyRank === 'E' ? 'bg-zinc-800 text-zinc-400' :
                                        currentExercise.details.difficultyRank === 'D' ? 'bg-neon-green/20 text-neon-green' :
                                            currentExercise.details.difficultyRank === 'C' ? 'bg-neon-blue/20 text-neon-blue' :
                                                currentExercise.details.difficultyRank === 'B' ? 'bg-neon-purple/20 text-neon-purple' :
                                                    currentExercise.details.difficultyRank === 'A' ? 'bg-neon-pink/20 text-neon-pink' :
                                                        'bg-neon-gold/20 text-neon-gold')}>
                                    Rank {currentExercise.details.difficultyRank}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tighter uppercase mb-1">{currentExercise.details.name}</h2>
                                <p className="text-zinc-500 text-sm mb-6">{currentExercise.details.description}</p>

                                {/* Target */}
                                <div className="flex items-center justify-center gap-6 mb-6">
                                    <div>
                                        <p className="text-4xl font-black text-neon-blue glow-blue">{currentExercise.reps}</p>
                                        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Target Reps</p>
                                    </div>
                                </div>

                                {/* Set Progress */}
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-3">Set {setsCompleted + 1} of {currentExercise.sets}</p>
                                <div className="flex space-x-2 mb-6 max-w-xs mx-auto">
                                    {Array.from({ length: currentExercise.sets }).map((_, i) => (
                                        <motion.div key={i}
                                            className={clsx("h-3 flex-1 rounded-sm",
                                                i < setsCompleted ? "bg-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.6)]" :
                                                    i === setsCompleted ? "bg-neon-blue/30" : "bg-zinc-800")}
                                            animate={i === setsCompleted ? { opacity: [0.3, 1, 0.3] } : {}}
                                            transition={i === setsCompleted ? { duration: 1.5, repeat: Infinity } : {}}
                                        />
                                    ))}
                                </div>

                                {/* Previous set logs */}
                                {setLogs.length > 0 && (
                                    <div className="space-y-1.5 mb-6 max-h-24 overflow-y-auto scrollbar-hide">
                                        {setLogs.map((log, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                                                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Set {idx + 1} — {log.reps} reps</span>
                                                <span className="text-neon-gold font-bold text-xs glow-gold">+{log.xp} XP</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* START SET button */}
                                <button onClick={handleStartSet}
                                    className="w-full py-5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black uppercase tracking-widest flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(181,56,255,0.5)] hover:scale-[1.02] active:scale-95 transition-all text-lg">
                                    <Play className="mr-3" size={24} /> Start Set {setsCompleted + 1}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── PERFORMING (in-set with centered timer) ─── */}
                    {phase === 'performing' && (
                        <motion.div key={`performing_${currentExIndex}_${setsCompleted}`}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="w-full max-w-lg">
                            <div className="glass-panel p-6 md:p-10 text-center relative overflow-hidden">
                                {/* Pulsing border glow */}
                                <motion.div className="absolute inset-0 rounded-2xl border-2 border-neon-blue/50"
                                    animate={{ borderColor: ['rgba(0,240,255,0.3)', 'rgba(0,240,255,0.8)', 'rgba(0,240,255,0.3)'] }}
                                    transition={{ duration: 2, repeat: Infinity }} />

                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2 relative z-10">
                                    {currentExercise.details.name} — Set {setsCompleted + 1}
                                </p>

                                {/* BIG CENTERED TIMER */}
                                <div className="my-8 relative z-10">
                                    <motion.div
                                        animate={{ scale: [1, 1.02, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                        <span className="text-8xl md:text-9xl font-black text-neon-blue glow-blue tracking-tighter tabular-nums">
                                            {formatTime(setTimerSec)}
                                        </span>
                                    </motion.div>
                                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs mt-2">
                                        Time Under Tension
                                    </p>
                                </div>

                                {/* Target reminder */}
                                <div className="flex items-center justify-center gap-4 mb-8 relative z-10">
                                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                                        <span className="text-neon-blue font-black text-lg">{currentExercise.reps}</span>
                                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] ml-2">Reps</span>
                                    </div>
                                </div>

                                {/* COMPLETE SET button */}
                                <button onClick={handleCompleteSet}
                                    className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black uppercase tracking-widest flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-95 transition-all text-lg relative z-10">
                                    <Check className="mr-3" size={24} /> Complete Set
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};
