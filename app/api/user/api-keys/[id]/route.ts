import { NextRequest, NextResponse } from "next/server"
import { and, eq, isNull } from "drizzle-orm"
import { getDb, mcpApiKeys } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const [row] = await getDb()
    .update(mcpApiKeys)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(mcpApiKeys.id, id),
        eq(mcpApiKeys.userId, userId),
        isNull(mcpApiKeys.revokedAt)
      )
    )
    .returning({ id: mcpApiKeys.id })

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
