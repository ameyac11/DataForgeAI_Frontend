import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  Plus,
  Trash2,
  Eye,
  Download,
  Search,
  Sparkles,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Database,
  Cpu,
  X,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  Zap,
  Lock,
  Check,
  GripVertical,
  User,
  ShoppingCart,
  CreditCard,
  Settings2,
  Brain,
  MapPin,
  Briefcase,
  Globe,
  Landmark,
  FileText,
  Box,
  Shuffle,
  Server,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { useTheme } from '@/contexts/ThemeContext';


type DataFormat = 'CSV' | 'JSON' | 'SQL' | 'Parquet';
type SourceType = 'AI' | 'Library';
type AutoFillMode = 'ai' | 'template';
type DataMode = 'Synthetic' | 'Realistic' | 'Hybrid';
type Model = 'Compound' | 'Compound Mini' | 'Llama 4 Scout' | 'GPT OSS 120B' | 'GPT-4o' | 'GPT-4o Mini' | 'Kimi K2';

interface Column {
  id: string;
  name: string;
  dataType: string;
}

const formatConfig: Record<DataFormat, { icon: any; color: string; label: string; description: string }> = {
  CSV: { icon: FileSpreadsheet, color: 'text-green-500', label: 'CSV', description: 'Spreadsheet format' },
  JSON: { icon: FileJson, color: 'text-amber-500', label: 'JSON', description: 'Structured data' },
  SQL: { icon: FileCode, color: 'text-blue-500', label: 'SQL', description: 'Database queries' },
  Parquet: { icon: Zap, color: 'text-purple-500', label: 'Parquet', description: 'Big data format' },
};

const dataTypeColors: Record<string, string> = {
  'String': 'text-slate-400',
  'Number': 'text-blue-400',
  'Boolean': 'text-orange-400',
  'Date': 'text-pink-400',
  'DateTime': 'text-pink-500',
  'Time': 'text-pink-300',
  'Email': 'text-green-400',
  'Phone': 'text-cyan-400',
  'URL': 'text-indigo-400',
  'UUID': 'text-violet-400',
  'First Name': 'text-emerald-400',
  'Last Name': 'text-emerald-500',
  'Full Name': 'text-emerald-400',
  'Age': 'text-amber-400',
  'Gender': 'text-rose-400',
  'Username': 'text-teal-400',
  'Address': 'text-cyan-500',
  'City': 'text-cyan-400',
  'State': 'text-cyan-300',
  'Country': 'text-cyan-500',
  'Zip Code': 'text-cyan-400',
  'Company': 'text-blue-500',
  'Job Title': 'text-blue-400',
  'Department': 'text-blue-300',
  'Salary': 'text-green-500',
  'Credit Card': 'text-yellow-400',
  'Price': 'text-green-400',
  'Paragraph': 'text-gray-400',
  'Sentence': 'text-gray-300',
};

const models = [
  { value: 'Compound', label: 'Compound', badge: 'Web', color: 'text-purple-500' },
  { value: 'Compound Mini', label: 'Compound Mini', badge: 'Web', color: 'text-purple-500' },
  { value: 'Llama 4 Scout', label: 'Llama 4 Scout', badge: 'Default', secondaryBadge: 'Vision', color: 'text-purple-500' },
  { value: 'GPT OSS 120B', label: 'GPT OSS 120B', color: 'text-gray-500' },
  { value: 'Kimi K2', label: 'Kimi K2', color: 'text-teal-500' },
  { value: 'GPT-4o', label: 'GPT-4o', secondaryBadge: 'Vision', color: 'text-blue-500' },
  { value: 'GPT-4o Mini', label: 'GPT-4o Mini', secondaryBadge: 'Vision', color: 'text-blue-500' },
];

const iconMap: Record<string, any> = {
  'user-profile': User,
  'product-catalog': ShoppingCart,
  'financial-transaction': CreditCard,
};

interface TemplateExample {
  id: string;
  name: string;
  description: string;
  icon: any;
  columns: Column[];
}


const popularTopics = [
  'e-commerce orders',
  'customer analytics',
  'employee records',
  'real estate listings',
  'student grades',
];

