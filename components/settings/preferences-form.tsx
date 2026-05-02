"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES } from "@/lib/mock-data"
import { Separator } from "@/components/ui/separator"

export function PreferencesForm() {
  const { theme, setTheme } = useTheme()
  const [currency, setCurrency] = useState("INR")
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY")
  const [defaultCategory, setDefaultCategory] = useState("Food")

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.1, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Currency */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <Label className="text-sm font-medium">Currency</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Used for displaying amounts
              </p>
            </div>
            <Select value={currency} onValueChange={(v) => v !== null && setCurrency(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 sm:h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date Format */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <Label className="text-sm font-medium">Date Format</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                How dates are displayed
              </p>
            </div>
            <Select value={dateFormat} onValueChange={(v) => v !== null && setDateFormat(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 sm:h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Default Category */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <Label className="text-sm font-medium">Default Category</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pre-selected when adding expenses
              </p>
            </div>
            <Select value={defaultCategory} onValueChange={(v) => v !== null && setDefaultCategory(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 sm:h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label className="text-sm font-medium">Dark Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toggle dark theme
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
