import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeLogo } from '@/components/ThemeLogo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import logoLight from '@/assets/logo-light-theme.png';
import logoDark from '@/assets/logo-dark-theme.png';
import background from '@/assets/background.png';

type AuthMode = 'signin' | 'signup';
type AuthStep = 'method' | 'email' | 'password' | 'forgot' | 'signup-details' | 'signup-password';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>('method');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.onboarding_completed ? '/app' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle OAuth error from query params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setError(decodeURIComponent(error));
    }
  }, [searchParams]);

  const switchMode = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(newMode);
    setStep('method');
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/app');
    } catch {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  const handleSignupDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!username) {
      setError('Please enter a username');
      return;
    }
    setError('');
    setStep('signup-password');
  };

  const handleSignupPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signup(email, password, username);
      navigate('/onboarding');
    } catch {
      setError('Failed to create account');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setIsLoading(true);
    // Backend doesn't support password reset yet — show informational message
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    setError('');
    alert('Password reset is not available yet. Please contact support.');
    setStep('email');
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    // Redirect to backend OAuth endpoint — backend handles the entire flow
    // and redirects back to /app or /onboarding with cookies set
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  const goBack = () => {
    setError('');
    if (step === 'password' || step === 'forgot') setStep('email');
    else if (step === 'email' || step === 'signup-details') setStep('method');
    else if (step === 'signup-password') setStep('signup-details');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const isSignUp = mode === 'signup';

  return (
    <div className={cn(
      "min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-500",
      theme === 'dark' ? "bg-[#0a0a16]" : "bg-slate-50"
    )}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={background}
          alt="Background"
          className="w-full h-full object-cover scale-105"
        />
        <div className={cn(
          "absolute inset-0 transition-all duration-1000",
          theme === 'dark' ? "bg-[#0a0a16]/40" : "bg-white/20 backdrop-blur-[1px]"
        )} />
      </div>

      {/* Shapes for extra depth */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(120,120,120,0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(120,120,120,0.1) 0%, transparent 20%)' }}></div>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "absolute top-6 right-6 h-10 w-10 z-20 hover:bg-white/10 transition-colors rounded-full",
          theme === 'dark' ? "text-white/70 hover:text-white" : "text-gray-600 hover:text-gray-900"
        )}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      <div className="relative z-10 w-full max-w-[450px] p-4">
        {/* Glass Card */}
        <div className={cn(
          "backdrop-blur-2xl border rounded-[2rem] shadow-2xl p-10 overflow-hidden relative transition-all duration-500",
          theme === 'dark'
            ? "bg-slate-900/40 border-white/10 shadow-black/40"
            : "bg-white/60 border-white/40 shadow-slate-200/50"
        )}>

          {/* Subtle sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "circOut" }}
              className="relative z-10"
            >
              {/* Header inside card */}
              <div className="text-center mb-10">
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-slate-900/10 dark:bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
                  <ThemeLogo size="custom" className="w-12 h-12 object-contain drop-shadow-2xl" />
                </div>
                <h1 className={cn(
                  "text-4xl font-bold mb-3 tracking-tight",
                  theme === 'dark' ? "text-white" : "text-slate-900"
                )}>
                  DataForgeAI
                </h1>
                <p className={cn(
                  "text-base font-medium opacity-60",
                  theme === 'dark' ? "text-slate-300" : "text-slate-500"
                )}>
                  {step === 'method' && (isSignUp ? "Join the future of synthetic data." : "Enterprise-grade synthetic data generation.")}
                  {step !== 'method' && (isSignUp ? "Create your account" : "Welcome back")}
                </p>
              </div>

              {step === 'method' && (
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-14 justify-start px-6 rounded-2xl font-medium transition-all backdrop-blur-sm border-0",
                      theme === 'dark'
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10"
                    )}
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-14 justify-start px-6 rounded-2xl font-medium transition-all backdrop-blur-sm border-0",
                      theme === 'dark'
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10"
                    )}
                    onClick={() => handleOAuthLogin('github')}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className={cn("w-full border-t", theme === 'dark' ? "border-white/10" : "border-slate-200")} />
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className={cn(
                        "px-4 font-bold tracking-[0.2em] rounded-full",
                        theme === 'dark' ? "text-white/40 bg-transparent" : "text-slate-400 bg-transparent"
                      )}>OR CONTINUE WITH EMAIL</span>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold transition-all shadow-xl",
                      theme === 'dark'
                        ? "bg-white text-slate-950 hover:bg-slate-100 shadow-white/5"
                        : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10"
                    )}
                    onClick={() => setStep(isSignUp ? 'signup-details' : 'email')}
                  >
                    Continue with email
                  </Button>

                  <div className="text-center pt-6">
                    <span className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>
                      {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    </span>
                    <button type="button" onClick={switchMode} className={cn(
                      "text-sm hover:underline font-bold transition-colors",
                      theme === 'dark' ? "text-white" : "text-slate-900"
                    )}>
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <button type="button" onClick={goBack} className={cn(
                    "flex items-center text-xs font-bold uppercase tracking-wider transition-colors mb-4",
                    theme === 'dark' ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  )}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "h-14 rounded-2xl px-6 backdrop-blur-md border-0",
                      theme === 'dark'
                        ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
                        : "bg-slate-900/5 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10"
                    )}
                    autoFocus
                  />
                  {error && <p className="text-red-400 text-sm font-medium px-2">{error}</p>}
                  <Button type="submit" className={cn(
                    "w-full h-14 rounded-2xl font-bold transition-all",
                    theme === 'dark' ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                  )} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <button type="button" onClick={goBack} className={cn(
                    "flex items-center text-xs font-bold uppercase tracking-wider transition-colors mb-4",
                    theme === 'dark' ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  )}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <div className="bg-white/5 rounded-2xl p-3 px-5 mb-4 border border-white/5">
                    <p className={cn("text-xs font-bold opacity-60 uppercase tracking-widest mb-1", theme === 'dark' ? "text-white/50" : "text-slate-500")}>Signing in as</p>
                    <p className={cn("text-sm font-bold truncate", theme === 'dark' ? "text-white" : "text-slate-900")}>{email}</p>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "h-14 rounded-2xl px-6 pr-14 backdrop-blur-md border-0",
                        theme === 'dark'
                          ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
                          : "bg-slate-900/5 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10"
                      )}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn(
                      "absolute right-5 top-1/2 -translate-y-1/2",
                      theme === 'dark' ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900"
                    )}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {error && <p className="text-red-400 text-sm font-medium px-2">{error}</p>}
                  <Button type="submit" className={cn(
                    "w-full h-14 rounded-2xl font-bold transition-all",
                    theme === 'dark' ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                  )} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
                  </Button>
                  <button type="button" onClick={() => { setError(''); setStep('forgot'); }} className={cn(
                    "w-full text-xs font-bold uppercase tracking-widest py-2 transition-colors",
                    theme === 'dark' ? "text-white/30 hover:text-white" : "text-slate-400 hover:text-slate-900"
                  )}>
                    Forgot password?
                  </button>
                </form>
              )}

              {step === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <button type="button" onClick={goBack} className={cn(
                    "flex items-center text-xs font-bold uppercase tracking-wider transition-colors mb-4",
                    theme === 'dark' ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  )}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "h-14 rounded-2xl px-6 backdrop-blur-md border-0",
                      theme === 'dark'
                        ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
                        : "bg-slate-900/5 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10"
                    )}
                    autoFocus
                  />
                  {error && <p className="text-red-400 text-sm font-medium px-2">{error}</p>}
                  <Button type="submit" className={cn(
                    "w-full h-14 rounded-2xl font-bold transition-all",
                    theme === 'dark' ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                  )} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
                  </Button>
                </form>
              )}

              {step === 'signup-details' && (
                <form onSubmit={handleSignupDetailsSubmit} className="space-y-5">
                  <button type="button" onClick={goBack} className={cn(
                    "flex items-center text-xs font-bold uppercase tracking-wider transition-colors mb-4",
                    theme === 'dark' ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  )}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={cn(
                      "h-14 rounded-2xl px-6 backdrop-blur-md border-0",
                      theme === 'dark'
                        ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
                        : "bg-slate-900/5 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10"
                    )}
                    autoFocus
                  />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "h-14 rounded-2xl px-6 backdrop-blur-md border-0",
                      theme === 'dark'
                        ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
                        : "bg-slate-900/5 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10"
                    )}
                  />
                  {error && <p className="text-red-400 text-sm font-medium px-2">{error}</p>}
                  <Button type="submit" className={cn(
                    "w-full h-14 rounded-2xl font-bold transition-all",
                    theme === 'dark' ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                  )} disabled={isLoading}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}

              {step === 'signup-password' && (
                <form onSubmit={handleSignupPasswordSubmit} className="space-y-5">
                  <button type="button" onClick={goBack} className={cn(
                    "flex items-center text-xs font-bold uppercase tracking-wider transition-colors mb-4",
                    theme === 'dark' ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  )}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "h-14 rounded-2xl px-6 pr-14 backdrop-blur-md border-0",
                        theme === 'dark'
                          ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
                          : "bg-slate-900/5 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10"
                      )}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn(
                      "absolute right-5 top-1/2 -translate-y-1/2",
                      theme === 'dark' ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900"
                    )}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "h-14 rounded-2xl px-6 backdrop-blur-md border-0",
                      theme === 'dark'
                        ? "bg-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
                        : "bg-slate-900/5 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10"
                    )}
                  />
                  {error && <p className="text-red-400 text-sm font-medium px-2">{error}</p>}
                  <Button type="submit" className={cn(
                    "w-full h-14 rounded-2xl font-bold transition-all",
                    theme === 'dark' ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                  )} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
            theme === 'dark' ? "text-white/20" : "text-slate-400"
          )}>
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-white/50 hover:text-white underline-offset-4 hover:underline transition-all">Terms</Link> and{' '}
            <Link to="/privacy" className="text-white/50 hover:text-white underline-offset-4 hover:underline transition-all">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;