import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Download, Trash2, Clock, HardDrive,
  FileJson, FileSpreadsheet, FileCode, Zap,
  Loader2, Search, BarChart3, Fingerprint, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { cn } from '@/lib/utils';

const formatIcons: Record<string, any> = {
  json: FileJson,
  csv: FileSpreadsheet,
  sql: FileCode,
  parquet: Zap,
};

const formatColors: Record<string, string> = {
  json: 'text-yellow-500 bg-yellow-500/10',
  csv: 'text-green-500 bg-green-500/10',
  sql: 'text-blue-500 bg-blue-500/10',
  parquet: 'text-purple-500 bg-purple-500/10',
};

interface Dataset {
  id: string;
  dataset_name: string;
  generation_mode: string;
  model_used: string;
  file_size_bytes: number;
  file_path: string;
  created_at: string;
}

const MyDatasets = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDatasets = useMemo(() => {
    if (!searchQuery.trim()) return datasets;
    const q = searchQuery.toLowerCase();
    return datasets.filter(d =>
      d.dataset_name.toLowerCase().includes(q) ||
      d.generation_mode.toLowerCase().includes(q) ||
      d.model_used.toLowerCase().includes(q) ||
      d.file_path.toLowerCase().includes(q)
    );
  }, [datasets, searchQuery]);

  const loadDatasets = async () => {
    try {
      const res = await api.get<any>(ENDPOINTS.DATASETS_LIST);
      if (res.data) {
        setDatasets(res.data.datasets || []);
        setCount(res.data.count || 0);
        setLimit(res.data.limit || 10);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleDelete = async (datasetId: string) => {
    setDeletingId(datasetId);
    try {
      await api.delete(ENDPOINTS.DATASETS_DELETE(datasetId));
      setDatasets(prev => prev.filter(d => d.id !== datasetId));
      setCount(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete dataset:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (dataset: Dataset) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}${ENDPOINTS.DATASETS_DOWNLOAD(dataset.id)}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const ext = dataset.file_path.split('.').pop() || 'json';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.dataset_name}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFormatFromPath = (filePath: string) => {
    return filePath.split('.').pop()?.toLowerCase() || 'json';
  };

  const modeLabels: Record<string, string> = {
    'synthetic': 'Synthetic',
    'realistic': 'Realistic',
    'real-time': 'Realistic',
    'hybrid': 'Hybrid',
    'live-data': 'Live Data',
  };

  return (
    <div className="h-full overflow-y-auto bg-background relative selection:bg-primary/20">

      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 space-y-8 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto p-6 md:p-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 relative">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Database className="w-5 h-5 text-purple-500" />
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                My Datasets
              </h1>
            </div>
            <p className="text-[13px] text-muted-foreground">
              Manage and download your generated datasets
            </p>
          </div>

          {/* Storage Indicator (Top Right Circular) */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="fill-none stroke-secondary"
                  strokeWidth="3.5"
                />
                {/* Progress Circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className={cn(
                    "fill-none transition-all duration-1000 ease-out",
                    count >= limit ? "stroke-red-500" : count >= limit * 0.8 ? "stroke-amber-500" : "stroke-primary"
                  )}
                  strokeWidth="3.5"
                  strokeDasharray={`${Math.min((count / limit) * 100, 100)} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <Database className="w-3.5 h-3.5 text-muted-foreground absolute" />
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide mb-0.5">Storage</span>
              <div className="flex items-baseline gap-0.5">
                <span className={cn(
                  "text-base font-bold leading-none tracking-tighter",
                  count >= limit ? "text-red-500" : count >= limit * 0.8 ? "text-amber-500" : "text-primary"
                )}>
                  {count}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">/ {limit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search datasets by name, mode, model, or format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="px-2 py-1 rounded-md bg-secondary text-xs font-medium border border-border hover:bg-secondary/80 transition-colors">
                  Clear
                </div>
              </button>
            )}
          </div>
        </div>


        {/* Datasets List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading datasets...</p>
          </div>
        ) : datasets.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-secondary/30 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner relative z-10">
              <Database className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">No datasets yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto relative z-10 leading-relaxed">
              Generate a dataset using the chat or custom generator to see it appear here.
            </p>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-secondary/30 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">No matches found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              No datasets match "{searchQuery}". Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDatasets.map((dataset, index) => {
              const ext = getFormatFromPath(dataset.file_path);
              const FormatIcon = formatIcons[ext] || FileJson;
              const formatColor = formatColors[ext] || 'text-primary bg-primary/10';

              return (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 px-4 rounded-xl border-b border-border/50 last:border-b-0 hover:bg-accent/30 transition-all duration-300 group cursor-default relative overflow-hidden"
                >

                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm", formatColor)}>
                    <FormatIcon className="w-6 h-6" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {dataset.dataset_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground">
                        <Fingerprint className="w-3.5 h-3.5 opacity-70" />
                        {modeLabels[dataset.generation_mode] || dataset.generation_mode}
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground">
                        <BarChart3 className="w-3.5 h-3.5 opacity-70" />
                        {dataset.model_used}
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground">
                        <HardDrive className="w-3.5 h-3.5 opacity-70" />
                        {formatFileSize(dataset.file_size_bytes)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full mt-2 sm:mt-0">
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      {formatDate(dataset.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-secondary/50 p-1 rounded-xl">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(dataset)}
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(dataset.id)}
                        disabled={deletingId === dataset.id}
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        {deletingId === dataset.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDatasets;
