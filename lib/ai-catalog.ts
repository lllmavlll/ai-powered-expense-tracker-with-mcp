/**
 * Client-safe catalog of BYOK providers and their curated, tool-capable models.
 *
 * This file imports NO provider SDKs or server-only code, so it can be shared
 * by the settings UI (model dropdown) and the server (validation). The chat
 * drives MCP tools, so only models that support tool calling belong here — the
 * first model in each list is the default.
 */

export interface CatalogModel {
  id: string
  label: string
}

export interface CatalogProvider {
  label: string
  keyPlaceholder: string
  keyHint: string
  models: CatalogModel[]
}

export const AI_PROVIDERS = {
  anthropic: {
    label: "Anthropic (Claude)",
    keyPlaceholder: "sk-ant-api03-…",
    keyHint: "Starts with sk-ant-",
    models: [
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { id: "claude-opus-4-8", label: "Claude Opus 4.8" },
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    ],
  },
  google: {
    label: "Google (Gemini)",
    keyPlaceholder: "AIza…",
    keyHint: "Starts with AIza",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    ],
  },
  groq: {
    label: "Groq",
    keyPlaceholder: "gsk_…",
    keyHint: "Starts with gsk_",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
    ],
  },
} as const satisfies Record<string, CatalogProvider>

export type AiProviderName = keyof typeof AI_PROVIDERS

export const PROVIDER_NAMES = Object.keys(AI_PROVIDERS) as AiProviderName[]

export function isAiProvider(value: string): value is AiProviderName {
  return value in AI_PROVIDERS
}

/** Validate a (provider, model) pair against the curated catalog. */
export function isValidProviderModel(provider: string, model: string): boolean {
  if (!isAiProvider(provider)) return false
  return AI_PROVIDERS[provider].models.some((m) => m.id === model)
}

/** The default (first) model id for a provider. */
export function defaultModelFor(provider: AiProviderName): string {
  return AI_PROVIDERS[provider].models[0].id
}
