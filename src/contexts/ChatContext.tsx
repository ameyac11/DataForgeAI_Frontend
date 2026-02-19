import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Types from DetNest.tsx (need to be shared or redefined)
// Ideally these should be in a types file, but for now I'll define them here
// to match the existing usage.
export type DataFormat = 'CSV' | 'JSON' | 'SQL' | 'Parquet';
export type DataMode = 'Synthetic' | 'Hybrid' | 'Realistic';
export type Model = 'Compound' | 'Compound Mini' | 'Llama 4 Scout' | 'GPT OSS 120B' | 'GPT-4.1' | 'GPT-4o Mini';
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

interface ChatHistoryItem {
    id: string;
    title: string;
    updatedAt: Date;
    starred: boolean;
    pinned?: boolean;
}

interface ChatContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    chats: ChatHistoryItem[];
    setChats: React.Dispatch<React.SetStateAction<ChatHistoryItem[]>>;
    currentChat: ChatHistoryItem | null;
    isLoading: boolean;
    loadingPhase: LoadingPhase;
    startNewChat: () => void;
    sendMessage: (content: string, attachments: Attachment[], options: {
        dataFormat: DataFormat;
        dataMode: DataMode;
    }) => Promise<void>;
    // New methods
    selectChat: (chatId: string) => void;
    deleteChat: (chatId: string) => void;
    renameChat: (chatId: string, newTitle: string) => void;
    starChat: (chatId: string) => void;
    createNewChat: () => void;
    model: Model;
    setModel: (model: Model) => void;
    dataFormat: DataFormat;
    setDataFormat: (format: DataFormat) => void;
    dataMode: DataMode;
    setDataMode: (mode: DataMode) => void;
    stopGeneration: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatHistoryItem[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
    const [model, setModel] = useState<Model>('Llama 4 Scout');
    const [dataFormat, setDataFormat] = useState<DataFormat>('JSON');
    const [dataMode, setDataMode] = useState<DataMode>('Synthetic');

    const createNewChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
        setIsLoading(false);
        setLoadingPhase(null);
    }, []);

    const startNewChat = createNewChat;

    const selectChat = useCallback((chatId: string) => {
        setCurrentChatId(chatId);
        // In a real app, you would load messages for this chat here
        // For now, we just clear messages if it's a new ID to simulate switching
        // or keep them if we had state management for multiple chats
        setMessages([]);
    }, []);

    const deleteChat = useCallback((chatId: string) => {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
            createNewChat();
        }
    }, [currentChatId, createNewChat]);

    const renameChat = useCallback((chatId: string, newTitle: string) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
        ));
    }, []);

    const starChat = useCallback((chatId: string) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, starred: !chat.starred } : chat
        ));
    }, []);

    const stopGeneration = useCallback(() => {
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
                title: content.length > 30 ? content.slice(0, 30) + '...' : content,
                updatedAt: new Date(),
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

    const currentChat = chats.find(c => c.id === currentChatId) || null;

    return (
        <ChatContext.Provider value={{
            messages,
            setMessages,
            chats,
            setChats,
            currentChat,

            isLoading,
            loadingPhase,
            startNewChat,
            sendMessage,
            selectChat,
            deleteChat,
            renameChat,
            starChat,
            createNewChat,
            model,
            setModel,
            dataFormat,
            setDataFormat,
            dataMode,
            setDataMode,
            stopGeneration
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
