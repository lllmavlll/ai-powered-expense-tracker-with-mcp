import { SignJWT } from "jose"

/**
 * Mint a short-lived identity-only JWT for service-to-service calls from the
 * in-app chat to the et-mcp server. et-mcp verifies the signature + audience
 * and enriches user context (timezone/currency) from the DB itself, so the
 * token carries nothing but the user id.
 *
 * NOT for external clients — those use long-lived `etmcp_` API keys minted
 * in Settings → API Keys.
 */
export async function mintMcpJwt(userId: string): Promise<string> {
  const secret = process.env.MCP_INTERNAL_JWT_SECRET
  if (!secret) {
    throw new Error("MCP_INTERNAL_JWT_SECRET is not set")
  }
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience("et-mcp")
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(secret))
}
