import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Box
} from 'lucide-react';
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
import { templateColumns } from '@/data/mockData';

type DataFormat = 'CSV' | 'JSON' | 'SQL' | 'Parquet';
type SourceType = 'AI' | 'Library';
type AutoFillMode = 'ai' | 'template';
type Model = 'Compound' | 'Compound Mini' | 'Llama 4 Scout' | 'GPT OSS 120B' | 'GPT-4.1' | 'GPT-4o Mini';

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
  { value: 'Compound', label: 'Compound', badge: 'Web', color: 'text-green-500' },
  { value: 'Compound Mini', label: 'Compound Mini', badge: 'Web', color: 'text-green-500' },
  { value: 'Llama 4 Scout', label: 'Llama 4 Scout', badge: 'Default', secondaryBadge: 'Vision', color: 'text-purple-500' },
  { value: 'GPT OSS 120B', label: 'GPT OSS 120B', color: 'text-gray-500' },
  { value: 'GPT-4.1', label: 'GPT-4.1', color: 'text-blue-500' },
  { value: 'GPT-4o Mini', label: 'GPT-4o Mini', secondaryBadge: 'Vision', color: 'text-blue-500' },
];

const templateExamples = [
  {
    id: 'user-profile',
    name: 'User Profile',
    description: 'Common fields for user information',
    icon: User,
    columns: templateColumns['User Profile']
  },
  {
    id: 'product-catalog',
    name: 'Product Catalog',
    description: 'Standard product listing fields',
    icon: ShoppingCart,
    columns: templateColumns['Product Catalog']
  },
  {
    id: 'financial-transaction',
    name: 'Financial Transaction',
    description: 'Banking and payment record fields',
    icon: CreditCard,
    columns: templateColumns['Financial Transaction']
  },
];

type TemplateExample = typeof templateExamples[0];

const popularTopics = [
  'e-commerce orders',
  'customer analytics',
  'employee records',
  'real estate listings',
  'student grades',
];

