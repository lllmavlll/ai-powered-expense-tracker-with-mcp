import { NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"
import { getDb, expenses } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const { userId, error } = await requireAuth()
  if (error) return error

  // Totals by category
  const byCategory = await getDb()
    .select({
      category: expenses.category,
      total: sql<number>`sum(${expenses.amount})::numeric`,
      count: sql<number>`count(*)::int`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(expenses.category)

  // Monthly totals for last 6 months
  const monthly = await getDb()
    .select({
      month: sql<string>`to_char(${expenses.date}, 'Mon')`,
      year: sql<number>`extract(year from ${expenses.date})::int`,
      total: sql<number>`sum(${expenses.amount})::numeric`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        sql`${expenses.date} >= now() - interval '6 months'`
      )
    )
    .groupBy(
      sql`to_char(${expenses.date}, 'Mon')`,
      sql`extract(year from ${expenses.date})`
    )
    .orderBy(sql`min(${expenses.date})`)

  // Overall total this month
  const [thisMonth] = await getDb()
    .select({
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)::numeric`,
      count: sql<number>`count(*)::int`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        sql`date_trunc('month', ${expenses.date}) = date_trunc('month', current_date)`
      )
    )

  return NextResponse.json({
    byCategory,
    monthly,
    thisMonth: {
      total: Number(thisMonth?.total ?? 0),
      count: thisMonth?.count ?? 0,
    },
  })
}

