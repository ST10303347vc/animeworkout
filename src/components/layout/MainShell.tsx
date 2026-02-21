import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Dumbbell, Brain, Wallet, Heart, User } from 'lucide-react';
import { OnboardingOverlay } from '@/components/hud/OnboardingOverlay';
import clsx from 'clsx';
import { soundFx } from '@/utils/sound';

const NAV_ITEMS = [
    { id: 'hub', path: '/hub', icon: Home, label: 'Hub', color: 'text-zinc-400' },
    { id: 'physical', path: '/physical', icon: Dumbbell, label: 'Physical', color: 'text-neon-pink' },
    { id: 'mental', path: '/mental', icon: Brain, label: 'Mental', color: 'text-neon-blue' },
    { id: 'wealth', path: '/wealth', icon: Wallet, label: 'Wealth', color: 'text-neon-gold' },
    { id: 'vitality', path: '/vitality', icon: Heart, label: 'Vitality', color: 'text-emerald-400' },
    { id: 'profile', path: '/profile', icon: User, label: 'Profile', color: 'text-zinc-400' },
];

export const MainShell = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="min-h-[100dvh] bg-bg-dark text-white flex flex-col relative overflow-x-hidden">
            {/* Main Content Area */}
            <main className="flex-1 pb-24 overflow-y-auto">
                <Outlet />
            </main>

            <OnboardingOverlay />

            {/* Bottom Tab Bar (Mobile/Standard Navigation) */}
            <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 z-50">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (!isActive) {
                                        soundFx.playHover();
                                        navigate(item.path);
                                    }
                                }}
                                className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 rounded-2xl"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                )}
                                <Icon
                                    size={24}
                                    className={clsx(
                                        'transition-colors relative z-10',
                                        isActive ? item.color : 'text-zinc-500 hover:text-zinc-300'
                                    )}
                                />
                                {/* Label only visible when active on larger screens, or always hidden for pure icon look. We'll hide it for sleekness or show very small. */}
                                <span className={clsx(
                                    "text-[9px] font-bold uppercase tracking-widest mt-1 relative z-10 transition-colors",
                                    isActive ? item.color : "text-zinc-600"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {/* Safe area padding for iOS devices */}
                <div className="h-safe-bottom" />
            </nav>
        </div>
    );
};
