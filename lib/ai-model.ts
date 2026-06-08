import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
import type { LanguageModel } from "ai"

/**
 * Provider-agnostic chat model, selected via env:
 *
 *   AI_PROVIDER  anthropic | google | groq   (default: google)
 *   AI_MODEL     overrides the per-provider default model id
 *
 * Each provider reads its own key from the conventional env var:
 *   anthropic → ANTHROPIC_API_KEY, google → GOOGLE_GENERATIVE_AI_API_KEY,
 *   groq → GROQ_API_KEY.
 *
 * Adding a provider = install @ai-sdk/<provider>, add a case here.
 * The model must support tool calling — the chat drives MCP tools.
 */
const PROVIDERS = {
  anthropic: { factory: anthropic, defaultModel: "claude-sonnet-4-6", keyVar: "ANTHROPIC_API_KEY" },
  google: { factory: google, defaultModel: "gemini-2.5-flash", keyVar: "GOOGLE_GENERATIVE_AI_API_KEY" },
  groq: { factory: groq, defaultModel: "llama-3.3-70b-versatile", keyVar: "GROQ_API_KEY" },
} as const

type ProviderName = keyof typeof PROVIDERS

export function getChatModel(): { model: LanguageModel; missingKeyError: string | null } {
  const name = (process.env.AI_PROVIDER ?? "google").toLowerCase() as ProviderName
  const provider = PROVIDERS[name]
  if (!provider) {
    return {
      model: google("gemini-2.5-flash"),
      missingKeyError: `Unknown AI_PROVIDER "${name}" — expected one of: ${Object.keys(PROVIDERS).join(", ")}`,
    }
  }
  if (!process.env[provider.keyVar]) {
    return {
      model: provider.factory(provider.defaultModel),
      missingKeyError: `Chat is not configured: ${provider.keyVar} is missing`,
    }
  }
  return {
    model: provider.factory(process.env.AI_MODEL ?? provider.defaultModel),
    missingKeyError: null,
  }
}
