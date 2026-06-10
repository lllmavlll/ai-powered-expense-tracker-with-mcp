"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, MessageSquare, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useChat } from "@/context/chat-context"

/** Compact relative time, e.g. "just now", "2h ago", "3 days ago". */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function ChatHistory() {
  const {
    sessions,
    sessionsLoading,
    currentSessionId,
    selectSession,
    deleteSession,
    showChat,
    newChat,
  } = useChat()

  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const id = pendingDelete
    setPendingDelete(null)
    await deleteSession(id).catch(() => {})
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sub-header: back + title */}
      <div className="flex items-center justify-between px-2 py-2.5 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={showChat}
          className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <p className="text-sm font-medium pr-2">History</p>
      </div>

      <ScrollArea className="flex-1">
        {sessionsLoading && sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading…
          </p>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No conversations yet. Start chatting to see your history here.
            </p>
            <Button size="sm" variant="outline" onClick={newChat} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New chat
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId
              return (
                <motion.button
                  key={session.id}
                  type="button"
                  onClick={() => void selectSession(session.id)}
                  whileTap={{ scale: 0.985 }}
                  className={cn(
                    "group w-full flex items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                    isActive ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {session.title || "New conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {relativeTime(session.updatedAt)}
                    </p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Delete conversation"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingDelete(session.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        e.stopPropagation()
                        setPendingDelete(session.id)
                      }
                    }}
                    className="flex-shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </ScrollArea>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the conversation and all of its messages.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
