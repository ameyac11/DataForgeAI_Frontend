import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Upload, BarChart3, Columns3, GitCompareArrows, Activity,
  FileText, Table2, ChevronLeft, ChevronRight, Download,
  AlertTriangle, Clock, Trash2, FileUp, Loader2, X,
  TrendingUp, Database, Eye, PieChart, BoxSelect, Info,
  ScatterChart as ScatterIcon, BarChart2, Maximize2, Sparkles, SlidersHorizontal,
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
  type AnalyticsHistoryItem,
  type ColumnInfo,
  type DistributionData,
  type CorrelationData,
  type ScatterData,
  type BoxPlotData,
  type OutlierData,
  type TimeseriesData,
  type PreviewData,
  type SimulationResult,
} from '@/services/analyticsApi';

// tab config
const TABS = [
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'summary', icon: BarChart3, label: 'Summary' },
  { id: 'columns', icon: Columns3, label: 'Columns' },
  { id: 'correlation', icon: GitCompareArrows, label: 'Correlation' },
  { id: 'distributions', icon: Activity, label: 'Distributions' },
  { id: 'scatter', icon: ScatterIcon, label: 'Scatter & Box' },
  { id: 'simulation', icon: SlidersHorizontal, label: 'Simulation' },
  { id: 'history', icon: Clock, label: 'History' },
  { id: 'report', icon: FileText, label: 'Report' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const CHART_COLORS = [
  '#0f766e', '#f97316', '#0284c7', '#ef4444', '#16a34a',
  '#ca8a04', '#b91c1c', '#0369a1', '#0ea5e9', '#22c55e',
  '#ea580c', '#0891b2', '#84cc16', '#65a30d', '#f59e0b',
];

const CATEGORY_BAR_COLORS = [
  '#0f766e', '#0e7490', '#0369a1', '#1d4ed8', '#15803d',
  '#4d7c0f', '#a16207', '#b45309', '#be123c', '#334155',
  '#475569', '#0f172a',
];

const PRIMARY_CHART_COLOR = '#0e7490';

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
  const [history, setHistory] = useState<AnalyticsHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // scatter & box plot state
  const [scatterData, setScatterData] = useState<ScatterData | null>(null);
  const [scatterColX, setScatterColX] = useState('');
  const [scatterColY, setScatterColY] = useState('');
  const [boxPlotData, setBoxPlotData] = useState<BoxPlotData | null>(null);
  const [boxPlotCol, setBoxPlotCol] = useState('');
  const [simulationTargetCol, setSimulationTargetCol] = useState('');
  const [simulationDriverCol, setSimulationDriverCol] = useState('');
  const [simulationChangePct, setSimulationChangePct] = useState(10);
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);

  const [uploading, setUploading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [scatterLoading, setScatterLoading] = useState(false);
  const [boxPlotLoading, setBoxPlotLoading] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistCol, setSelectedDistCol] = useState<string>('');
  const [selectedOutlierCol, setSelectedOutlierCol] = useState<string>('');
  const [distributionBins, setDistributionBins] = useState<number>(20);
  const [panelInsights, setPanelInsights] = useState<Record<string, string>>({});
  const [panelInsightLoading, setPanelInsightLoading] = useState<Record<string, boolean>>({});

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (sessionId) analyticsApi.deleteSession(sessionId).catch(() => { });
    };
  }, [sessionId]);

  useEffect(() => {
    const canNavigate = !!sessionId && !!summary;
    const onKey = (e: KeyboardEvent) => {
      if (!canNavigate) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const enabledTabs = TABS.filter((tab) => tab.id === 'upload' || canNavigate);
      const idx = enabledTabs.findIndex((t) => t.id === activeTab);
      if (idx < 0) return;
      const next = e.key === 'ArrowRight'
        ? enabledTabs[(idx + 1) % enabledTabs.length]
        : enabledTabs[(idx - 1 + enabledTabs.length) % enabledTabs.length];
      setActiveTab(next.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab, sessionId, summary]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      if (sessionId) await analyticsApi.deleteSession(sessionId).catch(() => { });
      const res = await analyticsApi.upload(file);
      setSessionId(res.session_id);
      setSummary(res.summary);
      setHistory(await analyticsApi.getHistory(30).catch(() => []));
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
      setSimulationTargetCol('');
      setSimulationDriverCol('');
      setSimulationChangePct(10);
      setSimulationData(null);
      setDistributionBins(20);
      setPanelInsights({});
      setPanelInsightLoading({});
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
    if (!sessionId && tab !== 'history') return;
    setLoadingTab(true);
    try {
      if (sessionId && (tab === 'columns' || tab === 'distributions' || tab === 'scatter' || tab === 'simulation') && columns.length === 0) {
        const cols = await analyticsApi.getColumns(sessionId);
        setColumns(cols);
        if (tab === 'simulation') {
          const nums = cols.filter((c) => c.category === 'numeric').map((c) => c.name);
          if (nums.length >= 2) {
            setSimulationDriverCol((prev) => prev || nums[0]);
            setSimulationTargetCol((prev) => prev || nums[1]);
          }
        }
      }
      if (sessionId && tab === 'simulation' && columns.length > 0) {
        const nums = columns.filter((c) => c.category === 'numeric').map((c) => c.name);
        if (nums.length >= 2) {
          setSimulationDriverCol((prev) => prev || nums[0]);
          setSimulationTargetCol((prev) => prev || nums[1]);
        }
      }
      if (sessionId && tab === 'correlation' && !correlation) {
        setCorrelation(await analyticsApi.getCorrelation(sessionId));
        setTimeseries(await analyticsApi.getTimeseries(sessionId));
      }
      if (tab === 'history') {
        setHistoryLoading(true);
        setHistory(await analyticsApi.getHistory(40));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingTab(false);
      setHistoryLoading(false);
    }
  }, [sessionId, columns, columns.length, correlation]);

  const loadDistribution = useCallback(async (col: string, bins: number) => {
    const cacheKey = `${col}:${bins}`;
    if (!sessionId || distributions[cacheKey]) return;
    try {
      const d = await analyticsApi.getDistribution(sessionId, col, bins);
      setDistributions(prev => ({ ...prev, [cacheKey]: d }));
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
    if (sessionId) await analyticsApi.deleteSession(sessionId).catch(() => { });
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
    setSimulationTargetCol('');
    setSimulationDriverCol('');
    setSimulationChangePct(10);
    setSimulationData(null);
    setPanelInsights({});
    setPanelInsightLoading({});
    setActiveTab('upload');
  }, [sessionId]);

  const explainPanel = useCallback(async (panel: 'summary' | 'columns' | 'correlation' | 'distribution' | 'scatter_box' | 'timeseries' | 'simulation', context: Record<string, unknown>) => {
    setPanelInsightLoading((prev) => ({ ...prev, [panel]: true }));
    try {
      const res = await analyticsApi.explainChart({ panel, context });
      setPanelInsights((prev) => ({ ...prev, [panel]: res.insight }));
    } catch (e: any) {
      setError(e.message || 'Failed to generate insight');
    } finally {
      setPanelInsightLoading((prev) => ({ ...prev, [panel]: false }));
    }
  }, []);

  const runSimulation = useCallback(async () => {
    if (!sessionId || !simulationTargetCol || !simulationDriverCol) return;
    setSimulationLoading(true);
    try {
      const res = await analyticsApi.getSimulation(sessionId, simulationTargetCol, simulationDriverCol, simulationChangePct);
      setSimulationData(res);
    } catch (e: any) {
      setError(e.message || 'Simulation failed');
    } finally {
      setSimulationLoading(false);
    }
  }, [sessionId, simulationTargetCol, simulationDriverCol, simulationChangePct]);

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
          <nav className="p-2 space-y-1" role="tablist" aria-label="Analytics sections">
            {TABS.map(tab => {
              const disabled = tab.id !== 'upload' && tab.id !== 'history' && !hasSession;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  disabled={disabled}
                  onClick={() => switchTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
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
          {hasSession && summary && (
            <div className="mb-6 rounded-2xl border border-border bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-emerald-500/10 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Operational Dataset</p>
                  <h3 className="text-base font-semibold">{summary.filename}</h3>
                  <p className="text-xs text-muted-foreground">
                    {summary.rows.toLocaleString()} rows, {summary.columns.toLocaleString()} columns, {summary.memory_display} in memory
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-background/80 px-3 py-2 border border-border">Quality Score: <span className="font-semibold">{computeDataQualityScore(summary)}/100</span></div>
                  <div className="rounded-lg bg-background/80 px-3 py-2 border border-border">Missing: <span className="font-semibold">{summary.missing_pct}%</span></div>
                  <div className="rounded-lg bg-background/80 px-3 py-2 border border-border">Numeric: <span className="font-semibold">{summary.numeric_columns}</span></div>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <div key="upload" id="panel-upload" role="tabpanel"><UploadPanel uploading={uploading} fileRef={fileRef} onUpload={handleUpload} onDrop={handleDrop} hasSession={hasSession} summary={summary} /></div>
            )}
            {activeTab === 'summary' && summary && (
              <div key="summary" id="panel-summary" role="tabpanel"><SummaryPanel
                summary={summary}
                loading={loadingTab}
                insight={panelInsights.summary}
                insightLoading={!!panelInsightLoading.summary}
                onExplain={() => explainPanel('summary', {
                  filename: summary.filename,
                  rows: summary.rows,
                  columns: summary.columns,
                  missing_pct: summary.missing_pct,
                  duplicates: summary.duplicates,
                  numeric_columns: summary.numeric_columns,
                  categorical_columns: summary.categorical_columns,
                })}
              /></div>
            )}
            {activeTab === 'columns' && (
              <div key="columns" id="panel-columns" role="tabpanel"><ColumnsPanel
                columns={columns}
                loading={loadingTab}
                insight={panelInsights.columns}
                insightLoading={!!panelInsightLoading.columns}
                onExplain={() => explainPanel('columns', {
                  total_columns: columns.length,
                  numeric_columns: columns.filter(c => c.category === 'numeric').length,
                  categorical_columns: columns.filter(c => c.category === 'categorical').length,
                  datetime_columns: columns.filter(c => c.category === 'datetime').length,
                  top_missing: columns
                    .slice()
                    .sort((a, b) => b.missing - a.missing)
                    .slice(0, 5)
                    .map(c => ({ name: c.name, missing: c.missing, missing_pct: c.missing_pct })),
                })}
              /></div>
            )}
            {activeTab === 'correlation' && (
              <div key="correlation" id="panel-correlation" role="tabpanel"><CorrelationPanel
                correlation={correlation}
                timeseries={timeseries}
                loading={loadingTab}
                insight={panelInsights.correlation}
                insightLoading={!!panelInsightLoading.correlation}
                onExplain={() => explainPanel('correlation', {
                  columns: correlation?.columns || [],
                  matrix: correlation?.matrix || [],
                  timeseries_columns: timeseries.map((t) => t.column),
                })}
              /></div>
            )}
            {activeTab === 'distributions' && (
              <div key="distributions" id="panel-distributions" role="tabpanel"><DistributionsPanel
                  columns={columns}
                  distributions={distributions}
                  outliers={outliers}
                  selectedDistCol={selectedDistCol}
                  selectedOutlierCol={selectedOutlierCol}
                  distributionBins={distributionBins}
                  insight={panelInsights.distribution}
                  insightLoading={!!panelInsightLoading.distribution}
                  onExplain={() => explainPanel('distribution', {
                    selected_column: selectedDistCol,
                    bins: distributionBins,
                    distribution: selectedDistCol ? distributions[`${selectedDistCol}:${distributionBins}`] || null : null,
                    outlier_column: selectedOutlierCol,
                    outlier: selectedOutlierCol ? outliers[selectedOutlierCol] || null : null,
                  })}
                  onDistributionBinsChange={(bins) => {
                    setDistributionBins(bins);
                    if (selectedDistCol) loadDistribution(selectedDistCol, bins);
                  }}
                  onSelectDist={(c) => { setSelectedDistCol(c); loadDistribution(c, distributionBins); }}
                  onSelectOutlier={(c) => { setSelectedOutlierCol(c); loadOutlier(c); }}
                  loading={loadingTab}
                /></div>
            )}
            {activeTab === 'scatter' && (
              <div key="scatter" id="panel-scatter" role="tabpanel"><ScatterBoxPanel
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
                  insight={panelInsights.scatter_box}
                  insightLoading={!!panelInsightLoading.scatter_box}
                  onExplain={() => explainPanel('scatter_box', {
                    scatter: scatterData,
                    boxplot: boxPlotData,
                    x_axis: scatterColX,
                    y_axis: scatterColY,
                    box_column: boxPlotCol,
                  })}
                  onBoxPlotColChange={(c) => { setBoxPlotCol(c); loadBoxPlot(c); }}
                  loading={loadingTab}
                /></div>
            )}
            {activeTab === 'simulation' && (
              <div key="simulation" id="panel-simulation" role="tabpanel"><SimulationPanel
                columns={columns}
                targetCol={simulationTargetCol}
                driverCol={simulationDriverCol}
                changePct={simulationChangePct}
                data={simulationData}
                loading={loadingTab || simulationLoading}
                onTargetColChange={setSimulationTargetCol}
                onDriverColChange={setSimulationDriverCol}
                onChangePctChange={setSimulationChangePct}
                onRun={runSimulation}
                insight={panelInsights.simulation}
                insightLoading={!!panelInsightLoading.simulation}
                onExplain={() => explainPanel('simulation', {
                  target: simulationTargetCol,
                  driver: simulationDriverCol,
                  change_pct: simulationChangePct,
                  result: simulationData,
                })}
              /></div>
            )}
            {activeTab === 'history' && (
              <div key="history" id="panel-history" role="tabpanel"><HistoryPanel history={history} loading={historyLoading} /></div>
            )}
            {activeTab === 'report' && (
              <div key="report" id="panel-report" role="tabpanel"><ReportPanel loading={reportLoading} onGenerate={handleReport} hasSession={hasSession} /></div>
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

function InsightCard({ insight, loading, onExplain }: { insight?: string; loading: boolean; onExplain: () => void }) {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 mb-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs font-semibold tracking-wide uppercase text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Explain this chart
        </p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onExplain} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Generate AI Insight'}
        </Button>
      </div>
      {insight ? (
        <div className="text-xs leading-relaxed text-muted-foreground overflow-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h4 className="text-sm font-semibold text-foreground mt-2 mb-1">{children}</h4>,
              h2: ({ children }) => <h4 className="text-sm font-semibold text-foreground mt-2 mb-1">{children}</h4>,
              h3: ({ children }) => <h5 className="text-xs font-semibold text-foreground mt-2 mb-1">{children}</h5>,
              h4: ({ children }) => <h5 className="text-xs font-semibold text-foreground mt-2 mb-1">{children}</h5>,
              p: ({ children }) => <p className="mb-2 text-xs leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
              li: ({ children }) => <li className="text-xs">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              code: ({ children }) => <code className="px-1 py-0.5 rounded bg-cyan-700/10 text-cyan-700 dark:text-cyan-300">{children}</code>,
            }}
          >
            {insight}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Get a concise AI interpretation with key signal, interpretation, and recommended action.</p>
      )}
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

function SummaryPanel({ summary, loading, insight, insightLoading, onExplain }: { summary: AnalyticsSummary; loading: boolean; insight?: string; insightLoading: boolean; onExplain: () => void }) {
  const [zoomed, setZoomed] = useState(false);
  if (loading) return <LoadingSkeleton />;
  const executiveInsights = buildExecutiveInsights(summary);

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
      <InsightCard insight={insight} loading={insightLoading} onExplain={onExplain} />

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

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-700" /> Executive Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {executiveInsights.map((insight) => (
            <div key={insight.title} className="rounded-lg border border-border/70 bg-muted/30 p-3">
              <p className="text-xs font-semibold text-foreground">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
            </div>
          ))}
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

function ColumnsPanel({ columns, loading, insight, insightLoading, onExplain }: { columns: ColumnInfo[]; loading: boolean; insight?: string; insightLoading: boolean; onExplain: () => void }) {
  const [zoomedCol, setZoomedCol] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'numeric' | 'categorical' | 'datetime'>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'missing' | 'unique'>('missing');
  if (loading) return <LoadingSkeleton />;

  const numeric = columns.filter(c => c.category === 'numeric');
  const categorical = columns.filter(c => c.category === 'categorical');
  const datetime = columns.filter(c => c.category === 'datetime');

  const filteredColumns = [...columns]
    .filter((col) => categoryFilter === 'all' || col.category === categoryFilter)
    .filter((col) => col.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      if (sortBy === 'unique') return b.unique - a.unique;
      return b.missing - a.missing;
    });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Column Analysis</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {numeric.length} numeric • {categorical.length} categorical • {datetime.length} datetime
      </p>
      <InsightCard insight={insight} loading={insightLoading} onExplain={onExplain} />

      <div className="mb-4 rounded-xl border border-border bg-card/70 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search column name..."
            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-600/30"
          />
          <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Filter category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All categories</SelectItem>
              <SelectItem value="numeric" className="text-xs">Numeric</SelectItem>
              <SelectItem value="categorical" className="text-xs">Categorical</SelectItem>
              <SelectItem value="datetime" className="text-xs">Datetime</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="missing" className="text-xs">Sort by missing</SelectItem>
              <SelectItem value="unique" className="text-xs">Sort by unique</SelectItem>
              <SelectItem value="alpha" className="text-xs">Sort A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {columns.length === 0 && <InfoBanner message="No columns found in dataset." />}
      {columns.length > 0 && filteredColumns.length === 0 && <InfoBanner message="No columns match current filters." variant="warning" />}

      <div className="space-y-3">
        {filteredColumns.map((col, i) => (
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
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {col.top_values.slice(0, 8).map((entry, i) => (
                          <Cell key={`${entry.value}-${i}`} fill={getCategoryBarColor(entry.value)} />
                        ))}
                      </Bar>
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
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {col.top_values.map((entry, i) => (
                      <Cell key={`${entry.value}-${i}`} fill={getCategoryBarColor(entry.value)} />
                    ))}
                  </Bar>
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

function CorrelationPanel({ correlation, timeseries, loading, insight, insightLoading, onExplain }: {
  correlation: CorrelationData | null; timeseries: TimeseriesData[]; loading: boolean;
  insight?: string; insightLoading: boolean; onExplain: () => void;
}) {
  const [zoomedHeatmap, setZoomedHeatmap] = useState(false);
  const [zoomedTs, setZoomedTs] = useState<string | null>(null);
  const [hoveredCorr, setHoveredCorr] = useState<{
    x: number;
    y: number;
    row: string;
    col: string;
    value: number;
  } | null>(null);
  if (loading) return <LoadingSkeleton />;

  const hasMessage = correlation?.message && correlation.columns.length < 2;
  const hasCorr = correlation && correlation.columns.length >= 2;
  const corrInsights = hasCorr && correlation ? deriveCorrelationInsights(correlation) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Correlation Analysis</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {hasCorr ? `${correlation.columns.length} numeric columns analyzed` : 'Correlation heatmap & time series'}
      </p>
      <InsightCard insight={insight} loading={insightLoading} onExplain={onExplain} />

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

          {corrInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Strongest Positive</p>
                <p className="text-muted-foreground mt-0.5">
                  {corrInsights.positive.left} × {corrInsights.positive.right} = {corrInsights.positive.value.toFixed(3)} ({correlationStrengthLabel(corrInsights.positive.value)})
                </p>
              </div>
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-xs">
                <p className="font-semibold text-orange-700 dark:text-orange-300">Strongest Negative</p>
                <p className="text-muted-foreground mt-0.5">
                  {corrInsights.negative.left} × {corrInsights.negative.right} = {corrInsights.negative.value.toFixed(3)} ({correlationStrengthLabel(corrInsights.negative.value)})
                </p>
              </div>
            </div>
          )}

          {/* Responsive heatmap grid — fills available width */}
          <div className="relative">
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
                      className="aspect-square flex items-center justify-center text-[10px] font-mono rounded-sm transition-transform hover:scale-[1.02] cursor-default min-h-[28px] ring-1 ring-transparent hover:ring-white/70"
                      style={{ backgroundColor: corrColor(val), color: Math.abs(val) > 0.5 ? 'white' : 'hsl(var(--foreground))' }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCorr({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          row: correlation.columns[i],
                          col: correlation.columns[j],
                          value: val,
                        });
                      }}
                      onMouseMove={(e) => {
                        setHoveredCorr((prev) => {
                          if (!prev) return prev;
                          return { ...prev, x: e.clientX, y: e.clientY };
                        });
                      }}
                      onMouseLeave={() => setHoveredCorr(null)}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>

            {hoveredCorr && (
              <div
                className="pointer-events-none fixed z-[80] px-3 py-2 rounded-lg border border-slate-700/70 bg-slate-950/95 text-slate-100 shadow-xl"
                style={{ left: hoveredCorr.x + 14, top: hoveredCorr.y - 12 }}
              >
                <p className="text-[11px] font-semibold leading-tight">
                  {hoveredCorr.row} × {hoveredCorr.col}
                </p>
                <p className="text-[11px] text-cyan-300 mt-0.5">
                  Correlation: {hoveredCorr.value.toFixed(3)}
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {correlationStrengthLabel(hoveredCorr.value)}
                </p>
              </div>
            )}
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
                    <Line type="monotone" dataKey="count" stroke="#0e7490" strokeWidth={2} dot={false} />
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
                        className="aspect-square flex items-center justify-center text-[10px] font-mono rounded-sm min-h-[36px] ring-1 ring-transparent hover:ring-white/70"
                        style={{ backgroundColor: corrColor(val), color: Math.abs(val) > 0.5 ? 'white' : 'hsl(var(--foreground))' }}
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
                  <Line type="monotone" dataKey="count" stroke="#0e7490" strokeWidth={2} dot={{ r: 2 }} />
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

function DistributionsPanel({ columns, distributions, outliers, selectedDistCol, selectedOutlierCol, distributionBins, insight, insightLoading, onExplain, onDistributionBinsChange, onSelectDist, onSelectOutlier, loading }: {
  columns: ColumnInfo[]; distributions: Record<string, DistributionData>;
  outliers: Record<string, OutlierData>;
  selectedDistCol: string; selectedOutlierCol: string;
  distributionBins: number;
  insight?: string;
  insightLoading: boolean;
  onExplain: () => void;
  onDistributionBinsChange: (bins: number) => void;
  onSelectDist: (c: string) => void; onSelectOutlier: (c: string) => void;
  loading: boolean;
}) {
  const [zoomedDist, setZoomedDist] = useState(false);
  if (loading) return <LoadingSkeleton />;

  const numericCols = columns.filter(c => c.category === 'numeric');
  const allCols = columns.map(c => c.name);
  const dist = distributions[`${selectedDistCol}:${distributionBins}`];
  const outlier = outliers[selectedOutlierCol];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Distributions</h1>
      <p className="text-sm text-muted-foreground mb-6">Explore value distributions and detect outliers</p>
      <InsightCard insight={insight} loading={insightLoading} onExplain={onExplain} />

      {/* distribution chart */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Value Distribution
          </h3>
          <div className="flex items-center gap-2">
            {dist && <ExpandButton onClick={() => setZoomedDist(true)} />}
            <Select value={String(distributionBins)} onValueChange={(v) => onDistributionBinsChange(Number(v))}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Bins" /></SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((b) => <SelectItem key={b} value={String(b)} className="text-xs">{b} bins</SelectItem>)}
              </SelectContent>
            </Select>
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
                <Bar dataKey="count" fill={PRIMARY_CHART_COLOR} radius={[4, 4, 0, 0]}>
                  {(dist.bins || dist.values || []).map((entry: any, i: number) => (
                    <Cell key={`${entry?.range || entry?.label || i}`} fill={CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length]} />
                  ))}
                </Bar>
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
                <Bar dataKey="count" fill={PRIMARY_CHART_COLOR} radius={[4, 4, 0, 0]}>
                  {(dist.bins || dist.values || []).map((entry: any, i: number) => (
                    <Cell key={`${entry?.range || entry?.label || i}`} fill={CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length]} />
                  ))}
                </Bar>
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
  boxPlotData, boxPlotCol, boxPlotLoading, insight, insightLoading, onExplain, onBoxPlotColChange, loading,
}: {
  columns: ColumnInfo[];
  scatterData: ScatterData | null;
  scatterColX: string; scatterColY: string; scatterLoading: boolean;
  onScatterColXChange: (c: string) => void; onScatterColYChange: (c: string) => void;
  boxPlotData: BoxPlotData | null;
  boxPlotCol: string; boxPlotLoading: boolean;
  insight?: string; insightLoading: boolean; onExplain: () => void;
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
      <InsightCard insight={insight} loading={insightLoading} onExplain={onExplain} />

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
                      <Scatter data={scatterData.points} fill="#0369a1" fillOpacity={0.6} strokeWidth={0} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  {scatterData.count} data points plotted{scatterData.count >= 500 ? ' (sampled)' : ''}
                </p>
                {scatterData.count >= 500 && (
                  <div className="mt-2">
                    <InfoBanner message="This scatter chart is sampled for performance (max 500 points). Use filters or narrower columns for higher-fidelity exploration." variant="warning" />
                  </div>
                )}
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
                <Scatter data={scatterData.points} fill="#0369a1" fillOpacity={0.6} strokeWidth={0} />
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

// ─── Simulation Panel ───

function SimulationPanel({
  columns,
  targetCol,
  driverCol,
  changePct,
  data,
  loading,
  onTargetColChange,
  onDriverColChange,
  onChangePctChange,
  onRun,
  insight,
  insightLoading,
  onExplain,
}: {
  columns: ColumnInfo[];
  targetCol: string;
  driverCol: string;
  changePct: number;
  data: SimulationResult | null;
  loading: boolean;
  onTargetColChange: (v: string) => void;
  onDriverColChange: (v: string) => void;
  onChangePctChange: (v: number) => void;
  onRun: () => void;
  insight?: string;
  insightLoading: boolean;
  onExplain: () => void;
}) {
  const numericCols = columns.filter((c) => c.category === 'numeric').map((c) => c.name);
  const hasEnough = numericCols.length >= 2;

  const comparisonData = data ? [
    { name: 'Baseline', driver: data.baseline.driver, target: data.baseline.target },
    { name: 'Simulated', driver: data.simulated.driver, target: data.simulated.target },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">What-if Simulation</h1>
      <p className="text-sm text-muted-foreground mb-6">Model how changing one driver can impact a target KPI using dataset relationships.</p>
      <InsightCard insight={insight} loading={insightLoading} onExplain={onExplain} />

      {!hasEnough ? (
        <InfoBanner message="Simulation requires at least 2 numeric columns." variant="warning" />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Driver Column</p>
                <Select value={driverCol} onValueChange={onDriverColChange}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select driver" /></SelectTrigger>
                  <SelectContent>
                    {numericCols.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Column</p>
                <Select value={targetCol} onValueChange={onTargetColChange}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select target" /></SelectTrigger>
                  <SelectContent>
                    {numericCols.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full h-9 text-xs" onClick={onRun} disabled={loading || !driverCol || !targetCol || driverCol === targetCol}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Simulation'}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">Driver Change Scenario</p>
                <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">{changePct > 0 ? '+' : ''}{changePct}%</p>
              </div>
              <input
                type="range"
                min={-50}
                max={100}
                step={1}
                value={changePct}
                onChange={(e) => onChangePctChange(Number(e.target.value))}
                className="w-full accent-cyan-700"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>-50%</span>
                <span>0%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>

          {data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Target Delta</p>
                  <p className="text-base font-semibold">{data.impact.target_delta.toLocaleString(undefined, { maximumFractionDigits: 3 })}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Target Delta %</p>
                  <p className="text-base font-semibold">{data.impact.target_delta_pct.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Correlation</p>
                  <p className="text-base font-semibold">{data.model.correlation.toLocaleString(undefined, { maximumFractionDigits: 3 })}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Sample Size</p>
                  <p className="text-base font-semibold">{data.model.sample_size.toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm mb-3">Baseline vs Simulated</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend />
                      <Bar dataKey="driver" fill="#0e7490" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
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

// ─── History Panel ───

function HistoryPanel({ history, loading }: { history: AnalyticsHistoryItem[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="text-2xl font-bold mb-1">Analysis History</h1>
      <p className="text-sm text-muted-foreground mb-6">Persistent timeline of your analytics sessions and operational status.</p>

      {history.length === 0 && (
        <InfoBanner message="No analytics history yet. Upload a dataset to begin building your analysis timeline." />
      )}

      <div className="space-y-3">
        {history.map((item, idx) => (
          <motion.div
            key={`${item.session_id}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{item.filename}</p>
                <p className="text-xs text-muted-foreground">Session: {item.session_id}</p>
              </div>
              <span className={cn(
                'text-[10px] px-2 py-1 rounded-full uppercase font-semibold w-fit',
                item.state === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                  item.state === 'expired' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-slate-500/10 text-slate-600'
              )}>
                {item.state}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <div className="rounded-lg bg-muted/50 p-2">Rows: <span className="font-semibold">{item.rows.toLocaleString()}</span></div>
              <div className="rounded-lg bg-muted/50 p-2">Columns: <span className="font-semibold">{item.columns}</span></div>
              <div className="rounded-lg bg-muted/50 p-2">Numeric: <span className="font-semibold">{item.numeric_columns}</span></div>
              <div className="rounded-lg bg-muted/50 p-2">Categorical: <span className="font-semibold">{item.categorical_columns}</span></div>
              <div className="rounded-lg bg-muted/50 p-2">File Size: <span className="font-semibold">{bytesToDisplay(item.file_size_bytes)}</span></div>
              <div className="rounded-lg bg-muted/50 p-2">Created: <span className="font-semibold">{formatDateTime(item.created_at)}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
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
          className="gap-2 bg-gradient-to-r from-cyan-700 to-emerald-600 hover:from-cyan-800 hover:to-emerald-700 text-white border-0 px-8"
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
                  className="h-full rounded-full bg-gradient-to-r from-cyan-700 to-emerald-600"
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
  if (val >= 0.7) return '#0369a1';
  if (val >= 0.4) return '#0ea5e9';
  if (val >= 0.1) return '#bae6fd';
  if (val >= -0.1) return '#f3f4f6';
  if (val >= -0.4) return '#fed7aa';
  if (val >= -0.7) return '#fdba74';
  return '#f97316';
}

function truncateLabel(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

function getCategoryBarColor(value: string): string {
  const text = value || '';
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % CATEGORY_BAR_COLORS.length;
  return CATEGORY_BAR_COLORS[idx];
}

function correlationStrengthLabel(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 0.85) return 'Very strong relationship';
  if (abs >= 0.7) return 'Strong relationship';
  if (abs >= 0.5) return 'Moderate relationship';
  if (abs >= 0.3) return 'Weak relationship';
  return 'Very weak relationship';
}

function deriveCorrelationInsights(correlation: CorrelationData) {
  const cols = correlation.columns;
  const matrix = correlation.matrix;
  let bestPositive = { left: cols[0], right: cols[0], value: -Infinity };
  let bestNegative = { left: cols[0], right: cols[0], value: Infinity };

  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = i + 1; j < matrix[i].length; j += 1) {
      const val = matrix[i][j];
      if (val > bestPositive.value) {
        bestPositive = { left: cols[i], right: cols[j], value: val };
      }
      if (val < bestNegative.value) {
        bestNegative = { left: cols[i], right: cols[j], value: val };
      }
    }
  }

  return { positive: bestPositive, negative: bestNegative };
}

function buildExecutiveInsights(summary: AnalyticsSummary): Array<{ title: string; description: string }> {
  const qualityScore = computeDataQualityScore(summary);
  const duplicateRate = summary.rows > 0 ? ((summary.duplicates / summary.rows) * 100).toFixed(2) : '0.00';
  const numericBalance = summary.columns > 0 ? ((summary.numeric_columns / summary.columns) * 100).toFixed(1) : '0.0';

  return [
    {
      title: `Data quality score: ${qualityScore}/100`,
      description: qualityScore >= 80
        ? 'Dataset quality is strong and suitable for advanced analytics workflows.'
        : 'Quality risk detected. Review missing values and duplicate patterns before modeling.',
    },
    {
      title: `Missing data exposure: ${summary.missing_pct}%`,
      description: summary.missing_pct > 10
        ? 'High missing ratio may skew trends. Consider imputation or targeted cleanup.'
        : 'Missing data is within acceptable range for exploratory analysis.',
    },
    {
      title: `Duplicate rate: ${duplicateRate}%`,
      description: Number(duplicateRate) > 5
        ? 'Duplicate-heavy records can distort KPIs; de-duplication is recommended.'
        : 'Duplicate pressure is low, supporting cleaner aggregates and correlation analysis.',
    },
    {
      title: `Numeric coverage: ${numericBalance}%`,
      description: Number(numericBalance) >= 40
        ? 'Healthy numeric coverage enables richer statistical and correlation analyses.'
        : 'Limited numeric coverage. Focus on categorical and frequency-based analytics.',
    },
  ];
}

function computeDataQualityScore(summary: AnalyticsSummary): number {
  const missingPenalty = Math.min(summary.missing_pct, 40);
  const duplicateRate = summary.rows > 0 ? (summary.duplicates / summary.rows) * 100 : 0;
  const duplicatePenalty = Math.min(duplicateRate, 35);
  const diversityBonus = summary.numeric_columns > 0 && summary.categorical_columns > 0 ? 5 : 0;
  return Math.max(0, Math.min(100, Math.round(100 - missingPenalty - duplicatePenalty + diversityBonus)));
}

function bytesToDisplay(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[idx]}`;
}

function formatDateTime(iso: string): string {
  if (!iso) return 'N/A';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return 'N/A';
  return dt.toLocaleString();
}

export default AnalyticsWorkspace;
