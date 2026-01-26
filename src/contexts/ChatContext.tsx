import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Types from DetNest.tsx (need to be shared or redefined)
// Ideally these should be in a types file, but for now I'll define them here
// to match the existing usage.
export type DataFormat = 'CSV' | 'JSON' | 'SQL' | 'Parquet';
export type DataMode = 'Synthetic' | 'Hybrid' | 'Realistic';
export type Model = 'Best' | 'GPT-4.1' | 'GPT-4o';
export type LoadingPhase = 'thinking' | 'analyzing' | 'generating' | null;

export interface Attachment {
    id: string;
    name: string;
    type: string;
    status: 'uploading' | 'ready' | 'error';
    file?: File;
    preview?: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    attachments?: Attachment[];
    showDownload?: boolean;
}

export interface ChatHistoryItem {
    id: string;
    name: string;
    date: string;
    starred: boolean;
    pinned?: boolean;
}

interface ChatContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    chats: ChatHistoryItem[];
    setChats: React.Dispatch<React.SetStateAction<ChatHistoryItem[]>>;
    currentChatId: string | null;
    isLoading: boolean;
    loadingPhase: LoadingPhase;
    startNewChat: () => void;
    sendMessage: (content: string, attachments: Attachment[], options: {
        dataFormat: DataFormat;
        dataMode: DataMode;
    }) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatHistoryItem[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);

    const startNewChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
        setIsLoading(false);
        setLoadingPhase(null);
    }, []);

    const sendMessage = useCallback(async (content: string, attachments: Attachment[], options: {
        dataFormat: DataFormat;
        dataMode: DataMode;
    }) => {

        // 1. Create User Message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            attachments: attachments.length > 0 ? [...attachments] : undefined,
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // 2. Handle New Chat History Creation (ONLY on first message)
        if (!currentChatId) {
            const newChatId = Date.now().toString();
            setCurrentChatId(newChatId);

            const newHistoryItem: ChatHistoryItem = {
                id: newChatId,
                name: content.length > 30 ? content.slice(0, 30) + '...' : content,
                date: 'Just now',
                starred: false,
                pinned: false
            };
            setChats(prev => [newHistoryItem, ...prev]);
        }


        // 3. Simulate AI Response
        setLoadingPhase('thinking');
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoadingPhase('analyzing');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingPhase('generating');
        await new Promise(resolve => setTimeout(resolve, 1200));

        const wantsDownload = content.toLowerCase().includes('download') ||
            content.toLowerCase().includes('file') ||
            content.toLowerCase().includes('export');

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I've generated a ${options.dataMode.toLowerCase()} dataset based on your request. The ${options.dataFormat} file contains 1,000 rows with the specifications you mentioned.${wantsDownload ? '\n\nYour dataset is ready for download.' : ''}`,
            showDownload: true,
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        setLoadingPhase(null);
    }, [currentChatId]);

    return (
        <ChatContext.Provider value={{
            messages,
            setMessages,
            chats,
            setChats,
            currentChatId,
            isLoading,
            loadingPhase,
            startNewChat,
            sendMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
