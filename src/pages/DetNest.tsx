import React, { useRef, useEffect, useState } from 'react';
import {
  Plus, Bot, User, StopCircle, CornerDownLeft,
  Sparkles, Zap, FileJson, Table, Database,
  ChevronDown, Globe, ArrowUp, Brain, Search, Cog,
  CheckCircle2, Copy, ThumbsUp, ThumbsDown, RotateCcw,
  Share, MoreHorizontal, Loader2, FileText, ImageIcon, X,
  Clock, Pin, FileType, Check, Cpu, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useChat, DataFormat, DataMode } from '@/contexts/ChatContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Config ---
const models = [
  { value: 'Compound', label: 'Compound', badge: 'Web', color: 'text-green-500' },
  { value: 'Compound Mini', label: 'Compound Mini', badge: 'Web', color: 'text-green-500' },
  { value: 'Llama 4 Scout', label: 'Llama 4 Scout', badge: 'Default', secondaryBadge: 'Vision', color: 'text-purple-500' },
  { value: 'GPT OSS 120B', label: 'GPT OSS 120B', color: 'text-gray-500' },
  { value: 'GPT-4.1', label: 'GPT-4.1', color: 'text-blue-500' },
  { value: 'GPT-4o Mini', label: 'GPT-4o Mini', secondaryBadge: 'Vision', color: 'text-blue-500' },
];

const dataFormats = [
  { value: 'JSON', label: 'JSON', icon: FileJson },
  { value: 'CSV', label: 'CSV', icon: Table },
  { value: 'SQL', label: 'SQL', icon: Database },
  { value: 'Parquet', label: 'Parquet', icon: Zap },
];

const dataModes = [
  { value: 'Synthetic', label: 'Synthetic', icon: Sparkles },
  { value: 'Realistic', label: 'Realistic', icon: Brain },
  { value: 'Hybrid', label: 'Hybrid', icon: Globe },
];

const suggestions = [
  "Summarize my documents",
  "Key findings?",
  "Compare papers",
  "Explain simply"
];

