export type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Utilities"
  | "Other"

export interface Expense {
  id: string
  amount: number
  category: Category
  description: string
  date: string
}

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Other",
]

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Shopping: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Entertainment: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Health: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Utilities: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export const mockExpenses: Expense[] = [
  { id: "1", amount: 850, category: "Food", description: "Weekly groceries — Zepto", date: "2026-03-23" },
  { id: "2", amount: 160, category: "Transport", description: "Uber to office", date: "2026-03-22" },
  { id: "3", amount: 120, category: "Food", description: "Starbucks — Latte", date: "2026-03-22" },
  { id: "4", amount: 2799, category: "Shopping", description: "Nike running shoes", date: "2026-03-21" },
  { id: "5", amount: 499, category: "Entertainment", description: "Netflix subscription", date: "2026-03-20" },
  { id: "6", amount: 380, category: "Health", description: "Apollo Pharmacy", date: "2026-03-19" },
  { id: "7", amount: 1240, category: "Utilities", description: "BESCOM electricity bill", date: "2026-03-18" },
  { id: "8", amount: 640, category: "Food", description: "Dinner — Social", date: "2026-03-17" },
  { id: "9", amount: 200, category: "Transport", description: "BMTC Smart Card recharge", date: "2026-03-16" },
  { id: "10", amount: 3499, category: "Shopping", description: "Amazon — Keyboard", date: "2026-03-15" },
  { id: "11", amount: 450, category: "Food", description: "Swiggy order", date: "2026-03-14" },
  { id: "12", amount: 900, category: "Health", description: "GP consultation", date: "2026-03-13" },
  { id: "13", amount: 299, category: "Entertainment", description: "Spotify Premium", date: "2026-03-12" },
  { id: "14", amount: 750, category: "Utilities", description: "Internet — ACT", date: "2026-03-11" },
  { id: "15", amount: 320, category: "Food", description: "Blinkit — snacks", date: "2026-03-10" },
]

export const mockMonthlyData = [
  { month: "Oct", total: 8200 },
  { month: "Nov", total: 11500 },
  { month: "Dec", total: 15800 },
  { month: "Jan", total: 9400 },
  { month: "Feb", total: 12100 },
  { month: "Mar", total: 10556 },
]

export const mockCategoryTotals: Record<Category, number> = {
  Food: 3130,
  Transport: 360,
  Shopping: 6298,
  Entertainment: 798,
  Health: 1280,
  Utilities: 1990,
  Other: 0,
}
