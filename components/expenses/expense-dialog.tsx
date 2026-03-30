"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Expense, CATEGORIES } from "@/lib/mock-data"

type FormState = {
  amount: string
  category: string
  description: string
  date: string
}

const emptyForm: FormState = {
  amount: "",
  category: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
}

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
  onSave: (data: Omit<Expense, "id">) => void
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  onSave,
}: ExpenseDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (expense) {
      setForm({
        amount: String(expense.amount),
        category: expense.category,
        description: expense.description,
        date: expense.date,
      })
    } else {
      setForm(emptyForm)
    }
  }, [expense, open])

  const isEditing = !!expense

  const handleSave = () => {
    if (!form.amount || !form.category || !form.date) return
    onSave({
      amount: Number(form.amount),
      category: form.category as Expense["category"],
      description: form.description,
      date: form.date,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => v !== null && setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select category" />
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

          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-sm">
              Description
            </Label>
            <Input
              id="desc"
              placeholder="What was this for?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="h-9"
            />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleSave} disabled={!form.amount || !form.category}>
            {isEditing ? "Save Changes" : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
