import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Settings2, FolderOpen, History, MoreHorizontal, Pin, Pencil, Trash2, User, Settings, HelpCircle, LogOut, LogIn, Check, X, Sidebar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ThemeLogo } from '@/components/ThemeLogo';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({
  isCollapsed,
  onToggle
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAnonymous, logout } = useAuth();
  const { chats, setChats, startNewChat } = useChat();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { icon: MessageSquare, label: 'DataForge AI', path: '/app' },
    { icon: Settings2, label: 'Custom Generator', path: '/app/generator' },
    { icon: FolderOpen, label: 'Sample Datasets', path: '/app/samples' },
    { icon: History, label: 'History', path: '/app/history' },
  ];

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      setChats(chats.map(c => c.id === id ? { ...c, name: editingName.trim() } : c));
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handlePin = (id: string) => {
    setChats(chats.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const handleDelete = (id: string) => {
    setChats(chats.filter(c => c.id !== id));
  };

  const handleHelpClick = () => {
    setShowSettings(true);
  };

  // When collapsed, show only the logo icon that expands sidebar on click
  if (isCollapsed) {
    return (
      <>
        <aside data-tour="sidebar" className="h-screen w-14 bg-background border-r border-border flex flex-col transition-all duration-300 ease-in-out hidden md:flex">
          {/* Logo that expands sidebar */}
          <div className="h-14 flex items-center justify-center mb-2">
            <button
              onClick={onToggle}
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ThemeLogo size="sm" forceTheme="dark" />
            </button>
          </div>

          <div className="px-2 mb-2">
            <Button
              onClick={() => {
                startNewChat();
                navigate('/app');
              }}
              size="icon"
              variant="outline"
              className="w-10 h-10 rounded-xl border border-dashed border-muted-foreground/50 bg-background hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-300"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Minimal nav icons */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    title={item.label}
                  >
                    <item.icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User icon */}
          <div className="p-2 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-48 bg-card border-border">
                <DropdownMenuItem onClick={() => setShowSettings(true)} className="text-sm cursor-pointer">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHelpClick} className="text-sm cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAnonymous ? (
                  <DropdownMenuItem onClick={() => navigate('/auth')} className="text-sm cursor-pointer">
                    <LogIn className="w-4 h-4 mr-3" />
                    Sign in
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-sm cursor-pointer">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} defaultSection="help" />
      </>
    );
  }

  return (
    <>
      <aside data-tour="sidebar" className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 ease-in-out hidden md:flex">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/app" className="flex items-center gap-3">
            <ThemeLogo size="md" forceTheme="dark" />
            <span className="font-semibold text-foreground">DataForgeAI</span>
          </Link>
          <button
            onClick={onToggle}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Sidebar className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {/* New Chat Button */}
          <Button
            onClick={() => {
              startNewChat();
              navigate('/app');
            }}
            className="w-full justify-start gap-3 mb-4 h-10 rounded-xl border border-dashed border-muted-foreground/50 bg-background hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-300 shadow-none"
            variant="outline"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </Button>

          <div className="space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground font-medium"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Recent Chats */}
          <div className="mt-8">
            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Recent
            </h3>
            <div className="space-y-1">
              {chats.slice(0, 5).map(chat => (
                <div
                  key={chat.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {chat.pinned && <Pin className="w-3.5 h-3.5 text-primary shrink-0" />}

                  {editingId === chat.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveRename(chat.id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                        className="flex-1 bg-background border border-border rounded-md px-2 py-1 text-sm outline-none focus:border-primary transition-colors"
                        autoFocus
                      />
                      <button onClick={() => saveRename(chat.id)} className="p-1 text-primary hover:text-primary/80 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={cancelRename} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-muted-foreground group-hover:text-foreground cursor-pointer text-sm">
                        {chat.name}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-card border-border">
                          <DropdownMenuItem onClick={() => startRename(chat.id, chat.name)} className="text-sm cursor-pointer">
                            <Pencil className="w-3.5 h-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePin(chat.id)} className="text-sm cursor-pointer">
                            <Pin className="w-3.5 h-3.5 mr-2" />
                            {chat.pinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(chat.id)} className="text-destructive text-sm cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))}
            </div>
            {chats.length === 0 && (
              <p className="px-3 text-xs text-muted-foreground/60 py-2">
                No chats yet
              </p>
            )}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">
                    {isAnonymous ? 'Guest' : user?.username}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              <DropdownMenuItem onClick={() => setShowSettings(true)} className="text-sm cursor-pointer">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHelpClick} className="text-sm cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-3" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAnonymous ? (
                <DropdownMenuItem onClick={() => navigate('/auth')} className="text-sm cursor-pointer">
                  <LogIn className="w-4 h-4 mr-3" />
                  Sign in
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-sm cursor-pointer">
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
