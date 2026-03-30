import { NextRequest, NextResponse } from "next/server"
import { and, eq, ilike, gte, lte, desc } from "drizzle-orm"
import { getDb, expenses } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { searchParams } = req.nextUrl
  const search = searchParams.get("search") ?? ""
  const category = searchParams.get("category") ?? ""
  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const limit = Number(searchParams.get("limit") ?? 100)
  const offset = Number(searchParams.get("offset") ?? 0)

  const filters = [eq(expenses.userId, userId)]
  if (search) filters.push(ilike(expenses.description, `%${search}%`))
  if (category) filters.push(eq(expenses.category, category))
  if (from) filters.push(gte(expenses.date, from))
  if (to) filters.push(lte(expenses.date, to))

  const rows = await getDb()
    .select()
    .from(expenses)
    .where(and(...filters))
    .orderBy(desc(expenses.date))
    .limit(limit)
    .offset(offset)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const { amount, category, description, date } = body

  if (!amount || !category || !date) {
    return NextResponse.json(
      { error: "amount, category, and date are required" },
      { status: 400 }
    )
  }

  const [row] = await getDb()
    .insert(expenses)
    .values({ userId, amount: String(amount), category, description, date })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
