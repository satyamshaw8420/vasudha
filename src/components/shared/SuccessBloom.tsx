import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Leaf, Award } from 'lucide-react';

export function SuccessBloom() {
  const { profile } = useAuth();
  const [show, setShow] = useState(false);
  const [awardAmount, setAwardAmount] = useState(0);
  const prevCredits = useRef(profile?.totalCredits || 0);

  useEffect(() => {
    if (profile?.totalCredits && profile.totalCredits > prevCredits.current) {
      const diff = profile.totalCredits - prevCredits.current;
      setAwardAmount(diff);
      setShow(true);
      
      const timer = setTimeout(() => setShow(false), 5000);
      prevCredits.current = profile.totalCredits;
      return () => clearTimeout(timer);
    }
    prevCredits.current = profile?.totalCredits || 0;
  }, [profile?.totalCredits]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Central Bloom Pulse */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_50%_50%,_var(--brand-secondary)_0%,_transparent_70%)] opacity-20 blur-3xl"
          />

          {/* Success Card */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="glass-card p-10 flex flex-col items-center text-center space-y-6 glow-sage pointer-events-auto bg-white/70 backdrop-blur-2xl shadow-[0_32px_64px_rgba(var(--brand-secondary-rgb),0.2)]"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 scale-150 opacity-10"
              >
                <Leaf size={120} className="text-[var(--brand-secondary)]" />
              </motion.div>
              <div className="h-24 w-24 rounded-full bg-[var(--brand-secondary)] text-white flex items-center justify-center shadow-lg shadow-[var(--brand-secondary)]/30 relative z-10">
                <Award size={48} />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-black text-[var(--brand-primary)] tracking-tight">Molecular Contribution!</h3>
              <p className="text-[var(--on-surface-variant)] text-sm font-bold uppercase tracking-widest">Global Ecosystem Updated</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-[var(--brand-secondary)] drop-shadow-sm">+{awardAmount}</span>
              <span className="text-xl font-bold text-[var(--brand-primary)] opacity-60">Credits</span>
            </div>

            {/* Particle Burst Simulation */}
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20 - Math.random() * 40], 
                    opacity: [1, 0],
                    scale: [1, 0.5]
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="h-2 w-2 rounded-full bg-[var(--brand-secondary)]"
                />
              ))}
            </div>
          </motion.div>

          {/* Background Ambient Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{ 
                y: [null, Math.random() * window.innerHeight - 100],
                opacity: [0, 0.3, 0],
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 3, 
                repeat: Infinity,
                delay: Math.random() * 2 
              }}
              className="absolute h-3 w-3 rounded-full bg-[var(--brand-secondary)] blur-[1px]"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
