import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Code2, LineChart, FlaskConical, LayoutTemplate, ArrowLeft, BookOpen, Briefcase, User, Database, BrainCircuit, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeLogo } from '@/components/ThemeLogo';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

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

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleNext = async () => {
        if (step === 3) {
            try {
                await api.post(ENDPOINTS.ONBOARDING_COMPLETE, { name, role, purpose: goals.join(', ') });
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

    const handleBack = () => setStep(prev => Math.max(0, prev - 1));
    const toggleGoal = (id: string) => setGoals(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);

    const stepVariants = {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -16 }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background transition-colors relative overflow-hidden">
            {/* Gradient background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 -left-24 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 -right-24 w-80 h-80 bg-orange-500/6 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
            </div>
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transform-gpu" />

            <div className="w-full max-w-md px-6 relative z-10">
                {/* Progress dots */}
                <div className="flex gap-1.5 mb-5 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 rounded-full transition-all duration-400",
                                i <= step
                                    ? "w-6 bg-gradient-to-r from-purple-500 to-orange-500"
                                    : "bg-border w-1.5"
                            )}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="relative border border-border/30 rounded-2xl bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />
                    <div className="p-6 flex-1 flex flex-col items-center text-center justify-center overflow-y-auto relative z-10">
                        {step !== 3 && (
                            <div className="w-10 h-10 mb-4 flex-shrink-0">
                                <ThemeLogo size="custom" className="w-full h-full object-contain" />
                            </div>
                        )}

                        <AnimatePresence mode="wait" custom={step}>
                            {step === 0 && (
                                <motion.div key="step0" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full max-w-xs">
                                    <h2 className="text-lg font-semibold mb-1 tracking-tight">Welcome to DataForgeAI</h2>
                                    <p className="text-sm text-muted-foreground mb-5">Let's personalize your experience.</p>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-medium text-muted-foreground">What should we call you?</label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="h-10 px-3 text-sm rounded-lg"
                                            autoFocus
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full">
                                    <h2 className="text-lg font-semibold mb-1 tracking-tight">Who are you?</h2>
                                    <p className="text-sm text-muted-foreground mb-5">Help us tailor the experience.</p>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {ROLES.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setRole(option.id)}
                                                className={cn(
                                                    "p-3 rounded-lg border text-left transition-all flex items-center gap-2.5 text-sm",
                                                    role === option.id
                                                        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white border-transparent shadow-sm shadow-purple-500/15"
                                                        : "bg-card/60 border-border/30 hover:bg-card/80 text-foreground backdrop-blur-sm"
                                                )}
                                            >
                                                <option.icon className="w-4 h-4 shrink-0" />
                                                <span className="font-medium text-xs">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full">
                                    <h2 className="text-lg font-semibold mb-1 tracking-tight">What will you use this for?</h2>
                                    <p className="text-sm text-muted-foreground mb-5">Select all that apply.</p>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {GOALS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => toggleGoal(option.id)}
                                                className={cn(
                                                    "p-3 rounded-lg border text-left transition-all flex items-center gap-2.5",
                                                    goals.includes(option.id)
                                                        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white border-transparent shadow-sm shadow-purple-500/15"
                                                        : "bg-card/60 border-border/30 hover:bg-card/80 text-foreground backdrop-blur-sm"
                                                )}
                                            >
                                                <option.icon className="w-4 h-4 shrink-0" />
                                                <span className="font-medium text-xs">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full py-4">
                                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5">
                                        <ThemeLogo size="custom" className="w-14 h-14 object-contain" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 tracking-tight">You're all set, {name}!</h2>
                                    <p className="text-sm text-muted-foreground">Your workspace is ready.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-4 px-6 border-t border-border/30 flex items-center justify-between relative z-10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            disabled={step === 0 || step === 3}
                            className={cn("text-xs text-muted-foreground", step === 0 && "opacity-0 pointer-events-none")}
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                        </Button>

                        <div>
                            {step === 0 && !name.trim() ? (
                                <span className="text-xs text-muted-foreground">Type your name to continue</span>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={(step === 0 && !name.trim()) || (step === 1 && !role) || (step === 2 && goals.length === 0)}
                                    className="px-6 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white border-0 shadow-sm shadow-purple-500/15"
                                >
                                    {step === 3 ? "Launch DataForge" : "Continue"} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
