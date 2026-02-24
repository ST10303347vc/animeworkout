import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { motion } from 'framer-motion';
import { Sword } from 'lucide-react';
import { pb } from '@/lib/pocketbase';

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // We still use zustand's login for the frontend sync for now
    const loginStore = useStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const authData = await pb.collection('users').authWithPassword(email, password);
                loginStore(authData.record.name || authData.record.username || 'Hunter');
                navigate('/hub');
            } else {
                // Registration
                const data = {
                    username: username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                    email,
                    emailVisibility: true,
                    password,
                    passwordConfirm: password,
                    name: username,
                };

                await pb.collection('users').create(data);
                const authData = await pb.collection('users').authWithPassword(email, password);
                loginStore(authData.record.name || username);
                navigate('/select-sensei');
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err?.response?.message || err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
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
                <div className="text-center mb-8">
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
                    <p className="text-zinc-400 text-sm tracking-widest uppercase">
                        {isLogin ? 'Resume Training' : 'Begin Your Training Arc'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                Challenger Name
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your display name..."
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Email Server
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="anime@example.com"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Secret Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                            required
                            minLength={8}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(181,56,255,0.6)] transition-all uppercase tracking-wider disabled:opacity-50"
                    >
                        {isLoading ? 'Connecting...' : (isLogin ? 'Enter the Arena' : 'Forge Alliance')}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-zinc-400 text-sm hover:text-white transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already registered? Log In"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
