"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Expense, CATEGORY_COLORS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })
}

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.36, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Recent Expenses
          </CardTitle>
          <Link
            href="/expenses"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No expenses yet</p>
          ) : (
          <div className="divide-y">
            {expenses.map((expense, i) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.2,
                  delay: 0.36 + i * 0.06,
                  ease: "easeOut",
                }}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs font-medium rounded-md px-2 py-0.5 border-0 flex-shrink-0",
                      CATEGORY_COLORS[expense.category]
                    )}
                  >
                    {expense.category}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold tabular-nums flex-shrink-0">
                  ₹{expense.amount.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
