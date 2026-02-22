import { useState, useEffect, useRef } from 'react';
import { CustomTask } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
    task: CustomTask;
    chapterId?: string; // Optional: If provided, the timer is for a specific chapter
    onComplete: (taskId: string, chapterId?: string, notes?: string) => void;
    onClose: () => void;
    initialPhase?: 'setup' | 'done';
}

const SAGE_QUOTES = [
    "The mind is not a vessel to be filled, but a fire to be kindled.",
    "He who has a why to live can bear almost any how.",
    "We suffer more often in imagination than in reality.",
    "It is not that we have a short time to live, but that we waste a lot of it.",
    "The happiness of your life depends upon the quality of your thoughts."
];

export const TaskTimerModal = ({ task, chapterId, onComplete, onClose, initialPhase = 'setup' }: Props) => {
    const isMental = task.pillar === 'mental';
    const [phase, setPhase] = useState<'setup' | 'running' | 'paused' | 'done'>(initialPhase);
    const [quote] = useState(() => SAGE_QUOTES[Math.floor(Math.random() * SAGE_QUOTES.length)]);
    const [duration, setDuration] = useState(task.timerDuration || 15 * 60); // Default 15 min, or from task
    const [timeLeft, setTimeLeft] = useState(duration);
    const [eurekaNote, setEurekaNote] = useState(''); // This state is used for the "Eureka Moment" input
    const [continuousRuntime, setContinuousRuntime] = useState(0); // For Deep Flow tracking
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
        setContinuousRuntime(0);
        setPhase('running');
    };

    const togglePause = () => {
        setPhase(prev => {
            if (prev === 'running') {
                return 'paused';
            }
            return 'running';
        });
    };

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
                            // Break over, back to focus
                            setDuration(workDuration);
                            setIsBreak(false);
                            return workDuration;
                        } else {
                            // Focus over, start break
                            setPomodorosCompleted(p => p + 1);
                            const breakTime = workDuration === 35 * 60 ? 5 * 60 : 10 * 60;
                            setDuration(breakTime);
                            setIsBreak(true);
                            return breakTime;
                        }
                    } else {
                        // Standard mode finish
                        if (timerRef.current) clearInterval(timerRef.current);
                        setPhase('done');
                        return 0;
                    }
                }
                return prev - 1;
            });
            if (!isBreak) setContinuousRuntime(prev => prev + 1);
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase, timerMode, isBreak]);

    const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
    const circumference = 2 * Math.PI * 120;
    const offset = circumference - (progress / 100) * circumference;

    const isDeepFlow = timerMode === 'standard' && duration >= 45 * 60 && continuousRuntime >= 45 * 60; // 45+ min unbroken
    const rawXp = chapterId ? Math.ceil(task.xpReward / (task.chapters?.length || 1)) : task.xpReward;
    const earnedXp = Math.ceil((isDeepFlow ? rawXp * 1.5 : rawXp) + (pomodorosCompleted * 2)); // +2 XP per pomodoro

    // ── Done screen ─────────────────────────────────────────────────
    if (phase === 'done') {
        return (
            <div className="fixed inset-0 z-[100] bg-bg-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-sm">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-gold/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-24 h-24 bg-neon-gold/20 rounded-full flex items-center justify-center mx-auto mb-8 text-neon-gold glow-gold">
                        <Check size={48} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-4">
                        {chapterId ? 'CHAPTER COMPLETE!' : (isMental ? 'ENLIGHTENMENT ACHIEVED!' : 'TASK CLEAR!')}
                    </h1>
                    <p className="text-zinc-400 mb-2">
                        {task.title} {chapterId && `- ${task.chapters?.find(c => c.id === chapterId)?.title}`}
                    </p>

                    {!chapterId && isMental && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="bg-black/30 border border-neon-blue/20 p-4 rounded-xl mx-auto my-6 italic text-sm text-neon-blue font-serif relative"
                        >
                            <div className="absolute top-0 left-4 -mt-2 text-neon-blue/50 text-2xl font-serif">"</div>
                            {quote}
                        </motion.div>
                    )}
                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
                        className="text-5xl font-black text-neon-gold glow-gold mb-4 mt-2">
                        +{earnedXp} XP
                    </motion.p>

                    {isDeepFlow && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                            className="text-neon-gold font-bold text-sm tracking-widest uppercase mb-6 bg-neon-gold/10 inline-block px-3 py-1 rounded-full border border-neon-gold/30">
                            Deep Flow Bonus (+50%)
                        </motion.div>
                    )}

                    {isMental && (
                        <div className="max-w-md mx-auto mb-8 mt-6">
                            <label className="block text-left text-sm font-bold text-neon-blue uppercase tracking-widest mb-2">
                                Add Notes (Optional)
                            </label>
                            <textarea
                                value={eurekaNote}
                                onChange={(e) => setEurekaNote(e.target.value)}
                                placeholder="What did you learn?"
                                className="w-full bg-black/40 border border-neon-blue/30 rounded-xl p-4 text-sm text-zinc-300 focus:border-neon-blue outline-none transition-colors resize-none placeholder:text-zinc-600 min-h-[100px]"
                            />
                        </div>
                    )}

                    <button onClick={() => { onComplete(task.id, chapterId, eurekaNote.trim() ? eurekaNote : undefined); onClose(); }}
                        className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                        Collect Rewards
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-bg-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Close */}
                <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">{task.title}</p>

                <AnimatePresence mode="wait">
                    {/* ── Setup ──────────────────── */}
                    {phase === 'setup' && (
                        <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h2 className="text-3xl font-extrabold text-white tracking-widest uppercase mb-6">Set Timer</h2>

                            {isMental && (
                                <div className="flex bg-white/5 p-1 rounded-xl mb-6 max-w-[200px] mx-auto">
                                    <button
                                        onClick={() => { setTimerMode('standard'); setDuration(15 * 60); }}
                                        className={`flex-1 text-xs font-bold uppercase tracking-widest py-2 rounded-lg transition-colors ${timerMode === 'standard' ? 'bg-neon-blue text-black' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        Standard
                                    </button>
                                    <button
                                        onClick={() => { setTimerMode('pomodoro'); setDuration(workDuration); }}
                                        className={`flex-1 text-xs font-bold uppercase tracking-widest py-2 rounded-lg transition-colors ${timerMode === 'pomodoro' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        Pomodoro
                                    </button>
                                </div>
                            )}

                            <div className="mb-6">
                                <span className={clsx("text-6xl font-black tabular-nums", timerMode === 'pomodoro' ? "text-emerald-400 glow-emerald" : "text-neon-blue glow-blue")}>
                                    {formatTime(duration)}
                                </span>
                            </div>

                            {timerMode === 'standard' ? (
                                <>
                                    <div className="flex items-center justify-center gap-3 mb-8">
                                        {[5, 10, 15, 20, 30, 45, 60].map(min => (
                                            <button key={min} onClick={() => setDuration(min * 60)}
                                                className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${duration === min * 60 ? 'bg-neon-blue text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                                {min}m
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mb-8">
                                        <input type="range" min={60} max={7200} step={60} value={duration}
                                            onChange={e => setDuration(Number(e.target.value))}
                                            className="w-full accent-neon-blue" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-3 mb-8">
                                        {[35, 45, 50].map(min => (
                                            <button key={min} onClick={() => { setDuration(min * 60); setWorkDuration(min * 60); }}
                                                className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${workDuration === min * 60 ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                                {min}m
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mb-8 text-zinc-400 text-sm">
                                        <p>{workDuration / 60} Min Focus • {workDuration === 35 * 60 ? 5 : 10} Min Break</p>
                                        <p className="mt-2 text-emerald-400/80 italic text-xs">Earn +2 bonus XP for every completed interval.</p>
                                    </div>
                                </>
                            )}

                            <button onClick={startTimer}
                                className={clsx(
                                    "w-full py-4 rounded-xl text-white font-black uppercase tracking-widest flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all",
                                    timerMode === 'pomodoro'
                                        ? "bg-gradient-to-r from-emerald-500 to-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                        : "bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                                )}>
                                <Play className="mr-3" size={20} /> Start {timerMode === 'pomodoro' ? 'Session' : ''}
                            </button>
                        </motion.div>
                    )}

                    {/* ── Running / Paused ─────── */}
                    {(phase === 'running' || phase === 'paused') && (
                        <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative w-64 h-64 mx-auto mb-8">
                                {/* Mental Task Breathing Pulse (Gamification) */}
                                {isMental && phase === 'running' && !isBreak && (
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.1, 0.4, 0.1]
                                        }}
                                        transition={{
                                            duration: 8, // 4s inhale, 4s exhale
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className={clsx("absolute inset-0 rounded-full blur-xl", timerMode === 'pomodoro' ? 'bg-emerald-500' : 'bg-neon-blue')}
                                    />
                                )}

                                <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 256 256">
                                    <circle cx="128" cy="128" r="120" fill="none" stroke="#ffffff10" strokeWidth="6" />
                                    <motion.circle cx="128" cy="128" r="120" fill="none" stroke={isBreak ? '#10b981' : (timerMode === 'pomodoro' ? '#10b981' : '#00f0ff')}
                                        strokeWidth="6" strokeLinecap="round"
                                        strokeDasharray={circumference} strokeDashoffset={offset}
                                        style={{ filter: `drop-shadow(0 0 12px ${isBreak ? 'rgba(16,185,129,0.6)' : (timerMode === 'pomodoro' ? 'rgba(16,185,129,0.6)' : 'rgba(0,240,255,0.6)')})` }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    <motion.span
                                        animate={phase === 'paused' ? { opacity: [1, 0.3, 1] } : {}}
                                        transition={phase === 'paused' ? { duration: 1, repeat: Infinity } : {}}
                                        className={clsx("text-6xl font-black tabular-nums", isBreak ? "text-emerald-400 glow-emerald" : (timerMode === 'pomodoro' ? "text-emerald-400 glow-emerald" : "text-neon-blue glow-blue"))}>
                                        {formatTime(timeLeft)}
                                    </motion.span>
                                    <span className={clsx("font-bold uppercase tracking-widest text-xs mt-1", isBreak ? "text-emerald-400" : "text-zinc-600")}>
                                        {phase === 'paused' ? 'PAUSED' : (isBreak ? 'BREAK' : (isMental ? 'BREATHE' : 'FOCUS'))}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={togglePause}
                                    className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center">
                                    {phase === 'paused' ? <><Play size={18} className="mr-2" /> Resume</> : <><Pause size={18} className="mr-2" /> Pause</>}
                                </button>
                                <button onClick={() => { setPhase('done'); if (timerRef.current) clearInterval(timerRef.current); }}
                                    className="flex-[2] py-4 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
                                    Finish Early
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
