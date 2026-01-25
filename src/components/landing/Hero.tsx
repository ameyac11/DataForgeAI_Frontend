import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeLogo } from '@/components/ThemeLogo';
import { motion } from 'framer-motion';

export function Hero() {
  const { loginAsGuest } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      {/* Animated Mesh Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
        backgroundSize: '4rem 4rem'
      }} />

      <div className="container relative z-10 px-4 sm:px-6 py-16 sm:py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Data Generation</span>
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-8 sm:mb-10"
          >
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <ThemeLogo size="xl" />
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 px-4"
          >
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Data</span>
            <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">ForgeAI</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Generate high-quality synthetic, realistic, or hybrid datasets in seconds using natural language.
            Built for developers, researchers, and enterprises.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-4"
          >
            {['No credit card required', 'Free trial', 'Privacy first'].map((item, index) => (
              <div key={index} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold border-2 hover:bg-accent/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              onClick={() => {
                loginAsGuest();
                window.location.href = '/app';
              }}
            >
              Try as Guest
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 sm:mt-20 md:mt-28 px-4"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 sm:gap-0 sm:divide-x divide-border/50 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 shadow-xl">
              {[
                { value: '50+', label: 'Data Types' },
                { value: '1M+', label: 'Rows Generated' },
                { value: '4', label: 'Export Formats' },
              ].map((stat, index) => (
                <div key={index} className="text-center px-6 sm:px-8 md:px-12">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
