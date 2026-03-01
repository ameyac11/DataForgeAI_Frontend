import { useState, useEffect, useCallback } from 'react';
import { User, Settings, X, LogOut, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { cn } from '@/lib/utils';

type SettingsSection = 'general' | 'account' | 'usage';

interface UsageData {
  datasets_generated: { used: number; limit: number };
  queries: { used: number; limit: number };
}

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
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: UsageData }>(ENDPOINTS.USAGE_STATUS);
      if (res.success && res.data) {
        setUsage(res.data);
      }
    } catch {
      // silently fail — usage is non-critical
    } finally {
      setUsageLoading(false);
    }
  }, []);

  // Update active section when defaultSection changes
  useEffect(() => {
    if (open) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection, open]);

  // Fetch usage when opening the usage tab
  useEffect(() => {
    if (open && activeSection === 'usage') {
      fetchUsage();
    }
  }, [open, activeSection, fetchUsage]);

  const sections = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'usage' as const, label: 'Usage', icon: BarChart3 },
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
          <div className="w-48 border-r border-border/50 bg-secondary/30 dark:bg-muted/30 p-4 flex flex-col h-full">
            <div className="px-2 py-1">
              <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
            </div>
            <nav className="space-y-1 mt-4">
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

            <div className="mt-auto px-2 pb-1">
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
                      <p className="text-xs text-muted-foreground">Interface language.</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 border border-border/50 px-3 py-1.5 rounded-lg">English</span>
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
                      onClick={() => { onOpenChange(false); navigate('/auth'); }}
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

            {activeSection === 'usage' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Usage</h2>
                  <p className="text-sm text-muted-foreground">Your daily usage limits reset every 24 hours.</p>
                </div>

                {usageLoading ? (
                  <div className="space-y-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="space-y-3 animate-pulse">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-2.5 w-full bg-muted rounded-full" />
                        <div className="h-3 w-20 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : usage ? (
                  <div className="space-y-6">
                    {/* Datasets Generated */}
                    <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Datasets Generated</p>
                        <span className="text-xs font-mono text-muted-foreground">
                          {usage.datasets_generated.used} / {usage.datasets_generated.limit}
                        </span>
                      </div>
                      <Progress
                        value={Math.min((usage.datasets_generated.used / usage.datasets_generated.limit) * 100, 100)}
                        className={cn(
                          "h-2.5",
                          usage.datasets_generated.used >= usage.datasets_generated.limit
                            ? "[&>div]:bg-red-500"
                            : usage.datasets_generated.used >= usage.datasets_generated.limit * 0.8
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-primary"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {usage.datasets_generated.limit - usage.datasets_generated.used > 0
                          ? `${usage.datasets_generated.limit - usage.datasets_generated.used} remaining today`
                          : 'Daily limit reached — resets in 24h'}
                      </p>
                    </div>

                    {/* Queries */}
                    <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Chat Queries</p>
                        <span className="text-xs font-mono text-muted-foreground">
                          {usage.queries.used} / {usage.queries.limit}
                        </span>
                      </div>
                      <Progress
                        value={Math.min((usage.queries.used / usage.queries.limit) * 100, 100)}
                        className={cn(
                          "h-2.5",
                          usage.queries.used >= usage.queries.limit
                            ? "[&>div]:bg-red-500"
                            : usage.queries.used >= usage.queries.limit * 0.8
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-primary"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {usage.queries.limit - usage.queries.used > 0
                          ? `${usage.queries.limit - usage.queries.used} remaining today`
                          : 'Daily limit reached — resets in 24h'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 text-center">
                    <p className="text-sm text-muted-foreground">Unable to load usage data. Please try again later.</p>
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
