import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Pin, PinOff } from 'lucide-react';
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
    isPinned: boolean;
    onSelect: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
    onDelete: (id: string) => void;
    onPin: (id: string) => void;
}

export function ChatItemMenu({
    chatId,
    chatTitle,
    updatedAt,
    isActive,
    isPinned,
    onSelect,
    onRename,
    onDelete,
    onPin
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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div
            className={cn(
                "group relative flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all",
                isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
            onClick={() => onSelect(chatId)}
        >
            <div className="flex-1 flex flex-col min-w-0 pr-4">
                <span className="truncate">{chatTitle}</span>
                <span className="text-[10px] text-muted-foreground truncate">{formatDate(updatedAt)}</span>
            </div>

            {/* Always show pin if pinned */}
            {isPinned && !isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                    <Pin className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
                </div>
            )}

            {/* Show menu trigger on hover or if active */}
            <div className={cn(
                "opacity-0 group-hover:opacity-100 flex items-center bg-background/50 rounded-md backdrop-blur-sm transition-opacity",
                isActive && "opacity-100",
                "absolute right-2 top-1/2 -translate-y-1/2"
            )}>
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin(chatId); }}>
                            {isPinned ? <PinOff className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
                            {isPinned ? 'Unpin' : 'Pin'}
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
