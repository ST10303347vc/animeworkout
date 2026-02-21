import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import { ChevronRight, Dumbbell, Brain, Wallet, Heart } from 'lucide-react';
import { soundFx } from '@/utils/sound';

const TUTORIAL_STEPS = [
    {
        title: 'Awaken Your Potential',
        content: 'Welcome to Project Limit Break. Your life is now an RPG. To ascend, you must balance the Four Pillars of Existence.',
        icon: null
    },
    {
        title: 'The Vanguard',
        content: 'Your Physical strength. Enter the Dungeon to log your workouts, face random encounters, and gain combat XP.',
        icon: <Dumbbell className="text-neon-pink w-16 h-16 mx-auto mb-4" />
    },
    {
        title: 'The Sage',
        content: 'Your Mental fortitude. Log reading sessions, study blocks, and deep focus time to expand your mind.',
        icon: <Brain className="text-neon-blue w-16 h-16 mx-auto mb-4" />
    },
    {
        title: 'The Merchant',
        content: 'Your Wealth. Track your career progression, side hustles, and strategic investments here.',
        icon: <Wallet className="text-neon-gold w-16 h-16 mx-auto mb-4" />
    },
    {
        title: 'The Guardian',
        content: 'Your Vitality. Consistently track your sleep, hydration, and nutrition. Health is your ultimate armor.',
        icon: <Heart className="text-emerald-400 w-16 h-16 mx-auto mb-4" />
    },
    {
        title: 'Complete Daily Directives',
        content: 'Check your Hub daily for new cross-pillar Quests. Complete them all for the Balanced Warrior bonus. Your journey begins now.',
        icon: null
    }
];

export const OnboardingOverlay = () => {
    const user = useStore(state => state.user);
    const completeTutorial = useStore(state => state.completeTutorial);

    const [step, setStep] = useState(0);

    if (!user || user.hasSeenTutorial) return null;

    const handleNext = () => {
        soundFx.playHover();
        if (step < TUTORIAL_STEPS.length - 1) {
            setStep(prev => prev + 1);
        } else {
            completeTutorial();
            soundFx.playLevelUp();
        }
    };

    const currentData = TUTORIAL_STEPS[step];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md glass-panel p-8 text-center"
            >
                {currentData.icon}
                <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">
                    {currentData.title}
                </h2>
                <p className="text-zinc-400 font-bold mb-8 h-20 text-sm md:text-base leading-relaxed">
                    {currentData.content}
                </p>

                <div className="flex items-center justify-between mt-8">
                    <div className="flex space-x-2">
                        {TUTORIAL_STEPS.map((_, i) => (
                            <div key={i} className={`h-2 w-2 rounded-full ${i === step ? 'bg-white' : 'bg-white/20'}`} />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center"
                    >
                        {step === TUTORIAL_STEPS.length - 1 ? 'Begin' : 'Next'} <ChevronRight className="ml-2" size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
