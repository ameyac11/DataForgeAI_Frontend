import { motion, AnimatePresence } from 'framer-motion';
import { ThemeLogo } from './ThemeLogo';

interface LoadingScreenProps {
  /** Controls visibility — screen fades out when false */
  show?: boolean;
}

export function LoadingScreen({ show = true }: LoadingScreenProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.06)_0%,_transparent_70%)]" />

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ThemeLogo size="lg" />
            </motion.div>

            {/* Brand */}
            <div className="text-center space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Data<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-400">ForgeAI</span>
              </h1>
              <p className="text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                AI-Powered Dataset Generation
              </p>
            </div>

            {/* Pulsing dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400/60 dark:bg-white/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
