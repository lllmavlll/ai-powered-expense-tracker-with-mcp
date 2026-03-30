import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { getDb, users } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const { userId, error } = await requireAuth()
  if (error) return error

  const [user] = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      currency: users.currency,
      dateFormat: users.dateFormat,
      defaultCategory: users.defaultCategory,
      theme: users.theme,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const body = await req.json()

  const allowed = ["name", "email", "image", "currency", "dateFormat", "defaultCategory", "theme"] as const
  const updateData: Record<string, unknown> = { updatedAt: new Date() }

  for (const key of allowed) {
    if (body[key] !== undefined) updateData[key] = body[key]
  }

  const [row] = await getDb()
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      currency: users.currency,
      dateFormat: users.dateFormat,
      defaultCategory: users.defaultCategory,
      theme: users.theme,
    })

  return NextResponse.json(row)
}
