import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, BarChart3, Columns3, GitCompareArrows, Activity,
  FileText, Table2, ChevronLeft, ChevronRight, Download,
  AlertTriangle, Clock, Trash2, FileUp, Loader2, X,
  TrendingUp, Database, Eye, PieChart, BoxSelect, Info,
  ScatterChart as ScatterIcon, BarChart2, Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartPie, Pie, Cell, CartesianGrid,
  LineChart, Line, ScatterChart, Scatter, Legend,
  ZAxis, ReferenceLine,
} from 'recharts';
import {
  analyticsApi,
  type AnalyticsSummary,
  type ColumnInfo,
  type DistributionData,
  type CorrelationData,
  type ScatterData,
  type BoxPlotData,
  type OutlierData,
  type TimeseriesData,
  type PreviewData,
} from '@/services/analyticsApi';

// tab config
const TABS = [
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'summary', icon: BarChart3, label: 'Summary' },
  { id: 'columns', icon: Columns3, label: 'Columns' },
  { id: 'correlation', icon: GitCompareArrows, label: 'Correlation' },
  { id: 'distributions', icon: Activity, label: 'Distributions' },
  { id: 'scatter', icon: ScatterIcon, label: 'Scatter & Box' },
  { id: 'report', icon: FileText, label: 'Report' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const CHART_COLORS = [
  '#7c3aed', '#ec4899', '#f97316', '#06b6d4', '#10b981',
  '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#14b8a6',
  '#e879f9', '#a78bfa', '#fb923c', '#34d399', '#fbbf24',
];

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '11px',
};

