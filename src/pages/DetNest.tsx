import React, { useRef, useEffect, useState } from 'react';
import {
  Plus, Bot, User, StopCircle, CornerDownLeft,
  Sparkles, Zap, FileJson, Table, Database,
  ChevronDown, Globe, ArrowUp, Brain, Search, Cog,
  CheckCircle2, Copy, ThumbsUp, ThumbsDown, RotateCcw,
  Share, MoreHorizontal, Loader2, FileText, ImageIcon, X,
  Clock, Pin, FileType, Check, Cpu, LayoutGrid, Download,
  FileDown, Server, Shuffle, PackageCheck, Lock, AlertTriangle,
  ExternalLink
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
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

// --- Helpers ---
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is data:image/...;base64,... — we send the full data URI
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Config ---
const models = [
  { value: 'Compound', label: 'Compound', badge: 'Web', color: 'text-purple-500' },
  { value: 'Compound Mini', label: 'Compound Mini', badge: 'Web', color: 'text-purple-500' },
  { value: 'Llama 4 Scout', label: 'Llama 4 Scout', badge: 'Default', secondaryBadge: 'Vision', color: 'text-purple-500' },
  { value: 'GPT OSS 120B', label: 'GPT OSS 120B', color: 'text-gray-500' },
  { value: 'GPT-4o', label: 'GPT-4o', secondaryBadge: 'Vision', color: 'text-blue-500' },
  { value: 'GPT-4o Mini', label: 'GPT-4o Mini', secondaryBadge: 'Vision', color: 'text-blue-500' },
];

const dataFormats = [
  { value: 'JSON', label: 'JSON', icon: FileJson, color: 'text-amber-500' },
  { value: 'CSV', label: 'CSV', icon: Table, color: 'text-green-500' },
  { value: 'SQL', label: 'SQL', icon: Database, color: 'text-blue-500' },
  { value: 'Parquet', label: 'Parquet', icon: Zap, color: 'text-indigo-500' },
];

const dataModes = [
  { value: 'Synthetic', label: 'Synthetic', icon: Sparkles },
  { value: 'Realistic', label: 'Realistic', icon: Globe },
  { value: 'Hybrid', label: 'Hybrid', icon: Brain },
];

const suggestions = [
  "Generate a user dataset",
  "Analyze data schema",
  "Create mock sales data"
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

// ===== DOWNLOAD MODAL =====
const DOWNLOAD_STEPS = [
  { icon: Search, label: 'Analyzing chat history...', color: 'text-blue-400' },
  { icon: Brain, label: 'Inferring schema & data types...', color: 'text-cyan-400' },
  { icon: Shuffle, label: 'Generating synthetic records...', color: 'text-indigo-400' },
  { icon: Server, label: 'Packaging dataset...', color: 'text-violet-400' },
  { icon: PackageCheck, label: 'Finalizing & compressing...', color: 'text-primary' },
];

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  chatId: string | null;
  dataFormat: string;
  dataMode: string;
  modelId: string;
  chatTitle?: string;
}

function DownloadModal({ open, onClose, chatId, dataFormat, dataMode, modelId, chatTitle }: DownloadModalProps) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [downloadData, setDownloadData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [rowsGenerated, setRowsGenerated] = useState(0);
  const [columnsCount, setColumnsCount] = useState(0);

  const steps = DOWNLOAD_STEPS;

  useEffect(() => {
    if (!open || !chatId) { setProgress(0); setStep(0); setDone(false); setError(null); setDownloadData(null); setSaveStatus(null); setSaveMessage(null); setRowsGenerated(0); setColumnsCount(0); return; }

    let cancelled = false;

    // Start visual progress
    let p = 0;
    const interval = setInterval(() => {
      if (cancelled) return;
      p += Math.random() * 1.2 + 0.3;
      if (p > 95) p = 95;
      setProgress(Math.min(p, 95));
      setStep(Math.min(Math.floor((Math.min(p, 99)) / 20), DOWNLOAD_STEPS.length - 1));
    }, 180);

    // Determine effective mode for compound models
    const isCompound = modelId === 'compound' || modelId === 'compound-mini';
    const effectiveMode = isCompound ? 'live-data' : dataMode.toLowerCase();

    api.post<{ success: boolean; data: any; format: string; rows_generated: number; save_status?: string; save_message?: string; dataset_id?: string }>(ENDPOINTS.CHAT_DOWNLOAD(chatId), {
      format: dataFormat.toLowerCase(),
      rows: 20,
      source: 'AI',
      data_mode: effectiveMode,
      model_id: modelId,
      dataset_name: chatTitle || 'Chat Dataset',
    }).then(res => {
      if (cancelled) return;
      clearInterval(interval);
      let rawData = (res as any).data;
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData) && 'data' in rawData && 'format' in rawData) {
        rawData = rawData.data;
      }
      setDownloadData(rawData);
      setSaveStatus((res as any).save_status || null);
      setSaveMessage((res as any).save_message || null);
      setRowsGenerated((res as any).rows_generated || 0);
      // Compute columns count from data
      try {
        if (Array.isArray(rawData) && rawData.length > 0) {
          setColumnsCount(Object.keys(rawData[0]).length);
        } else if (typeof rawData === 'string') {
          // For CSV, count header columns
          const firstLine = rawData.split('\n')[0];
          if (firstLine) setColumnsCount(firstLine.split(',').length);
        }
      } catch { setColumnsCount(0); }
      setProgress(100);
      setStep(DOWNLOAD_STEPS.length - 1);
      setDone(true);
    }).catch(err => {
      if (cancelled) return;
      clearInterval(interval);
      setError(err.message || 'Download failed');
      setProgress(0);
    });

    return () => { cancelled = true; clearInterval(interval); };
  }, [open, chatId, dataFormat, dataMode, modelId, chatTitle]);

  if (!open) return null;

  const handleDownload = () => {
    if (!downloadData) return;
    const fmt = dataFormat.toLowerCase();
    let content: BlobPart;
    let mimeType = 'application/octet-stream';
    let ext = fmt;

    if (fmt === 'json') {
      // JSON: downloadData is an array of objects
      content = Array.isArray(downloadData)
        ? JSON.stringify(downloadData, null, 2)
        : typeof downloadData === 'string'
          ? downloadData
          : JSON.stringify(downloadData, null, 2);
      mimeType = 'application/json';
    } else if (fmt === 'csv') {
      // CSV: downloadData is a CSV string from backend
      content = typeof downloadData === 'string' ? downloadData : String(downloadData);
      mimeType = 'text/csv';
    } else if (fmt === 'sql') {
      // SQL: downloadData is a SQL string from backend
      content = typeof downloadData === 'string' ? downloadData : String(downloadData);
      mimeType = 'application/sql';
    } else if (fmt === 'parquet') {
      // Parquet: downloadData is a base64-encoded string from backend
      try {
        const binaryStr = atob(downloadData as string);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        content = bytes;
      } catch {
        content = typeof downloadData === 'string' ? downloadData : JSON.stringify(downloadData);
        ext = 'json'; // fallback
      }
      mimeType = 'application/octet-stream';
    } else {
      content = typeof downloadData === 'string' ? downloadData : JSON.stringify(downloadData, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={!done ? undefined : onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileDown className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Generating Dataset</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{dataFormat} format</p>
            </div>
          </div>
          {done && (
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Animated Steps */}
        <div className="px-6 py-5 space-y-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step && !done;
            const isComplete = i < step || done;
            return (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i > step && !done ? 'opacity-50' : 'opacity-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isComplete ? 'bg-primary/10' : isActive ? 'bg-secondary/80 animate-pulse' : 'bg-secondary/30'
                  }`}>
                  {isComplete
                    ? <Check className="w-4 h-4 text-primary" />
                    : <Icon className={`w-4 h-4 transition-colors ${isActive ? s.color : 'text-muted-foreground/40'}`} />}
                </div>
                <p className={`text-xs font-semibold transition-colors ${isComplete ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}>{s.label}</p>
                {isActive && <Loader2 className="w-3. h-3.5 text-muted-foreground animate-spin ml-auto" />}
                {isComplete && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {done ? 'Complete' : 'Processing...'}
            </p>
            <p className="text-xs font-mono font-bold text-primary">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {done && (
            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Dataset Stats */}
              {(rowsGenerated > 0 || columnsCount > 0) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                  {rowsGenerated > 0 && (
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-lg font-bold text-primary">{rowsGenerated.toLocaleString()}</span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Rows</span>
                    </div>
                  )}
                  {rowsGenerated > 0 && columnsCount > 0 && <div className="w-px h-8 bg-border/40" />}
                  {columnsCount > 0 && (
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-lg font-bold text-primary">{columnsCount}</span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Columns</span>
                    </div>
                  )}
                  <div className="w-px h-8 bg-border/40" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-lg font-bold text-amber-500 uppercase">{dataFormat}</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Format</span>
                  </div>
                </div>
              )}

              {/* Save Status Message */}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">{saveMessage || 'Dataset saved to My Datasets.'}</span>
                </div>
              )}
              {saveStatus === 'size_exceeded' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">{saveMessage || 'Dataset exceeds 2MB limit.'}</span>
                </div>
              )}
              {saveStatus === 'limit_exceeded' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">{saveMessage || 'Dataset storage is full (10/10).'}</span>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              >
                <Download className="w-4 h-4" />
                Download {dataFormat} File
              </button>

              {/* Go to My Datasets (only if saved) */}
              {saveStatus === 'saved' && (
                <button
                  onClick={() => { onClose(); navigate('/app/datasets'); }}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Go to My Datasets
                </button>
              )}
            </div>
          )}
          {error && (
            <div className="mt-4 text-center text-sm text-red-500">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function DetNest() {
  const { messages, sendMessage, isLoading, loadingPhase, stopGeneration, dataFormat, setDataFormat, dataMode, setDataMode, model, setModel, currentChat } = useChat();
  const [input, setInput] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string; base64: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0;
  const currentModel = models.find(m => m.value === model) ?? models[0];
  const isCompoundModel = model === 'Compound' || model === 'Compound Mini';

  const modelIdMap: Record<string, string> = {
    'Compound': 'compound',
    'Compound Mini': 'compound-mini',
    'Llama 4 Scout': 'llama-scout-4',
    'GPT OSS 120B': 'gpt-oss-120b',
    'GPT-4o': 'gpt-4o',
    'GPT-4o Mini': 'gpt-4o-mini',
  };

  // Check if current model supports vision
  const isVisionModel = currentModel?.secondaryBadge === 'Vision';
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
    const currentImages = imageFiles.map(f => f.base64);
    setInput('');
    setImageFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(currentInput, [], {
      dataFormat,
      dataMode,
      images: isVisionModel ? currentImages : undefined,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: typeof imageFiles = [];
    for (const file of Array.from(files).slice(0, 4 - imageFiles.length)) {
      if (!file.type.startsWith('image/')) continue;
      const base64 = await fileToBase64(file);
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        base64,
      });
    }
    setImageFiles(prev => [...prev, ...newImages].slice(0, 4));
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --- Render Search Bar (CorpusAI Style) ---
  const renderSearchBar = () => (
    <div className="flex items-start gap-3 w-full max-w-2xl mx-auto">
      <div className="flex-1 bg-secondary/40 dark:bg-secondary/60 border border-border/60 dark:border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm group focus-within:shadow-md focus-within:border-border">
        {/* Image Previews */}
        {imageFiles.length > 0 && (
          <div className="flex gap-2 px-4 pt-3 flex-wrap">
            {imageFiles.map((img, idx) => (
              <div key={idx} className="relative group/img w-16 h-16 rounded-lg overflow-hidden border border-border/50">
                <img src={img.preview} alt="upload" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-2 px-4 py-3">
          {/* Hidden file input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => isVisionModel ? imageInputRef.current?.click() : undefined}
                  disabled={!isVisionModel}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 mb-1 active:scale-95",
                    isVisionModel
                      ? "text-muted-foreground hover:text-foreground hover:bg-background/80"
                      : "text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {isVisionModel ? 'Upload Image (max 4)' : 'Vision not supported by this model'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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

        {/* Preview Note for Compound modes only */}
        {isCompoundModel && (
          <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/5 border-t border-amber-500/10">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Preview only — full dataset uses live internet data during download.</span>
          </div>
        )}

        {/* Controls Row - Bottom */}
        <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
          <div className="flex items-center gap-0.5 p-1 rounded-full bg-background/40 border border-border/30 shadow-sm transition-all duration-200 hover:shadow-md">
            {/* Web Search Indicator — active ONLY for Compound models, purple color */}
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative cursor-default",
                      isCompoundModel
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "text-muted-foreground/40 bg-secondary/30"
                    )}>
                    <Globe className="w-3.5 h-3.5" />
                    {isCompoundModel && <Lock className="w-2 h-2 absolute -bottom-0.5 -right-0.5 text-purple-300" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isCompoundModel
                    ? 'Internet search enabled (Compound model)'
                    : 'Internet search not available'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-4 bg-border/50 mx-0.5" />

            {/* Data Generation Mode Selection (Database Icon) */}
            {isCompoundModel ? (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 bg-purple-500/10 relative cursor-default">
                      <Database className="w-3.5 h-3.5" />
                      <Lock className="w-2 h-2 absolute -bottom-0.5 -right-0.5 text-purple-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Live Data Mode (locked)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <DropdownMenuTrigger asChild>
                      <TooltipTrigger asChild>
                        <button className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-secondary active:scale-95",
                          dataMode === 'Synthetic'
                            ? "text-blue-500 bg-blue-500/10"
                            : dataMode === 'Realistic'
                              ? "text-emerald-500 bg-emerald-500/10"
                              : dataMode === 'Hybrid'
                                ? "text-orange-500 bg-orange-500/10"
                                : "text-muted-foreground hover:text-foreground"
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
            )}
          </div>

          {/* Data Format Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ml-1",
                "bg-background/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-background hover:shadow-sm active:scale-95"
              )}>
                <currentFormat.icon className={cn("w-3.5 h-3.5", currentFormat.color)} />
                <span>{currentFormat.label}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase opacity-70">Output Format</DropdownMenuLabel>
              {dataFormats.map(f => (
                <DropdownMenuItem key={f.value} onClick={() => setDataFormat(f.value as DataFormat)} className="gap-2">
                  <f.icon className={cn("w-3.5 h-3.5", f.color)} />
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
                    <span className={cn("text-sm", model === m.value ? "font-semibold text-foreground" : "text-muted-foreground")}>{m.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.badge && (
                      <span className={cn(
                        "p-1 rounded-full flex items-center justify-center",
                        m.badge === 'Web' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                          m.badge === 'Default' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                            "bg-muted text-muted-foreground"
                      )}>
                        {m.badge === 'Web' && <Globe className="w-3 h-3" />}
                        {m.badge === 'Default' && <Sparkles className="w-3 h-3" />}
                      </span>
                    )}
                    {m.secondaryBadge && (
                      <span className="p-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-3 h-3" />
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

      {/* Download Action Button (outside bar, right side) */}
      {hasMessages && (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 active:scale-90 group animate-in slide-in-from-right-4 fade-in duration-500 border-0"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Download Dataset</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
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

                {/* Image attachment indicator for user messages */}
                {msg.role === 'user' && msg.hasImages && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">Image attached</span>
                  </div>
                )}

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

      {/* ─── Download Modal ─── */}
      <DownloadModal
        open={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        chatId={currentChat?.id || null}
        dataFormat={dataFormat}
        dataMode={dataMode}
        modelId={modelIdMap[model] || 'llama-scout-4'}
        chatTitle={currentChat?.title}
      />
    </div>
  );
}
