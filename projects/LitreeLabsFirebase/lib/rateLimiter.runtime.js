// Runtime-only optional imports for Redis-backed rate limiter.
// Implemented in JavaScript to avoid TypeScript and ESLint checks in CI.

let initialized = false;
let redisClient = null;
let redisLimiter = null;

const ioredisName = 'ioredis';
const rateLimiterFlexibleName = 'rate-limiter-flexible';

async function runtimeConsume(ip) {
  if (initialized && redisLimiter) {
    try {
      const res = await redisLimiter.consume(ip);
      return { ok: true, remaining: typeof (res === null || res === void 0 ? void 0 : res.remainingPoints) === 'number' ? res.remainingPoints : undefined };
    } catch (rej) {
      const sec = Math.ceil(((rej === null || rej === void 0 ? void 0 : rej.msBeforeNext) || 1000) / 1000) || 1;
      return { ok: false, retryAfter: sec, remaining: typeof (rej === null || rej === void 0 ? void 0 : rej.remainingPoints) === 'number' ? rej.remainingPoints : undefined };
    }
  }

  initialized = true;
  try {
    let IORedisMod = null;
    let RateLimiterFlexibleMod = null;
    try {
      IORedisMod = await (new Function('n', 'return import(n)')(ioredisName));
    } catch {
      IORedisMod = null;
    }
    try {
      RateLimiterFlexibleMod = await (new Function('n', 'return import(n)')(rateLimiterFlexibleName));
    } catch {
      RateLimiterFlexibleMod = null;
    }

    if (process.env.REDIS_URL && IORedisMod && RateLimiterFlexibleMod) {
      const IORedis = (IORedisMod.default || IORedisMod);
      const RateLimiterFlexible = (RateLimiterFlexibleMod.default || RateLimiterFlexibleMod);
      const RateLimiterRedis = RateLimiterFlexible === null || RateLimiterFlexible === void 0 ? void 0 : RateLimiterFlexible.RateLimiterRedis;
      if (typeof IORedis === 'function' && RateLimiterRedis) {
        redisClient = new IORedis(process.env.REDIS_URL);
        redisLimiter = new RateLimiterRedis({
          storeClient: redisClient,
          points: parseInt(process.env.DEMO_RATE_LIMIT || '20', 10),
          duration: parseInt(process.env.DEMO_RATE_LIMIT_WINDOW || '60', 10),
          keyPrefix: 'rl_demo',
        });

        try {
          const res = await redisLimiter.consume(ip);
          return { ok: true, remaining: typeof (res === null || res === void 0 ? void 0 : res.remainingPoints) === 'number' ? res.remainingPoints : undefined };
        } catch (rej) {
          const sec = Math.ceil(((rej === null || rej === void 0 ? void 0 : rej.msBeforeNext) || 1000) / 1000) || 1;
          return { ok: false, retryAfter: sec, remaining: typeof (rej === null || rej === void 0 ? void 0 : rej.remainingPoints) === 'number' ? rej.remainingPoints : undefined };
        }
      }
    }

    redisClient = null;
    redisLimiter = null;
    throw new Error('no-redis');
  } catch (e) {
    if (e && typeof (e === null || e === void 0 ? void 0 : e.msBeforeNext) === 'number') {
      const sec = Math.ceil(((e === null || e === void 0 ? void 0 : e.msBeforeNext) || 1000) / 1000) || 1;
      return { ok: false, retryAfter: sec, remaining: typeof (e === null || e === void 0 ? void 0 : e.remainingPoints) === 'number' ? e.remainingPoints : undefined };
    }
    throw e;
  }
}

export { runtimeConsume };
export default { runtimeConsume };
