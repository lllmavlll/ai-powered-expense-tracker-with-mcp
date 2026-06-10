import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { generateText } from "ai"
import { getDb, userAiKeys } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { getChatModel } from "@/lib/ai-model"
import { encryptSecret, maskKey } from "@/lib/crypto"
import { isAiProvider, isValidProviderModel, type AiProviderName } from "@/lib/ai-catalog"

/** GET — the user's current BYOK config (never the secret itself). */
export async function GET() {
  const { userId, error } = await requireAuth()
  if (error) return error

  const [row] = await getDb()
    .select({
      provider: userAiKeys.provider,
      model: userAiKeys.model,
      keyPrefix: userAiKeys.keyPrefix,
      updatedAt: userAiKeys.updatedAt,
    })
    .from(userAiKeys)
    .where(eq(userAiKeys.userId, userId))
    .limit(1)

  return NextResponse.json({ configured: !!row, config: row ?? null })
}

/** PUT — validate, encrypt, and upsert the user's BYOK key (replaces any existing). */
export async function PUT(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const provider = typeof body.provider === "string" ? body.provider : ""
  const model = typeof body.model === "string" ? body.model : ""
  const key = typeof body.key === "string" ? body.key.trim() : ""

  if (!isAiProvider(provider)) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
  }
  if (!isValidProviderModel(provider, model)) {
    return NextResponse.json(
      { error: "Model is not valid for the selected provider" },
      { status: 400 }
    )
  }
  if (!key) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 })
  }

  // Validate the key against the provider before storing it — a cheap call that
  // confirms the key authenticates and the model id is accepted.
  const { model: candidate } = getChatModel({
    provider: provider as AiProviderName,
    model,
    apiKey: key,
  })
  try {
    await generateText({ model: candidate, prompt: "Reply with OK.", maxOutputTokens: 8 })
  } catch (err) {
    console.error("ai-key: validation call failed", err)
    return NextResponse.json(
      {
        error:
          "We couldn't validate that key. Check that the key is correct and has access to the selected model.",
      },
      { status: 400 }
    )
  }

  const encryptedKey = encryptSecret(key)
  const keyPrefix = maskKey(key)

  await getDb()
    .insert(userAiKeys)
    .values({ userId, provider, model, encryptedKey, keyPrefix })
    .onConflictDoUpdate({
      target: userAiKeys.userId,
      set: { provider, model, encryptedKey, keyPrefix, updatedAt: new Date() },
    })

  return NextResponse.json({ configured: true, config: { provider, model, keyPrefix } })
}

/** DELETE — remove the BYOK key, reverting the user to the shared house key. */
export async function DELETE() {
  const { userId, error } = await requireAuth()
  if (error) return error

  await getDb().delete(userAiKeys).where(eq(userAiKeys.userId, userId))
  return NextResponse.json({ ok: true })
}
