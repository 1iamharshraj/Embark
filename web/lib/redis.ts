import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl, {
    maxRetriesPerRequest: null, // recommended for BullMQ
    enableReadyCheck: false,      // recommended for BullMQ
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

redis.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Redis connection error:", err.message);
});
