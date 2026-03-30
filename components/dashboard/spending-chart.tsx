"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export function SpendingChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.28, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Monthly Spending
          </CardTitle>
          <p className="text-xs text-muted-foreground">Last 6 months</p>
        </CardHeader>
        <CardContent className="pt-0">
          {data.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              No spending data yet
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
