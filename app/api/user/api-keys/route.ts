import { NextRequest, NextResponse } from "next/server"
import { and, desc, eq, isNull } from "drizzle-orm"
import { getDb, mcpApiKeys } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { generateApiKey } from "@/lib/mcp-keys"

export async function GET() {
  const { userId, error } = await requireAuth()
  if (error) return error

  const rows = await getDb()
    .select({
      id: mcpApiKeys.id,
      name: mcpApiKeys.name,
      prefix: mcpApiKeys.keyPrefix,
      lastUsedAt: mcpApiKeys.lastUsedAt,
      createdAt: mcpApiKeys.createdAt,
    })
    .from(mcpApiKeys)
    .where(and(eq(mcpApiKeys.userId, userId), isNull(mcpApiKeys.revokedAt)))
    .orderBy(desc(mcpApiKeys.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === "string" ? body.name.trim() : ""

  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: "name is required (1-100 chars)" },
      { status: 400 }
    )
  }

  const { plaintext, prefix, hash } = generateApiKey()

  const [row] = await getDb()
    .insert(mcpApiKeys)
    .values({ userId, name, keyHash: hash, keyPrefix: prefix })
    .returning({
      id: mcpApiKeys.id,
      name: mcpApiKeys.name,
      prefix: mcpApiKeys.keyPrefix,
      createdAt: mcpApiKeys.createdAt,
    })

  // Plaintext is returned ONCE — never retrievable again.
  return NextResponse.json({ ...row, key: plaintext }, { status: 201 })
}
