import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Code2, LineChart, FlaskConical, LayoutTemplate, Moon, Sun, ArrowLeft, BookOpen, Briefcase, User, Database, BrainCircuit, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeLogo } from '@/components/ThemeLogo';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import logoLight from '@/assets/logo-light-theme.png';
import logoDark from '@/assets/logo-dark-theme.png';

const ROLES = [
    { id: 'student', label: 'Student', icon: BookOpen },
    { id: 'developer', label: 'Developer', icon: Code2 },
    { id: 'data_scientist', label: 'Data Scientist', icon: LineChart },
    { id: 'product_manager', label: 'Product Manager', icon: Briefcase },
    { id: 'researcher', label: 'Researcher', icon: FlaskConical },
    { id: 'other', label: 'Other', icon: User },
];

const GOALS = [
    { id: 'generate_data', label: 'Generate Synthetic Data', icon: Database },
    { id: 'train_models', label: 'Train AI Models', icon: BrainCircuit },
    { id: 'test_apis', label: 'Test APIs / Databases', icon: Server },
    { id: 'prototyping', label: 'Prototyping / Demos', icon: LayoutTemplate },
];

const Onboarding = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { refreshUser } = useAuth();

    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [isExiting, setIsExiting] = useState(false);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleNext = async () => {
        if (step === 3) {
            // Submit onboarding data to backend
            try {
                await api.post(ENDPOINTS.ONBOARDING_COMPLETE, {
                    name,
                    role,
                    purpose: goals.join(', '),
                });
                // Refresh user data so onboarding_completed flag updates
                await refreshUser();
            } catch (err) {
                console.error('Failed to complete onboarding:', err);
            }
            setIsExiting(true);
            setTimeout(() => navigate('/app'), 500);
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(0, prev - 1));
    };

    const toggleGoal = (id: string) => {
        setGoals(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className={cn(
            "min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-500",
            theme === 'dark' ? "bg-[#0a0a16]" : "bg-slate-50"
        )}>
            {/* Background - Matched with Auth.tsx */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-b transition-colors duration-1000",
                    theme === 'dark'
                        ? "from-[#1a103c] via-[#2d1b69] to-[#0a0a16]"
                        : "from-blue-100 via-indigo-50 to-white"
                )} />
                <div className="absolute inset-0 opacity-40">
                    <div className={cn(
                        "absolute bottom-0 left-0 right-0 h-[60vh] transform translate-y-1/4 skew-y-[-3deg] origin-bottom-left",
                        theme === 'dark' ? "bg-[#251b5ebb]" : "bg-blue-200/50"
                    )} style={{ borderRadius: '100% 0 0 0' }} />
                    <div className={cn(
                        "absolute bottom-0 right-[-10%] w-[80%] h-[50vh] transform translate-y-1/6 skew-y-[2deg] rounded-[10rem]",
                        theme === 'dark' ? "bg-[#18104ebb]" : "bg-indigo-200/50"
                    )} />
                </div>
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(120,120,120,0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(120,120,120,0.1) 0%, transparent 20%)' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-[600px] p-6">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-6 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-500",
                                i <= step
                                    ? (theme === 'dark' ? "bg-white w-8" : "bg-slate-900 w-8")
                                    : (theme === 'dark' ? "bg-white/20 w-2" : "bg-slate-300 w-2")
                            )}
                        />
                    ))}
                </div>

                {/* Glass Card */}
                <div className={cn(
                    "backdrop-blur-2xl border rounded-[2rem] shadow-2xl overflow-hidden relative transition-all duration-500 flex flex-col max-h-[85vh]",
                    theme === 'dark'
                        ? "bg-white/5 border-white/10 shadow-black/40"
                        : "bg-white/70 border-white/60 shadow-slate-200/50"
                )}>

                    <div className="p-6 md:p-8 flex-1 flex flex-col items-center text-center justify-center overflow-y-auto">
                        {step !== 3 && (
                            <div className="w-12 h-12 mb-4 opacity-90 hover:opacity-100 transition-opacity flex-shrink-0">
                                <ThemeLogo size="custom" className="w-full h-full object-contain drop-shadow-lg" />
                            </div>
                        )}

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
                                    <h2 className={cn("text-2xl font-bold mb-2 tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                                        Welcome to DataForgeAI
                                    </h2>
                                    <p className={cn("text-base mb-6", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>
                                        Let's personalize your experience.
                                    </p>

                                    <div className="space-y-2 text-left">
                                        <label className={cn("text-xs font-bold ml-1 uppercase tracking-wider opacity-70", theme === 'dark' ? "text-white" : "text-slate-700")}>
                                            What should we call you?
                                        </label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className={cn(
                                                "h-12 px-4 text-lg rounded-xl transition-all border-0",
                                                theme === 'dark'
                                                    ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20"
                                                    : "bg-white border-slate-200 text-slate-900 shadow-sm"
                                            )}
                                            autoFocus
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 1: Role */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={stepVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="w-full"
                                >
                                    <h2 className={cn("text-xl font-bold mb-1 tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                                        Who are you?
                                    </h2>
                                    <p className={cn("text-sm mb-6", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>
                                        Help us tailor the experience for you.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                                        {ROLES.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setRole(option.id)}
                                                className={cn(
                                                    "p-3 rounded-xl border text-left transition-all flex items-center gap-3 group relative overflow-hidden",
                                                    role === option.id
                                                        ? (theme === 'dark' ? "bg-white text-slate-950 border-white shadow-lg" : "bg-slate-900 text-white border-slate-900 shadow-lg")
                                                        : (theme === 'dark' ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50")
                                                )}
                                            >
                                                <option.icon className={cn("w-4 h-4", role === option.id ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
                                                <span className="font-bold text-sm">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Goal */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={stepVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="w-full"
                                >
                                    <h2 className={cn("text-xl font-bold mb-1 tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                                        What will you do with this tool?
                                    </h2>
                                    <p className={cn("text-sm mb-6", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>
                                        Select all that apply.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md mx-auto">
                                        {GOALS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => toggleGoal(option.id)}
                                                className={cn(
                                                    "p-3 rounded-xl border text-left transition-all flex items-center gap-3 group",
                                                    goals.includes(option.id)
                                                        ? (theme === 'dark' ? "bg-white text-slate-950 border-white shadow-md" : "bg-slate-900 text-white border-slate-900 shadow-md")
                                                        : (theme === 'dark' ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50")
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-1.5 rounded-lg",
                                                    goals.includes(option.id)
                                                        ? (theme === 'dark' ? "bg-slate-950/10" : "bg-white/20")
                                                        : (theme === 'dark' ? "bg-white/5" : "bg-slate-100")
                                                )}>
                                                    <option.icon className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm flex-1">{option.label}</span>
                                                {goals.includes(option.id) && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <div className={cn("w-2 h-2 rounded-full", theme === 'dark' ? "bg-slate-950" : "bg-white")} />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
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
                                    <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 bg-green-500/10 rounded-3xl animate-in zoom-in duration-700">
                                        <ThemeLogo size="custom" className="w-16 h-16 object-contain drop-shadow-xl" />
                                    </div>

                                    <h2 className={cn("text-3xl font-bold mb-3 tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                                        You're all set, {name}!
                                    </h2>
                                    <p className={cn("text-base mb-6", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>
                                        Your personalized workspace is ready.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer / Navigation */}
                    <div className={cn(
                        "p-4 px-6 border-t flex items-center justify-between backdrop-blur-md mt-auto",
                        theme === 'dark' ? "border-white/5 bg-white/5" : "border-slate-100 bg-white/50"
                    )}>
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={step === 0 || step === 3}
                            className={cn(
                                "font-medium transition-all",
                                theme === 'dark' ? "text-white/50 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-900",
                                step === 0 && "opacity-0 pointer-events-none"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        <div className="flex gap-2">
                            {step === 0 && !name.trim() ? (
                                <span className={cn("text-xs font-medium opacity-50 py-2", theme === 'dark' ? "text-white" : "text-slate-500")}>Type your name to continue</span>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    disabled={(step === 0 && !name.trim()) || (step === 1 && !role) || (step === 2 && goals.length === 0)}
                                    className={cn(
                                        "px-8 rounded-xl font-bold transition-all",
                                        theme === 'dark'
                                            ? "bg-white text-slate-950 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                                            : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10"
                                    )}
                                >
                                    {step === 3 ? "Launch DataForge" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
