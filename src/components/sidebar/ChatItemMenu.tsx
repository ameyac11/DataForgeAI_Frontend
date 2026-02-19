import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Star, StarOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ChatItemMenuProps {
    chatId: string;
    chatTitle: string;
    updatedAt: Date;
    isActive: boolean;
    isStarred: boolean;
    onSelect: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
    onDelete: (id: string) => void;
    onStar: (id: string) => void;
}

export function ChatItemMenu({
    chatId,
    chatTitle,
    updatedAt,
    isActive,
    isStarred,
    onSelect,
    onRename,
    onDelete,
    onStar
}: ChatItemMenuProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(chatTitle);

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRename(chatId, newTitle);
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsRenaming(false);
            setNewTitle(chatTitle);
        }
    };

    if (isRenaming) {
        return (
            <form onSubmit={handleRenameSubmit} className="px-2 py-1">
                <input
                    autoFocus
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => setIsRenaming(false)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-background border border-primary/50 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </form>
        );
    }

    return (
        <div
            className={cn(
                "group flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all",
                isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
            onClick={() => onSelect(chatId)}
        >
            <div className="flex-1 truncate">
                {chatTitle}
            </div>

            {/* Show menu trigger on hover or if active */}
            <div className={cn("opacity-0 group-hover:opacity-100 flex items-center", isActive && "opacity-100")}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-0.5 rounded-md hover:bg-sidebar-background/50 text-muted-foreground hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStar(chatId); }}>
                            {isStarred ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                            {isStarred ? 'Unstar' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => { e.stopPropagation(); onDelete(chatId); }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
