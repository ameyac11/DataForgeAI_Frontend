import { useState } from 'react';
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

const formatConfig: Record<DataFormat, { icon: typeof FileSpreadsheet; color: string; label: string; description: string }> = {
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      const draggedIndex = columns.findIndex(c => c.id === draggedId);
      const targetIndex = columns.findIndex(c => c.id === targetId);
      if (draggedIndex !== targetIndex) {
        const newColumns = [...columns];
        const [removed] = newColumns.splice(draggedIndex, 1);
        newColumns.splice(targetIndex, 0, removed);
        setColumns(newColumns);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const applyTemplate = (template: typeof templateExamples[0]) => {
    setColumns(template.columns.map((col, i) => ({
      id: Date.now().toString() + i,
      name: col.name,
      dataType: col.dataType,
    })));
    setShowAutoFillModal(false);
  };

  // Generate mock preview data
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
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-5xl mx-auto p-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Dataset Generator</h1>
            <p className="text-base text-muted-foreground mt-2">
              Define your schema and generate custom datasets
            </p>
          </div>
          <Button 
            onClick={() => setShowAutoFillModal(true)} 
            variant="outline" 
            className="gap-2 h-11 px-5 text-base hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            Auto-fill
          </Button>
        </div>

        {/* Column Definitions Card */}
        <div className="rounded-2xl border border-border bg-card p-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutTemplate className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">Column Definitions</h2>
                <p className="text-sm text-muted-foreground">{columns.length} columns defined</p>
              </div>
            </div>
          </div>

          {/* Column Header */}
          <div className="flex items-center gap-4 px-4 pb-4 mb-3 border-b border-border/50">
            <div className="w-14" />
            <div className="flex-[7]">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Column Name</span>
            </div>
            <div className="flex-[4]">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Type</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="space-y-3">
            {columns.map((column, index) => (
              <div
                key={column.id}
                draggable
                onDragStart={(e) => handleDragStart(e, column.id)}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group flex items-center gap-4 px-4 py-5 rounded-xl border-2 transition-all duration-200",
                  draggedId === column.id 
                    ? "opacity-50 border-primary bg-primary/5 scale-[0.98]" 
                    : "border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm bg-background/50"
                )}
              >
                {/* Drag handle + Arrows */}
                <div className="flex items-center gap-1.5 w-14">
                  <div className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveColumn(column.id, 'up')}
                      disabled={index === 0}
                      className={cn(
                        "p-1 rounded transition-all duration-150",
                        index === 0 
                          ? "text-muted-foreground/20 cursor-not-allowed" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveColumn(column.id, 'down')}
                      disabled={index === columns.length - 1}
                      className={cn(
                        "p-1 rounded transition-all duration-150",
                        index === columns.length - 1 
                          ? "text-muted-foreground/20 cursor-not-allowed" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column name input - 70% width */}
                <div className="flex-[7]">
                  <Input
                    placeholder="column_name"
                    value={column.name}
                    onChange={(e) => updateColumn(column.id, 'name', e.target.value)}
                    className="h-12 text-base bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Data type selector button - 40% width */}
                <div className="flex-[4]">
                  <button
                    onClick={() => setShowDataTypeModal(column.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-muted/80 border-2 border-border text-sm font-medium hover:border-primary/50 hover:bg-muted transition-all duration-200"
                  >
                    <span className={cn("font-medium", dataTypeColors[column.dataType] || 'text-foreground')}>
                      {column.dataType}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeColumn(column.id)}
                  className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add column button */}
            <button
              onClick={addColumn}
              className="w-full flex items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-border text-base text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Column
            </button>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Row Count */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/20 transition-all duration-200">
            <label className="text-base font-medium text-foreground mb-4 block">Number of Rows</label>
            <Input
              type="number"
              value={rowCount}
              onChange={(e) => setRowCount(parseInt(e.target.value) || 0)}
              min={1}
              max={1000000}
              className="h-14 text-lg font-medium"
            />
            <p className="text-sm text-muted-foreground mt-3">Maximum: 1,000,000 rows</p>
          </div>

          {/* Output Format */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/20 transition-all duration-200">
            <label className="text-base font-medium text-foreground mb-4 block">Output Format</label>
            <div className="grid grid-cols-4 gap-3">
              {(Object.entries(formatConfig) as [DataFormat, typeof formatConfig.JSON][]).map(([format, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={format}
                    onClick={() => setDataFormat(format)}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200",
                      dataFormat === format
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-8 h-8 mb-2", config.color)} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Generation Source */}
        <div className="rounded-2xl border border-border bg-card p-8 mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-6">Data Generation Source</h3>
          
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <button
              onClick={() => setSourceType('AI')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 text-center",
                sourceType === 'AI'
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                sourceType === 'AI' ? "bg-primary/15" : "bg-muted"
              )}>
                <Sparkles className={cn("w-7 h-7", sourceType === 'AI' ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <span className="font-medium text-base block mb-1">AI Generated</span>
                <span className="text-sm text-muted-foreground">Context-aware data generation</span>
              </div>
              {sourceType === 'AI' && <Check className="w-5 h-5 text-primary" />}
            </button>

            <button
              onClick={() => setSourceType('Library')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 text-center",
                sourceType === 'Library'
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                sourceType === 'Library' ? "bg-primary/15" : "bg-muted"
              )}>
                <Zap className={cn("w-7 h-7", sourceType === 'Library' ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <span className="font-medium text-base block mb-1">Library Generated</span>
                <span className="text-sm text-muted-foreground">Fast Faker.js generation</span>
              </div>
              {sourceType === 'Library' && <Check className="w-5 h-5 text-primary" />}
            </button>
          </div>

          {/* AI Prompt Input */}
          {sourceType === 'AI' && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl border border-border overflow-hidden">
                <Input
                  placeholder="Enter context (e.g., 'Japanese market data', 'Healthcare records')"
                  value={specialPrompt}
                  onChange={(e) => setSpecialPrompt(e.target.value)}
                  className="h-14 border-0 bg-transparent focus-visible:ring-0 px-5 text-base"
                />
                <div className="flex items-center justify-between px-4 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Try:</span>
                    {['Japanese market', 'Healthcare USA', 'E-commerce'].map((example) => (
                      <button
                        key={example}
                        onClick={() => setSpecialPrompt(example)}
                        className="px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                  
                  {/* Model selector chip inside search bar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg",
                          model === 'GPT-4.1' ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Cpu className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Equal width, centered */}
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setShowPreviewModal(true)}
            className="gap-2 h-12 text-base w-full"
          >
            <Eye className="w-5 h-5" />
            Preview
          </Button>
          <Button className="gap-2 h-12 text-base bg-primary hover:bg-primary/90 w-full">
            <Download className="w-5 h-5" />
            Generate Dataset
          </Button>
        </div>
      </div>

      {/* Auto Fill Modal - Matching reference design */}
      <Dialog open={showAutoFillModal} onOpenChange={setShowAutoFillModal}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold text-primary">
                Auto-generate Columns
              </DialogTitle>
            </DialogHeader>
            
            {/* Mode Toggle - Card style like reference */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setAutoFillMode('ai')}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200",
                  autoFillMode === 'ai'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  autoFillMode === 'ai' ? "bg-primary/15" : "bg-muted"
                )}>
                  <Sparkles className={cn("w-6 h-6", autoFillMode === 'ai' ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="text-center">
                  <span className="font-medium text-sm block">AI Generation</span>
                  <span className="text-xs text-muted-foreground">Generate columns based on your topic</span>
                </div>
              </button>
              
              <button
                onClick={() => setAutoFillMode('template')}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200",
                  autoFillMode === 'template'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  autoFillMode === 'template' ? "bg-primary/15" : "bg-muted"
                )}>
                  <LayoutTemplate className={cn("w-6 h-6", autoFillMode === 'template' ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="text-center">
                  <span className="font-medium text-sm block">Use Template</span>
                  <span className="text-xs text-muted-foreground">Start with a predefined structure</span>
                </div>
              </button>
            </div>

            {autoFillMode === 'ai' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Enter Your Topic</label>
                  <Input
                    placeholder="e.g., 'real estate listings', 'customer orders'"
                    value={autoFillTopic}
                    onChange={(e) => setAutoFillTopic(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Describe your dataset topic and the AI will suggest relevant columns
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Popular Topics
                  </span>
                  {popularTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setAutoFillTopic(topic)}
                      className="px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground mb-2 block">Select a Template</label>
                {templateExamples.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block">{template.name}</span>
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
            <Button variant="ghost" onClick={() => setShowAutoFillModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setShowAutoFillModal(false)}
              disabled={autoFillMode === 'ai' && !autoFillTopic.trim()}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Type Selection Modal */}
      <Dialog open={!!showDataTypeModal} onOpenChange={() => setShowDataTypeModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Select Data Type</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4">
            {/* Categories - Left side navigation */}
            <div className="w-36 shrink-0 space-y-1">
              {Object.keys(dataTypeCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setDataTypeSearch('');
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                    selectedCategory === category && !dataTypeSearch
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Data Types - Right side */}
            <div className="flex-1">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search data types..."
                  value={dataTypeSearch}
                  onChange={(e) => setDataTypeSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Data type grid */}
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {filteredDataTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (showDataTypeModal) {
                        updateColumn(showDataTypeModal, 'dataType', type);
                        setShowDataTypeModal(null);
                        setDataTypeSearch('');
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
                  >
                    <div className={cn("w-2 h-2 rounded-full", dataTypeColors[type]?.replace('text-', 'bg-') || 'bg-slate-400')} />
                    <span className={cn("text-sm", dataTypeColors[type] || 'text-foreground')}>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Dataset Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground block mb-1">Rows</span>
                <span className="text-lg font-semibold">{rowCount.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground block mb-1">Columns</span>
                <span className="text-lg font-semibold">{columns.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground block mb-1">Format</span>
                <span className={cn("text-lg font-semibold", formatConfig[dataFormat].color)}>{dataFormat}</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground block mb-1">Est. Size</span>
                <span className="text-lg font-semibold">~{Math.round(rowCount * columns.length * 0.05)} KB</span>
              </div>
            </div>

            {/* Preview Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      {columns.map((col) => (
                        <th key={col.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
                          <div>
                            <span className="text-foreground">{col.name || 'unnamed'}</span>
                            <span className={cn("ml-2 text-[10px] lowercase", dataTypeColors[col.dataType])}>
                              {col.dataType}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {generatePreviewData().map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm text-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Showing 5 sample rows. Actual dataset will contain {rowCount.toLocaleString()} rows.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomGenerator;
