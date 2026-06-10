import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

/**
 * Reversible secret encryption for BYOK provider keys.
 *
 * Unlike MCP API keys (which are hashed because the server only *verifies*
 * them), BYOK keys must be decrypted so the server can *use* them to call the
 * provider — so we encrypt with AES-256-GCM under a server-held master key.
 *
 * Master key: BYOK_ENCRYPTION_KEY, a base64-encoded 32-byte value
 *   generate with:  openssl rand -base64 32
 *
 * Stored format:  ivB64:authTagB64:ciphertextB64
 */
const ALGORITHM = "aes-256-gcm"
const IV_BYTES = 12

function getMasterKey(): Buffer {
  const raw = process.env.BYOK_ENCRYPTION_KEY
  if (!raw) {
    throw new Error("BYOK_ENCRYPTION_KEY is not set")
  }
  const key = Buffer.from(raw, "base64")
  if (key.length !== 32) {
    throw new Error(
      "BYOK_ENCRYPTION_KEY must decode to 32 bytes (generate with: openssl rand -base64 32)"
    )
  }
  return key
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, getMasterKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":")
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":")
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed encrypted secret")
  }
  const decipher = createDecipheriv(ALGORITHM, getMasterKey(), Buffer.from(ivB64, "base64"))
  decipher.setAuthTag(Buffer.from(tagB64, "base64"))
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8")
}

/** A safe-to-display masked hint, e.g. "sk-ant…x9f2". Never store the raw key. */
export function maskKey(key: string): string {
  if (key.length <= 10) return "••••"
  return `${key.slice(0, 6)}…${key.slice(-4)}`
}
