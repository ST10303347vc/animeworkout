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
    const addXp = useStore(state => state.addXp);
    const logWorkout = useStore(state => state.logWorkout);

    // For Phase 1 demo, we'll just run the first mock workout
    const workout = MOCK_WORKOUTS[0];
    const exercises = workout.exercises.map(we => ({
        ...we,
        details: MOCK_EXERCISES.find(e => e.id === we.exerciseId)!
    }));

    const [currentExIndex, setCurrentExIndex] = useState(0);
    const [setsCompleted, setSetsCompleted] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);
    const [isResting, setIsResting] = useState(false);

    const currentExercise = exercises[currentExIndex];
    const isLastExercise = currentExIndex === exercises.length - 1;
    const isLastSet = setsCompleted === currentExercise.sets - 1;

    const handleCompleteSet = () => {
        // Base XP calculation: 10 XP * difficulty multiplier * (1 + streakBonus)
        const difficultyMultipliers: Record<string, number> = { 'E': 1.0, 'D': 1.2, 'C': 1.5, 'B': 2.0, 'A': 2.5, 'S': 3.0 };
        const baseXP = 10;
        const mult = difficultyMultipliers[currentExercise.details.difficultyRank] || 1;
        const streakBonus = Math.min(useStore.getState().user!.currentStreak * 0.05, 0.5);

        const setXp = Math.round(baseXP * mult * (1 + streakBonus));
        setXpEarned(prev => prev + setXp);

        if (isLastSet && isLastExercise) {
            setSetsCompleted(prev => prev + 1); // visually complete it
            setTimeout(() => setIsFinished(true), 600); // slight delay before finish screen
        } else {
            setIsResting(true);
        }
    };

    const finishRest = () => {
        setIsResting(false);
        if (isLastSet) {
            setCurrentExIndex(prev => prev + 1);
            setSetsCompleted(0);
        } else {
            setSetsCompleted(prev => prev + 1);
        }
    };

    const finishWorkout = () => {
        addXp(xpEarned);
        logWorkout(workout.name, xpEarned);
        navigate('/dashboard');
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
                    {isResting ? (
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

                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-2">Sets Completed</p>
                                        <div className="flex space-x-2">
                                            {Array.from({ length: currentExercise.sets }).map((_, i) => (
                                                <div key={i} className={clsx(
                                                    "h-3 rounded-sm transition-all duration-300",
                                                    i < setsCompleted ? "w-8 bg-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "w-6 bg-zinc-800"
                                                )} />
                                            ))}
                                        </div>
                                    </div>

                                    <span className="text-zinc-500 font-mono text-xl">{setsCompleted} / {currentExercise.sets}</span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCompleteSet}
                                    className="w-full py-5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black uppercase tracking-widest flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(181,56,255,0.5)] transition-all"
                                >
                                    <Check className="mr-2" /> Complete Set
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
