import { tooMany } from "./errors";

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

/**
 * Простой rate-limit в памяти процесса.
 * Для нескольких инстансов замените на Redis (например, Upstash).
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > limit) throw tooMany();

  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (v.reset < now) buckets.delete(k);
    });
  }
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
