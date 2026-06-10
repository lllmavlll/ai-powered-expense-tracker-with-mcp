import { anthropic, createAnthropic } from "@ai-sdk/anthropic"
import { google, createGoogleGenerativeAI } from "@ai-sdk/google"
import { groq, createGroq } from "@ai-sdk/groq"
import type { LanguageModel } from "ai"
import { AI_PROVIDERS, defaultModelFor, type AiProviderName } from "./ai-catalog"

/**
 * Provider-agnostic chat model.
 *
 * Two paths:
 *  - House key (default): provider via AI_PROVIDER env, key from the
 *    conventional per-provider env var, model from AI_MODEL or the provider
 *    default.
 *  - BYOK: a per-user { provider, model, apiKey } — the provider client is
 *    built with the user's key via the create* factory.
 *
 * The model must support tool calling — the chat drives MCP tools. The curated
 * BYOK model list lives in ./ai-catalog.
 */
const PROVIDERS = {
  anthropic: { env: anthropic, create: createAnthropic, keyVar: "ANTHROPIC_API_KEY" },
  google: { env: google, create: createGoogleGenerativeAI, keyVar: "GOOGLE_GENERATIVE_AI_API_KEY" },
  groq: { env: groq, create: createGroq, keyVar: "GROQ_API_KEY" },
} as const satisfies Record<AiProviderName, unknown>

export interface UserModelConfig {
  provider: AiProviderName
  model: string
  apiKey: string
}

export function getChatModel(
  userKey?: UserModelConfig | null
): { model: LanguageModel; missingKeyError: string | null } {
  // BYOK path — build the provider client with the user's own key.
  if (userKey) {
    const provider = PROVIDERS[userKey.provider]
    if (!provider) {
      return {
        model: google("gemini-2.5-flash"),
        missingKeyError: `Unknown BYOK provider "${userKey.provider}"`,
      }
    }
    return {
      model: provider.create({ apiKey: userKey.apiKey })(userKey.model),
      missingKeyError: null,
    }
  }

  // House path — provider + key from env.
  const name = (process.env.AI_PROVIDER ?? "google").toLowerCase() as AiProviderName
  const provider = PROVIDERS[name]
  if (!provider) {
    return {
      model: google("gemini-2.5-flash"),
      missingKeyError: `Unknown AI_PROVIDER "${name}" — expected one of: ${Object.keys(AI_PROVIDERS).join(", ")}`,
    }
  }
  const defaultModel = defaultModelFor(name)
  if (!process.env[provider.keyVar]) {
    return {
      model: provider.env(defaultModel),
      missingKeyError: `Chat is not configured: ${provider.keyVar} is missing`,
    }
  }
  return {
    model: provider.env(process.env.AI_MODEL ?? defaultModel),
    missingKeyError: null,
  }
}
