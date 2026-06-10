import { eq } from "drizzle-orm"
import { getDb, userAiKeys } from "@/lib/db"
import { decryptSecret } from "@/lib/crypto"
import type { UserModelConfig } from "@/lib/ai-model"
import type { AiProviderName } from "@/lib/ai-catalog"

/**
 * Load a user's decrypted BYOK config for use at request time, or null if they
 * have none (→ fall back to the house key). Server-only: decrypts the secret.
 */
export async function getUserModelConfig(userId: string): Promise<UserModelConfig | null> {
  const [row] = await getDb()
    .select()
    .from(userAiKeys)
    .where(eq(userAiKeys.userId, userId))
    .limit(1)

  if (!row) return null

  return {
    provider: row.provider as AiProviderName,
    model: row.model,
    apiKey: decryptSecret(row.encryptedKey),
  }
}
