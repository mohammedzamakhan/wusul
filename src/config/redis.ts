import Redis from 'ioredis';
import config from './index';
import logger from './logger';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('error', (err) => {
  logger.error({ error: err }, 'Redis client error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
  logger.info('Redis connection closed');
});

export default redis;
