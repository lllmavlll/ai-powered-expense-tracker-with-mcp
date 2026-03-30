import { NextRequest, NextResponse } from "next/server"
import { eq, desc } from "drizzle-orm"
import { getDb, chatSessions } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const { userId, error } = await requireAuth()
  if (error) return error

  const sessions = await getDb()
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.updatedAt))

  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { title } = await req.json().catch(() => ({}))

  const [session] = await getDb()
    .insert(chatSessions)
    .values({ userId, title: title ?? null })
    .returning()

  return NextResponse.json(session, { status: 201 })
}
