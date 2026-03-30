import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { getDb, categories } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const { userId, error } = await requireAuth()
  if (error) return error

  const rows = await getDb()
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { name, color } = await req.json()

  if (!name || !color) {
    return NextResponse.json(
      { error: "name and color are required" },
      { status: 400 }
    )
  }

  const [row] = await getDb()
    .insert(categories)
    .values({ userId, name, color, isDefault: false })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
