import { useState, useEffect } from 'react';
import { User, Bell, Shield, HelpCircle, CreditCard, Settings, X, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type SettingsSection = 'general' | 'account' | 'notifications' | 'data' | 'help';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: SettingsSection;
}

export function SettingsDialog({ open, onOpenChange, defaultSection = 'general' }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const { user, isAnonymous, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>(defaultSection);
  const [notifications, setNotifications] = useState(true);

  // Update active section when defaultSection changes
  useEffect(() => {
    if (open) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection, open]);

  const sections = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'data' as const, label: 'Data & Usage', icon: CreditCard },
    { id: 'help' as const, label: 'Help', icon: HelpCircle },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-border/80 dark:border-border shadow-2xl transition-all duration-300 [&>button]:hidden">
        {/* Close button at top-right of dialog */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-md hover:bg-accent hover:text-foreground transition-all text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex h-[520px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-border/50 bg-secondary/30 dark:bg-muted/30 p-4 space-y-4">
            <div className="px-2 py-1">
              <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
            </div>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left group",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <section.icon className={cn("w-4 h-4", activeSection === section.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="pt-8 px-2">
              <button
                onClick={() => { signOut(); onOpenChange(false); }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto bg-background/50 backdrop-blur-sm">
            {activeSection === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-1">General</h2>
                  <p className="text-sm text-muted-foreground">Manage your app experience and preferences.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium">Appearance</p>
                      <p className="text-xs text-muted-foreground">Adjust the visual theme of the application.</p>
                    </div>
                    <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs transition-all duration-200",
                          theme === 'light' ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs transition-all duration-200",
                          theme === 'dark' ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-xs text-muted-foreground">Select your primary language for the UI.</p>
                    </div>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-32 h-9 text-xs transition-all hover:border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en" className="text-xs">🇺🇸 English</SelectItem>
                        <SelectItem value="es" className="text-xs">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr" className="text-xs">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium">Default Format</p>
                      <p className="text-xs text-muted-foreground">Preferred default file format for dataset generation.</p>
                    </div>
                    <Select defaultValue="json">
                      <SelectTrigger className="w-32 h-9 text-xs transition-all hover:border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv" className="text-xs">CSV</SelectItem>
                        <SelectItem value="json" className="text-xs">JSON</SelectItem>
                        <SelectItem value="sql" className="text-xs">SQL</SelectItem>
                        <SelectItem value="parquet" className="text-xs">Parquet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Account</h2>
                  <p className="text-sm text-muted-foreground">Manage your identity and subscription status.</p>
                </div>

                {isAnonymous ? (
                  <div className="p-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-primary">Guest Session</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">You are using a temporary account. Sign in to sync your work across devices and unlock advanced synthetic data models.</p>
                    </div>
                    <Button
                      onClick={() => { onOpenChange(false); navigate('/login'); }}
                      className="w-full h-10 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                      Sign in to DataForgeAI
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs">Change</Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Username</p>
                        <p className="text-xs text-muted-foreground">{user?.username}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs">Edit</Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Password</p>
                        <p className="text-xs text-muted-foreground">••••••••</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs">Update</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Stay updated on your generation status and new features.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between py-2 group">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates about new synthetic models and features.</p>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>

                  <div className="flex items-center justify-between py-2 group">
                    <div>
                      <p className="text-sm font-medium">Generation Completed</p>
                      <p className="text-xs text-muted-foreground">Get alerted when your large dataset is ready for download.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-2 group">
                    <div>
                      <p className="text-sm font-medium">Usage Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify when approaching your monthly free tier limits.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Data & Usage</h2>
                  <p className="text-sm text-muted-foreground">Track your synthetic data consumption and plan details.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-background shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold">Current Plan</p>
                        <p className="text-xs text-muted-foreground">Free Tier</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Active</span>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Row Limit</span>
                        <span className="font-medium text-foreground">1,000 / dataset</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Monthly Quota</span>
                        <span className="font-medium text-foreground">12 / 10 used</span>
                      </div>
                    </div>
                    <Button className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold shadow-md shadow-primary/10">Upgrade to Pro</Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Storage</p>
                      <p className="text-lg font-semibold">24.5 MB</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Avg. Accuracy</p>
                      <p className="text-lg font-semibold">99.4%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Help & Support</h2>
                  <p className="text-sm text-muted-foreground">Resources and contact info for any assistance.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border border-border/50 bg-muted/10 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Quick Support</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our team is available Mon-Fri, 9AM-6PM EST. We typically respond within 24 hours.</p>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">support@dataforgeai.com</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-10 mt-2 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => {
                          onOpenChange(false);
                          window.location.href = '/#contact';
                        }}
                      >
                        Visit Help Center
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