// Hardcoded auto-fill column templates (module-level so they never change)
const BUILT_IN_TEMPLATES: TemplateExample[] = [
  {
    id: 'user-profile',
    name: 'User Profiles',
    description: 'Standard user database with personal & account info',
    icon: User,
    columns: [
      { id: '1', name: 'user_id', dataType: 'Number' },
      { id: '2', name: 'first_name', dataType: 'First Name' },
      { id: '3', name: 'last_name', dataType: 'Last Name' },
      { id: '4', name: 'email', dataType: 'Email' },
      { id: '5', name: 'phone', dataType: 'Phone' },
      { id: '6', name: 'city', dataType: 'City' },
      { id: '7', name: 'signup_date', dataType: 'Date' },
    ],
  },
  {
    id: 'product-catalog',
    name: 'Product Catalog',
    description: 'E-commerce product inventory with pricing',
    icon: ShoppingCart,
    columns: [
      { id: '1', name: 'product_id', dataType: 'Number' },
      { id: '2', name: 'product_name', dataType: 'String' },
      { id: '3', name: 'category', dataType: 'String' },
      { id: '4', name: 'price', dataType: 'Price' },
      { id: '5', name: 'description', dataType: 'Sentence' },
      { id: '6', name: 'in_stock', dataType: 'Boolean' },
    ],
  },
  {
    id: 'financial-transaction',
    name: 'Financial Transactions',
    description: 'Banking & payment transaction records',
    icon: CreditCard,
    columns: [
      { id: '1', name: 'transaction_id', dataType: 'UUID' },
      { id: '2', name: 'account_holder', dataType: 'Full Name' },
      { id: '3', name: 'amount', dataType: 'Currency' },
      { id: '4', name: 'transaction_date', dataType: 'DateTime' },
      { id: '5', name: 'credit_card', dataType: 'Credit Card' },
      { id: '6', name: 'country', dataType: 'Country' },
      { id: '7', name: 'status', dataType: 'Boolean' },
    ],
  },
];

const ReorderItem = ({ index, col, updateColumn, removeColumn, setShowDataTypeModal, dataTypeColors, theme }: any) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={col}
      layout
      dragListener={false}
      dragControls={controls}
      className={cn(
        "group grid grid-cols-[32px_2fr_1.5fr_40px] items-center gap-4 p-3 rounded-xl transition-all cursor-default border",
        theme === 'dark'
          ? "bg-zinc-900/40 border-white/10 hover:border-primary/40 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-primary/5"
          : "bg-card border-border/50 hover:border-primary/30 hover:shadow-sm"
      )}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="flex items-center justify-center cursor-grab active:cursor-grabbing relative w-full h-full"
      >
        <span className="text-xs font-bold text-muted-foreground/60 transition-opacity group-hover:opacity-0 absolute">{index + 1}</span>
        <GripVertical className="w-4 h-4 text-muted-foreground/50 transition-opacity opacity-0 group-hover:opacity-100 absolute" />
      </div>

      <div>
        <Input
          value={col.name}
          onChange={e => updateColumn(col.id, 'name', e.target.value)}
          className="h-9 bg-transparent border-transparent hover:bg-secondary/50 focus:bg-background focus:border-primary/20 transition-all font-medium"
          placeholder="column_name"
        />
      </div>

      <div>
        <button
          onClick={() => setShowDataTypeModal(col.id)}
          className="w-full h-10 px-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/30 flex items-center justify-between text-base transition-all group-hover:shadow-inner"
        >
          <span className={dataTypeColors[col.dataType]}>{col.dataType}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => removeColumn(col.id)}
          className="p-2 rounded-lg text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
};

