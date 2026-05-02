"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Expense, CATEGORY_COLORS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ExpenseTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })
}

function RowMenu({
  expense,
  onEdit,
  onDelete,
}: {
  expense: Expense
  onEdit: (e: Expense) => void
  onDelete: (e: Expense) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none">
        <MoreHorizontal className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => onEdit(expense)}
          className="gap-2 text-sm"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(expense)}
          className="gap-2 text-sm text-destructive focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">No expenses found.</p>
        <p className="text-muted-foreground text-xs mt-1">
          Add one or adjust your filters.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden divide-y">
        <AnimatePresence initial={false}>
          {expenses.map((expense, i) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, delay: i * 0.03, ease: "easeOut" }}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-medium rounded-md px-1.5 py-0.5 border-0 flex-shrink-0",
                      CATEGORY_COLORS[expense.category]
                    )}
                  >
                    {expense.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">
                    {formatDate(expense.date)}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">
                  {expense.description || "—"}
                </p>
              </div>
              <div className="flex items-start gap-1 flex-shrink-0">
                <p className="text-sm font-semibold tabular-nums whitespace-nowrap pt-0.5">
                  ₹{expense.amount.toLocaleString()}
                </p>
                <RowMenu expense={expense} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tablet/desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground w-24">
                Date
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-36">
                Category
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right w-28">
                Amount
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {expenses.map((expense, i) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, delay: i * 0.04, ease: "easeOut" }}
                  className="border-b hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="text-sm text-muted-foreground py-3">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell className="text-sm font-medium py-3">
                    {expense.description}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium rounded-md px-2 py-0.5 border-0",
                        CATEGORY_COLORS[expense.category]
                      )}
                    >
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums text-right py-3">
                    ₹{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3">
                    <RowMenu
                      expense={expense}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </>
  )
}
