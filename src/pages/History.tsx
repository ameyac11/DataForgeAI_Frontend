import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pin, Pencil, Trash2, Check, X, Clock, Calendar, ChevronDown, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { isAnonymous } = useAuth();
  const { chats, deleteChat, renameChat, pinChat, selectChat } = useChat();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  const filteredChats = chats
    .filter(chat => {
      const matchesSearch = chat.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'pinned' && chat.pinned);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  // Group chats by date
  const groupedChats = filteredChats.reduce((groups, chat) => {
    let groupName: string;

    if (chat.pinned) {
      groupName = 'Pinned';
    } else {
      const now = new Date();
      const chatDate = chat.updatedAt;
      const diffDays = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) groupName = 'Today';
      else if (diffDays === 1) groupName = 'Yesterday';
      else if (diffDays < 7) groupName = 'This Week';
      else if (diffDays < 30) groupName = 'This Month';
      else groupName = 'Older';
    }

    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(chat);
    return groups;
  }, {} as Record<string, typeof filteredChats>);

  const groupOrder = ['Pinned', 'Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  const startRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingName(name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      renameChat(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handlePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    pinChat(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(id);
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    navigate('/app');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleSelection = (id: string) => {
    setSelectedChats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredChats.map(c => c.id);
    setSelectedChats(allFilteredIds);
  };

  const handleBatchDelete = () => {
    selectedChats.forEach(id => deleteChat(id));
    setSelectedChats([]);
  };

  const handleBatchPin = () => {
    selectedChats.forEach(id => pinChat(id));
    setSelectedChats([]);
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">History</h1>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Browse and manage your past conversations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-card border border-border rounded-lg p-0.5">
              <Button
                variant={filter === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-8 px-4 rounded-md"
              >
                All
              </Button>
              <Button
                variant={filter === 'pinned' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('pinned')}
                className="h-8 px-4 rounded-md gap-1.5"
              >
                <Pin className="w-3.5 h-3.5" />
                Pinned
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {sortBy === 'recent' ? 'Recent' : 'Name'}
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('recent')}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  By Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chat Groups */}
        <div className="space-y-6">
          {groupOrder.map(groupName => {
            const groupChats = groupedChats[groupName];
            if (!groupChats || groupChats.length === 0) return null;

            return (
              <div key={groupName}>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {groupName}
                </h2>
                <div className="space-y-1">
                  {groupChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => editingId !== chat.id && handleSelectChat(chat.id)}
                      className={cn(
                        "flex items-center gap-4 py-3 px-4 rounded-xl border-b border-border/50 last:border-b-0",
                        "hover:bg-accent/30 transition-all cursor-pointer group",
                        editingId === chat.id && "bg-accent/30",
                        selectedChats.includes(chat.id) && "bg-primary/5"
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className="flex items-center justify-center -ml-1 pr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(chat.id);
                        }}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm",
                          selectedChats.includes(chat.id)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border/60 group-hover:border-primary/50 text-transparent bg-background/20"
                        )}>
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                      </div>

                      {/* Pin indicator */}
                      <div className="w-5 flex-shrink-0">
                        {chat.pinned && (
                          <Pin className="w-4 h-4 text-primary" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {editingId === chat.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename(chat.id);
                                if (e.key === 'Escape') cancelRename();
                              }}
                              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => saveRename(chat.id)}
                              className="h-8 w-8 text-primary hover:text-primary/80"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelRename}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-foreground/90">
                            {chat.title}
                          </h3>
                        )}
                      </div>

                      {/* Date */}
                      {editingId !== chat.id && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(chat.updatedAt)}
                        </span>
                      )}

                      {/* Direct Action Buttons */}
                      {editingId !== chat.id && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-secondary/50 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => startRename(chat.id, chat.title, e)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Rename"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handlePin(chat.id, e)}
                            className={cn(
                              "h-8 w-8",
                              chat.pinned ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                            title={chat.pinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDelete(chat.id, e)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredChats.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No conversations found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {search
                ? "Try adjusting your search terms"
                : filter === 'pinned'
                  ? "You haven't pinned any conversations yet"
                  : "Start a new conversation to see it here"
              }
            </p>
          </div>
        )}
      </div>

      {/* Batch Selection Bar */}
      <AnimatePresence>
        {selectedChats.length > 0 && (
          <div className="sticky bottom-8 pointer-events-none flex justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-popover/90 backdrop-blur-xl border border-border shadow-[0_0_40px_rgba(0,0,0,0.1)] rounded-full px-5 py-2.5 flex items-center gap-3 overflow-hidden pointer-events-auto"
            >
              <span className="text-sm font-semibold text-foreground whitespace-nowrap flex items-center gap-2 pl-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                  {selectedChats.length}
                </div>
                Selected
              </span>
              <div className="w-px h-6 bg-border mx-1" />
              <div className="flex items-center gap-1">
                {selectedChats.length < filteredChats.length ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-9 rounded-full px-4 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Select All
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChats([])}
                    className="h-9 rounded-full px-4 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CheckSquare className="w-4 h-4 mr-2 opacity-50" />
                    Deselect All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBatchDelete}
                  className="h-9 rounded-full px-4 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedChats([])}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;
