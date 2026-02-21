import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SESSION_KEY = 'datanestx_login_prompt_shown';

interface LoginPromptDialogProps {
  isAnonymous: boolean;
}

export function LoginPromptDialog({ isAnonymous }: LoginPromptDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAnonymous) {
      const hasShown = sessionStorage.getItem(SESSION_KEY);
      if (!hasShown) {
        // Small delay so user sees the page first
        const timer = setTimeout(() => {
          setOpen(true);
          sessionStorage.setItem(SESSION_KEY, 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAnonymous]);

  if (!isAnonymous) return null;

  const features = [
    { icon: Sparkles, text: 'Access GPT-4o model' },
    { icon: Zap, text: 'Unlimited dataset generation' },
    { icon: Shield, text: 'Save & sync your history' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-lg font-semibold text-center">
              Welcome to DataForgeAI
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground text-center mb-6">
            You're using a limited guest mode. Sign in to unlock all features:
          </p>

          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => {
                setOpen(false);
                navigate('/auth');
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setOpen(false);
                navigate('/auth?mode=signup');
              }}
            >
              Create Account
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
