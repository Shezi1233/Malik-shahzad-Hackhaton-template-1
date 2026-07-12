/**
 * Simple in-memory cache for API responses with TTL support.
 * Helps avoid repeated network requests for the same data.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 30_000; // 30 seconds default

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl ?? this.defaultTTL),
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /** Invalidate all keys starting with a prefix (e.g., "/admin") */
  invalidatePrefix(prefix: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  /** Get or fetch — like React Query's pattern but simpler */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

export const apiCache = new APICache();
