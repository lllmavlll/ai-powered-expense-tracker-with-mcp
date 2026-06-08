"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { IndianRupee, ReceiptText, CalendarDays } from "lucide-react"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { Expense } from "@/lib/mock-data"

type SummaryData = {
  byCategory: { category: string; total: number; count: number }[]
  monthly: { month: string; year: number; total: number }[]
  thisMonth: { total: number; count: number }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [recent, setRecent] = useState<Expense[]>([])

  const fetchData = useCallback(() => {
    fetch("/api/expenses/summary")
      .then((r) => r.json())
      .then(setSummary)

    fetch("/api/expenses?limit=5")
      .then((r) => r.json())
      .then((rows) =>
        setRecent(
          rows.map((e: { id: string; amount: string; category: string; description: string | null; date: string }) => ({
            ...e,
            amount: Number(e.amount),
            description: e.description ?? "",
          }))
        )
      )
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    window.addEventListener("expense-data-changed", fetchData)
    return () => window.removeEventListener("expense-data-changed", fetchData)
  }, [fetchData])

  const totalThisMonth = summary?.thisMonth.total ?? 0
  const count = summary?.thisMonth.count ?? 0
  const topCategory = summary?.byCategory.sort((a, b) => b.total - a.total)[0]
  const avgPerDay = count > 0 ? Math.round(totalThisMonth / new Date().getDate()) : 0

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">
          Good morning{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Here&apos;s your spending overview for {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard
          title="This Month"
          value={`₹${totalThisMonth.toLocaleString()}`}
          subtitle={`${count} transaction${count !== 1 ? "s" : ""}`}
          icon={IndianRupee}
          index={0}
        />
        <SummaryCard
          title="Top Category"
          value={topCategory?.category ?? "—"}
          subtitle={topCategory ? `₹${Number(topCategory.total).toLocaleString()} spent` : "No data yet"}
          icon={ReceiptText}
          iconClassName="bg-purple-100 dark:bg-purple-900/30"
          index={1}
        />
        <SummaryCard
          title="Daily Average"
          value={avgPerDay > 0 ? `₹${avgPerDay.toLocaleString()}` : "—"}
          subtitle={`across ${new Date().getDate()} days`}
          icon={CalendarDays}
          iconClassName="bg-blue-100 dark:bg-blue-900/30"
          index={2}
        />
      </div>

      {/* Chart */}
      <SpendingChart data={summary?.monthly.map((m) => ({ month: m.month, total: Number(m.total) })) ?? []} />

      {/* Recent */}
      <RecentExpenses expenses={recent} />
    </div>
  )
}
