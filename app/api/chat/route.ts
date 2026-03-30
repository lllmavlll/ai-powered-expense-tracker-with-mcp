import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { getDb, chatSessions, chatMessages } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

/**
 * POST /api/chat
 *
 * Accepts a message + session_id, persists it, and returns an AI response.
 * This is a placeholder until the MCP server is wired up via Vercel AI SDK.
 * When MCP is ready, this route will stream using streamText() + createMCPClient().
 */
export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { sessionId, content } = await req.json()

  if (!sessionId || !content) {
    return NextResponse.json(
      { error: "sessionId and content are required" },
      { status: 400 }
    )
  }

  // Verify session belongs to user
  const [session] = await getDb()
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1)

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  // Persist the user message
  await getDb().insert(chatMessages).values({
    sessionId,
    role: "user",
    content,
  })

  // Auto-set session title from first message
  if (!session.title) {
    const title = content.slice(0, 80)
    await getDb()
      .update(chatSessions)
      .set({ title, updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId))
  } else {
    await getDb()
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId))
  }

  // TODO: Replace with streamText() + MCP client when MCP server is ready
  // For now return a placeholder response
  const assistantContent =
    "I'm ready to help with your expenses! (MCP integration coming soon)"

  const [assistantMessage] = await getDb()
    .insert(chatMessages)
    .values({
      sessionId,
      role: "assistant",
      content: assistantContent,
    })
    .returning()

  return NextResponse.json(assistantMessage)
}
