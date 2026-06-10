import { and, eq, gte, sql } from "drizzle-orm"
import { getDb, chatMessages, chatSessions } from "@/lib/db"

/**
 * Postgres-based chat rate limiting (no Redis in this stack). Limits are
 * derived by counting the user's own persisted messages in a time window, so
 * no extra table is needed — call this BEFORE persisting the new message so it
 * isn't counted against itself.
 *
 *  - Burst limit: protects the app + provider from rapid-fire requests.
 *    Applies to everyone, including BYOK users.
 *  - Daily limit: caps usage of the shared house key. Skipped for BYOK users,
 *    who pay for their own usage.
 */
export const CHAT_BURST_LIMIT = 5
export const CHAT_BURST_WINDOW_MS = 30_000
export const CHAT_DAILY_LIMIT = 25
const DAY_MS = 24 * 60 * 60 * 1000

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; error: string }

async function countUserMessagesSince(userId: string, since: Date): Promise<number> {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(chatMessages)
    .innerJoin(chatSessions, eq(chatMessages.sessionId, chatSessions.id))
    .where(
      and(
        eq(chatSessions.userId, userId),
        eq(chatMessages.role, "user"),
        gte(chatMessages.createdAt, since)
      )
    )
  return row?.n ?? 0
}

export async function checkChatRateLimit(
  userId: string,
  opts: { skipDaily: boolean }
): Promise<RateLimitResult> {
  const now = Date.now()

  const burst = await countUserMessagesSince(userId, new Date(now - CHAT_BURST_WINDOW_MS))
  if (burst >= CHAT_BURST_LIMIT) {
    return {
      ok: false,
      retryAfterSec: Math.ceil(CHAT_BURST_WINDOW_MS / 1000),
      error: "You're sending messages too quickly. Please wait a few seconds and try again.",
    }
  }

  if (!opts.skipDaily) {
    const daily = await countUserMessagesSince(userId, new Date(now - DAY_MS))
    if (daily >= CHAT_DAILY_LIMIT) {
      return {
        ok: false,
        retryAfterSec: DAY_MS / 1000,
        error: `You've reached the daily limit of ${CHAT_DAILY_LIMIT} messages on the shared AI key. Add your own API key in Settings for unlimited use, or try again tomorrow.`,
      }
    }
  }

  return { ok: true }
}
