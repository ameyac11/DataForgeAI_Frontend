import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Code2, LineChart, FlaskConical, LayoutTemplate, Moon, Sun, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import logoLight from '@/assets/logo-light-theme.png';
import logoDark from '@/assets/logo-dark-theme.png';
import background from '@/assets/background.png';

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const USAGE_OPTIONS = [
  { id: 'dev', label: 'Software Development', icon: Code2 },
  { id: 'data', label: 'Data Science / ML', icon: LineChart },
  { id: 'research', label: 'Academic Research', icon: FlaskConical },
  { id: 'demo', label: 'Product Demos', icon: LayoutTemplate },
];

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const { theme, toggleTheme } = useTheme();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [usage, setUsage] = useState<string[]>([]);

  const handleNext = async () => {
    if (step === 3) {
      try {
        const goals = usage.map(id => USAGE_OPTIONS.find(o => o.id === id)?.label || id);
        await api.post(ENDPOINTS.ONBOARDING_COMPLETE, {
          name,
          role: 'user',
          purpose: goals.join(', '),
        });
        await refreshUser();
      } catch (err) {
        console.error('Failed to save onboarding:', err);
      }
      onComplete();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const toggleUsage = (id: string) => {
    setUsage(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={background}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className={cn(
          "absolute inset-0 transition-all duration-1000",
          theme === 'dark' ? "bg-black/40" : "bg-white/40 backdrop-blur-[2px]"
        )} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-[550px] p-6"
      >
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i <= step
                  ? (theme === 'dark' ? "bg-white w-8" : "bg-primary w-8")
                  : (theme === 'dark' ? "bg-white/20 w-2" : "bg-gray-300 w-2")
              )}
            />
          ))}
        </div>

        {/* Glass Card */}
        <div className={cn(
          "backdrop-blur-2xl border rounded-[2rem] shadow-2xl overflow-hidden relative transition-all duration-500 min-h-[400px] flex flex-col",
          theme === 'dark'
            ? "bg-white/5 border-white/10"
            : "bg-white/70 border-white/60 shadow-xl"
        )}>

          <div className="p-8 md:p-10 flex-1 flex flex-col items-center text-center justify-center">
            <div className="w-12 h-12 mb-6 opacity-80 hover:opacity-100 transition-opacity">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <AnimatePresence mode="wait" custom={step}>
              {/* Step 0: Name */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm"
                >
                  <h2 className={cn("text-3xl font-bold mb-3", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    Welcome to DataForgeAI
                  </h2>
                  <p className={cn("text-lg mb-8", theme === 'dark' ? "text-white/50" : "text-gray-500")}>
                    Let's personalize your experience
                  </p>

                  <div className="space-y-4 text-left">
                    <label className={cn("text-sm font-medium ml-1", theme === 'dark' ? "text-white/70" : "text-gray-700")}>
                      What should we call you?
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className={cn(
                        "h-14 px-6 text-lg rounded-xl transition-all",
                        theme === 'dark'
                          ? "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10"
                          : "bg-white border-gray-200 text-gray-900"
                      )}
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 1: Usage */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <h2 className={cn("text-2xl font-bold mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    How will you use DataForge?
                  </h2>
                  <p className={cn("text-sm mb-8", theme === 'dark' ? "text-white/50" : "text-gray-500")}>
                    Select all that apply
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {USAGE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleUsage(option.id)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                          usage.includes(option.id)
                            ? (theme === 'dark' ? "bg-white text-black border-white" : "bg-primary text-primary-foreground border-primary")
                            : (theme === 'dark' ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")
                        )}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Theme */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <h2 className={cn("text-2xl font-bold mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    Choose your vibe
                  </h2>
                  <p className={cn("text-sm mb-8", theme === 'dark' ? "text-white/50" : "text-gray-500")}>
                    You can always change this later
                  </p>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={cn(
                        "w-32 h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all",
                        theme === 'light'
                          ? "bg-white border-primary shadow-lg scale-105"
                          : "bg-white/5 border-transparent opacity-50 hover:opacity-100"
                      )}
                    >
                      <Sun className={cn("w-8 h-8", theme === 'light' ? "text-orange-500" : "text-white")} />
                      <span className={cn("font-medium", theme === 'dark' && "text-white")}>Light</span>
                    </button>

                    <button
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={cn(
                        "w-32 h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all",
                        theme === 'dark'
                          ? "bg-white/10 border-white shadow-lg scale-105"
                          : "bg-white border-gray-200 opacity-50 hover:opacity-100"
                      )}
                    >
                      <Moon className={cn("w-8 h-8", theme === 'dark' ? "text-purple-400" : "text-gray-600")} />
                      <span className={cn("font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>Dark</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-green-500" />
                  </div>

                  <h2 className={cn("text-3xl font-bold mb-3", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    You're all set, {name}!
                  </h2>
                  <p className={cn("text-lg mb-8", theme === 'dark' ? "text-white/50" : "text-gray-500")}>
                    Ready to generate some data?
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer / Navigation */}
          <div className={cn(
            "p-6 border-t flex items-center justify-between",
            theme === 'dark' ? "border-white/10" : "border-gray-200"
          )}>
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0 || step === 3}
              className={cn(
                theme === 'dark' ? "text-white/50 hover:text-white hover:bg-white/10" : "text-gray-500",
                step === 0 && "opacity-0 pointer-events-none"
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={step === 0 && !name.trim()}
              className={cn(
                "px-8 rounded-xl transition-all",
                theme === 'dark'
                  ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              )}
            >
              {step === 3 ? "Let's Go" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
