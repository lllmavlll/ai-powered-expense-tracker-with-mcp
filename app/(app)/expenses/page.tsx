"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpenseFilters } from "@/components/expenses/expense-filters"
import { ExpenseTable } from "@/components/expenses/expense-table"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { DeleteDialog } from "@/components/expenses/delete-dialog"
import { ChatFAB } from "@/components/expenses/chat-fab"
import { Expense } from "@/lib/mock-data"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((rows) =>
        setExpenses(
          rows.map((e: { id: string; amount: string; category: string; description: string | null; date: string }) => ({
            ...e,
            amount: Number(e.amount),
            description: e.description ?? "",
          }))
        )
      )
  }, [])

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        !search ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === "all" || e.category === category
      return matchesSearch && matchesCategory
    })
  }, [expenses, search, category])

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  const handleAdd = () => {
    setEditingExpense(null)
    setDialogOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setDialogOpen(true)
  }

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense)
    setDeleteDialogOpen(true)
  }

  const handleSave = async (data: Omit<Expense, "id">) => {
    if (editingExpense) {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const updated = await res.json()
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? { ...updated, amount: Number(updated.amount), description: updated.description ?? "" }
            : e
        )
      )
    } else {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      setExpenses((prev) => [
        { ...created, amount: Number(created.amount), description: created.description ?? "" },
        ...prev,
      ])
    }
  }

  const handleConfirmDelete = async () => {
    if (deletingExpense) {
      await fetch(`/api/expenses/${deletingExpense.id}`, { method: "DELETE" })
      setExpenses((prev) => prev.filter((e) => e.id !== deletingExpense.id))
      setDeletingExpense(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-start justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Expenses</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} &middot; ₹
            {total.toLocaleString()} total
          </p>
        </div>
        <Button
          onClick={handleAdd}
          size="sm"
          className="gap-1.5 h-8 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.06, ease: "easeOut" }}
      >
        <ExpenseFilters
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.12, ease: "easeOut" }}
        className="border rounded-xl overflow-hidden bg-card"
      >
        <ExpenseTable
          expenses={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>

      {/* Dialogs */}
      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editingExpense}
        onSave={handleSave}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        expense={deletingExpense}
        onConfirm={handleConfirmDelete}
      />

      {/* AI Chat FAB */}
      <ChatFAB />
    </div>
  )
}
