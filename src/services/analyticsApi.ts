import { ENDPOINTS } from './endpoints';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface AnalyticsSummary {
  filename: string;
  rows: number;
  columns: number;
  numeric_columns: number;
  categorical_columns: number;
  missing_values: number;
  missing_pct: number;
  duplicates: number;
  memory_bytes: number;
  memory_display: string;
  file_size_display: string;
  dtypes: Record<string, string>;
}

export interface ColumnInfo {
  name: string;
  dtype: string;
  category: 'numeric' | 'categorical' | 'datetime';
  missing: number;
  missing_pct: number;
  unique: number;
  stats?: Record<string, number | string>;
  top_values?: { value: string; count: number }[];
}

export interface DistributionData {
  type: 'histogram' | 'bar';
  column: string;
  bins?: { range: string; count: number }[];
  values?: { label: string; count: number }[];
}

export interface CorrelationData {
  columns: string[];
  matrix: number[][];
  message: string | null;
}

export interface ScatterData {
  col_x: string;
  col_y: string;
  points: { x: number; y: number }[];
  count: number;
  error: string | null;
}

export interface BoxPlotData {
  column: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  lower_whisker: number;
  upper_whisker: number;
  outliers: number[];
  outlier_count: number;
  error: string | null;
}

export interface OutlierData {
  column: string;
  q1: number;
  q3: number;
  iqr: number;
  lower_fence: number;
  upper_fence: number;
  outlier_count: number;
  outlier_pct: number;
  min: number;
  max: number;
  median: number;
  error: string | null;
}

export interface TimeseriesData {
  column: string;
  data: { date: string; count: number }[];
}

export interface PreviewData {
  columns: string[];
  rows: string[][];
  total_rows: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalyticsHistoryItem {
  session_id: string;
  filename: string;
  rows: number;
  columns: number;
  numeric_columns: number;
  categorical_columns: number;
  file_size_bytes: number;
  state: 'active' | 'ended' | 'expired';
  created_at: string;
  last_accessed_at: string;
}

export interface ExplainChartRequest {
  panel: 'summary' | 'columns' | 'correlation' | 'distribution' | 'scatter_box' | 'timeseries';
  context: Record<string, unknown>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  error_code?: string | null;
  details?: Record<string, unknown> | null;
}

const ERROR_CODE_MESSAGES: Record<string, string> = {
  SESSION_EXPIRED: 'Your analytics session expired. Re-upload your dataset to continue.',
  SESSION_NOT_FOUND: 'Analytics session not found. It may belong to another account or be expired.',
  ANALYTICS_LIMIT_EXCEEDED: 'Daily analytics limit reached for this operation. Try again tomorrow.',
  INVALID_COLUMN: 'Selected column is not available in this dataset.',
  INVALID_FILE: 'Invalid file. Please upload CSV, JSON, Parquet, or SQL within the allowed size.',
  REPORT_FAILED: 'Report generation failed for this session. Please retry.',
};

function resolveApiError(body: any, fallback: string): string {
  const code = body?.error_code as string | undefined;
  if (code && ERROR_CODE_MESSAGES[code]) {
    return ERROR_CODE_MESSAGES[code];
  }
  return body?.error || body?.detail || fallback;
}

async function analyticsRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(resolveApiError(body, 'Request failed'));
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(resolveApiError(json, 'Request failed'));
  return json.data;
}

export const analyticsApi = {
  upload: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return analyticsRequest<{ session_id: string; summary: AnalyticsSummary }>(
      ENDPOINTS.ANALYTICS_UPLOAD,
      { method: 'POST', body: form }
    );
  },

  getSummary: (sessionId: string) =>
    analyticsRequest<AnalyticsSummary>(`${ENDPOINTS.ANALYTICS_SUMMARY}?session_id=${sessionId}`),

  getColumns: (sessionId: string) =>
    analyticsRequest<ColumnInfo[]>(`${ENDPOINTS.ANALYTICS_COLUMNS}?session_id=${sessionId}`),

  getDistribution: (sessionId: string, column: string, bins = 20) =>
    analyticsRequest<DistributionData>(`${ENDPOINTS.ANALYTICS_DISTRIBUTION}?session_id=${sessionId}&column=${encodeURIComponent(column)}&bins=${bins}`),

  getCorrelation: (sessionId: string) =>
    analyticsRequest<CorrelationData>(`${ENDPOINTS.ANALYTICS_CORRELATION}?session_id=${sessionId}`),

  getScatter: (sessionId: string, colX: string, colY: string) =>
    analyticsRequest<ScatterData>(`${ENDPOINTS.ANALYTICS_SCATTER}?session_id=${sessionId}&col_x=${encodeURIComponent(colX)}&col_y=${encodeURIComponent(colY)}`),

  getBoxPlot: (sessionId: string, column: string) =>
    analyticsRequest<BoxPlotData>(`${ENDPOINTS.ANALYTICS_BOXPLOT}?session_id=${sessionId}&column=${encodeURIComponent(column)}`),

  getOutliers: (sessionId: string, column: string) =>
    analyticsRequest<OutlierData>(`${ENDPOINTS.ANALYTICS_OUTLIERS}?session_id=${sessionId}&column=${encodeURIComponent(column)}`),

  getTimeseries: (sessionId: string) =>
    analyticsRequest<TimeseriesData[]>(`${ENDPOINTS.ANALYTICS_TIMESERIES}?session_id=${sessionId}`),

  getPreview: (sessionId: string, page = 1, pageSize = 50) =>
    analyticsRequest<PreviewData>(`${ENDPOINTS.ANALYTICS_PREVIEW}?session_id=${sessionId}&page=${page}&page_size=${pageSize}`),

  downloadReport: async (sessionId: string) => {
    const url = `${API_URL}${ENDPOINTS.ANALYTICS_REPORT}?session_id=${sessionId}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(resolveApiError(body, 'Failed to download report'));
    }
    return res.blob();
  },

  deleteSession: (sessionId: string) =>
    analyticsRequest<{ deleted: boolean }>(`${ENDPOINTS.ANALYTICS_SESSION}?session_id=${sessionId}`, { method: 'DELETE' }),

  getHistory: (limit = 30) =>
    analyticsRequest<AnalyticsHistoryItem[]>(`${ENDPOINTS.ANALYTICS_HISTORY}?limit=${limit}`),

  explainChart: (payload: ExplainChartRequest) =>
    analyticsRequest<{ insight: string }>(ENDPOINTS.ANALYTICS_EXPLAIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
