import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeLogo } from '@/components/ThemeLogo';
import { LoadingScreen } from '@/components/LoadingScreen';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [redirecting, setRedirecting] = useState(false);
  const [error] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setRedirecting(true);
      navigate(user.onboarding_completed ? '/app' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      const decoded = decodeURIComponent(err);
      console.error('OAuth error from backend:', decoded);
    }
  }, [searchParams]);

  // OAuth-only flow — kick the browser to the backend, which handles the rest
  const handleOAuthLogin = (provider: 'google' | 'github') => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <>
      <LoadingScreen show={redirecting} />

      <div className="min-h-screen w-full flex items-center justify-center bg-background transition-colors relative overflow-hidden">
        {/* gradient background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
        </div>

        {/* grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transform-gpu" />

        {/* theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="absolute top-5 right-5 h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground z-20"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <div className="w-full max-w-sm px-6 relative z-10">
          <div className="p-8 rounded-2xl border border-border/30 bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />

            {/* header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block group">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105">
                  <ThemeLogo size="custom" className="w-10 h-10 object-contain" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight mb-1 group-hover:text-primary transition-colors">DataForgeAI</h1>
              </Link>
              <p className="text-xs text-muted-foreground">Sign in to continue</p>
            </div>

            {/* oauth buttons — only path in */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 justify-start px-4 rounded-lg text-sm font-medium"
                onClick={() => handleOAuthLogin('google')}
              >
                <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 justify-start px-4 rounded-lg text-sm font-medium"
                onClick={() => handleOAuthLogin('github')}
              >
                <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </Button>

              {error && (
                <p className="text-destructive text-xs text-center pt-2">{error}</p>
              )}
            </div>
          </div>

          <p className="text-center mt-6 text-[10px] text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</Link> and{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
