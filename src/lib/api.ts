// API service layer for FastAPI backend
// Base URL will be configured for the Python FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'Request failed');
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============ Types ============

export interface User {
  id: string;
  email: string;
  username: string;
  is_anonymous: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Dataset {
  id: string;
  name: string;
  category: string;
  format: string;
  rows: number;
  description: string;
  columns?: string[];
  created_at?: string;
}

export interface Column {
  id: string;
  name: string;
  dataType: string;
}

export interface GenerateDatasetRequest {
  columns: Column[];
  row_count: number;
  format: 'CSV' | 'JSON' | 'SQL' | 'Parquet';
  source_type: 'AI' | 'Library';
  prompt?: string;
  model?: string;
}

export interface GenerateDatasetResponse {
  id: string;
  download_url: string;
  preview_data: Record<string, unknown>[];
  stats: {
    rows: number;
    columns: number;
    size: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string; type: string; id?: string }[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  data_format?: string;
  data_mode?: string;
  web_search_enabled?: boolean;
}

export interface ChatResponse {
  message: string;
  download_url?: string;
  preview_data?: Record<string, unknown>[];
}

export interface ChatSession {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

// ============ API Methods ============

// Authentication
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (email: string, password: string, username: string) =>
    fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),

  loginAsGuest: () =>
    fetchApi<AuthResponse>('/auth/guest', {
      method: 'POST',
    }),

  logout: () =>
    fetchApi<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  forgotPassword: (email: string) =>
    fetchApi<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, new_password: string) =>
    fetchApi<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    }),

  me: () => fetchApi<User>('/auth/me'),

  refreshToken: () =>
    fetchApi<AuthResponse>('/auth/refresh', {
      method: 'POST',
    }),
};

// Datasets
export const datasetsApi = {
  getAll: () => fetchApi<Dataset[]>('/datasets'),

  getById: (id: string) => fetchApi<Dataset>(`/datasets/${id}`),

  getSamples: () => fetchApi<Dataset[]>('/datasets/samples'),

  generate: (data: GenerateDatasetRequest) =>
    fetchApi<GenerateDatasetResponse>('/datasets/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  preview: (data: GenerateDatasetRequest) =>
    fetchApi<GenerateDatasetResponse>('/datasets/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  download: async (id: string, format: string) => {
    const url = `${API_BASE_URL}/datasets/${id}/download?format=${format}`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Download failed');
    }
    
    return response.blob();
  },

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/datasets/${id}`, {
      method: 'DELETE',
    }),
};

// Chat / DetNest
export const chatApi = {
  getSessions: () => fetchApi<ChatSession[]>('/chat/sessions'),

  getSession: (id: string) => fetchApi<ChatSession>(`/chat/sessions/${id}`),

  createSession: (name?: string) =>
    fetchApi<ChatSession>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteSession: (id: string) =>
    fetchApi<{ success: boolean }>(`/chat/sessions/${id}`, {
      method: 'DELETE',
    }),

  renameSession: (id: string, name: string) =>
    fetchApi<ChatSession>(`/chat/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  pinSession: (id: string, pinned: boolean) =>
    fetchApi<ChatSession>(`/chat/sessions/${id}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned }),
    }),

  send: (data: ChatRequest, sessionId?: string) =>
    fetchApi<ChatResponse>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ ...data, session_id: sessionId }),
    }),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/chat/upload`, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, 'File upload failed');
    }
    
    return response.json() as Promise<{ id: string; name: string; type: string }>;
  },
};

// Auto-fill / AI columns generation
export const columnsApi = {
  generateFromTopic: (topic: string, model?: string) =>
    fetchApi<Column[]>('/columns/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, model }),
    }),

  getTemplates: () =>
    fetchApi<{ name: string; description: string; columns: string[] }[]>('/columns/templates'),

  getDataTypes: () =>
    fetchApi<{ id: string; name: string; category: string; example: string }[]>('/columns/data-types'),
};

// User settings
export const userApi = {
  getSettings: () =>
    fetchApi<{ notifications: boolean; theme: string; default_format: string }>('/user/settings'),

  updateSettings: (settings: Partial<{ notifications: boolean; theme: string; default_format: string }>) =>
    fetchApi<{ success: boolean }>('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    }),

  getUsage: () =>
    fetchApi<{ rows_generated: number; datasets_created: number; api_calls: number }>('/user/usage'),

  deleteAccount: () =>
    fetchApi<{ success: boolean }>('/user/account', {
      method: 'DELETE',
    }),
};

// History
export const historyApi = {
  getAll: () => fetchApi<{ id: string; name: string; timestamp: string; pinned: boolean }[]>('/history'),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/history/${id}`, {
      method: 'DELETE',
    }),

  rename: (id: string, name: string) =>
    fetchApi<{ success: boolean }>(`/history/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  pin: (id: string, pinned: boolean) =>
    fetchApi<{ success: boolean }>(`/history/${id}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned }),
    }),
};

// Health check
export const healthApi = {
  check: () => fetchApi<{ status: string; version: string }>('/health'),
};

// ============ Mock Data for Development ============

export const mockData = {
  datasets: [
    {
      id: '1',
      name: 'E-commerce Transactions',
      category: 'Business',
      format: 'CSV',
      rows: 10000,
      description: 'Complete e-commerce transaction data with customer details, products, and payment info.',
    },
    {
      id: '2',
      name: 'Healthcare Patient Records',
      category: 'Healthcare',
      format: 'JSON',
      rows: 5000,
      description: 'Synthetic patient data including demographics, diagnoses, and treatment history.',
    },
  ] as Dataset[],

  generateResponse: {
    id: 'gen_123',
    download_url: '/downloads/dataset_123.csv',
    preview_data: [
      { first_name: 'John', email: 'john@example.com', address: '123 Main St' },
      { first_name: 'Sarah', email: 'sarah@mail.com', address: '456 Oak Ave' },
    ],
    stats: { rows: 1000, columns: 3, size: '45 KB' },
  } as GenerateDatasetResponse,

  chatResponse: {
    message: "I've generated a dataset based on your request. The CSV file contains 1,000 rows with the specifications you mentioned.",
    download_url: '/downloads/chat_dataset_123.csv',
  } as ChatResponse,
};