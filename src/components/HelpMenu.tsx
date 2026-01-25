import { useState } from 'react';
import { HelpCircle, X, Mail, ArrowLeft, Send, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type MenuState = 'closed' | 'menu' | 'contact';

export function HelpMenu() {
  const navigate = useNavigate();
  // Force Update
  const [state, setState] = useState<MenuState>('closed');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSending(false);

    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    setState('menu');
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
              className="w-12 h-12 rounded-full border-2 border-primary bg-transparent hover:bg-primary/10 text-primary"
            >
              <HelpCircle className="w-5 h-5" />
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
