export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
}

interface BucketRecord {
  timestamps: number[];
}

const MAX_TRACKED_IPS = 2000;
const ipBuckets = new Map<string, BucketRecord>();

/**
 * Rate limiter de ventana deslizante (Sliding Window) con límite de memoria LRU.
 */
export function checkRateLimit(
  clientKey: string,
  limitPerMinute = Number(process.env.RATE_LIMIT_PER_MINUTE) || 15,
  windowMs = 60_000
): RateLimitDecision {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Evicción preventiva si el mapa crece demasiado
  if (ipBuckets.size >= MAX_TRACKED_IPS && !ipBuckets.has(clientKey)) {
    const oldestKey = ipBuckets.keys().next().value;
    if (oldestKey) {
      ipBuckets.delete(oldestKey);
    }
  }

  const record = ipBuckets.get(clientKey) ?? { timestamps: [] };
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= limitPerMinute) {
    const oldestInWindow = record.timestamps[0] ?? now;
    const resetInMs = Math.max(1000, oldestInWindow + windowMs - now);
    ipBuckets.set(clientKey, record);
    return {
      allowed: false,
      limit: limitPerMinute,
      remaining: 0,
      resetInMs,
    };
  }

  record.timestamps.push(now);
  ipBuckets.set(clientKey, record);

  return {
    allowed: true,
    limit: limitPerMinute,
    remaining: Math.max(0, limitPerMinute - record.timestamps.length),
    resetInMs: windowMs,
  };
}

export function resetRateLimiterForTests(): void {
  ipBuckets.clear();
}
