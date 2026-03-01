import { useState, useEffect } from 'react';
import { HelpCircle, X, Mail, ArrowLeft, Send, BookOpen, Database, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

type MenuState = 'closed' | 'menu' | 'contact';

interface UsageData {
  datasets_generated: { used: number; limit: number };
  queries: { used: number; limit: number };
}

export function HelpMenu() {
  const navigate = useNavigate();
  const [state, setState] = useState<MenuState>('closed');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    if (state === 'menu') {
      api.get<{ success: boolean; data: UsageData }>(ENDPOINTS.USAGE_STATUS)
        .then(res => { if (res.success && res.data) setUsage(res.data); })
        .catch(() => {});
    }
  }, [state]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);

    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
    if (!accessKey) {
      toast({ title: 'Configuration Error', description: 'Web3Forms API key is missing. Please add VITE_WEB3FORMS_KEY to .env', variant: 'destructive' });
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name,
          email,
          message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Message sent!', description: "We'll get back to you soon." });
        setName('');
        setEmail('');
        setMessage('');
        setState('menu');
      } else {
        toast({ title: 'Error', description: data.message || "Failed to send message.", variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: "An error occurred while sending your message.", variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleGetStarted = () => {
    setState('closed');
    navigate('/getting-started');
  };

  return (
    <div data-tour="help-menu" className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence mode="wait">
        {state === 'closed' && (
          <motion.div
            key="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => setState('menu')}
              size="icon"
              variant="ghost"
              className="w-10 h-10 rounded-full border border-muted-foreground/30 bg-background hover:bg-muted text-muted-foreground shadow-sm"
            >
              <span className="text-sm">?</span>
            </Button>
          </motion.div>
        )}

        {state === 'menu' && (
          <motion.div
            key="menu"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <div className="bg-card border border-border rounded-xl p-2 shadow-lg min-w-[200px]">
              <button
                onClick={handleGetStarted}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Get Started</span>
              </button>
              <button
                onClick={() => setState('contact')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Contact Support</span>
              </button>

              {/* Usage section */}
              {usage && (
                <div className="mt-1 px-3 pb-2 pt-1 border-t border-border/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-1">Today's Usage</p>
                  <div className="space-y-2">
                    {/* Datasets */}
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[11px] text-muted-foreground">Datasets</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{usage.datasets_generated.used}/{usage.datasets_generated.limit}</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              usage.datasets_generated.used >= usage.datasets_generated.limit ? "bg-red-500" :
                                usage.datasets_generated.used >= usage.datasets_generated.limit * 0.8 ? "bg-amber-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min((usage.datasets_generated.used / usage.datasets_generated.limit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Queries */}
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[11px] text-muted-foreground">Queries</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{usage.queries.used}/{usage.queries.limit}</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              usage.queries.used >= usage.queries.limit ? "bg-red-500" :
                                usage.queries.used >= usage.queries.limit * 0.8 ? "bg-amber-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min((usage.queries.used / usage.queries.limit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setState('closed')}
                size="icon"
                variant="secondary"
                className="w-12 h-12 rounded-full shadow-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {state === 'contact' && (
          <motion.div
            key="contact"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg w-80">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold">Contact Support</h3>
                <button
                  onClick={() => setState('menu')}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Name
                  </label>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 bg-muted/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 bg-muted/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="How can we help?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px] bg-muted/50 border-border resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSending || !name || !email || !message}
                  className="w-full h-11"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setState('closed')}
                size="icon"
                variant="secondary"
                className="w-12 h-12 rounded-full shadow-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
