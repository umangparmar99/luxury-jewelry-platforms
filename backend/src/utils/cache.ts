type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

export class InMemoryCache {
  private static store = new Map<string, CacheEntry<any>>();

  static set<T>(key: string, data: T, ttlMs: number) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  static delete(key: string) {
    this.store.delete(key);
  }

  static clear() {
    this.store.clear();
  }
}
