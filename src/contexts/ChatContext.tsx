import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { api, streamSSE } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { useAuth } from '@/contexts/AuthContext';

// Types
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
    selectChat: (chatId: string) => void;
    deleteChat: (chatId: string) => void;
    renameChat: (chatId: string, newTitle: string) => void;
    starChat: (chatId: string) => void;
    pinChat: (chatId: string) => void;
    createNewChat: () => void;
    model: Model;
    setModel: (model: Model) => void;
    dataFormat: DataFormat;
    setDataFormat: (format: DataFormat) => void;
    dataMode: DataMode;
    setDataMode: (mode: DataMode) => void;
    stopGeneration: () => void;
    loadHistory: () => Promise<void>;
}

// Map model display names to backend model IDs
const MODEL_MAP: Record<Model, string> = {
    'Compound': 'compound',
    'Compound Mini': 'compound-mini',
    'Llama 4 Scout': 'llama-scout-4',
    'GPT OSS 120B': 'gpt-oss-120b',
    'GPT-4.1': 'gpt-4.1',
    'GPT-4o Mini': 'gpt-4o-mini',
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatHistoryItem[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
    const [model, setModel] = useState<Model>('Llama 4 Scout');
    const [dataFormat, setDataFormat] = useState<DataFormat>('JSON');
    const [dataMode, setDataMode] = useState<DataMode>('Synthetic');
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Load chat history from backend
    const loadHistory = useCallback(async () => {
        try {
            const res = await api.get<{ status: string; data: any[] }>(ENDPOINTS.CHAT_HISTORY);
            if (res.data) {
                setChats(res.data.map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    updatedAt: new Date(c.updatedAt),
                    starred: c.starred || false,
                    pinned: c.pinned || false,
                })));
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }, []);

    // Load history when user authenticates
    useEffect(() => {
        if (isAuthenticated) {
            loadHistory();
        } else {
            setChats([]);
            setMessages([]);
            setCurrentChatId(null);
        }
    }, [isAuthenticated, loadHistory]);

    const createNewChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
        setIsLoading(false);
        setLoadingPhase(null);
    }, []);

    const startNewChat = createNewChat;

    const selectChat = useCallback(async (chatId: string) => {
        setCurrentChatId(chatId);
        setIsLoading(false);
        setLoadingPhase(null);

        // Load messages for this chat
        try {
            const res = await api.get<{ status: string; data: any[] }>(ENDPOINTS.CHAT_MESSAGES(chatId));
            if (res.data) {
                setMessages(res.data.map((m: any) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    showDownload: m.showDownload,
                })));
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
            setMessages([]);
        }
    }, []);

    const deleteChat = useCallback(async (chatId: string) => {
        try {
            await api.delete(ENDPOINTS.CHAT_DELETE(chatId));
            setChats(prev => prev.filter(chat => chat.id !== chatId));
            if (currentChatId === chatId) {
                createNewChat();
            }
        } catch (err) {
            console.error('Failed to delete chat:', err);
        }
    }, [currentChatId, createNewChat]);

    const renameChat = useCallback(async (chatId: string, newTitle: string) => {
        try {
            await api.put(ENDPOINTS.CHAT_RENAME(chatId), { title: newTitle });
            setChats(prev => prev.map(chat =>
                chat.id === chatId ? { ...chat, title: newTitle } : chat
            ));
        } catch (err) {
            console.error('Failed to rename chat:', err);
        }
    }, []);

    const starChat = useCallback(async (chatId: string) => {
        try {
            const res = await api.put<{ status: string; data: { starred: boolean } }>(ENDPOINTS.CHAT_STAR(chatId));
            setChats(prev => prev.map(chat =>
                chat.id === chatId ? { ...chat, starred: res.data?.starred ?? !chat.starred } : chat
            ));
        } catch (err) {
            console.error('Failed to star chat:', err);
        }
    }, []);

    const pinChat = useCallback(async (chatId: string) => {
        try {
            const res = await api.put<{ status: string; data: { pinned: boolean } }>(ENDPOINTS.CHAT_PIN(chatId));
            setChats(prev => prev.map(chat =>
                chat.id === chatId ? { ...chat, pinned: res.data?.pinned ?? !chat.pinned } : chat
            ));
        } catch (err) {
            console.error('Failed to pin chat:', err);
        }
    }, []);

    const stopGeneration = useCallback(() => {
        abortController?.abort();
        setIsLoading(false);
        setLoadingPhase(null);
    }, [abortController]);

    const sendMessage = useCallback(async (content: string, attachments: Attachment[], options: {
        dataFormat: DataFormat;
        dataMode: DataMode;
    }) => {
        // 1. Create optimistic user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            attachments: attachments.length > 0 ? [...attachments] : undefined,
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setLoadingPhase('thinking');

        const controller = new AbortController();
        setAbortController(controller);

        try {
            // 2. Stream response from backend
            const modelId = MODEL_MAP[model] || 'llama-scout-4';
            let fullContent = '';
            let chatId = currentChatId;
            let showDownload = false;

            // Create placeholder assistant message for streaming
            const assistantMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: '',
                showDownload: false,
            }]);

            setLoadingPhase('generating');

            for await (const event of streamSSE(ENDPOINTS.CHAT_SEND, {
                chat_id: chatId,
                message: content,
                model: modelId,
                data_format: options.dataFormat,
                data_mode: options.dataMode,
            })) {
                if (controller.signal.aborted) break;

                if (event.type === 'chunk' && event.content) {
                    fullContent += event.content;
                    setMessages(prev => prev.map(m =>
                        m.id === assistantMsgId ? { ...m, content: fullContent } : m
                    ));
                } else if (event.type === 'done') {
                    chatId = event.chat_id || chatId;
                    showDownload = event.show_download || false;
                    setMessages(prev => prev.map(m =>
                        m.id === assistantMsgId ? { ...m, showDownload } : m
                    ));
                } else if (event.type === 'error') {
                    setMessages(prev => prev.map(m =>
                        m.id === assistantMsgId ? { ...m, content: `Error: ${event.content || 'Generation failed'}` } : m
                    ));
                }
            }

            // 3. Update chat ID + history
            if (chatId && chatId !== currentChatId) {
                setCurrentChatId(chatId);
                // Add to history
                const newHistoryItem: ChatHistoryItem = {
                    id: chatId,
                    title: content.length > 50 ? content.slice(0, 50) + '...' : content,
                    updatedAt: new Date(),
                    starred: false,
                    pinned: false,
                };
                setChats(prev => [newHistoryItem, ...prev]);
            }

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Send message failed:', err);
                // Add error message
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'assistant' && !last.content) {
                        return prev.map(m => m.id === last.id ? { ...m, content: `Error: ${err.message || 'Failed to get response'}` } : m);
                    }
                    return prev;
                });
            }
        } finally {
            setIsLoading(false);
            setLoadingPhase(null);
            setAbortController(null);
        }
    }, [currentChatId, model]);

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
            pinChat,
            createNewChat,
            model,
            setModel,
            dataFormat,
            setDataFormat,
            dataMode,
            setDataMode,
            stopGeneration,
            loadHistory,
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
