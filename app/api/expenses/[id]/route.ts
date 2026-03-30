import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { getDb, expenses } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  if (body.amount !== undefined) updateData.amount = String(body.amount)
  if (body.category !== undefined) updateData.category = body.category
  if (body.description !== undefined) updateData.description = body.description
  if (body.date !== undefined) updateData.date = body.date
  updateData.updatedAt = new Date()

  const [row] = await getDb()
    .update(expenses)
    .set(updateData)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning()

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(row)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const [row] = await getDb()
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning({ id: expenses.id })

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
