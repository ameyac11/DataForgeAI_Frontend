import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Download, Trash2, Clock, HardDrive,
  FileJson, FileSpreadsheet, FileCode, Zap,
  Loader2, Search
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
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Database className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Datasets</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Manage and download your saved datasets
          </p>
          <div className="h-px w-full bg-border/60" />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search datasets by name, mode, model, or format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-secondary/30 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-xs font-medium">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Storage Indicator */}
        <div className="mb-6 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            <span className={cn(
              "text-sm font-bold",
              count >= limit ? "text-red-500" : count >= limit * 0.8 ? "text-amber-500" : "text-primary"
            )}>
              {count} / {limit} Used
            </span>
          </div>
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                count >= limit ? "bg-red-500" : count >= limit * 0.8 ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${Math.min((count / limit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Datasets List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No datasets yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Generate a dataset using the chat or custom generator to see it here.
            </p>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No matches found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No datasets match "{searchQuery}". Try a different search term.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDatasets.map((dataset, index) => {
              const ext = getFormatFromPath(dataset.file_path);
              const FormatIcon = formatIcons[ext] || FileJson;

              return (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
                >
                  {/* Format Icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FormatIcon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {dataset.dataset_name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{modeLabels[dataset.generation_mode] || dataset.generation_mode}</span>
                      <span>•</span>
                      <span>{dataset.model_used}</span>
                      <span>•</span>
                      <span>{formatFileSize(dataset.file_size_bytes)}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(dataset.created_at)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(dataset)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(dataset.id)}
                      disabled={deletingId === dataset.id}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      {deletingId === dataset.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
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
