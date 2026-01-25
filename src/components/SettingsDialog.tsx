import { useState, useEffect } from 'react';
import { User, Bell, Shield, HelpCircle, CreditCard, Settings, X } from 'lucide-react';
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
  const { user, isAnonymous } = useAuth();
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
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Close button at top-right of dialog */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-accent transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex h-[480px]">
          {/* Sidebar */}
          <div className="w-44 border-r border-border bg-muted/30 p-3">
            <div className="px-2 py-2 mb-3">
              <span className="text-sm font-medium">Settings</span>
            </div>
            <nav className="space-y-0.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors text-left",
                    activeSection === section.id
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium">General</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Appearance</p>
                      <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light" className="text-xs">Light</SelectItem>
                        <SelectItem value="dark" className="text-xs">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-xs text-muted-foreground">Select your preferred language</p>
                    </div>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en" className="text-xs">English</SelectItem>
                        <SelectItem value="es" className="text-xs">Español</SelectItem>
                        <SelectItem value="fr" className="text-xs">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Default format</p>
                      <p className="text-xs text-muted-foreground">Default output format for datasets</p>
                    </div>
                    <Select defaultValue="csv">
                      <SelectTrigger className="w-28 h-8 text-xs">
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
              <div className="space-y-6">
                <h2 className="text-lg font-medium">Account</h2>
                
                {isAnonymous ? (
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm font-medium mb-1">You're using DataForgeAI as a guest</p>
                    <p className="text-xs text-muted-foreground mb-3">Sign in to save your work and access all features</p>
                    <Button size="sm" className="h-8 text-xs">Sign in</Button>
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
              <div className="space-y-6">
                <h2 className="text-lg font-medium">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Email notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates about new features</p>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Product updates</p>
                      <p className="text-xs text-muted-foreground">Get notified about new data types and features</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Usage alerts</p>
                      <p className="text-xs text-muted-foreground">Notify when approaching usage limits</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium">Data & Usage</h2>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Current Plan</p>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">Free</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">1,000 rows per dataset • 10 datasets/month</p>
                    <Button size="sm" className="h-8 text-xs">Upgrade to Pro</Button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Datasets generated</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                    <span className="text-sm font-medium">12 / 10</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Storage used</p>
                      <p className="text-xs text-muted-foreground">Saved datasets</p>
                    </div>
                    <span className="text-sm font-medium">24.5 MB</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium">Help</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-xs text-muted-foreground">support@dataforgeai.com</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-xs text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Support Hours</p>
                      <p className="text-xs text-muted-foreground">Monday - Friday, 9AM - 6PM EST</p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      onOpenChange(false);
                      window.location.href = '/#contact';
                    }}
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
