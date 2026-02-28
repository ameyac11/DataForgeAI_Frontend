import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings2, History, Plus, PanelLeft, FolderOpen, Search, Sparkles, Database, X, MessageSquare, Pin, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import { UserMenu } from '@/components/layout/UserMenu';
import { ChatItemMenu } from '@/components/sidebar/ChatItemMenu';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const navItems = [
  { icon: BarChart3, label: 'Analytics', path: '/app/analytics' },
  { icon: FolderOpen, label: 'Sample Datasets', path: '/app/samples' },
  { icon: Database, label: 'My Datasets', path: '/app/datasets' },
  { icon: History, label: 'History', path: '/app/history' },
];

// Functional Chat Search Popup
const ChatSearchPopup = ({ open, onClose, chats, onSelect }: { open: boolean; onClose: () => void; chats: { id: string; title: string; updatedAt: Date; pinned?: boolean }[]; onSelect: (chatId: string) => void }) => {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const filteredChats = query.trim()
    ? chats.filter(c => c.title.toLowerCase().includes(query.toLowerCase()))
    : chats;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="glass-panel border border-border/50 rounded-xl w-[480px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Search Header */}
        <div className="p-4 border-b border-border/40 flex items-center gap-3 bg-secondary/10">
          <div className="p-2 rounded-lg bg-primary/10">
            <Search className="w-4 h-4 text-primary shrink-0" />
          </div>
          <input
            className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-muted-foreground/50"
            placeholder="Search chats..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-1 shrink-0 p-1 hover:bg-muted rounded-md hidden sm:block">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {query ? `No chats matching "${query}"` : 'No chats yet'}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => { onSelect(chat.id); onClose(); setQuery(''); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left group"
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{chat.title}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(chat.updatedAt)}</p>
                  </div>
                  {chat.pinned && <Pin className="w-3 h-3 text-primary fill-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredChats.length > 0 && (
          <div className="px-4 py-2 border-t border-border/40 bg-secondary/5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center">
              {filteredChats.length} {filteredChats.length === 1 ? 'chat' : 'chats'} {query ? 'found' : 'total'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export function AppSidebar({ collapsed, onToggle, isMobile = false, onItemClick }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { chats, currentChat, selectChat, deleteChat, renameChat, pinChat, createNewChat } = useChat();
  const [searchOpen, setSearchOpen] = useState(false);

  // Safely use theme context
  const themeContext = useTheme();
  // Provide fallback or handle missing context if strictly necessary, assuming context exists as per file reads
  const resolvedTheme = themeContext?.resolvedTheme || 'dark';

  // Sort pinned chats first, then by date
  const recentChats = [...chats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const handleNewChat = () => {
    createNewChat();
    // Assuming new chat navigates to the main app/chat route
    if (location.pathname !== '/app') {
      navigate('/app');
    }
    onItemClick?.(); // Close mobile drawer
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    if (location.pathname !== '/app') {
      navigate('/app');
    }
    onItemClick?.(); // Close mobile drawer
  };

  const handleRename = (chatId: string, newTitle: string) => {
    renameChat(chatId, newTitle);
  };

  const handlePin = (chatId: string) => {
    pinChat(chatId);
  };

  const handleDelete = (chatId: string) => {
    deleteChat(chatId);
  };

  // When collapsed, clicking the logo opens the sidebar
  const handleLogoClick = () => {
    if (collapsed) {
      onToggle();
    }
  };

  return (
    <>
      <aside className={cn(
        'h-screen border-r flex flex-col transition-all duration-300 ease-in-out',
        // Mobile: always full width, no collapse
        isMobile ? 'w-64 bg-sidebar border-sidebar-border' : '',
        // Desktop: support collapse
        !isMobile && collapsed ? 'w-[72px] bg-background border-border' : '',
        !isMobile && !collapsed ? 'w-64 bg-sidebar border-sidebar-border' : ''
      )}>
        {/* Header with Logo */}
        <div className={cn(
          "flex items-center border-b",
          collapsed ? "justify-center h-[60px] border-border" : "h-[60px] px-3 border-sidebar-border"
        )}>
          {collapsed ? (
            <button
              onClick={handleLogoClick}
              className="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src={resolvedTheme === 'dark' ? "/DataNesTX_Logo_Dark_Frontend.png" : "/DataNesTX_Logo_Light_Frontend.png"} alt="DataNesTX Logo" className="w-12 h-12" />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <img
                  src={resolvedTheme === 'dark' ? "/DataNesTX_Logo_Dark_Frontend.png" : "/DataNesTX_Logo_Light_Frontend.png"}
                  alt="DataNesTX Logo"
                  className="w-10 h-10 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base text-sidebar-foreground tracking-tight truncate">DataForgeAI</span>
                  <div className="flex items-center">
                    <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(34,197,94,0.15)] scale-90 origin-left">
                      <span className="relative flex h-1 w-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1 w-1 bg-green-500"></span>
                      </span>
                      Beta
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0 ml-1"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Custom Generator Button - Primary Gradient */}
        <div className={cn(
          "flex justify-center",
          !isMobile && collapsed ? "py-3" : "p-3"
        )}>
          <Link to="/app/generator" className={!isMobile && collapsed ? "" : "w-full"} onClick={onItemClick}>
            <Button
              variant="default"
              className={cn(
                'gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white border-0 transition-all duration-300',
                // Glow effect on hover
                'hover:shadow-[0_0_20px_rgba(168,85,247,0.6),0_0_40px_rgba(236,72,153,0.4),0_0_60px_rgba(249,115,22,0.3)]',
                'hover:scale-105 active:scale-100',
                // Touch-friendly on mobile
                'h-11 xl:h-10',
                !isMobile && collapsed ? 'w-10 p-0' : 'w-full justify-start',
                location.pathname === '/app/generator' && 'ring-2 ring-white/30 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
              )}
            >
              <Settings2 className="w-4 h-4 animate-pulse shrink-0" />
              {(isMobile || !collapsed) && (
                <span className="font-semibold whitespace-nowrap">
                  Custom Generator
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className={cn(
          "flex justify-center",
          !isMobile && collapsed ? "pb-3" : "px-3 pb-2"
        )}>
          <Button
            onClick={handleNewChat}
            variant="outline"
            className={cn(
              'gap-2 border-dashed transition-all duration-300',
              // Touch-friendly on mobile
              'h-11 xl:h-10',
              !isMobile && collapsed ? 'w-10 p-0' : 'w-full justify-start'
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {(isMobile || !collapsed) && <span className="whitespace-nowrap">New Chat</span>}
          </Button>
        </div>

        {/* Search Chat Button */}
        {(isMobile || !collapsed) && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 xl:py-2 rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 min-h-[44px] xl:min-h-0"
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Search Chats</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "flex flex-col gap-1",
          !isMobile && collapsed ? "items-center py-2" : "px-3 pt-2"
        )}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  // Touch-friendly on mobile
                  'min-h-[44px] xl:min-h-0',
                  !isMobile && collapsed ? 'h-10 w-10 justify-center' : 'w-full px-3 py-2.5'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(isMobile || !collapsed) && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Recent Chats */}
        {(isMobile || !collapsed) && (
          <div
            className="flex-1 overflow-y-auto px-3 py-2 min-h-0"
            onWheel={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-medium text-muted-foreground mb-2 px-3">Recent</p>
            <div className="space-y-1">
              {recentChats.map((chat) => (
                <ChatItemMenu
                  key={chat.id}
                  chatId={chat.id}
                  chatTitle={chat.title}
                  isPinned={!!chat.pinned}
                  isActive={currentChat?.id === chat.id}
                  onRename={handleRename}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onSelect={handleSelectChat}
                  updatedAt={chat.updatedAt}
                />
              ))}
              {recentChats.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No chats yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* User Section */}
        <div className={cn(
          "mt-auto border-t flex",
          collapsed ? "justify-center py-3 border-border" : "p-3 border-sidebar-border"
        )}>
          <UserMenu collapsed={collapsed} />
        </div>
      </aside>

      <ChatSearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} chats={chats} onSelect={handleSelectChat} />
    </>
  );
}
