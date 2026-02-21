import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { MOCK_WORKOUTS, MOCK_EXERCISES } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Award } from 'lucide-react';
import { RestTimer } from '@/components/workout/RestTimer';
import clsx from 'clsx';

export const WorkoutSessionPage = () => {
    const navigate = useNavigate();
    const logWorkout = useStore(state => state.logWorkout);

    // For Phase 1 demo, we'll just run the first mock workout
    const workout = MOCK_WORKOUTS[0];
    const exercises = workout.exercises.map(we => ({
        ...we,
        details: MOCK_EXERCISES.find(e => e.id === we.exerciseId)!
    }));

    const [currentExIndex, setCurrentExIndex] = useState(0);
    const [setsCompleted, setSetsCompleted] = useState(0);

    // Custom Exercise State
    const [currentWeight, setCurrentWeight] = useState<string>('');
    const [currentReps, setCurrentReps] = useState<string>('');
    const [setLogs, setSetLogs] = useState<{ weight: number, reps: number, xp: number }[]>([]);

    const [isFinished, setIsFinished] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);
    const [isResting, setIsResting] = useState(false);

    // Random Encounter State
    const [encounterActive, setEncounterActive] = useState(false);
    const [encounterXpBonus, setEncounterXpBonus] = useState(0);

    const currentExercise = exercises[currentExIndex];
    const isLastExercise = currentExIndex === exercises.length - 1;
    const isLastSet = setsCompleted === currentExercise.sets - 1;

    const handleCompleteSet = () => {
        // Base XP calculation: 10 XP * difficulty multiplier * (1 + streakBonus)
        const difficultyMultipliers: Record<string, number> = { 'E': 1.0, 'D': 1.2, 'C': 1.5, 'B': 2.0, 'A': 2.5, 'S': 3.0 };
        const baseXP = 10;
        const mult = difficultyMultipliers[currentExercise.details.difficultyRank] || 1;
        const streakBonus = Math.min(useStore.getState().user!.currentStreak * 0.05, 0.5);

        // Adjust XP slightly based on tracked weight/reps if desired, but keep standard for now
        const setXp = Math.round(baseXP * mult * (1 + streakBonus));
        setXpEarned(prev => prev + setXp);

        // Save set log
        setSetLogs(prev => [...prev, {
            weight: Number(currentWeight) || 0,
            reps: Number(currentReps) || currentExercise.reps,
            xp: setXp
        }]);

        // 15% chance for Random Encounter on any set completion (except last set of last exercise)
        if (!(isLastSet && isLastExercise) && Math.random() < 0.15) {
            setEncounterXpBonus(setXp); // Bonus is equal to base set XP (essentially 2x XP)
            setEncounterActive(true);
        } else if (isLastSet && isLastExercise) {
            setSetsCompleted(prev => prev + 1); // visually complete it
            setTimeout(() => setIsFinished(true), 600); // slight delay before finish screen
        } else {
            setIsResting(true);
        }
    };

    const acceptEncounter = () => {
        setEncounterActive(false);
        setXpEarned(prev => prev + encounterXpBonus);

        // Log the bonus XP
        setSetLogs(prev => [...prev, {
            weight: Number(currentWeight) || 0,
            reps: 2, // 2 extra reps
            xp: encounterXpBonus
        }]);

        setIsResting(true);
    };

    const declineEncounter = () => {
        setEncounterActive(false);
        setIsResting(true);
    };

    const finishRest = () => {
        setIsResting(false);
        if (isLastSet) {
            setCurrentExIndex(prev => prev + 1);
            setSetsCompleted(0);
            setSetLogs([]); // Reset logs for next exercise
            setCurrentWeight('');
            setCurrentReps('');
        } else {
            setSetsCompleted(prev => prev + 1);
        }
    };

    const finishWorkout = () => {
        // Log to Physical Pillar
        useStore.getState().addPillarXp('physical', xpEarned);
        logWorkout(workout.name, xpEarned);
        navigate('/hub');
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel max-w-md w-full p-8 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-neon-gold/20 to-transparent blur-xl"></div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 bg-neon-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 text-neon-gold glow-gold"
                    >
                        <Award size={40} />
                    </motion.div>

                    <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase mb-2">SESSION CLEAR!</h1>
                    <p className="text-zinc-400 font-bold tracking-widest uppercase text-sm mb-8">{workout.name}</p>

                    <div className="bg-zinc-900/80 rounded-2xl p-6 mb-8 border border-white/5">
                        <span className="block text-zinc-500 text-xs font-bold tracking-widest uppercase mb-1">XP Gained</span>
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-neon-gold to-white drop-shadow-[0_0_15px_rgba(255,207,0,0.5)]">
                            +{xpEarned}
                        </span>
                    </div>

                    <button
                        onClick={finishWorkout}
                        className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest flex items-center justify-center hover:bg-zinc-200 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    // Active Workout Screen
    const progressPercent = ((currentExIndex * 100) + ((setsCompleted / currentExercise.sets) * 100)) / exercises.length;

    return (
        <div className="min-h-screen bg-bg-dark flex flex-col pt-12">
            {/* Header */}
            <header className="px-6 md:px-12 flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">{workout.name}</h1>
                    <p className="text-zinc-500 font-bold text-sm tracking-widest mt-1">Exercise {currentExIndex + 1} of {exercises.length}</p>
                </div>
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/10 hover:border-neon-pink text-zinc-400 hover:text-neon-pink group transition-all">
                    <X className="group-hover:scale-110 transition-transform" />
                </button>
            </header>

            {/* Global Progress */}
            <div className="px-6 md:px-12 mb-12">
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Main Area */}
            <main className="flex-1 px-6 md:px-12 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {encounterActive ? (
                        <motion.div
                            key="encounter"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full max-w-2xl bg-gradient-to-br from-red-900/40 to-black p-8 md:p-12 rounded-2xl border-2 border-neon-pink shadow-[0_0_30px_rgba(255,0,85,0.3)] text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20Mix" />

                            <h2 className="text-4xl font-black text-neon-pink tracking-tighter uppercase mb-4 drop-shadow-[0_0_10px_#ff0055]">
                                ⚠️ ELITE FOE APPEARS! ⚠️
                            </h2>
                            <p className="text-zinc-300 text-lg mb-8 font-medium">
                                Limit break opportunity! Do <span className="text-white font-black glow-white text-xl">2 MORE REPS</span> to land the finishing blow and earn DOUBLE XP!
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={declineEncounter}
                                    className="flex-1 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase hover:bg-white/5 transition-colors"
                                >
                                    Flee
                                </button>
                                <button
                                    onClick={acceptEncounter}
                                    className="flex-[2] py-4 rounded-xl bg-neon-pink text-bg-dark font-black uppercase tracking-widest shadow-[0_0_20px_#ff0055] hover:bg-white transition-all transform hover:scale-105"
                                >
                                    Engage (+{encounterXpBonus} XP)
                                </button>
                            </div>
                        </motion.div>
                    ) : isResting ? (
                        <motion.div
                            key="resting"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full h-full flex items-center justify-center flex-col"
                        >
                            <h2 className="text-3xl font-extrabold text-white tracking-widest uppercase mb-8">RECOVER</h2>
                            <RestTimer durationSec={60} onComplete={finishRest} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`ex_${currentExercise.id}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-2xl"
                        >
                            <div className="glass-panel p-8 md:p-12 relative overflow-hidden group">
                                {/* Inner Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>

                                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                                    <div>
                                        <span className={clsx(
                                            "inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-3",
                                            currentExercise.details.difficultyRank === 'E' ? 'bg-zinc-800 text-zinc-400' :
                                                currentExercise.details.difficultyRank === 'D' ? 'bg-neon-green/20 text-neon-green' :
                                                    currentExercise.details.difficultyRank === 'C' ? 'bg-neon-blue/20 text-neon-blue' :
                                                        currentExercise.details.difficultyRank === 'B' ? 'bg-neon-purple/20 text-neon-purple' :
                                                            currentExercise.details.difficultyRank === 'A' ? 'bg-neon-pink/20 text-neon-pink' :
                                                                'bg-neon-gold/20 text-neon-gold'
                                        )}>
                                            Rank {currentExercise.details.difficultyRank}
                                        </span>
                                        <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase">{currentExercise.details.name}</h2>
                                        <p className="text-zinc-400 mt-2 font-medium">{currentExercise.details.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-5xl font-black text-neon-blue glow-blue tracking-tighter">{currentExercise.reps}</p>
                                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Reps</p>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Sets Completed</p>
                                        <span className="text-zinc-500 font-mono text-xl">{setsCompleted} / {currentExercise.sets}</span>
                                    </div>
                                    <div className="flex space-x-2 mb-8">
                                        {Array.from({ length: currentExercise.sets }).map((_, i) => (
                                            <div key={i} className={clsx(
                                                "h-3 rounded-sm transition-all duration-300",
                                                i < setsCompleted ? "flex-1 bg-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "flex-1 bg-zinc-800"
                                            )} />
                                        ))}
                                    </div>

                                    {/* Input Architecture */}
                                    <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 mb-6">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Weight (kg/lbs)</label>
                                            <input
                                                type="number"
                                                value={currentWeight}
                                                onChange={e => setCurrentWeight(e.target.value)}
                                                placeholder="e.g. 50"
                                                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xl focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Reps</label>
                                            <input
                                                type="number"
                                                value={currentReps}
                                                onChange={e => setCurrentReps(e.target.value)}
                                                placeholder={String(currentExercise.reps)}
                                                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xl focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Real-time Battle Log */}
                                    <AnimatePresence>
                                        {setLogs.length > 0 && (
                                            <div className="space-y-2 mb-6">
                                                {setLogs.map((log, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                        className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2 border border-white/5"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Set {idx + 1}</span>
                                                            <span className="text-white font-mono text-sm">{log.weight > 0 ? `${log.weight}kg × ` : ''}{log.reps} reps</span>
                                                        </div>
                                                        <span className="text-neon-gold font-bold text-xs tracking-widest uppercase glow-gold">+{log.xp} XP</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCompleteSet}
                                    className="w-full py-5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black uppercase tracking-widest flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(181,56,255,0.5)] transition-all"
                                >
                                    <Check className="mr-2" /> Complete Set {setsCompleted + 1}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
