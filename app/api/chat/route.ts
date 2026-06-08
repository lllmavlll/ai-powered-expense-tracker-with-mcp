import { NextRequest, NextResponse } from "next/server"
import { asc, eq } from "drizzle-orm"
import { createMCPClient } from "@ai-sdk/mcp"
import { generateText, stepCountIs, type ModelMessage } from "ai"
import { getDb, chatSessions, chatMessages, users } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { getChatModel } from "@/lib/ai-model"
import { mintMcpJwt } from "@/lib/mcp-jwt"

function buildSystemPrompt(opts: { today: string; timezone: string; currency: string }) {
  return `You are the AI assistant inside an expense tracker app.
You help the user manage and analyze their expenses using the available tools
(adding/editing/deleting expenses, listing categories, spending summaries).

Today's date is ${opts.today} (timezone: ${opts.timezone}). Always compute
relative dates from this — e.g. "last month" means the full calendar month
before ${opts.today.slice(0, 7)}, not the current month. Pass explicit dates
to tools when the user asks about a specific period.

Amounts are in the user's currency (${opts.currency}); dates the tools return
are already in the user's timezone.

If a summary or list for a period comes back empty or zero, do NOT conclude
the user has no expenses — first retry with a wider window (e.g. the last 6-12
months) and tell the user when their spending actually occurred.

Be concise and friendly. When you add or change data, confirm what you did
with the concrete values. Never invent expense data — always use the tools.`
}

/**
 * POST /api/chat
 *
 * Accepts { sessionId, content }, persists the user message, runs Claude with
 * the et-mcp server's tools (authenticated via a short-lived internal JWT),
 * persists and returns the assistant message.
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

  const { model, missingKeyError } = getChatModel()
  if (missingKeyError) {
    return NextResponse.json({ error: missingKeyError }, { status: 503 })
  }
  if (!process.env.MCP_URL) {
    return NextResponse.json(
      { error: "Chat is not configured: MCP_URL is missing" },
      { status: 503 }
    )
  }

  // Persist the user message
  await getDb().insert(chatMessages).values({
    sessionId,
    role: "user",
    content,
  })

  // Auto-set session title from first message
  await getDb()
    .update(chatSessions)
    .set({
      ...(session.title ? {} : { title: content.slice(0, 80) }),
      updatedAt: new Date(),
    })
    .where(eq(chatSessions.id, sessionId))

  // Ground the model in the user's "now" — without this it guesses what
  // "last month" means and misreads empty windows as "no data at all".
  const [user] = await getDb()
    .select({ timezone: users.timezone, currency: users.currency })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  const timezone = user?.timezone ?? "UTC"
  const currency = user?.currency ?? "INR"
  // en-CA formats as YYYY-MM-DD
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date())

  // Conversation history (including the message just persisted)
  const history = await getDb()
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt))

  const messages: ModelMessage[] = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-30) // keep the prompt bounded
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))

  // Connect to the live MCP server as this user (short-lived internal JWT)
  const mcpClient = await createMCPClient({
    transport: {
      type: "http",
      url: process.env.MCP_URL,
      headers: { Authorization: `Bearer ${await mintMcpJwt(userId)}` },
    },
  })

  try {
    const tools = await mcpClient.tools()

    const result = await generateText({
      model,
      system: buildSystemPrompt({ today, timezone, currency }),
      messages,
      tools,
      stopWhen: stepCountIs(8),
    })

    // Flatten tool calls across steps for the jsonb audit column
    const toolCalls = result.steps.flatMap((step) =>
      step.toolCalls.map((tc) => ({
        toolName: tc.toolName,
        input: tc.input,
      }))
    )

    const [assistantMessage] = await getDb()
      .insert(chatMessages)
      .values({
        sessionId,
        role: "assistant",
        content:
          result.text ||
          "I ran into a problem forming a response — please try again.",
        toolCalls: toolCalls.length > 0 ? toolCalls : null,
      })
      .returning()

    return NextResponse.json(assistantMessage)
  } catch (err) {
    console.error("chat: model/MCP call failed", err)
    // Surface free-tier rate limits honestly instead of a generic failure.
    const isRateLimit =
      err instanceof Error && /quota|rate.?limit|RESOURCE_EXHAUSTED|429/i.test(err.message)
    return NextResponse.json(
      {
        error: isRateLimit
          ? "The AI provider's rate limit was hit (free tier). Wait a minute and try again."
          : "The assistant failed to respond. Please try again.",
      },
      { status: isRateLimit ? 429 : 502 }
    )
  } finally {
    await mcpClient.close().catch(() => {})
  }
}
