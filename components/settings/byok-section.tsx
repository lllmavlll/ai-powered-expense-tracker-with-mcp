"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { KeyRound, Sparkles, Trash2, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  AI_PROVIDERS,
  PROVIDER_NAMES,
  defaultModelFor,
  type AiProviderName,
} from "@/lib/ai-catalog"

type Config = {
  provider: AiProviderName
  model: string
  keyPrefix: string
}

function providerLabel(p: string) {
  return (AI_PROVIDERS as Record<string, { label: string }>)[p]?.label ?? p
}
function modelLabel(p: AiProviderName, modelId: string) {
  return AI_PROVIDERS[p]?.models.find((m) => m.id === modelId)?.label ?? modelId
}

export function BYOKSection() {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<Config | null>(null)
  const [editing, setEditing] = useState(false)

  const [provider, setProvider] = useState<AiProviderName>("google")
  const [model, setModel] = useState<string>(defaultModelFor("google"))
  const [key, setKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removeOpen, setRemoveOpen] = useState(false)

  // Refresh after save/remove (called from handlers, not an effect).
  async function load() {
    const res = await fetch("/api/user/ai-key")
    if (res.ok) setConfig((await res.json()).config)
  }

  // Initial load — the async IIFE keeps every setState off the synchronous
  // path of the effect body.
  useEffect(() => {
    let active = true
    void (async () => {
      const res = await fetch("/api/user/ai-key")
      const data = res.ok ? await res.json() : null
      if (!active) return
      if (data) setConfig(data.config)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [])

  function startEditing() {
    setProvider(config?.provider ?? "google")
    setModel(config?.model ?? defaultModelFor(config?.provider ?? "google"))
    setKey("")
    setError(null)
    setEditing(true)
  }

  function changeProvider(next: AiProviderName) {
    setProvider(next)
    setModel(defaultModelFor(next)) // reset to the new provider's default model
  }

  async function handleSave() {
    if (!key.trim()) return
    setSaving(true)
    setError(null)
    const res = await fetch("/api/user/ai-key", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model, key: key.trim() }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? "Failed to save key")
      return
    }
    setEditing(false)
    setKey("")
    load()
  }

  async function handleRemove() {
    await fetch("/api/user/ai-key", { method: "DELETE" })
    setRemoveOpen(false)
    setConfig(null)
    setEditing(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.25, ease: "easeOut" }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI Chat Key (BYOK)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              By default the AI chat uses a shared key with daily limits. Add
              your own provider key for unlimited use — it&apos;s encrypted at
              rest and only used to power your chat.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : config && !editing ? (
              // Configured summary
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {providerLabel(config.provider)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {modelLabel(config.provider, config.model)}
                      <span className="font-mono"> · {config.keyPrefix}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" className="h-8" onClick={startEditing}>
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={() => setRemoveOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : config || editing ? (
              // Edit / add form
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Provider</Label>
                    <Select
                      value={provider}
                      onValueChange={(v) => v && changeProvider(v as AiProviderName)}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_NAMES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {AI_PROVIDERS[p].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Model</Label>
                    <Select value={model} onValueChange={(v) => v && setModel(v)}>
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PROVIDERS[provider].models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">API key</Label>
                  <Input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={AI_PROVIDERS[provider].keyPlaceholder}
                    autoComplete="off"
                    className="h-9 text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {AI_PROVIDERS[provider].keyHint}. We validate it before saving.
                  </p>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex gap-2 pt-0.5">
                  <Button size="sm" onClick={handleSave} disabled={!key.trim() || saving}>
                    {saving ? "Validating…" : "Save key"}
                  </Button>
                  {(config || editing) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(false)
                        setError(null)
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Empty state
              <div className="flex flex-col items-center text-center py-5 gap-3 text-muted-foreground">
                <KeyRound className="w-6 h-6" />
                <p className="text-xs max-w-xs">
                  No key added — you&apos;re on the shared key. Add your own to
                  remove daily limits.
                </p>
                <Button size="sm" onClick={() => setEditing(true)}>
                  Add your key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove your AI key?</AlertDialogTitle>
            <AlertDialogDescription>
              Your chat will switch back to the shared key with daily limits.
              You can add a key again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