const AnalyticsWorkspace = () => {
  const [activeTab, setActiveTab] = useState<TabId>('upload');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [distributions, setDistributions] = useState<Record<string, DistributionData>>({});
  const [outliers, setOutliers] = useState<Record<string, OutlierData>>({});
  const [timeseries, setTimeseries] = useState<TimeseriesData[]>([]);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewPage, setPreviewPage] = useState(1);

  // scatter & box plot state
  const [scatterData, setScatterData] = useState<ScatterData | null>(null);
  const [scatterColX, setScatterColX] = useState('');
  const [scatterColY, setScatterColY] = useState('');
  const [boxPlotData, setBoxPlotData] = useState<BoxPlotData | null>(null);
  const [boxPlotCol, setBoxPlotCol] = useState('');

  const [uploading, setUploading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [scatterLoading, setScatterLoading] = useState(false);
  const [boxPlotLoading, setBoxPlotLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistCol, setSelectedDistCol] = useState<string>('');
  const [selectedOutlierCol, setSelectedOutlierCol] = useState<string>('');

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (sessionId) analyticsApi.deleteSession(sessionId).catch(() => {});
    };
  }, [sessionId]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      if (sessionId) await analyticsApi.deleteSession(sessionId).catch(() => {});
      const res = await analyticsApi.upload(file);
      setSessionId(res.session_id);
      setSummary(res.summary);
      setColumns([]);
      setCorrelation(null);
      setDistributions({});
      setOutliers({});
      setTimeseries([]);
      setPreview(null);
      setScatterData(null);
      setBoxPlotData(null);
      setScatterColX('');
      setScatterColY('');
      setBoxPlotCol('');
      setActiveTab('summary');
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [sessionId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const switchTab = useCallback(async (tab: TabId) => {
    setActiveTab(tab);
    if (!sessionId) return;
    setLoadingTab(true);
    try {
      if ((tab === 'columns' || tab === 'distributions' || tab === 'scatter') && columns.length === 0) {
        setColumns(await analyticsApi.getColumns(sessionId));
      }
      if (tab === 'correlation' && !correlation) {
        setCorrelation(await analyticsApi.getCorrelation(sessionId));
        setTimeseries(await analyticsApi.getTimeseries(sessionId));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingTab(false);
    }
  }, [sessionId, columns.length, correlation]);

  const loadDistribution = useCallback(async (col: string) => {
    if (!sessionId || distributions[col]) return;
    try {
      const d = await analyticsApi.getDistribution(sessionId, col);
      setDistributions(prev => ({ ...prev, [col]: d }));
    } catch (e: any) { setError(e.message); }
  }, [sessionId, distributions]);

  const loadOutlier = useCallback(async (col: string) => {
    if (!sessionId || outliers[col]) return;
    try {
      const o = await analyticsApi.getOutliers(sessionId, col);
      setOutliers(prev => ({ ...prev, [col]: o }));
    } catch (e: any) { setError(e.message); }
  }, [sessionId, outliers]);

  const loadScatter = useCallback(async (colX: string, colY: string) => {
    if (!sessionId || !colX || !colY) return;
    setScatterLoading(true);
    try {
      const d = await analyticsApi.getScatter(sessionId, colX, colY);
      setScatterData(d);
    } catch (e: any) { setError(e.message); }
    finally { setScatterLoading(false); }
  }, [sessionId]);

  const loadBoxPlot = useCallback(async (col: string) => {
    if (!sessionId || !col) return;
    setBoxPlotLoading(true);
    try {
      const d = await analyticsApi.getBoxPlot(sessionId, col);
      setBoxPlotData(d);
    } catch (e: any) { setError(e.message); }
    finally { setBoxPlotLoading(false); }
  }, [sessionId]);

  const loadPreview = useCallback(async (page: number) => {
    if (!sessionId) return;
    try {
      setPreview(await analyticsApi.getPreview(sessionId, page));
      setPreviewPage(page);
    } catch (e: any) { setError(e.message); }
  }, [sessionId]);

  const handleReport = useCallback(async () => {
    if (!sessionId) return;
    setReportLoading(true);
    try {
      const blob = await analyticsApi.downloadReport(sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DataForgeAI_Report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setReportLoading(false);
    }
  }, [sessionId]);

  const handleClear = useCallback(async () => {
    if (sessionId) await analyticsApi.deleteSession(sessionId).catch(() => {});
    setSessionId(null);
    setSummary(null);
    setColumns([]);
    setCorrelation(null);
    setDistributions({});
    setOutliers({});
    setTimeseries([]);
    setPreview(null);
    setScatterData(null);
    setBoxPlotData(null);
    setActiveTab('upload');
  }, [sessionId]);

  const hasSession = !!sessionId && !!summary;

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* sidebar tabs */}
      <div className="w-56 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Session-based workspace</p>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {TABS.map(tab => {
              const disabled = tab.id !== 'upload' && !hasSession;
              return (
                <button
                  key={tab.id}
                  disabled={disabled}
                  onClick={() => switchTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    disabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
        {hasSession && (
          <div className="p-3 border-t border-border space-y-2">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => loadPreview(1)}>
              <Eye className="w-3.5 h-3.5" /> Data Preview
            </Button>
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-destructive hover:text-destructive" onClick={handleClear}>
              <Trash2 className="w-3.5 h-3.5" /> End Session
            </Button>
          </div>
        )}
      </div>

      {/* main content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="mx-6 mt-4 flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <UploadPanel key="upload" uploading={uploading} fileRef={fileRef} onUpload={handleUpload} onDrop={handleDrop} hasSession={hasSession} summary={summary} />
            )}
            {activeTab === 'summary' && summary && (
              <SummaryPanel key="summary" summary={summary} loading={loadingTab} />
            )}
            {activeTab === 'columns' && (
              <ColumnsPanel key="columns" columns={columns} loading={loadingTab} />
            )}
            {activeTab === 'correlation' && (
              <CorrelationPanel key="correlation" correlation={correlation} timeseries={timeseries} loading={loadingTab} />
            )}
            {activeTab === 'distributions' && (
              <DistributionsPanel
                key="distributions"
                columns={columns}
                distributions={distributions}
                outliers={outliers}
                selectedDistCol={selectedDistCol}
                selectedOutlierCol={selectedOutlierCol}
                onSelectDist={(c) => { setSelectedDistCol(c); loadDistribution(c); }}
                onSelectOutlier={(c) => { setSelectedOutlierCol(c); loadOutlier(c); }}
                loading={loadingTab}
              />
            )}
            {activeTab === 'scatter' && (
              <ScatterBoxPanel
                key="scatter"
                columns={columns}
                scatterData={scatterData}
                scatterColX={scatterColX}
                scatterColY={scatterColY}
                scatterLoading={scatterLoading}
                onScatterColXChange={(c) => { setScatterColX(c); if (scatterColY) loadScatter(c, scatterColY); }}
                onScatterColYChange={(c) => { setScatterColY(c); if (scatterColX) loadScatter(scatterColX, c); }}
                boxPlotData={boxPlotData}
                boxPlotCol={boxPlotCol}
                boxPlotLoading={boxPlotLoading}
                onBoxPlotColChange={(c) => { setBoxPlotCol(c); loadBoxPlot(c); }}
                loading={loadingTab}
              />
            )}
            {activeTab === 'report' && (
              <ReportPanel key="report" loading={reportLoading} onGenerate={handleReport} hasSession={hasSession} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {preview && (
              <PreviewModal preview={preview} page={previewPage} onPageChange={loadPreview} onClose={() => setPreview(null)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ─── Info Banner ───

function InfoBanner({ message, variant = 'info' }: { message: string; variant?: 'info' | 'warning' }) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl border text-sm',
      variant === 'warning'
        ? 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
        : 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400'
    )}>
      <Info className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ─── Upload Panel ───

function UploadPanel({ uploading, fileRef, onUpload, onDrop, hasSession, summary }: {
  uploading: boolean; fileRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (f: File) => void; onDrop: (e: React.DragEvent) => void;
  hasSession: boolean; summary: AnalyticsSummary | null;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Upload Dataset</h1>
      <p className="text-sm text-muted-foreground mb-6">Drag & drop or browse. Supports CSV, JSON, Parquet, and SQL files.</p>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
          "hover:border-primary/50 hover:bg-primary/5",
          uploading ? "border-primary/40 bg-primary/5 pointer-events-none" : "border-border"
        )}
      >
        <input
          ref={fileRef} type="file" className="hidden" accept=".csv,.json,.parquet,.sql"
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-primary">Processing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base">Drop your file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse • Max 50 MB</p>
            </div>
            <div className="flex gap-2 mt-2">
              {['CSV', 'JSON', 'Parquet', 'SQL'].map(fmt => (
                <span key={fmt} className="text-[10px] px-2.5 py-1 rounded-full bg-muted font-medium">{fmt}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasSession && summary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
              <Database className="w-4 h-4" /> Active session: {summary.filename}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.rows.toLocaleString()} rows × {summary.columns} columns • {summary.memory_display}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Summary Panel ───

function SummaryPanel({ summary, loading }: { summary: AnalyticsSummary; loading: boolean }) {
  const [zoomed, setZoomed] = useState(false);
  if (loading) return <LoadingSkeleton />;

  const metrics = [
    { label: 'Rows', value: summary.rows.toLocaleString(), icon: Database, color: 'text-violet-500' },
    { label: 'Columns', value: summary.columns, icon: Columns3, color: 'text-blue-500' },
    { label: 'Numeric', value: summary.numeric_columns ?? '—', icon: BarChart2, color: 'text-indigo-500' },
    { label: 'Categorical', value: summary.categorical_columns ?? '—', icon: BoxSelect, color: 'text-pink-500' },
    { label: 'Missing Values', value: `${summary.missing_values.toLocaleString()} (${summary.missing_pct}%)`, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Duplicates', value: summary.duplicates.toLocaleString(), icon: Table2, color: 'text-rose-500' },
    { label: 'Memory', value: summary.memory_display, icon: Activity, color: 'text-cyan-500' },
    { label: 'File Size', value: summary.file_size_display, icon: FileText, color: 'text-emerald-500' },
  ];

  const dtypeCounts: Record<string, number> = {};
  Object.values(summary.dtypes).forEach(d => { dtypeCounts[d] = (dtypeCounts[d] || 0) + 1; });
  const pieData = Object.entries(dtypeCounts).map(([name, value]) => ({ name, value }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Dataset Summary</h1>
      <p className="text-sm text-muted-foreground mb-6">{summary.filename}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={cn('w-4 h-4', m.color)} />
              <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
            </div>
            <p className="text-lg font-bold">{m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" /> Data Type Distribution
          </h3>
          <ExpandButton onClick={() => setZoomed(true)} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartPie>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, value }) => `${name} (${value})`}>
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RechartPie>
          </ResponsiveContainer>
        </div>
      </div>

      <AnimatePresence>
        {zoomed && (
          <ChartZoomModal title="Data Type Distribution" onClose={() => setZoomed(false)}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartPie>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%"
                  label={({ name, value }) => `${name} (${value})`}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
              </RechartPie>
            </ResponsiveContainer>
          </ChartZoomModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Columns Panel ───

function ColumnsPanel({ columns, loading }: { columns: ColumnInfo[]; loading: boolean }) {
  const [zoomedCol, setZoomedCol] = useState<string | null>(null);
  if (loading) return <LoadingSkeleton />;

  const numeric = columns.filter(c => c.category === 'numeric');
  const categorical = columns.filter(c => c.category === 'categorical');
  const datetime = columns.filter(c => c.category === 'datetime');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Column Analysis</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {numeric.length} numeric • {categorical.length} categorical • {datetime.length} datetime
      </p>

      {columns.length === 0 && <InfoBanner message="No columns found in dataset." />}

      <div className="space-y-3">
        {columns.map((col, i) => (
          <motion.div
            key={col.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase',
                  col.category === 'numeric' ? 'bg-violet-500/10 text-violet-500' :
                  col.category === 'datetime' ? 'bg-cyan-500/10 text-cyan-500' :
                  'bg-amber-500/10 text-amber-500'
                )}>{col.category}</span>
                <h4 className="font-semibold text-sm">{col.name}</h4>
                <span className="text-[10px] text-muted-foreground">({col.dtype})</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {col.unique} unique • {col.missing} missing ({col.missing_pct}%)
              </div>
            </div>

            {col.category === 'numeric' && col.stats && (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                {Object.entries(col.stats).map(([k, v]) => (
                  <div key={k} className="text-center p-1.5 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase">{k}</p>
                    <p className="text-xs font-semibold">{typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v}</p>
                  </div>
                ))}
              </div>
            )}

            {col.category === 'categorical' && col.top_values && (
              <div className="mt-2">
                <div className="flex justify-end mb-1">
                  <ExpandButton onClick={() => setZoomedCol(col.name)} />
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={col.top_values.slice(0, 8).map(v => ({ ...v, label: truncateLabel(v.value, 28) }))} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="label" width={180} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number) => [val.toLocaleString(), 'Count']} labelFormatter={(label: string) => col.top_values?.find(v => truncateLabel(v.value, 28) === label)?.value || label} />
                      <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {col.category === 'datetime' && col.stats && (
              <div className="flex gap-4 mt-2 text-xs">
                <span><strong>From:</strong> {col.stats.min}</span>
                <span><strong>To:</strong> {col.stats.max}</span>
                <span><strong>Span:</strong> {col.stats.range_days} days</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {zoomedCol && (() => {
          const col = columns.find(c => c.name === zoomedCol);
          if (!col?.top_values) return null;
          return (
            <ChartZoomModal title={`${col.name} — Top Values`} onClose={() => setZoomedCol(null)}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={col.top_values.map(v => ({ ...v, label: v.value }))} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" width={250} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number) => [val.toLocaleString(), 'Count']} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartZoomModal>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Correlation Panel ───

function CorrelationPanel({ correlation, timeseries, loading }: {
  correlation: CorrelationData | null; timeseries: TimeseriesData[]; loading: boolean;
}) {
  const [zoomedHeatmap, setZoomedHeatmap] = useState(false);
  const [zoomedTs, setZoomedTs] = useState<string | null>(null);
  if (loading) return <LoadingSkeleton />;

  const hasMessage = correlation?.message && correlation.columns.length < 2;
  const hasCorr = correlation && correlation.columns.length >= 2;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Correlation Analysis</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {hasCorr ? `${correlation.columns.length} numeric columns analyzed` : 'Correlation heatmap & time series'}
      </p>

      {/* info message when not enough numeric columns */}
      {hasMessage && (
        <InfoBanner message={correlation.message!} variant="warning" />
      )}

      {/* heatmap */}
      {hasCorr && correlation && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <GitCompareArrows className="w-4 h-4 text-primary" /> Correlation Heatmap
            </h3>
            <ExpandButton onClick={() => setZoomedHeatmap(true)} />
          </div>

          {/* Responsive heatmap grid — fills available width */}
          <div
            className="grid w-full gap-[2px]"
            style={{
              /* +1 for the row label column */
              gridTemplateColumns: `minmax(60px, 0.8fr) repeat(${correlation.columns.length}, 1fr)`,
              gridTemplateRows: `auto repeat(${correlation.columns.length}, 1fr)`,
            }}
          >
            {/* Top-left empty cell */}
            <div />
            {/* Column headers */}
            {correlation.columns.map(c => (
              <div key={c} className="flex items-end justify-center pb-1 min-h-[32px]">
                <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full [writing-mode:vertical-rl] rotate-180">
                  {c.length > 14 ? c.slice(0, 14) + '…' : c}
                </span>
              </div>
            ))}

            {/* Rows */}
            {correlation.matrix.map((row, i) => (
              <React.Fragment key={i}>
                {/* Row label */}
                <div className="flex items-center justify-end pr-2">
                  <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full text-right">
                    {correlation.columns[i].length > 16 ? correlation.columns[i].slice(0, 16) + '…' : correlation.columns[i]}
                  </span>
                </div>
                {/* Cells */}
                {row.map((val, j) => (
                  <div
                    key={j}
                    className="aspect-square flex items-center justify-center text-[10px] font-mono rounded-sm transition-transform hover:scale-105 cursor-default min-h-[28px]"
                    style={{ backgroundColor: corrColor(val), color: Math.abs(val) > 0.5 ? 'white' : 'hsl(var(--foreground))' }}
                    title={`${correlation.columns[i]} × ${correlation.columns[j]}: ${val.toFixed(3)}`}
                  >
                    {val.toFixed(2)}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* color legend */}
          <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
            <span>-1.0</span>
            <div className="flex h-3 flex-1 max-w-xs rounded-full overflow-hidden">
              {['#ef4444', '#f87171', '#fecaca', '#f3f4f6', '#ddd6fe', '#a78bfa', '#7c3aed'].map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span>+1.0</span>
          </div>
        </div>
      )}

      {!hasCorr && !hasMessage && (
        <InfoBanner message="No correlation data available. Upload a dataset with numeric columns to see correlations." />
      )}

      {/* timeseries */}
      {timeseries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Time Series
          </h3>
          {timeseries.map(ts => (
            <div key={ts.column} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{ts.column}</p>
                <ExpandButton onClick={() => setZoomedTs(ts.column)} />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ts.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zoom modals */}
      <AnimatePresence>
        {zoomedHeatmap && hasCorr && correlation && (
          <ChartZoomModal title="Correlation Heatmap" onClose={() => setZoomedHeatmap(false)}>
            <div className="overflow-auto h-full flex items-start justify-center p-4">
              <div
                className="grid w-full max-w-4xl gap-[2px]"
                style={{
                  gridTemplateColumns: `minmax(80px, 0.6fr) repeat(${correlation.columns.length}, 1fr)`,
                  gridTemplateRows: `auto repeat(${correlation.columns.length}, 1fr)`,
                }}
              >
                <div />
                {correlation.columns.map(c => (
                  <div key={c} className="flex items-end justify-center pb-1 min-h-[36px]">
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-full [writing-mode:vertical-rl] rotate-180">{c}</span>
                  </div>
                ))}
                {correlation.matrix.map((row, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center justify-end pr-3">
                      <span className="text-xs font-medium text-muted-foreground truncate max-w-full text-right">{correlation.columns[i]}</span>
                    </div>
                    {row.map((val, j) => (
                      <div
                        key={j}
                        className="aspect-square flex items-center justify-center text-[10px] font-mono rounded-sm min-h-[36px]"
                        style={{ backgroundColor: corrColor(val), color: Math.abs(val) > 0.5 ? 'white' : 'hsl(var(--foreground))' }}
                        title={`${correlation.columns[i]} × ${correlation.columns[j]}: ${val.toFixed(3)}`}
                      >
                        {val.toFixed(3)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </ChartZoomModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedTs && (() => {
          const ts = timeseries.find(t => t.column === zoomedTs);
          if (!ts) return null;
          return (
            <ChartZoomModal title={`Time Series — ${ts.column}`} onClose={() => setZoomedTs(null)}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ts.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartZoomModal>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Distributions Panel ───

function DistributionsPanel({ columns, distributions, outliers, selectedDistCol, selectedOutlierCol, onSelectDist, onSelectOutlier, loading }: {
  columns: ColumnInfo[]; distributions: Record<string, DistributionData>;
  outliers: Record<string, OutlierData>;
  selectedDistCol: string; selectedOutlierCol: string;
  onSelectDist: (c: string) => void; onSelectOutlier: (c: string) => void;
  loading: boolean;
}) {
  const [zoomedDist, setZoomedDist] = useState(false);
  if (loading) return <LoadingSkeleton />;

  const numericCols = columns.filter(c => c.category === 'numeric');
  const allCols = columns.map(c => c.name);
  const dist = distributions[selectedDistCol];
  const outlier = outliers[selectedOutlierCol];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Distributions</h1>
      <p className="text-sm text-muted-foreground mb-6">Explore value distributions and detect outliers</p>

      {/* distribution chart */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Value Distribution
          </h3>
          <div className="flex items-center gap-2">
            {dist && <ExpandButton onClick={() => setZoomedDist(true)} />}
            <Select value={selectedDistCol} onValueChange={onSelectDist}>
              <SelectTrigger className="w-52 h-8 text-xs"><SelectValue placeholder="Select column" /></SelectTrigger>
              <SelectContent>
                {allCols.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {dist ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist.bins || dist.values} margin={{ bottom: 40, left: 10, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={dist.type === 'histogram' ? 'range' : 'label'} tick={{ fontSize: 9 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            Select a column to view its distribution
          </div>
        )}
      </div>

      {/* outlier detection */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <BoxSelect className="w-4 h-4 text-primary" /> Outlier Detection (IQR)
          </h3>
          <Select value={selectedOutlierCol} onValueChange={onSelectOutlier}>
            <SelectTrigger className="w-52 h-8 text-xs"><SelectValue placeholder="Select numeric column" /></SelectTrigger>
            <SelectContent>
              {numericCols.map(c => <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {numericCols.length === 0 && (
          <InfoBanner message="No numeric columns available for outlier detection. This feature requires numeric data." variant="warning" />
        )}

        {numericCols.length > 0 && outlier ? (
          outlier.error ? (
            <InfoBanner message={outlier.error} variant="warning" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Q1', value: outlier.q1 },
                { label: 'Q3', value: outlier.q3 },
                { label: 'IQR', value: outlier.iqr },
                { label: 'Median', value: outlier.median },
                { label: 'Lower Fence', value: outlier.lower_fence },
                { label: 'Upper Fence', value: outlier.upper_fence },
                { label: 'Outliers', value: `${outlier.outlier_count} (${outlier.outlier_pct}%)` },
                { label: 'Range', value: `${outlier.min} — ${outlier.max}` },
              ].map(m => (
                <div key={m.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">{m.label}</p>
                  <p className="text-sm font-semibold">{typeof m.value === 'number' ? m.value.toLocaleString(undefined, { maximumFractionDigits: 3 }) : m.value}</p>
                </div>
              ))}
            </div>
          )
        ) : numericCols.length > 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
            Select a numeric column to detect outliers
          </div>
        ) : null}
      </div>

      {/* Distribution zoom modal */}
      <AnimatePresence>
        {zoomedDist && dist && (
          <ChartZoomModal title={`Distribution — ${selectedDistCol}`} onClose={() => setZoomedDist(false)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist.bins || dist.values} margin={{ bottom: 60, left: 20, right: 20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={dist.type === 'histogram' ? 'range' : 'label'} tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartZoomModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Scatter & Box Plot Panel ───

function ScatterBoxPanel({
  columns, scatterData, scatterColX, scatterColY, scatterLoading,
  onScatterColXChange, onScatterColYChange,
  boxPlotData, boxPlotCol, boxPlotLoading, onBoxPlotColChange, loading,
}: {
  columns: ColumnInfo[];
  scatterData: ScatterData | null;
  scatterColX: string; scatterColY: string; scatterLoading: boolean;
  onScatterColXChange: (c: string) => void; onScatterColYChange: (c: string) => void;
  boxPlotData: BoxPlotData | null;
  boxPlotCol: string; boxPlotLoading: boolean;
  onBoxPlotColChange: (c: string) => void;
  loading: boolean;
}) {
  const [zoomedScatter, setZoomedScatter] = useState(false);
  const [zoomedBox, setZoomedBox] = useState(false);
  if (loading) return <LoadingSkeleton />;

  const numericCols = columns.filter(c => c.category === 'numeric');
  const hasNumeric = numericCols.length > 0;
  const hasTwoNumeric = numericCols.length >= 2;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Scatter Plot & Box Plot</h1>
      <p className="text-sm text-muted-foreground mb-6">Visualize relationships and distributions of numeric data</p>

      {/* Scatter Plot */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ScatterIcon className="w-4 h-4 text-primary" /> Scatter Plot
          </h3>
          {scatterData && !scatterData.error && scatterData.points.length > 0 && (
            <ExpandButton onClick={() => setZoomedScatter(true)} />
          )}
        </div>

        {!hasTwoNumeric ? (
          <InfoBanner message="Scatter plots require at least 2 numeric columns. This dataset does not have enough numeric columns for a scatter plot." variant="warning" />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">X Axis:</span>
                <Select value={scatterColX} onValueChange={onScatterColXChange}>
                  <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Select X column" /></SelectTrigger>
                  <SelectContent>
                    {numericCols.map(c => <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Y Axis:</span>
                <Select value={scatterColY} onValueChange={onScatterColYChange}>
                  <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Select Y column" /></SelectTrigger>
                  <SelectContent>
                    {numericCols.map(c => <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {scatterLoading && (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}

            {!scatterLoading && scatterData?.error && (
              <InfoBanner message={scatterData.error} variant="warning" />
            )}

            {!scatterLoading && scatterData && !scatterData.error && scatterData.points.length > 0 && (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" dataKey="x" name={scatterData.col_x} tick={{ fontSize: 10 }}
                        label={{ value: scatterData.col_x, position: 'bottom', offset: 20, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis type="number" dataKey="y" name={scatterData.col_y} tick={{ fontSize: 10 }}
                        label={{ value: scatterData.col_y, angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <ZAxis range={[30, 30]} />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number, name: string) => [value.toLocaleString(undefined, { maximumFractionDigits: 3 }), name]}
                      />
                      <Scatter data={scatterData.points} fill="#7c3aed" fillOpacity={0.6} strokeWidth={0} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  {scatterData.count} data points plotted{scatterData.count >= 500 ? ' (sampled)' : ''}
                </p>
              </>
            )}

            {!scatterLoading && !scatterData && (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Select two numeric columns to create a scatter plot
              </div>
            )}
          </>
        )}
      </div>

      {/* Box Plot */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <BoxSelect className="w-4 h-4 text-primary" /> Box Plot
          </h3>
          {boxPlotData && !boxPlotData.error && (
            <ExpandButton onClick={() => setZoomedBox(true)} />
          )}
        </div>

        {!hasNumeric ? (
          <InfoBanner message="Box plots require at least 1 numeric column. This dataset has no numeric columns." variant="warning" />
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-muted-foreground font-medium">Column:</span>
              <Select value={boxPlotCol} onValueChange={onBoxPlotColChange}>
                <SelectTrigger className="w-52 h-8 text-xs"><SelectValue placeholder="Select numeric column" /></SelectTrigger>
                <SelectContent>
                  {numericCols.map(c => <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {boxPlotLoading && (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}

            {!boxPlotLoading && boxPlotData?.error && (
              <InfoBanner message={boxPlotData.error} variant="warning" />
            )}

            {!boxPlotLoading && boxPlotData && !boxPlotData.error && (
              <div className="space-y-4">
                {/* Visual box plot representation */}
                <div className="relative h-20 mx-8">
                  <BoxPlotVisual data={boxPlotData} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {[
                    { label: 'Min', value: boxPlotData.min },
                    { label: 'Q1', value: boxPlotData.q1 },
                    { label: 'Median', value: boxPlotData.median },
                    { label: 'Q3', value: boxPlotData.q3 },
                    { label: 'Max', value: boxPlotData.max },
                    { label: 'Lower Whisker', value: boxPlotData.lower_whisker },
                    { label: 'Upper Whisker', value: boxPlotData.upper_whisker },
                    { label: 'Outliers', value: boxPlotData.outlier_count },
                    { label: 'IQR', value: +(boxPlotData.q3 - boxPlotData.q1).toFixed(3) },
                    { label: 'Range', value: +(boxPlotData.max - boxPlotData.min).toFixed(3) },
                  ].map(m => (
                    <div key={m.label} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">{m.label}</p>
                      <p className="text-sm font-semibold">{typeof m.value === 'number' ? m.value.toLocaleString(undefined, { maximumFractionDigits: 3 }) : m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!boxPlotLoading && !boxPlotData && (
              <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                Select a numeric column to view its box plot
              </div>
            )}
          </>
        )}
      </div>

      {/* Scatter zoom modal */}
      <AnimatePresence>
        {zoomedScatter && scatterData && !scatterData.error && scatterData.points.length > 0 && (
          <ChartZoomModal title={`Scatter — ${scatterData.col_x} vs ${scatterData.col_y}`} onClose={() => setZoomedScatter(false)}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="x" name={scatterData.col_x} tick={{ fontSize: 11 }}
                  label={{ value: scatterData.col_x, position: 'bottom', offset: 30, fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="number" dataKey="y" name={scatterData.col_y} tick={{ fontSize: 11 }}
                  label={{ value: scatterData.col_y, angle: -90, position: 'insideLeft', offset: 0, fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <ZAxis range={[40, 40]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number, name: string) => [value.toLocaleString(undefined, { maximumFractionDigits: 3 }), name]} />
                <Scatter data={scatterData.points} fill="#7c3aed" fillOpacity={0.6} strokeWidth={0} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartZoomModal>
        )}
      </AnimatePresence>

      {/* Box plot zoom modal */}
      <AnimatePresence>
        {zoomedBox && boxPlotData && !boxPlotData.error && (
          <ChartZoomModal title={`Box Plot — ${boxPlotCol}`} onClose={() => setZoomedBox(false)}>
            <div className="flex flex-col h-full justify-center">
              <div className="relative h-32 mx-16">
                <BoxPlotVisual data={boxPlotData} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-16">
                {[
                  { label: 'Min', value: boxPlotData.min },
                  { label: 'Q1', value: boxPlotData.q1 },
                  { label: 'Median', value: boxPlotData.median },
                  { label: 'Q3', value: boxPlotData.q3 },
                  { label: 'Max', value: boxPlotData.max },
                  { label: 'Lower Whisker', value: boxPlotData.lower_whisker },
                  { label: 'Upper Whisker', value: boxPlotData.upper_whisker },
                  { label: 'Outliers', value: boxPlotData.outlier_count },
                  { label: 'IQR', value: +(boxPlotData.q3 - boxPlotData.q1).toFixed(3) },
                  { label: 'Range', value: +(boxPlotData.max - boxPlotData.min).toFixed(3) },
                ].map(m => (
                  <div key={m.label} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">{m.label}</p>
                    <p className="text-sm font-semibold">{typeof m.value === 'number' ? m.value.toLocaleString(undefined, { maximumFractionDigits: 3 }) : m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </ChartZoomModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Box Plot Visual ───

function BoxPlotVisual({ data }: { data: BoxPlotData }) {
  const { min, q1, median, q3, max, lower_whisker, upper_whisker, outliers } = data;
  const range = max - min || 1;
  const toPercent = (val: number) => ((val - min) / range) * 100;

  return (
    <div className="relative w-full h-full">
      {/* center line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />

      {/* whisker line */}
      <div
        className="absolute top-1/2 h-0.5 bg-muted-foreground/40 -translate-y-1/2"
        style={{ left: `${toPercent(lower_whisker)}%`, width: `${toPercent(upper_whisker) - toPercent(lower_whisker)}%` }}
      />

      {/* whisker caps */}
      {[lower_whisker, upper_whisker].map((v, i) => (
        <div key={i} className="absolute top-1/4 w-0.5 h-1/2 bg-muted-foreground/60" style={{ left: `${toPercent(v)}%` }} />
      ))}

      {/* IQR box */}
      <div
        className="absolute top-[15%] h-[70%] rounded-md border-2 border-primary bg-primary/15"
        style={{ left: `${toPercent(q1)}%`, width: `${toPercent(q3) - toPercent(q1)}%` }}
      />

      {/* median line */}
      <div
        className="absolute top-[10%] h-[80%] w-0.5 bg-destructive z-10"
        style={{ left: `${toPercent(median)}%` }}
      />

      {/* outlier dots */}
      {outliers.slice(0, 20).map((v, i) => (
        <div
          key={i}
          className="absolute top-1/2 w-2 h-2 rounded-full bg-amber-500 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${Math.max(0, Math.min(100, toPercent(v)))}%` }}
          title={`Outlier: ${v}`}
        />
      ))}

      {/* labels */}
      <div className="absolute -bottom-5 text-[9px] text-muted-foreground" style={{ left: `${toPercent(q1)}%`, transform: 'translateX(-50%)' }}>Q1: {q1}</div>
      <div className="absolute -bottom-5 text-[9px] text-destructive font-semibold" style={{ left: `${toPercent(median)}%`, transform: 'translateX(-50%)' }}>Med: {median}</div>
      <div className="absolute -bottom-5 text-[9px] text-muted-foreground" style={{ left: `${toPercent(q3)}%`, transform: 'translateX(-50%)' }}>Q3: {q3}</div>
    </div>
  );
}

// ─── Report Panel ───

const REPORT_STAGES = [
  { pct: 5, label: 'Preparing data…' },
  { pct: 15, label: 'Computing statistics…' },
  { pct: 30, label: 'Building histograms…' },
  { pct: 45, label: 'Drawing scatter plots…' },
  { pct: 55, label: 'Generating heatmap…' },
  { pct: 65, label: 'Rendering box plots…' },
  { pct: 75, label: 'Creating pie charts…' },
  { pct: 85, label: 'Assembling PDF pages…' },
  { pct: 92, label: 'Adding watermarks…' },
];

function ReportPanel({ loading, onGenerate, hasSession }: { loading: boolean; onGenerate: () => void; hasSession: boolean }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      let idx = 0;
      setProgress(0);
      setStage(REPORT_STAGES[0].label);
      intervalRef.current = setInterval(() => {
        idx++;
        if (idx < REPORT_STAGES.length) {
          setProgress(REPORT_STAGES[idx].pct);
          setStage(REPORT_STAGES[idx].label);
        }
      }, 800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progress > 0) {
        setProgress(100);
        setStage('Done!');
        const t = setTimeout(() => { setProgress(0); setStage(''); }, 1200);
        return () => clearTimeout(t);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loading]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Generate Report</h1>
      <p className="text-sm text-muted-foreground mb-6">Download a branded PDF analytics report with embedded charts</p>

      <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">PDF Analytics Report</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Comprehensive report with embedded charts, statistical analysis,
          and watermarked branding on every page.
        </p>
        <ul className="text-left text-xs text-muted-foreground space-y-2 mb-6 max-w-xs mx-auto">
          {[
            'Summary metrics & data types',
            'Column statistics with skew',
            'Histogram & bar charts',
            'Correlation heatmap',
            'Scatter plots (top pairs)',
            'Box plots for numeric columns',
            'Pie chart for categoricals',
            'Outlier detection (IQR)',
            'DataForgeAI watermark',
          ].map(t => (
            <li key={t} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t}
            </li>
          ))}
        </ul>
        <Button
          onClick={onGenerate}
          disabled={!hasSession || loading}
          size="lg"
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loading ? 'Generating...' : 'Download Report'}
        </Button>

        {/* Progress bar */}
        <AnimatePresence>
          {(loading || progress > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 w-full max-w-xs mx-auto"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground font-medium">{stage}</span>
                <span className="text-xs font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Preview Modal ───

function PreviewModal({ preview, page, onPageChange, onClose }: {
  preview: PreviewData; page: number; onPageChange: (p: number) => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl shadow-lg w-full max-w-5xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Table2 className="w-4 h-4 text-primary" /> Data Preview
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Page {preview.page} of {preview.total_pages}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= preview.total_pages} onClick={() => onPageChange(page + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">#</th>
                {preview.columns.map(c => (
                  <th key={c} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-1.5 text-muted-foreground">{(page - 1) * preview.page_size + ri + 1}</td>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5 max-w-[200px] truncate">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          {preview.total_rows.toLocaleString()} total rows
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Chart Zoom Modal ───

function ChartZoomModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-primary" /> {title}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="h-[65vh]">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Expand chart"
    >
      <Maximize2 className="w-3.5 h-3.5" />
    </button>
  );
}

// ─── Helpers ───

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-lg" />
      <div className="h-4 w-80 bg-muted rounded" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function corrColor(val: number): string {
  if (val >= 0.7) return '#7c3aed';
  if (val >= 0.4) return '#a78bfa';
  if (val >= 0.1) return '#ddd6fe';
  if (val >= -0.1) return '#f3f4f6';
  if (val >= -0.4) return '#fecaca';
  if (val >= -0.7) return '#f87171';
  return '#ef4444';
}

function truncateLabel(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

export default AnalyticsWorkspace;