const CustomGenerator = () => {
  const { isAnonymous } = useAuth();
  const [columns, setColumns] = useState<Column[]>([
    { id: '1', name: 'first_name', dataType: 'First Name' },
    { id: '2', name: 'email', dataType: 'Email' },
    { id: '3', name: 'address', dataType: 'Address' },
  ]);
  const [rowCount, setRowCount] = useState(1000);
  const [dataFormat, setDataFormat] = useState<DataFormat>('JSON');
  const [sourceType, setSourceType] = useState<SourceType>('AI');
  const [specialPrompt, setSpecialPrompt] = useState('');
  const [model, setModel] = useState<Model>('Llama 4 Scout');
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [autoFillMode, setAutoFillMode] = useState<AutoFillMode>('ai');
  const [autoFillTopic, setAutoFillTopic] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateExample | null>(null);
  const [showDataTypeModal, setShowDataTypeModal] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Personal');
  const [dataTypeSearch, setDataTypeSearch] = useState('');

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [context, setContext] = useState('');

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

  const applyTemplate = (template: typeof templateExamples[0]) => {
    setColumns(template.columns.map((col, i) => ({
      id: Date.now().toString() + i,
      name: col.name,
      dataType: col.dataType,
    })));
    setSelectedTemplate(null);
    setShowAutoFillModal(false);
  };

  const generatePreviewData = () => {
    const mockValues: Record<string, string[]> = {
      'First Name': ['John', 'Sarah', 'Mike', 'Emily', 'David'],
      'Last Name': ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'],
      'Email': ['john@example.com', 'sarah@mail.com', 'mike@test.com', 'emily@demo.com', 'david@sample.com'],
      'Address': ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm Blvd', '654 Cedar Ln'],
      'Phone': ['555-0101', '555-0102', '555-0103', '555-0104', '555-0105'],
      'Company': ['Acme Inc', 'TechCorp', 'DataSoft', 'CloudBase', 'NetWorks'],
    };

    return Array.from({ length: 5 }, (_, rowIndex) =>
      columns.map(col => {
        const values = mockValues[col.dataType] || ['Sample data'];
        return values[rowIndex % values.length];
      })
    );
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
                  "min-h-[100px] text-xs bg-background/50 border-primary/20 focus-visible:ring-primary/30 resize-none transition-all",
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
                                "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
                                m.badge === 'Web' && "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
                                m.badge === 'Default' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              )}>
                                {m.badge}
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

            {/* Row Count */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity (Rows)</label>
              <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/50">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setRowCount(Math.max(1, rowCount - 100))}>-</Button>
                <Input
                  type="number"
                  value={rowCount}
                  onChange={e => setRowCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 0)))}
                  className="h-9 border-none text-center bg-transparent text-sm font-mono p-0 focus-visible:ring-0 shadow-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setRowCount(Math.min(10000, rowCount + 100))}>+</Button>
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
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                      dataFormat === fmt
                        ? "bg-primary/5 border-primary/30 text-primary shadow-sm"
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background/50">
          <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-primary" />
                Schema Definition
              </h2>
              <Button
                onClick={() => setShowAutoFillModal(true)}
                variant="ghost"
                className="h-8 gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Fill Columns
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[32px_2fr_1.5fr_40px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground bg-secondary/30 rounded-lg border border-border/40 uppercase tracking-wider">
                <div className="flex justify-center text-center">#</div>
                <div className="pl-3">Column Name</div>
                <div className="pl-3">Data Type</div>
                <div className="text-right pr-2">Actions</div>
              </div>

              {columns.map((col, idx) => (
                <div
                  key={col.id}
                  className="group grid grid-cols-[32px_2fr_1.5fr_40px] items-center gap-4 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all animate-fadeIn"
                >
                  <div className="flex items-center justify-center text-muted-foreground/50 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
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
                      className="w-full h-9 px-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/30 flex items-center justify-between text-sm transition-all group-hover:shadow-inner"
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
                </div>
              ))}

              <button
                onClick={addColumn}
                className="w-full py-3 rounded-xl border border-dashed border-border/50 text-muted-foreground/70 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium mt-4"
              >
                <Plus className="w-4 h-4" />
                Add New Column
              </button>
            </div>


            <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur-sm sticky bottom-0 z-10">
              <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(true)}
                  className="h-11 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Data
                </Button>
                <Button
                  className="h-11 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-lg shadow-purple-500/20 w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Fill Modal */}
      <Dialog open={showAutoFillModal} onOpenChange={setShowAutoFillModal}>
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
                <p className="text-xs text-muted-foreground mt-0.5">Smartly populate your dataset structure</p>
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
                  <div className="font-bold text-xs">AI Agent</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 px-1 truncate font-medium">Generate with AI</div>
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
                  <div className="font-bold text-xs">Templates</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 px-1 truncate font-medium">Industry Standards</div>
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
                      className="min-h-[100px] pl-10 text-xs bg-background/50 border-primary/20 focus-visible:ring-primary/30 rounded-xl resize-none py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1">Quick Starters</p>
                    <div className="flex flex-wrap gap-1.5">
                      {popularTopics.map(topic => (
                        <button
                          key={topic}
                          onClick={() => setAutoFillTopic(topic)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 hover:border-primary/20 transition-all font-medium"
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
                  {templateExamples.map(t => {
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
                          <div className={cn("font-bold text-xs transition-colors", isSelected ? "text-primary" : "group-hover:text-primary")}>{t.name}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">{t.description}</div>
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
                className="h-10 rounded-lg hover:bg-secondary/40 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                className="h-10 rounded-lg font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                disabled={autoFillMode === 'ai' ? !autoFillTopic : !selectedTemplate}
                onClick={() => {
                  if (autoFillMode === 'ai') {
                    setShowAutoFillModal(false);
                  } else if (selectedTemplate) {
                    applyTemplate(selectedTemplate);
                  }
                }}
              >
                {autoFillMode === 'ai' ? 'Magic Generate' : 'Apply Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Type Modal */}
      <Dialog open={!!showDataTypeModal} onOpenChange={() => setShowDataTypeModal(null)}>
        <DialogContent className="max-w-2xl glass-panel border-border/50 h-[500px] flex flex-col p-0 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-border/40 flex items-center gap-3 bg-secondary/10">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <input
              placeholder="Search 50+ data types..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/50"
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
                      "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
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
                      <span className="text-xs font-semibold group-hover:text-primary transition-colors">{type}</span>
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
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl glass-panel border-border/40 p-0 overflow-hidden flex flex-col max-h-[85vh] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
          <div className="p-5 border-b border-border/40 flex items-center justify-between bg-secondary/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight">Data Preview</h2>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest font-semibold mt-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Showing First 5 Rows & 5 Columns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-background/50 border border-border/40 shadow-sm gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">Columns</span>
                  <span className="text-xs font-mono font-bold text-primary">{columns.length}</span>
                </div>
                <div className="w-px h-6 bg-border/40" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">Rows</span>
                  <span className="text-xs font-mono font-bold">{rowCount}</span>
                </div>
                <div className="w-px h-6 bg-border/40" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">Format</span>
                  <span className="text-xs font-mono font-bold text-amber-500">{dataFormat}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-background/20">
            <div className="rounded-xl border border-border/40 overflow-hidden shadow-sm bg-background/50">
              <table className="w-full border-collapse">
                <thead className="bg-secondary/40 border-b border-border/40">
                  <tr>
                    {columns.slice(0, 5).map((col) => (
                      <th key={col.id} className="px-5 py-3 text-left">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{col.name || 'untitled'}</span>
                          <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded bg-background/50 w-fit border border-border/20", dataTypeColors[col.dataType])}>
                            {col.dataType}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {generatePreviewData().map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-primary/5 transition-colors group">
                      {row.slice(0, 5).map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-5 py-3.5 text-xs text-foreground/80 font-mono whitespace-nowrap">
                          <span className="group-hover:text-primary transition-colors">{cell}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(columns.length > 5 || rowCount > 5) && (
              <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-center gap-2">
                <LayoutTemplate className="w-3.5 h-3.5 text-orange-500" />
                <p className="text-[10px] font-bold text-orange-600/80 uppercase tracking-widest text-center">
                  Truncated for preview — full dataset contains {columns.length} columns and {rowCount} rows
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border/40 bg-secondary/5 flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowPreviewModal(false)}
              className="h-10 rounded-lg text-xs font-bold hover:bg-secondary/40"
            >
              Close Preview
            </Button>
            <Button
              className="h-10 rounded-lg font-bold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-6"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomGenerator;
