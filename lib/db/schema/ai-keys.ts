import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"
import { users } from "./auth"

/**
 * A user's own provider API key for the in-app chat (BYOK). One row per user
 * (PK = userId), so saving replaces and deleting reverts the user to the shared
 * house key. The key is AES-256-GCM encrypted (see lib/crypto) — never stored
 * in plaintext and never returned to the client after save.
 */
export const userAiKeys = pgTable("user_ai_keys", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 20 }).notNull(), // anthropic | google | groq
  model: varchar("model", { length: 80 }).notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  keyPrefix: varchar("key_prefix", { length: 24 }).notNull(), // masked, for display only
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type UserAiKey = typeof userAiKeys.$inferSelect
export type NewUserAiKey = typeof userAiKeys.$inferInsert
