const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const CACHE_TTL = 15_000; // 15 seconds for GET request cache

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

/** Simple in-memory cache for GET requests */
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;

  // For GET requests, check cache first
  if (options.method === undefined || options.method === 'GET') {
    const cached = getCache<T>(endpoint);
    if (cached !== null) return cached;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/signin')) {
        window.location.href = '/signin';
      }
    }
    throw new Error(error.detail || 'Request failed');
  }

  const data = await response.json();

  // Cache GET responses
  if (options.method === undefined || options.method === 'GET') {
    setCache(endpoint, data);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: unknown, requiresAuth = true) =>
    apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(data), requiresAuth }),

  put: <T>(endpoint: string, data: unknown, requiresAuth = true) =>
    apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), requiresAuth }),

  delete: <T>(endpoint: string, requiresAuth = true) => {
    // Invalidate cache on delete
    invalidateCache('/admin');
    return apiClient<T>(endpoint, { method: 'DELETE', requiresAuth });
  },
};
