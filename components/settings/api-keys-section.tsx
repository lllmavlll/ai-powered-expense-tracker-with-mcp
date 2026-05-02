"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, Plus, Trash2, KeyRound } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

type ApiKey = {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  createdAt: string
}

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [revealed, setRevealed] = useState<{ key: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/user/api-keys")
    if (res.ok) setKeys(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate() {
    if (!newKeyName.trim()) return
    setCreating(true)
    const res = await fetch("/api/user/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    })
    setCreating(false)
    if (!res.ok) return
    const created = await res.json()
    setRevealed({ key: created.key, name: created.name })
    setCreateOpen(false)
    setNewKeyName("")
    load()
  }

  async function handleRevoke() {
    if (!revokeTarget) return
    await fetch(`/api/user/api-keys/${revokeTarget.id}`, { method: "DELETE" })
    setRevokeTarget(null)
    load()
  }

  async function copyKey() {
    if (!revealed) return
    await navigator.clipboard.writeText(revealed.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.2, ease: "easeOut" }}
      >
        <Card>
          <CardHeader className="pb-4 flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">MCP API Keys</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Used by MCP clients (Cursor, Claude Desktop, etc.) to access your expenses.
              </p>
            </div>
            <Button
              size="sm"
              className="h-8"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New key
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : keys.length === 0 ? (
              <div className="flex flex-col items-center text-center py-6 gap-2 text-muted-foreground">
                <KeyRound className="w-6 h-6" />
                <p className="text-xs">No API keys yet. Create one to connect an MCP client.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {keys.map((k, i) => (
                  <li key={k.id}>
                    {i > 0 && <Separator className="hidden" />}
                    <div className="flex items-center justify-between py-3 gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{k.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {k.prefix}…
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Created {new Date(k.createdAt).toLocaleDateString()}
                          {k.lastUsedAt
                            ? ` · last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                            : " · never used"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:text-destructive"
                        onClick={() => setRevokeTarget(k)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Give your key a name so you can identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="key-name" className="text-sm">Name</Label>
            <Input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Cursor on laptop"
              maxLength={100}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newKeyName.trim() || creating}
            >
              {creating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal-once dialog */}
      <Dialog
        open={!!revealed}
        onOpenChange={(o) => !o && setRevealed(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this key now</DialogTitle>
            <DialogDescription>
              This is the only time the full key will be shown. Copy it and store it somewhere safe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{revealed?.name}</Label>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 rounded-md bg-muted text-xs font-mono break-all">
                {revealed?.key}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyKey}
                className="shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget
                ? `"${revokeTarget.name}" will stop working immediately. Any MCP client using it will need a new key.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRevoke}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
