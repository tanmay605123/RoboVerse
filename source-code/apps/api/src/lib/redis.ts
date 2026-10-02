import Redis from 'ioredis';
import { ENV } from '../config/env';

class RedisService {
  private client: Redis | null = null;
  private inMemoryStore: Map<string, { value: string; expiresAt: number | null }> = new Map();
  private isRedisAvailable = false;

  constructor() {
    if (process.env.NODE_ENV !== 'test' && ENV.REDIS_URL) {
      try {
        this.client = new Redis(ENV.REDIS_URL, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: () => null, // don't infinitely retry if not found
        });

        this.client
          .connect()
          .then(() => {
            this.isRedisAvailable = true;
            console.log('⚡ Connected to Redis');
          })
          .catch(() => {
            this.isRedisAvailable = false;
            console.log('ℹ️ Redis not available locally. Using fast in-memory store for cache/OTP/limits.');
          });

        this.client.on('error', () => {
          this.isRedisAvailable = false;
        });
      } catch (err) {
        this.isRedisAvailable = false;
      }
    }
  }

  public async get(key: string): Promise<string | null> {
    if (this.isRedisAvailable && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // fallback
      }
    }

    const item = this.inMemoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt !== null && item.expiresAt < Date.now()) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisAvailable && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // fallback
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.inMemoryStore.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    if (this.isRedisAvailable && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // fallback
      }
    }
    this.inMemoryStore.delete(key);
  }

  public async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (this.isRedisAvailable && this.client) {
      try {
        const val = await this.client.incr(key);
        if (val === 1 && ttlSeconds) {
          await this.client.expire(key, ttlSeconds);
        }
        return val;
      } catch {
        // fallback
      }
    }

    const currentVal = await this.get(key);
    const nextVal = currentVal ? parseInt(currentVal, 10) + 1 : 1;
    await this.set(key, nextVal.toString(), ttlSeconds);
    return nextVal;
  }

  public clearAll(): void {
    this.inMemoryStore.clear();
  }
}

export const redis = new RedisService();
