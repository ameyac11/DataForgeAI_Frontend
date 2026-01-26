import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pin, Pencil, Trash2, Check, X, Clock, Calendar, ChevronDown } from 'lucide-react';
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

interface ChatItem {
  id: string;
  name: string;
  timestamp: Date;
  pinned: boolean;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const { isAnonymous } = useAuth();
  const { chats: contextChats } = useChat();
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<ChatItem[]>(
    contextChats.map(c => ({
      id: c.id,
      name: c.name,
      timestamp: c.date ? new Date(c.date) : new Date(),
      pinned: c.pinned || false
    }))
  );
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const filteredChats = chats
    .filter(chat => {
      const matchesSearch = chat.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'pinned' && chat.pinned);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  // Group chats by date
  const groupedChats = filteredChats.reduce((groups, chat) => {
    const now = new Date();
    const chatDate = chat.timestamp;
    const diffDays = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24));

    let groupName: string;
    if (diffDays === 0) groupName = 'Today';
    else if (diffDays === 1) groupName = 'Yesterday';
    else if (diffDays < 7) groupName = 'This Week';
    else if (diffDays < 30) groupName = 'This Month';
    else groupName = 'Older';

    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(chat);
    return groups;
  }, {} as Record<string, ChatItem[]>);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  const startRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handlePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(chats.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(chats.filter(c => c.id !== id));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">History</h1>
          </div>
          <p className="text-sm text-muted-foreground">
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
                      onClick={() => editingId !== chat.id && navigate(`/app/detnest?chat=${chat.id}`)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border border-border bg-card",
                        "hover:bg-accent/50 hover:border-accent transition-all cursor-pointer group",
                        editingId === chat.id && "bg-accent/30"
                      )}
                    >
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
                            {chat.name}
                          </h3>
                        )}
                      </div>

                      {/* Time */}
                      {editingId !== chat.id && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(chat.timestamp)}
                        </span>
                      )}

                      {/* Direct Action Buttons */}
                      {editingId !== chat.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => startRename(chat.id, chat.name, e)}
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
    </div>
  );
};

export default HistoryPage;
