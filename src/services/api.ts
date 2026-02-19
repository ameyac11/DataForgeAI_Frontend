const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Core fetch wrapper. Uses `credentials: 'include'` so httpOnly
 * cookies (access_token + refresh_token) are sent automatically.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // send httpOnly cookies
  });

  // Try to refresh token on 401
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // retry original request
      const retry = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
      if (retry.ok) {
        return retry.json();
      }
    }
    // Refresh failed — force logout
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw new ApiError(401, 'Session expired');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new ApiError(response.status, body?.detail || body?.message || 'Request failed');
  }

  // Some endpoints return 204 No Content
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * SSE streaming helper — returns an async generator of parsed SSE events.
 * The backend sends `data: { "type": "chunk" | "done" | "error", ... }\n\n`
 */
export async function* streamSSE(endpoint: string, body: Record<string, unknown>): AsyncGenerator<{
  type: 'chunk' | 'done' | 'error';
  content?: string;
  chat_id?: string;
  show_download?: boolean;
}> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Stream failed' }));
    throw new ApiError(response.status, err?.detail || 'Stream request failed');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6));
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

// ────────────────────── Convenience methods ──────────────────────

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
