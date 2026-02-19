import React, { useState } from 'react';
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
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
type Model = 'GPT-4.1' | 'GPT-4o';

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
  const [model, setModel] = useState<Model>('GPT-4o');
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [autoFillMode, setAutoFillMode] = useState<AutoFillMode>('ai');
  const [autoFillTopic, setAutoFillTopic] = useState('');
  const [showDataTypeModal, setShowDataTypeModal] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Personal');
  const [dataTypeSearch, setDataTypeSearch] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const dataTypeCategories: Record<string, string[]> = {
    'Personal': ['First Name', 'Last Name', 'Full Name', 'Email', 'Phone', 'Age', 'Gender', 'Username'],
    'Location': ['Address', 'City', 'State', 'Country', 'Zip Code', 'Latitude', 'Longitude', 'Street'],
    'Business': ['Company', 'Job Title', 'Department', 'Employee ID', 'Salary', 'Revenue'],
    'Internet': ['URL', 'IP Address', 'Domain', 'Password', 'MAC Address'],
    'Finance': ['Credit Card', 'IBAN', 'Bitcoin Address', 'Currency', 'Price'],
    'Content': ['Paragraph', 'Sentence', 'Word', 'UUID', 'Slug', 'Description'],
    'Basic': ['String', 'Number', 'Boolean', 'Date', 'DateTime', 'Time'],
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

      {/* 1. Page Header (Static) */}
      <div className="flex-none px-6 py-4 flex items-center justify-between border-b border-border/40 bg-background/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Custom Generator</h1>
            <p className="text-xs text-muted-foreground">Design, configure, and generate synthetic datasets.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Global Actions can go here if needed */}
        </div>
      </div>

      {/* 2. Sticky Configuration Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-sm transition-all pb-4 pt-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-secondary/20 border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

            {/* Left: Source & Model */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Generation Source</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-background/50 p-1.5 rounded-xl border border-border/50 shadow-inner">
                  <button
                    onClick={() => setSourceType('AI')}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5",
                      sourceType === 'AI' ? "bg-background shadow-md text-foreground border border-border/20" : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    )}
                  >
                    <Sparkles className={cn("w-4 h-4", sourceType === 'AI' ? "text-purple-500" : "")} />
                    AI Powered
                  </button>
                  <button
                    onClick={() => setSourceType('Library')}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5",
                      sourceType === 'Library' ? "bg-background shadow-md text-foreground border border-border/20" : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    )}
                  >
                    <Zap className={cn("w-4 h-4", sourceType === 'Library' ? "text-orange-500" : "")} />
                    Fast Gen
                  </button>
                </div>

                {sourceType === 'AI' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-[46px] flex items-center gap-3 px-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 text-sm font-medium transition-all shadow-sm">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span>{model}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px]">
                      <DropdownMenuItem onClick={() => setModel('GPT-4o')} className="py-2.5">
                        <span className="flex-1">GPT-4o</span>
                        {model === 'GPT-4o' && <Check className="w-4 h-4 text-primary" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setModel('GPT-4.1')} className="py-2.5">
                        <span className="flex-1">GPT-4.1</span>
                        {model === 'GPT-4.1' && <Check className="w-4 h-4 text-primary" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-16 bg-border/40" />

            {/* Center: Row Count & Format */}
            <div className="flex items-center gap-8 flex-1 justify-center">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Quantity</label>
                <div className="flex items-center gap-2 bg-background/50 p-1 rounded-xl border border-border/50 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-background shadow-none" onClick={() => setRowCount(Math.max(1, rowCount - 10))}>
                    <span className="text-lg">-</span>
                  </Button>
                  <div className="w-24 text-center">
                    <Input
                      type="number"
                      value={rowCount}
                      onChange={e => setRowCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 0)))}
                      className="h-9 border-none text-center bg-transparent text-lg font-mono p-0 focus-visible:ring-0 shadow-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-background shadow-none" onClick={() => setRowCount(Math.min(1000, rowCount + 10))}>
                    <span className="text-lg">+</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Format</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-[46px] min-w-[140px] flex items-center justify-between gap-3 px-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 text-sm font-medium transition-all shadow-sm">
                      <div className="flex items-center gap-2.5">
                        {React.createElement(formatConfig[dataFormat].icon, { className: cn("w-4 h-4", formatConfig[dataFormat].color) })}
                        <span>{dataFormat}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[180px]">
                    {(Object.entries(formatConfig) as [DataFormat, typeof formatConfig.JSON][]).map(([fmt, cfg]) => (
                      <DropdownMenuItem key={fmt} onClick={() => setDataFormat(fmt)} className="gap-2.5 py-2.5">
                        <cfg.icon className={cn("w-4 h-4", cfg.color)} />
                        {fmt}
                        {dataFormat === fmt && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-16 bg-border/40" />

            {/* Right: Actions */}
            <div className="flex flex-col gap-2 min-w-[200px] justify-end">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right mr-1">Actions</label>
              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(true)}
                  className="h-[46px] px-6 gap-2 text-sm border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  className="h-[46px] px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white shadow-lg shadow-purple-500/20 gap-2 text-sm rounded-xl transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  Generate
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Schema Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

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
              <div className="flex justify-center">#</div>
              <div>Column Name</div>
              <div>Data Type</div>
              <div className="text-right">Actions</div>
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

        </div>
      </div>

      {/* Auto Fill Modal */}
      <Dialog open={showAutoFillModal} onOpenChange={setShowAutoFillModal}>
        <DialogContent className="max-w-lg glass-panel p-0 overflow-hidden border-border/50">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Auto-Generate Columns
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Choose how you want to populate your schema.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => setAutoFillMode('ai')} className={cn("p-4 rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center gap-2 transition-all", autoFillMode === 'ai' ? "border-primary bg-primary/5" : "hover:bg-secondary/40")}>
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-medium">AI Generation</span>
              </button>
              <button onClick={() => setAutoFillMode('template')} className={cn("p-4 rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center gap-2 transition-all", autoFillMode === 'template' ? "border-primary bg-primary/5" : "hover:bg-secondary/40")}>
                <LayoutTemplate className="w-6 h-6 text-blue-500" />
                <span className="font-medium">Use Template</span>
              </button>
            </div>

            {autoFillMode === 'ai' ? (
              <div className="space-y-4">
                <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 mb-3">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Example Prompt:</p>
                  <p className="text-xs italic opacity-80">"Generate a dataset of realistic startup companies with fields for valuation, industry, founding date, and founder names."</p>
                </div>
                <Input
                  placeholder="Describe your dataset..."
                  value={autoFillTopic}
                  onChange={e => setAutoFillTopic(e.target.value)}
                  className="h-12 text-base bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                />
                <div className="flex flex-wrap gap-2">
                  {popularTopics.slice(0, 3).map(topic => (
                    <button key={topic} onClick={() => setAutoFillTopic(topic)} className="px-3 py-1 rounded-full text-xs bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50 transition-colors">
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {templateExamples.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)} className="w-full p-3 rounded-lg hover:bg-secondary/50 flex items-center gap-3 border border-transparent hover:border-border/50 transition-all text-left">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary"><t.icon className="w-4 h-4" /></div>
                    <div>
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowAutoFillModal(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" disabled={autoFillMode === 'ai' && !autoFillTopic} onClick={() => setShowAutoFillModal(false)}>Generate</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Type Modal */}
      <Dialog open={!!showDataTypeModal} onOpenChange={() => setShowDataTypeModal(null)}>
        <DialogContent className="max-w-2xl glass-panel border-border/50 h-[600px] flex flex-col p-0 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search data types..."
              className="flex-1 bg-transparent border-none outline-none"
              value={dataTypeSearch}
              onChange={e => setDataTypeSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-40 border-r border-border/50 bg-secondary/20 p-2 space-y-1 overflow-y-auto">
              {Object.keys(dataTypeCategories).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn("w-full text-left px-3 py-2 rounded-lg text-sm", selectedCategory === cat ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50")}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {filteredDataTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      if (showDataTypeModal) updateColumn(showDataTypeModal, 'dataType', type);
                      setShowDataTypeModal(null);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border/30 hover:bg-secondary/50 hover:border-primary/30 transition-all text-left"
                  >
                    <div className={cn("w-2 h-2 rounded-full", dataTypeColors[type]?.replace('text-', 'bg-') || 'bg-slate-400')} />
                    <span className="text-sm">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl glass-panel border-border/50 p-0 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/20">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Data Preview <span className="text-muted-foreground font-normal text-sm ml-2">(Showing first 5 rows)</span></h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 font-mono">
                {columns.length} columns
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 font-mono">
                {rowCount} rows
              </span>
              <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full border border-border/50 font-mono">
                {dataFormat}
              </span>
              <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full border border-border/50 font-mono">
                ~{(rowCount * columns.length * 0.05).toFixed(1)} KB
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0 scrollbar-hide">
            <div className="min-w-full inline-block align-middle">
              <div className="border-b border-border/50">
                <table className="min-w-full divide-y divide-border/50">
                  <thead className="bg-secondary/30">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap sticky top-0 bg-secondary/95 backdrop-blur-sm z-10">
                          <div className="flex items-center gap-1.5">
                            <span>{col.name || 'Untitled'}</span>
                            <span className={cn("text-[10px] lowercase opacity-70", dataTypeColors[col.dataType])}>({col.dataType})</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 bg-background/50">
                    {generatePreviewData().map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-secondary/20 transition-colors">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80 font-mono">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowPreviewModal(false)}>Close Preview</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Download className="w-4 h-4" />
              Download Sample
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomGenerator;
