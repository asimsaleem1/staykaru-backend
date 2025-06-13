import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes default
}));