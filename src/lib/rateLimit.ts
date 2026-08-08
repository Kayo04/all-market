// In-memory token-bucket rate limiter. Single-instance only (no Redis) — fine for
// this app's current deployment, but won't share state across multiple server
// instances if that ever changes.
const buckets = new Map<string, { count: number; resetAt: number }>();

// Prevents unbounded growth from one-off keys (e.g. many distinct IPs hitting once).
const MAX_BUCKETS = 10000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
        if (buckets.size >= MAX_BUCKETS) buckets.clear();
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (bucket.count >= limit) {
        return false;
    }

    bucket.count++;
    return true;
}
