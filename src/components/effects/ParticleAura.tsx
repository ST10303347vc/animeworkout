import { motion } from 'framer-motion';

export const ParticleAura = ({ color }: { color: string }) => {
    // Generate 15 particles
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 2, // 2px to 6px
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 2, // 2s to 4s
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bottom-0 rounded-full mix-blend-screen"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        backgroundColor: color,
                        boxShadow: `0 0 ${p.size * 2}px ${color}`,
                    }}
                    initial={{ opacity: 0, y: 10, scale: 0 }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        y: -100 - (Math.random() * 50),
                        scale: [0, 1, 0.5]
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
};
