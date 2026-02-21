import { useState, useEffect, useRef } from 'react';
import { CustomTask } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Play, Pause } from 'lucide-react';

interface Props {
    task: CustomTask;
    onComplete: (id: string) => void;
    onClose: () => void;
}

export const TaskTimerModal = ({ task, onComplete, onClose }: Props) => {
    const [phase, setPhase] = useState<'setup' | 'running' | 'paused' | 'done'>('setup');
    const [duration, setDuration] = useState(15 * 60); // Default 15 min
    const [timeLeft, setTimeLeft] = useState(duration);
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

    const togglePause = () => {
        setPhase(prev => prev === 'running' ? 'paused' : 'running');
    };

    useEffect(() => {
        if (phase !== 'running') {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setPhase('done');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
    const circumference = 2 * Math.PI * 120;
    const offset = circumference - (progress / 100) * circumference;

    // ── Done screen ─────────────────────────────────────────────────
    if (phase === 'done') {
        return (
            <div className="fixed inset-0 z-[100] bg-bg-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-sm">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-24 h-24 bg-neon-gold/20 rounded-full flex items-center justify-center mx-auto mb-8 text-neon-gold glow-gold">
                        <Award size={48} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-4">TASK CLEAR!</h1>
                    <p className="text-zinc-400 mb-2">{task.title}</p>
                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
                        className="text-5xl font-black text-neon-gold glow-gold mb-10">
                        +{task.xpReward} XP
                    </motion.p>
                    <button onClick={() => { onComplete(task.id); onClose(); }}
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
                            <h2 className="text-3xl font-extrabold text-white tracking-widest uppercase mb-8">Set Timer</h2>
                            <div className="mb-6">
                                <span className="text-6xl font-black text-neon-blue glow-blue tabular-nums">{formatTime(duration)}</span>
                            </div>
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
                            <button onClick={startTimer}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black uppercase tracking-widest flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                                <Play className="mr-3" size={20} /> Start
                            </button>
                        </motion.div>
                    )}

                    {/* ── Running / Paused ─────── */}
                    {(phase === 'running' || phase === 'paused') && (
                        <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative w-64 h-64 mx-auto mb-8">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
                                    <circle cx="128" cy="128" r="120" fill="none" stroke="#ffffff10" strokeWidth="6" />
                                    <motion.circle cx="128" cy="128" r="120" fill="none" stroke="#00f0ff"
                                        strokeWidth="6" strokeLinecap="round"
                                        strokeDasharray={circumference} strokeDashoffset={offset}
                                        style={{ filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.6))' }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        animate={phase === 'paused' ? { opacity: [1, 0.3, 1] } : {}}
                                        transition={phase === 'paused' ? { duration: 1, repeat: Infinity } : {}}
                                        className="text-6xl font-black text-neon-blue glow-blue tabular-nums">
                                        {formatTime(timeLeft)}
                                    </motion.span>
                                    <span className="text-zinc-600 font-bold uppercase tracking-widest text-xs mt-1">
                                        {phase === 'paused' ? 'PAUSED' : 'FOCUS'}
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
