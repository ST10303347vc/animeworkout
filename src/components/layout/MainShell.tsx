import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Dumbbell, Brain, Wallet, Heart, User } from 'lucide-react';
import { OnboardingOverlay } from '@/components/hud/OnboardingOverlay';
import { useEnabledPillars } from '@/stores/useStore';
import { Pillar } from '@/types';
import clsx from 'clsx';
import { soundFx } from '@/utils/sound';
import { useMemo } from 'react';

const ALL_NAV_ITEMS: { id: string; pillar?: Pillar; path: string; icon: typeof Home; label: string; color: string }[] = [
    { id: 'hub', path: '/hub', icon: Home, label: 'Hub', color: 'text-zinc-400' },
    { id: 'physical', pillar: 'physical', path: '/physical', icon: Dumbbell, label: 'Physical', color: 'text-neon-pink' },
    { id: 'mental', pillar: 'mental', path: '/mental', icon: Brain, label: 'Mental', color: 'text-neon-blue' },
    { id: 'wealth', pillar: 'wealth', path: '/wealth', icon: Wallet, label: 'Wealth', color: 'text-neon-gold' },
    { id: 'vitality', pillar: 'vitality', path: '/vitality', icon: Heart, label: 'Vitality', color: 'text-emerald-400' },
    { id: 'profile', path: '/profile', icon: User, label: 'Profile', color: 'text-zinc-400' },
];

export const MainShell = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const enabledPillars = useEnabledPillars();

    const navItems = useMemo(() => {
        return ALL_NAV_ITEMS.filter(item => {
            // Hub and Profile are always visible
            if (!item.pillar) return true;
            // Only show pillar tabs that are enabled
            return enabledPillars.includes(item.pillar);
        });
    }, [enabledPillars]);

    return (
        <div className="min-h-[100dvh] bg-bg-dark text-white flex flex-col relative overflow-x-hidden">
            {/* Main Content Area */}
            <main className="flex-1 pb-24 overflow-y-auto">
                <Outlet />
            </main>

            <OnboardingOverlay />

            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 z-50">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    {navItems.map((item) => {
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
                <div className="h-safe-bottom" />
            </nav>
        </div>
    );
};
