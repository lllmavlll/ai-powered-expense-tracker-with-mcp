import { createHash, randomBytes } from "node:crypto"

export const MCP_KEY_PREFIX = "etmcp_"

export function generateApiKey(): { plaintext: string; prefix: string; hash: string } {
  const random = randomBytes(24).toString("base64url")
  const plaintext = `${MCP_KEY_PREFIX}${random}`
  return {
    plaintext,
    prefix: plaintext.slice(0, 14),
    hash: hashApiKey(plaintext),
  }
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex")
}
