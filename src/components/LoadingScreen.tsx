import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeLogo } from './ThemeLogo';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onComplete, minDuration = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = minDuration;
    const interval = 50;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete?.(), 200);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [minDuration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      {/* Logo with subtle animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="p-6 rounded-2xl bg-card/50 border border-border">
          <ThemeLogo size="xl" />
        </div>
      </motion.div>

      {/* Brand Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center mb-2"
      >
        <h1 className="text-3xl font-bold">
          <span className="text-foreground">Data</span>
          <span className="text-primary">ForgeAI</span>
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-sm text-muted-foreground tracking-widest uppercase mb-12"
      >
        AI-Powered Dataset Generation
      </motion.p>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 280 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="relative"
      >
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-purple-400"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">Loading...</p>
      </motion.div>
    </motion.div>
  );
}
