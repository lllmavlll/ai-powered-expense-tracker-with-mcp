import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { getDb, users, categories, DEFAULT_CATEGORIES } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const [existing] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [user] = await getDb()
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id })

    // Seed default categories for the new user
    await getDb().insert(categories).values(
      DEFAULT_CATEGORIES.map((cat) => ({
        userId: user.id,
        name: cat.name,
        color: cat.color,
        isDefault: true,
      }))
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
