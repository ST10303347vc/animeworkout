import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { motion } from 'framer-motion';
import { Sword } from 'lucide-react';

export const AuthPage = () => {
    const [username, setUsername] = useState('');
    const login = useStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            login(username.trim());
            navigate('/select-sensei');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-aura"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl animate-pulse-aura" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 bg-surface/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                        className="flex justify-center mb-4 text-neon-gold glow-gold"
                    >
                        <Sword size={64} strokeWidth={1.5} />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink text-glow-blue mb-2">
                        LIMIT BREAK
                    </h1>
                    <p className="text-zinc-400 text-sm tracking-widest uppercase">Begin Your Training Arc</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Challenger Name
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(181,56,255,0.6)] transition-all uppercase tracking-wider"
                    >
                        Enter the Arena
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};
