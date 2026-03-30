import { NextRequest, NextResponse } from "next/server"
import { and, asc, eq } from "drizzle-orm"
import { getDb, chatSessions, chatMessages } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  // Verify session belongs to user
  const [session] = await getDb()
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)))
    .limit(1)

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const messages = await getDb()
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, id))
    .orderBy(asc(chatMessages.createdAt))

  return NextResponse.json({ session, messages })
}
