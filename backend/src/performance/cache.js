// src/performance/cache.js
// Redis Caching Layer

const Redis = require('ioredis');

class CacheService {
    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.redis.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        this.redis.on('connect', () => {
            console.log('✅ Redis connected');
        });
    }

    async get(key) {
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, ttl = 3600) {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    async del(key) {
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async invalidatePattern(pattern) {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Cache invalidate error:', error);
        }
    }

    // Cache wrapper for database queries
    async wrap(key, ttl, fn) {
        const cached = await this.get(key);
        if (cached) {
            return cached;
        }

        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }
}

module.exports = new CacheService();