// --- Components ---
const CodeBlock = ({ className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-border/60 bg-[#1a1a2e] dark:bg-[#0d0d1a]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] dark:bg-[#0a0a14] border-b border-border/40">
        <span className="text-xs font-medium text-primary/80 uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className={cn("text-gray-200 font-mono", className)} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

// Animated dots for thinking
const AnimatedDots = () => (
  <span className="inline-flex ml-1">
    <span className="animate-pulse duration-1000">.</span>
    <span className="animate-pulse duration-1000 delay-150">.</span>
    <span className="animate-pulse duration-1000 delay-300">.</span>
  </span>
);

// ===== MAIN COMPONENT =====
export default function DetNest() {
  const { messages, sendMessage, isLoading, loadingPhase, stopGeneration, dataFormat, setDataFormat, dataMode, setDataMode, model, setModel } = useChat();
  const [input, setInput] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;
  const currentModel = models.find(m => m.value === model) ?? models[0];
  const currentFormat = dataFormats.find(f => f.value === dataFormat) ?? dataFormats[0];
  const currentMode = dataModes.find(m => m.value === dataMode) ?? dataModes[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, loadingPhase]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(currentInput, [], { dataFormat, dataMode });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --- Render Search Bar (CorpusAI Style) ---
  const renderSearchBar = () => (
    <div className="bg-secondary/40 dark:bg-secondary/60 border border-border/60 dark:border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm group focus-within:shadow-md focus-within:border-border w-full max-w-2xl mx-auto">
      {/* Input Row */}
      <div className="flex items-end gap-2 px-4 py-3">
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all duration-200 shrink-0 mb-1 active:scale-95">
          <Plus className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/70 min-h-[44px] max-h-[160px] text-sm py-2.5 leading-relaxed"
          rows={1}
        />
      </div>

      {/* Controls Row - Bottom */}
      <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-background/40 border border-border/30 shadow-sm transition-all duration-200 hover:shadow-md">
          {/* Web Search Toggle */}
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95",
                    webSearchEnabled
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}>
                  <Globe className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {webSearchEnabled ? 'Web Search Enabled' : 'Search Web'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-4 bg-border/50 mx-0.5" />

          {/* Data Generation Mode Selection (Database Icon) */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <button className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95",
                      dataMode !== 'Synthetic' && "text-purple-600 dark:text-purple-400 bg-purple-500/10"
                    )}>
                      <Database className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <TooltipContent side="top" className="text-xs">Generation Mode: {currentMode.label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="start" className="w-[150px]">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase opacity-70">Generation Mode</DropdownMenuLabel>
              {dataModes.map(m => (
                <DropdownMenuItem key={m.value} onClick={() => setDataMode(m.value as DataMode)} className="gap-2">
                  <m.icon className="w-3.5 h-3.5" />
                  {m.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Data Format Selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ml-1",
              "bg-background/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-background hover:shadow-sm active:scale-95"
            )}>
              <currentFormat.icon className="w-3.5 h-3.5" />
              <span>{currentFormat.label}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[140px]">
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase opacity-70">Output Format</DropdownMenuLabel>
            {dataFormats.map(f => (
              <DropdownMenuItem key={f.value} onClick={() => setDataFormat(f.value as DataFormat)} className="gap-2">
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Model Selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
              "bg-background/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-background hover:shadow-sm active:scale-95"
            )}>
              <Cpu className="w-3.5 h-3.5" />
              <span>{currentModel.value}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            {models.map(m => (
              <DropdownMenuItem key={m.value} onClick={() => setModel(m.value as any)} className="justify-between py-2">
                <div className="flex items-center gap-2">
                  {/* {m.value === model && <div className="w-1.5 h-1.5 rounded-full bg-primary" />} */}
                  <span className={cn("text-sm", model === m.value ? "font-semibold text-foreground" : "text-muted-foreground")}>{m.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {m.badge && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1",
                      m.badge === 'Web' ? "bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20" :
                        m.badge === 'Default' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20" :
                          "bg-muted text-muted-foreground"
                    )}>
                      {m.badge === 'Web' && <Globe className="w-2.5 h-2.5" />}
                      {m.badge}
                    </span>
                  )}
                  {m.secondaryBadge && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-blue-500/20">
                      <ImageIcon className="w-2.5 h-2.5" />
                      {m.secondaryBadge}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send Button */}
        <Button
          onClick={() => isLoading ? stopGeneration() : handleSubmit()}
          disabled={!input.trim() && !isLoading}
          size="icon"
          className={cn(
            "rounded-full h-9 w-9 shrink-0 transition-all duration-300 shadow-sm ml-1",
            input.trim() || isLoading
              ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground opacity-50 shadow-none cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative bg-background">
      {/* ─── Messages Area ─── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto w-full scroll-smooth"
      >
        {!hasMessages ? (
          /* Hero / Empty State */
          <div className="min-h-full flex flex-col items-center justify-center px-4 -mt-10 animate-fade-in">
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome to DataForgeAI
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Generate synthetic datasets, transform files, or analyze data structures with AI-powered precision.
              </p>
            </div>

            <div className="w-full px-4">
              {renderSearchBar()}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl px-4">
              <span className="text-xs text-muted-foreground mr-1 self-center">Try:</span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 pb-24">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex flex-col gap-2", msg.role === 'user' ? 'items-end' : 'items-start')}>

                {/* Message Content */}
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-2 max-w-[95%]">
                    {/* AI Text - No Bubble */}
                    <div className="text-sm text-foreground/90 leading-relaxed overflow-hidden">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            if (inline) {
                              return <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.85em] border border-primary/20" {...props}>{children}</code>;
                            }
                            return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
                          },
                          table({ children, ...props }: any) {
                            return <div className="my-4 overflow-x-auto rounded-lg border-2 border-border"><table className="w-full text-sm border-collapse" {...props}>{children}</table></div>;
                          },
                          th({ children, ...props }: any) {
                            return <th className="px-4 py-2 text-left font-semibold text-foreground/90 bg-muted/50 border-b border-border" {...props}>{children}</th>;
                          },
                          td({ children, ...props }: any) {
                            return <td className="px-4 py-2 border-b border-border/50 text-foreground/80" {...props}>{children}</td>;
                          },
                          a({ children, href, ...props }: any) {
                            return <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Action Buttons */}
                    {!isLoading && (
                      <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Copy className="w-4 h-4" onClick={() => navigator.clipboard.writeText(msg.content)} /></button>
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><ThumbsUp className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><RotateCcw className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3 max-w-[85%]">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {loadingPhase === 'thinking' ? <span>Thinking<AnimatedDots /></span> : <span>Generating response<AnimatedDots /></span>}
                </span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* ─── Fixed Bottom Input (Active Chat) ─── */}
      {hasMessages && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pb-6 z-20">
          <div className="w-full max-w-3xl mx-auto">
            {renderSearchBar()}
            <p className="text-center text-[10px] text-muted-foreground/40 mt-2">DataForgeAI can make mistakes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
