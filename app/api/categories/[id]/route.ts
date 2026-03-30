import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { getDb, categories } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { name, color } = await req.json()

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (color !== undefined) updateData.color = color

  const [row] = await getDb()
    .update(categories)
    .set(updateData)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
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

  // Prevent deleting default (system) categories
  const [cat] = await getDb()
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1)

  if (!cat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (cat.isDefault) {
    return NextResponse.json(
      { error: "Cannot delete default categories" },
      { status: 403 }
    )
  }

  await getDb()
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))

  return NextResponse.json({ success: true })
}
