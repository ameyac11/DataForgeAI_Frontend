import { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Globe,
  ChevronDown,
  FileJson,
  FileSpreadsheet,
  FileCode,
  Database,
  Lock,
  Loader2,
  Cpu,
  Plus,
  File,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, DataFormat, DataMode, Model, Attachment, Message } from '@/contexts/ChatContext';
import { tryExamples } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { showErrorToast } from '@/components/ui/error-toast';

const formatColors: Record<DataFormat, string> = {
  CSV: 'text-green-500',
  JSON: 'text-amber-500',
  SQL: 'text-blue-500',
  Parquet: 'text-purple-500',
};

const DetNest = () => {
  const { isAnonymous } = useAuth();
  const {
    messages,
    isLoading,
    loadingPhase,
    sendMessage
  } = useChat();

  const [input, setInput] = useState('');
  const [dataFormat, setDataFormat] = useState<DataFormat>('CSV');
  const [dataMode, setDataMode] = useState<DataMode>('Synthetic');
  const [model, setModel] = useState<Model>('Best');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const newAttachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: file.name,
        type: isImage ? 'IMG' :
          file.type.includes('pdf') ? 'PDF' :
            file.type.includes('doc') ? 'DOCX' :
              file.type.includes('sheet') || file.type.includes('csv') ? 'CSV' : 'FILE',
        status: 'uploading',
        file,
      };

      // Create preview for images
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev =>
            prev.map(a => a.id === newAttachment.id ? { ...a, preview: e.target?.result as string } : a)
          );
        };
        reader.readAsDataURL(file);
      }

      setAttachments(prev => [...prev, newAttachment]);

      // Simulate upload completion
      setTimeout(() => {
        setAttachments(prev =>
          prev.map(a => a.id === newAttachment.id ? { ...a, status: 'ready' } : a)
        );
      }, 1000 + Math.random() * 1000);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAttachMenu(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const currentInput = input;
    const currentAttachments = [...attachments];

    // Clear local state immediately
    setInput('');
    setAttachments([]);

    await sendMessage(currentInput, currentAttachments, {
      dataFormat,
      dataMode
    });
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    inputRef.current?.focus();
  };

  const formatIcons: Record<DataFormat, typeof FileSpreadsheet> = {
    CSV: FileSpreadsheet,
    JSON: FileJson,
    SQL: FileCode,
    Parquet: Database,
  };

  const FormatIcon = formatIcons[dataFormat];

  const getLoadingContent = () => {
    switch (loadingPhase) {
      case 'thinking':
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Thinking</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full typing-dot" />
            </div>
          </div>
        );
      case 'analyzing':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Analyzing requirements...</span>
          </div>
        );
      case 'generating':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Generating dataset...</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Attachment Preview Component
  const AttachmentPreview = ({ attachment, onRemove, compact = false }: {
    attachment: Attachment;
    onRemove?: () => void;
    compact?: boolean;
  }) => (
    <div
      className={cn(
        "flex items-center gap-2 bg-muted/80 rounded-lg border border-border",
        compact ? "px-2 py-1.5" : "px-3 py-2"
      )}
    >
      {attachment.preview ? (
        <div className="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
          <img src={attachment.preview} alt={attachment.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
          {attachment.status === 'uploading' ? (
            <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          ) : attachment.status === 'error' ? (
            <X className="w-4 h-4 text-destructive" />
          ) : (
            <File className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-foreground truncate max-w-[100px]">{attachment.name}</span>
        <span className="text-[10px] text-muted-foreground uppercase font-medium">{attachment.type}</span>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 p-0.5 hover:bg-accent rounded-full transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );

  const InputBar = ({ className, compact }: { className?: string; compact?: boolean }) => {
    const [localInput, setLocalInput] = useState(input);

    useEffect(() => {
      setLocalInput(input);
    }, [input]);

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalInput(e.target.value);
    };

    const handleBlur = () => {
      setInput(localInput);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setInput(localInput);
        setTimeout(() => handleSubmit(), 0);
      }
    };

    return (
      <div className={cn("w-full", className)}>
        {/* Attachment previews above search bar - ChatGPT style */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-1">
            {attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                onRemove={() => removeAttachment(attachment.id)}
              />
            ))}
          </div>
        )}

        {/* Main Search Bar - Compact when at bottom */}
        <div className="bg-card border border-border rounded-xl">
          <div className={cn(
            "flex items-start gap-2",
            compact ? "p-2.5" : "p-4"
          )}>
            {/* Plus button - opens menu upward */}
            {/* Direct file upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0",
                compact ? "mt-0" : "mt-0.5"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                handleFileUpload(e.target.files);
              }}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx,.csv,.xlsx,.xls,.txt"
            />

            {/* Text Input - Using local state to prevent re-render issues */}
            <input
              ref={inputRef}
              type="text"
              value={localInput}
              onChange={handleLocalChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className={cn(
                "flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm",
                compact ? "py-0.5" : "py-1.5"
              )}
            />
          </div>

          {/* Controls Row */}
          <div className={cn(
            "flex items-center justify-between",
            compact ? "px-2.5 pb-2.5" : "px-4 pb-4"
          )}>
            {/* Left side - Data Type Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <FormatIcon className={cn("w-4 h-4", formatColors[dataFormat])} />
                  <span className="text-xs font-medium">{dataFormat}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {(['CSV', 'JSON', 'SQL', 'Parquet'] as DataFormat[]).map((format) => {
                  const Icon = formatIcons[format];
                  return (
                    <DropdownMenuItem
                      key={format}
                      onClick={() => setDataFormat(format)}
                      className="gap-3"
                    >
                      <Icon className={cn("w-4 h-4", formatColors[format])} />
                      <span>{format}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Right side - Controls + Send */}
            <div className="flex items-center gap-1.5">
              {/* Model Selector - Icon only with Best option */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 rounded-lg",
                      model === 'Best'
                        ? "text-purple-500 bg-purple-500/10"
                        : "text-blue-400/60 hover:text-foreground"
                    )}
                  >
                    <Cpu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => setModel('Best')}>
                    <span className={cn(model === 'Best' && 'text-purple-500 font-medium')}>Best Model</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => !isAnonymous && setModel('GPT-4.1')}
                    disabled={isAnonymous}
                    className="gap-2"
                  >
                    {isAnonymous && <Lock className="w-3.5 h-3.5" />}
                    <span>GPT-4.1</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModel('GPT-4o')}>
                    <span>GPT-4o</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Data Source - Icon only */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Database className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {(['Synthetic', 'Hybrid', 'Realistic'] as DataMode[]).map((mode) => (
                    <DropdownMenuItem
                      key={mode}
                      onClick={() => setDataMode(mode)}
                    >
                      {mode}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Web Search - Shows "Web" text when enabled */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={cn(
                  "h-7 px-2 gap-1 rounded-lg",
                  webSearchEnabled
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="w-4 h-4" />
                {webSearchEnabled && <span className="text-xs">Web</span>}
              </Button>

              {/* Send Button */}
              <Button
                onClick={() => {
                  setInput(localInput);
                  setTimeout(() => handleSubmit(), 0);
                }}
                disabled={(!localInput.trim() && attachments.length === 0) || isLoading}
                size="sm"
                className="h-7 w-7 p-0 rounded-full bg-primary hover:bg-primary/90 ml-1"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Welcome to DataForgeAI
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate synthetic, realistic, or hybrid datasets with AI. Describe what you need and we'll create it.
              </p>
            </div>

            {/* Centered Input Bar */}
            <div className="w-full max-w-2xl mb-8">
              <InputBar />
            </div>

            {/* Try Examples */}
            {!input && (
              <div className="w-full max-w-2xl px-1">
                <div className="grid grid-cols-2 gap-3 w-full">
                  {tryExamples.slice(0, 4).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="group flex items-center gap-3 p-3 text-left rounded-xl bg-muted/20 border border-transparent hover:bg-muted/40 hover:border-primary/20 transition-all duration-300"
                    >
                      <span className="text-xs text-muted-foreground/80 group-hover:text-foreground transition-colors line-clamp-2 leading-relaxed px-1">
                        {example}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="space-y-8">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'user' ? (
                    // User message - right aligned with box
                    <div className="flex justify-end">
                      <div className="max-w-[80%]">
                        {/* Attachments above user message */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2 justify-end">
                            {message.attachments.map((attachment) => (
                              <AttachmentPreview key={attachment.id} attachment={attachment} compact />
                            ))}
                          </div>
                        )}
                        <div className="px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-sm">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant message - left aligned without box
                    <div className="flex justify-start">
                      <div className="max-w-[80%] space-y-3">
                        <p className="text-sm text-foreground leading-relaxed">
                          {message.content}
                        </p>

                        {/* Download button - always visible for demo */}
                        {message.showDownload && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download {dataFormat}
                          </Button>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 pt-1">
                          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading state */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    {getLoadingContent()}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Bar - Only when there are messages */}
      {hasMessages && (
        <div className="bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <InputBar compact />
          </div>
        </div>
      )}

      {/* Typing animation styles */}
      <style>{`
        .typing-dot {
          animation: typing-bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DetNest;