const CustomGenerator = () => {
  const { isAnonymous } = useAuth();
  const { theme } = useTheme();
  const [columns, setColumns] = useState<Column[]>([
    { id: '1', name: 'first_name', dataType: 'First Name' },
    { id: '2', name: 'email', dataType: 'Email' },
    { id: '3', name: 'address', dataType: 'Address' },
  ]);
  const [rowCount, setRowCount] = useState(50);
  const [dataFormat, setDataFormat] = useState<DataFormat>('JSON');
  const [sourceType, setSourceType] = useState<SourceType>('AI');
  const [specialPrompt, setSpecialPrompt] = useState('');
  const [model, setModel] = useState<Model>('Llama 4 Scout');
  const [dataMode, setDataMode] = useState<DataMode>('Synthetic');
  const isCompoundModel = model === 'Compound' || model === 'Compound Mini';
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [autoFillMode, setAutoFillMode] = useState<AutoFillMode>('ai');
  const [autoFillTopic, setAutoFillTopic] = useState('');
  const [templates, setTemplates] = useState<TemplateExample[]>(BUILT_IN_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateExample | null>(null);
  const [autoFillLoading, setAutoFillLoading] = useState(false);

  const [showDataTypeModal, setShowDataTypeModal] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Personal');
  const [dataTypeSearch, setDataTypeSearch] = useState('');

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [context, setContext] = useState('');

  const navigate = useNavigate();

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState(0);
  const [genDone, setGenDone] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [genRowsGenerated, setGenRowsGenerated] = useState(0);

  const genSteps = [
    { icon: Search, label: 'Analyzing schema & configuration...', color: 'text-blue-400' },
    { icon: Brain, label: 'Initializing model & field correlations...', color: 'text-cyan-400' },
    { icon: Shuffle, label: `Generating ${rowCount.toLocaleString()} records...`, color: 'text-indigo-400' },
    { icon: Server, label: 'Optimizing data distributions...', color: 'text-violet-400' },
    { icon: PackageCheck, label: `Formatting output to ${dataFormat}...`, color: 'text-primary' },
  ];

  // Visual-only progress bar for when API call is in progress
  React.useEffect(() => {
    if (!isGenerating) {
      if (!genDone) {
        setGenProgress(0);
        setGenStep(0);
      }
      return;
    }
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 1.5 + 0.3;
      if (p >= 95) {
        // cap at 95% — the API completion will push to 100%
        p = 95;
        clearInterval(interval);
      }
      setGenProgress(p);
      setGenStep(Math.min(Math.floor((Math.min(p, 99)) / 20), 4));
    }, 150);
    return () => clearInterval(interval);
  }, [isGenerating, rowCount, dataFormat, genDone]);

  const handleGenerate = async () => {
    if (genDone && generatedData) {
      // Download the generated data with proper format handling
      const fmt = dataFormat.toLowerCase();
      let content: BlobPart;
      let mimeType = 'application/octet-stream';
      let ext = fmt;

      if (fmt === 'json') {
        // JSON: generatedData is an array of objects
        content = Array.isArray(generatedData)
          ? JSON.stringify(generatedData, null, 2)
          : typeof generatedData === 'string'
            ? generatedData
            : JSON.stringify(generatedData, null, 2);
        mimeType = 'application/json';
      } else if (fmt === 'csv') {
        // CSV: generatedData is a CSV string from the backend
        content = typeof generatedData === 'string' ? generatedData : String(generatedData);
        mimeType = 'text/csv';
      } else if (fmt === 'sql') {
        // SQL: generatedData is a SQL string from the backend
        content = typeof generatedData === 'string' ? generatedData : String(generatedData);
        mimeType = 'application/sql';
      } else if (fmt === 'parquet') {
        // Parquet: generatedData is a base64-encoded string from the backend
        try {
          const binaryStr = atob(generatedData as string);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
          content = bytes;
        } catch {
          content = typeof generatedData === 'string' ? generatedData : JSON.stringify(generatedData);
          ext = 'json'; // fallback
        }
        mimeType = 'application/octet-stream';
      } else {
        content = typeof generatedData === 'string' ? generatedData : JSON.stringify(generatedData, null, 2);
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      setGenDone(false);
      setGenProgress(0);
      setGenStep(0);
      setGeneratedData(null);
      return;
    }

    setIsGenerating(true);
    setGenDone(false);
    setGeneratedData(null);
    setSaveStatus(null);
    setSaveMessage(null);
    setGenRowsGenerated(0);

    try {
      const modelMap: Record<string, string> = {
        'Compound': 'compound',
        'Compound Mini': 'compound-mini',
        'Llama 4 Scout': 'llama-scout-4',
        'GPT OSS 120B': 'gpt-oss-120b',
        'GPT-4o': 'gpt-4o',
        'GPT-4o Mini': 'gpt-4o-mini',
        'Kimi K2': 'kimi-k2',
      };

      const res = await api.post<{ success: boolean; data: any; format: string; rows_generated: number; save_status?: string; save_message?: string }>(ENDPOINTS.GENERATE_DOWNLOAD, {
        columns: columns.map(c => ({ name: c.name, type: c.dataType })),
        rows: rowCount,
        format: dataFormat.toLowerCase(),
        source: sourceType,
        context: context || specialPrompt,
        model_id: sourceType === 'AI' ? modelMap[model] : undefined,
        data_mode: isCompoundModel ? 'live-data' : dataMode.toLowerCase(),
        dataset_name: context?.slice(0, 100) || specialPrompt?.slice(0, 100) || 'Generated Dataset',
      });

      // res is the parsed JSON body: { success, data, format, rows_generated, error }
      // res.data is the actual formatted content
      let rawData = (res as any).data;
      // Guard against any remaining wrapper layers
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData) && 'data' in rawData && 'format' in rawData) {
        rawData = rawData.data;
      }
      setGeneratedData(rawData);
      setSaveStatus((res as any).save_status || null);
      setSaveMessage((res as any).save_message || null);
      setGenRowsGenerated((res as any).rows_generated || rowCount);
      setGenProgress(100);
      setGenStep(genSteps.length - 1);
      setGenDone(true);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setGenDone(false);
      setGenProgress(0);
      setGenStep(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const dataTypeCategories: Record<string, string[]> = {
    'Personal': ['First Name', 'Last Name', 'Full Name', 'Email', 'Phone', 'Age', 'Gender', 'Username'],
    'Location': ['Address', 'City', 'State', 'Country', 'Zip Code', 'Latitude', 'Longitude', 'Street'],
    'Business': ['Company', 'Job Title', 'Department', 'Employee ID', 'Salary', 'Revenue'],
    'Internet': ['URL', 'IP Address', 'Domain', 'Password', 'MAC Address'],
    'Finance': ['Credit Card', 'IBAN', 'Bitcoin Address', 'Currency', 'Price'],
    'Content': ['Paragraph', 'Sentence', 'Word', 'UUID', 'Slug', 'Description'],
    'Basic': ['String', 'Number', 'Boolean', 'Date', 'DateTime', 'Time'],
  };

  const categoryIcons: Record<string, any> = {
    'Personal': User,
    'Location': MapPin,
    'Business': Briefcase,
    'Internet': Globe,
    'Finance': Landmark,
    'Content': FileText,
    'Basic': Box,
  };

  const allDataTypes = Object.values(dataTypeCategories).flat();

  const filteredDataTypes = dataTypeSearch
    ? allDataTypes.filter(type => type.toLowerCase().includes(dataTypeSearch.toLowerCase()))
    : dataTypeCategories[selectedCategory] || [];

  const addColumn = () => {
    if (columns.length >= 10) return;
    setColumns([
      ...columns,
      { id: Date.now().toString(), name: '', dataType: 'String' },
    ]);
  };

  const removeColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const updateColumn = (id: string, field: 'name' | 'dataType', value: string) => {
    setColumns(columns.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const moveColumn = (id: string, direction: 'up' | 'down') => {
    const index = columns.findIndex(c => c.id === id);
    if (direction === 'up' && index > 0) {
      const newColumns = [...columns];
      [newColumns[index - 1], newColumns[index]] = [newColumns[index], newColumns[index - 1]];
      setColumns(newColumns);
    } else if (direction === 'down' && index < columns.length - 1) {
      const newColumns = [...columns];
      [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
      setColumns(newColumns);
    }
  };

  const applyTemplate = (template: TemplateExample) => {
    setColumns(template.columns.map((col, i) => ({
      id: Date.now().toString() + i,
      name: col.name,
      dataType: col.dataType,
    })));
    setSelectedTemplate(null);
    setShowAutoFillModal(false);
  };

  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadPreviewData = async () => {
    setPreviewLoading(true);
    try {
      const modelMap: Record<string, string> = {
        'Compound': 'compound',
        'Compound Mini': 'compound-mini',
        'Llama 4 Scout': 'llama-scout-4',
        'GPT OSS 120B': 'gpt-oss-120b',
        'GPT-4o': 'gpt-4o',
        'GPT-4o Mini': 'gpt-4o-mini',
        'Kimi K2': 'kimi-k2',
      };

      const res = await api.post<{ status: string; data: any }>(ENDPOINTS.GENERATE_PREVIEW, {
        columns: columns.map(c => ({ name: c.name, type: c.dataType })),
        source: sourceType,
        context: context || specialPrompt,
        model_id: sourceType === 'AI' ? modelMap[model] : undefined,
        data_mode: dataMode.toLowerCase(),
      });

      // Convert response data to 2D array for the table
      if (Array.isArray(res.data)) {
        const rows = res.data.map((row: any) =>
          columns.map(col => String(row[col.name] ?? ''))
        );
        setPreviewData(rows);
      } else {
        setPreviewData([]);
      }
    } catch (err) {
      console.error('Preview failed:', err);
      // Fallback to simple placeholders
      setPreviewData(
        Array.from({ length: 5 }, () => columns.map(() => 'N/A'))
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">



      <div className="flex-1 flex overflow-hidden">

        {/* 2. Vertical Configuration Sidebar */}
        <div className="w-96 border-r border-border/40 bg-secondary/10 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
              <Settings2 className="w-4 h-4" />
              Configuration
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Context for AI */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Context for AI Generation
              </label>
              <Textarea
                placeholder="Describe the overall context or theme of the data you want to generate (e.g., 'E-commerce platform user data for testing checkout flow')."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={sourceType === 'Library'}
                className={cn(
                  "min-h-[100px] text-xs resize-none transition-all placeholder:text-muted-foreground/50",
                  theme === 'dark'
                    ? "bg-slate-900/40 border-white/10 focus-visible:ring-primary/40"
                    : "bg-background/50 border-primary/20 focus-visible:ring-primary/30",
                  sourceType === 'Library' && "opacity-50 cursor-not-allowed bg-secondary/20"
                )}
              />
            </div>

            {/* Source & Model */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</label>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 bg-secondary/50 p-1 rounded-lg border border-border/50">
                  <button
                    onClick={() => setSourceType('AI')}
                    className={cn(
                      "px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2",
                      sourceType === 'AI' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI
                  </button>
                  <button
                    onClick={() => setSourceType('Library')}
                    className={cn(
                      "px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2",
                      sourceType === 'Library' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Fast
                  </button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      disabled={sourceType === 'Library'}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/30 text-sm font-semibold transition-all shadow-sm group",
                        sourceType === 'Library' && "opacity-50 cursor-not-allowed hover:bg-background/50 hover:border-border/50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Cpu className={cn("w-4 h-4 transition-colors", sourceType !== 'Library' ? "text-primary/70 group-hover:text-primary" : "text-muted-foreground")} />
                        <span className={cn(sourceType !== 'Library' ? "text-foreground/90" : "text-muted-foreground")}>{model}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[280px] p-2 glass-panel border-border/40 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                    {models.map((m) => {
                      const isSelected = model === m.value;
                      return (
                        <DropdownMenuItem
                          key={m.value}
                          onClick={() => setModel(m.value as Model)}
                          className={cn(
                            "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all mb-1 last:mb-0 outline-none",
                            isSelected
                              ? "bg-primary/5 text-primary border-primary/20"
                              : "hover:bg-secondary/50 focus:bg-secondary/50"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isSelected ? "bg-primary animate-pulse" : "bg-muted-foreground/30 group-hover:bg-primary/50"
                            )} />
                            <span className={cn(
                              "text-sm truncate transition-colors",
                              isSelected ? "font-bold text-primary" : "text-muted-foreground group-hover:text-foreground font-medium"
                            )}>
                              {m.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {m.badge && (
                              <span className={cn(
                                "p-1 rounded-md flex items-center justify-center",
                                m.badge === 'Web' && "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
                                m.badge === 'Default' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              )}>
                                {m.badge === 'Web' && <Globe className="w-3 h-3" />}
                                {m.badge === 'Default' && <Sparkles className="w-3 h-3" />}
                              </span>
                            )}
                            {(m as any).secondaryBadge && (
                              <span className="p-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center border border-blue-500/20">
                                <Eye className="w-3 h-3" />
                              </span>
                            )}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-primary/10 p-0.5 rounded-full"
                              >
                                <Check className="w-3 h-3 text-primary stroke-[3]" />
                              </motion.div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Generation Mode — only in AI mode */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Generation Mode
              </label>
              {isCompoundModel ? (
                <div className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border",
                  "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
                )}>
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-bold">Live Data</span>
                  <Lock className="w-3 h-3 ml-1 opacity-60" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'Synthetic' as DataMode, label: 'Synthetic', icon: Sparkles, desc: 'Fictional data' },
                    { value: 'Realistic' as DataMode, label: 'Realistic', icon: Globe, desc: 'Looks real' },
                    { value: 'Hybrid' as DataMode, label: 'Hybrid', icon: Brain, desc: 'Mixed approach' },
                  ]).map(mode => (
                    <button
                      key={mode.value}
                      onClick={() => setDataMode(mode.value)}
                      disabled={sourceType === 'Library'}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all",
                        sourceType === 'Library' && "opacity-40 cursor-not-allowed",
                        dataMode === mode.value && sourceType === 'AI'
                          ? mode.value === 'Synthetic'
                            ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400"
                            : mode.value === 'Realistic'
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400"
                          : theme === 'dark'
                            ? "bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-zinc-900/60 text-muted-foreground"
                            : "bg-background/30 border-border/40 hover:bg-background/50 hover:border-border/60 text-muted-foreground"
                      )}
                    >
                      <mode.icon className={cn(
                        "w-4 h-4",
                        dataMode === mode.value && sourceType === 'AI'
                          ? mode.value === 'Synthetic' ? "text-blue-500" : mode.value === 'Realistic' ? "text-emerald-500" : "text-orange-500"
                          : "opacity-70"
                      )} />
                      <span className="text-[10px] font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Web Search Indicator — only for Compound models */}
            {sourceType === 'AI' && isCompoundModel && (
              <div className={cn(
                "flex items-center gap-2 p-2.5 rounded-xl border transition-all",
                "bg-purple-500/5 border-purple-500/20"
              )}>
                <div className="relative flex items-center justify-center w-6 h-6">
                  <Globe className={cn(
                    "w-4 h-4 animate-pulse",
                    "text-purple-500"
                  )} />
                  <span className={cn(
                    "absolute inset-0 rounded-full border animate-ping",
                    "border-purple-500/30"
                  )} style={{ animationDuration: '2s' }} />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold",
                  "text-purple-600 dark:text-purple-400"
                )}>
                  Internet data will be used during generation
                </span>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity (Rows)</label>
              <div className={cn(
                "flex items-center gap-1 p-1 rounded-xl border",
                theme === 'dark' ? "bg-zinc-900/40 border-white/10" : "bg-background/50 border-border/50"
              )}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setRowCount(Math.max(10, rowCount - 10))}>-</Button>
                <Input
                  type="number"
                  value={rowCount}
                  onChange={e => setRowCount(parseInt(e.target.value) || 10)}
                  onBlur={() => setRowCount(Math.max(10, Math.min(200, rowCount)))}
                  className="h-9 border-none text-center bg-transparent text-sm font-mono p-0 focus-visible:ring-0 shadow-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setRowCount(Math.min(200, rowCount + 10))}>+</Button>
              </div>
            </div>

            {/* Format */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(formatConfig) as [DataFormat, typeof formatConfig.JSON][]).map(([fmt, cfg]) => (
                  <button
                    key={fmt}
                    onClick={() => setDataFormat(fmt)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all shadow-sm",
                      dataFormat === fmt
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : theme === 'dark'
                          ? "bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-zinc-900/60 text-muted-foreground"
                          : "bg-background/30 border-border/40 hover:bg-background/50 hover:border-border/60 text-muted-foreground"
                    )}
                  >
                    <cfg.icon className={cn("w-5 h-5", dataFormat === fmt ? cfg.color : "opacity-70")} />
                    <span className="text-xs font-medium">{fmt}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>


        </div>

        {/* 3. Main Schema Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
          <motion.div layoutScroll className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                  Schema Definition
                  <span className="text-sm font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-md ml-1">{columns.length} columns</span>
                </h2>
                <Button
                  onClick={() => setShowAutoFillModal(true)}
                  variant="outline"
                  className="h-8 gap-2 text-xs font-semibold border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Fill Columns
                </Button>
              </div>

              <div className="space-y-3">
                <div className={cn(
                  "grid grid-cols-[32px_2fr_1.5fr_40px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground rounded-lg border uppercase tracking-wider",
                  theme === 'dark' ? "bg-zinc-900/60 border-white/10" : "bg-secondary/30 border-border/40"
                )}>
                  <div className="flex justify-center text-center">#</div>
                  <div className="pl-3">Column Name</div>
                  <div className="pl-3">Data Type</div>
                  <div className="text-right pr-2"></div>
                </div>

                <Reorder.Group as="ul" axis="y" values={columns} onReorder={setColumns} className="flex flex-col gap-3 list-none p-0 m-0">
                  {columns.map((col, index) => (
                    <ReorderItem
                      key={col.id}
                      index={index}
                      col={col}
                      updateColumn={updateColumn}
                      removeColumn={removeColumn}
                      setShowDataTypeModal={setShowDataTypeModal}
                      dataTypeColors={dataTypeColors}
                      theme={theme}
                    />
                  ))}
                </Reorder.Group>

                <button
                  onClick={addColumn}
                  className={cn(
                    "w-full py-4 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-sm font-bold mt-4",
                    "text-muted-foreground/70 hover:text-primary hover:border-primary/40 hover:bg-primary/5",
                    theme === 'dark' ? "border-white/20" : "border-border/50"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add New Column
                </button>
              </div>

            </div>
          </motion.div>

          {/* Action Buttons - outside the scroll container */}
          <div className="p-4 border-t border-border/40 bg-background">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Preview Note for Compound modes only */}
              {isCompoundModel && sourceType === 'AI' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>Dataset will be generated using live internet data during download.</span>
                </div>
              )}
              <motion.div
                animate={isGenerating || genDone ? { y: -2 } : { y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <Button
                  variant="outline"
                  onClick={async () => { await loadPreviewData(); setShowPreviewModal(true); }}
                  disabled={isGenerating || previewLoading}
                  className="h-11 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary w-full"
                >
                  {previewLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {previewLoading ? 'Loading Preview...' : 'Preview Data'}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={cn(
                    "h-11 shadow-lg transition-all duration-500 w-full relative group overflow-hidden",
                    genDone
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-purple-500/20"
                  )}
                >
                  {genDone ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Download {dataFormat} File
                    </>
                  ) : (
                    <>
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2 transition-transform group-hover:-translate-y-0.5" />
                      )}
                      {isGenerating ? 'Generating...' : 'Generate Dataset'}
                    </>
                  )}
                </Button>
              </motion.div>

              <AnimatePresence>
                {(isGenerating || genDone) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-1 space-y-4">
                      {/* Progress Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {React.createElement(genSteps[genStep].icon, {
                            className: cn("w-4 h-4 animate-pulse", genSteps[genStep].color)
                          })}
                          <span className="text-xs font-bold text-foreground/90">
                            {genDone ? 'Dataset ready for download' : genSteps[genStep].label}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-primary">
                          {Math.round(genProgress)}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-secondary/40 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full"
                          animate={{ width: `${genProgress}%` }}
                          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                        />
                      </div>

                      {/* Status Grid (mini versions of the steps) */}
                      <div className="grid grid-cols-5 gap-2">
                        {genSteps.map((s, i) => {
                          const Icon = s.icon;
                          const isActive = i === genStep && !genDone;
                          const isComplete = i < genStep || genDone;
                          return (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500",
                                isComplete ? "bg-primary/10 text-primary" : isActive ? "bg-secondary/80 animate-pulse text-foreground" : "bg-secondary/20 text-muted-foreground/30"
                              )}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className={cn(
                                "h-0.5 w-full rounded-full transition-all duration-500",
                                isComplete ? "bg-primary" : isActive ? "bg-primary/30" : "bg-border/20"
                              )} />
                            </div>
                          );
                        })}
                      </div>

                      {/* Save Status & Navigation (shown when done) */}
                      {genDone && (
                        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                              <span className="text-xs font-medium">{saveMessage || 'Dataset storage is full (10/10). Download will continue without saving.'}</span>
                            </div>
                          )}
                          {saveStatus === 'saved' && (
                            <button
                              onClick={() => navigate('/app/datasets')}
                              className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Go to My Datasets
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div >

      {/* Auto Fill Modal */}
      < Dialog open={showAutoFillModal} onOpenChange={setShowAutoFillModal} >
        <DialogContent className="max-w-lg glass-panel p-0 overflow-hidden border-border/50 shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  Auto-Fill Schema
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Smartly populate your dataset structure</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => {
                  setAutoFillMode('ai');
                  setSelectedTemplate(null);
                }}
                className={cn(
                  "relative group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 text-center overflow-hidden",
                  autoFillMode === 'ai'
                    ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    : "border-border/40 bg-secondary/10 hover:border-primary/20 hover:bg-secondary/20"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-lg transition-all duration-300",
                  autoFillMode === 'ai' ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-muted-foreground group-hover:text-primary"
                )}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">AI Agent</div>
                  <div className="text-xs text-muted-foreground mt-0.5 px-1 truncate font-medium">Generate with AI</div>
                </div>
                {autoFillMode === 'ai' && (
                  <motion.div
                    layoutId="active-mode"
                    className="absolute inset-0 bg-primary/5 -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </button>

              <button
                onClick={() => {
                  setAutoFillMode('template');
                }}
                className={cn(
                  "relative group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 text-center overflow-hidden",
                  autoFillMode === 'template'
                    ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.08)]"
                    : "border-border/40 bg-secondary/10 hover:border-primary/20 hover:bg-secondary/20"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-lg transition-all duration-300",
                  autoFillMode === 'template' ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-muted-foreground group-hover:text-primary"
                )}>
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Templates</div>
                  <div className="text-xs text-muted-foreground mt-0.5 px-1 truncate font-medium">Industry Standards</div>
                </div>
                {autoFillMode === 'template' && (
                  <motion.div
                    layoutId="active-mode"
                    className="absolute inset-0 bg-primary/5 -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {autoFillMode === 'ai' ? (
                <motion.div
                  key="ai-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <div className="absolute left-3 top-3.5">
                      <Brain className="w-4 h-4 text-primary/40" />
                    </div>
                    <Textarea
                      placeholder="e.g. 'Create a medical records database for a private clinic...'"
                      value={autoFillTopic}
                      onChange={e => setAutoFillTopic(e.target.value)}
                      className="min-h-[100px] pl-10 text-sm bg-background/50 border-primary/20 focus-visible:ring-primary/30 rounded-xl resize-none py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Quick Starters</p>
                    <div className="flex flex-wrap gap-1.5">
                      {popularTopics.map(topic => (
                        <button
                          key={topic}
                          onClick={() => setAutoFillTopic(topic)}
                          className="px-3 py-1.5 rounded-lg text-sm bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 hover:border-primary/20 transition-all font-medium"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="template-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[250px] pr-1.5 -mr-1.5 custom-scrollbar"
                >
                  {templates.map(t => {
                    const isSelected = selectedTemplate?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={cn(
                          "group w-full p-3 rounded-xl transition-all text-left flex items-center gap-3 border",
                          isSelected
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "bg-secondary/10 hover:bg-primary/5 border-border/40 hover:border-primary/20"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-sm",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                        )}>
                          <t.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className={cn("font-bold text-sm transition-colors", isSelected ? "text-primary" : "group-hover:text-primary")}>{t.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>
                        </div>
                        <div className={cn("transition-all", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0")}>
                          <ChevronRight className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setShowAutoFillModal(false)}
                className="h-10 rounded-lg hover:bg-secondary/40 text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                className="h-10 rounded-lg font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                disabled={autoFillLoading || (autoFillMode === 'ai' ? !autoFillTopic : !selectedTemplate)}
                onClick={async () => {
                  if (autoFillMode === 'ai') {
                    // Call backend AI column suggestion
                    setAutoFillLoading(true);
                    try {
                      const allTypes = Object.values(dataTypeCategories).flat();
                      const res = await api.post<{ status: string; data: any }>(ENDPOINTS.GENERATE_COLUMNS, {
                        topic: autoFillTopic,
                        available_types: allTypes,
                      });
                      if (res.data && Array.isArray(res.data)) {
                        setColumns(res.data.map((col: any, i: number) => ({
                          id: Date.now().toString() + i,
                          name: col.name || col.column_name || `col_${i}`,
                          dataType: col.type || col.dataType || 'String',
                        })));
                      }
                    } catch (err) {
                      console.error('AI column suggestion failed:', err);
                    } finally {
                      setAutoFillLoading(false);
                    }
                    setShowAutoFillModal(false);
                  } else if (selectedTemplate) {
                    applyTemplate(selectedTemplate);
                  }
                }}
              >
                {autoFillLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : autoFillMode === 'ai' ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Magic Generate
                  </>
                ) : 'Apply Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog >

      {/* Data Type Modal */}
      < Dialog open={!!showDataTypeModal} onOpenChange={() => setShowDataTypeModal(null)}>
        <DialogContent className="max-w-2xl glass-panel border-border/50 h-[500px] flex flex-col p-0 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-border/40 flex items-center gap-3 bg-secondary/10">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <input
              placeholder="Search 50+ data types..."
              className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-muted-foreground/50"
              value={dataTypeSearch}
              onChange={e => setDataTypeSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-44 border-r border-border/40 bg-secondary/5 p-3 space-y-1 overflow-y-auto custom-scrollbar">
              {Object.entries(dataTypeCategories).map(([cat, types]) => {
                const Icon = categoryIcons[cat] || Box;
                const isActive = selectedCategory === cat && !dataTypeSearch;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDataTypeSearch('');
                    }}
                    className={cn(
                      "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-category"
                        className="absolute inset-0 bg-primary/10 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                    <span className="relative z-10">{cat}</span>
                    <span className="ml-auto text-[10px] opacity-40 font-mono">{types.length}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-background/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory + dataTypeSearch}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-2 gap-2.5"
                >
                  {filteredDataTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        if (showDataTypeModal) updateColumn(showDataTypeModal, 'dataType', type);
                        setShowDataTypeModal(null);
                      }}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-primary/5 hover:border-primary/30 transition-all text-left shadow-sm hover:shadow-md"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full transition-transform group-hover:scale-125",
                        dataTypeColors[type]?.replace('text-', 'bg-') || 'bg-slate-400'
                      )} />
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">{type}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 text-primary" />
                    </button>
                  ))}
                  {filteredDataTypes.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                      <Search className="w-8 h-8 mb-3" />
                      <p className="text-sm font-medium">No data types found</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog >

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-5xl bg-background border-border/40 p-0 overflow-hidden flex flex-col shadow-2xl rounded-2xl w-fit min-w-[800px]">
          <div className="p-6 border-b border-border/40 flex items-center justify-between bg-background">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg tracking-tight">Data Preview</h2>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest font-bold mt-1">
                  <Sparkles className="w-3 h-3" />
                  Showing First 5 Rows & 5 Columns
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center px-4 py-2 rounded-xl border border-border/40 shadow-sm gap-6 bg-background">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Columns</span>
                  <span className="text-sm font-bold text-primary">{columns.length}</span>
                </div>
                <div className="w-px h-8 bg-border/40" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Rows</span>
                  <span className="text-sm font-bold">{rowCount}</span>
                </div>
                <div className="w-px h-8 bg-border/40" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Format</span>
                  <span className="text-sm font-bold text-amber-500">{dataFormat}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-secondary/5">
            <div className="rounded-2xl border border-border/30 overflow-hidden shadow-sm bg-background">
              <table className="w-full border-collapse">
                <thead className="bg-background border-b border-border/30">
                  <tr>
                    {columns.slice(0, 5).map((col) => (
                      <th key={col.id} className="px-6 py-4 text-left">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-foreground uppercase tracking-widest">{col.name || 'untitled'}</span>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md bg-transparent w-fit", dataTypeColors[col.dataType])}>
                            {col.dataType}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {previewLoading ? (
                    <tr>
                      <td colSpan={Math.min(columns.length, 5)} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Loading preview...
                      </td>
                    </tr>
                  ) : previewData.length > 0 ? (
                    previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-primary/5 transition-colors group">
                        {row.slice(0, 5).map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-5 py-3.5 text-xs text-foreground/80 font-mono whitespace-nowrap">
                            <span className="group-hover:text-primary transition-colors">{cell}</span>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={Math.min(columns.length, 5)} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        No preview data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {(columns.length > 5 || rowCount > 5) && (
              <div className="mt-6 p-4 rounded-xl bg-orange-50 border-2 border-orange-100 flex items-center justify-center gap-2 dark:bg-orange-500/5 dark:border-orange-500/20">
                <LayoutTemplate className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest text-center">
                  Truncated for preview — full dataset contains {columns.length} columns and {rowCount} rows
                </p>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-border/40 bg-background flex items-center justify-end gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowPreviewModal(false)}
              className="h-11 rounded-xl text-sm font-bold hover:bg-secondary"
            >
              Close Preview
            </Button>
            <Button
              className="h-11 rounded-xl font-bold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-8"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample
            </Button>
          </div>
        </DialogContent>
      </Dialog >
    </div >
  );
};

export default CustomGenerator;
