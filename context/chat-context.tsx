"use client"

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isError?: boolean
}

/** Lightweight session metadata for the history list. */
export interface ChatSessionMeta {
  id: string
  title: string | null
  updatedAt: string
}

type ChatView = "chat" | "history"

interface ChatContextType {
  isOpen: boolean
  /** False until the persisted open/closed state has been restored on the
   *  client — lets the panel skip its open animation on the initial restore. */
  hydrated: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  isTyping: boolean
  // History
  view: ChatView
  showHistory: () => void
  showChat: () => void
  sessions: ChatSessionMeta[]
  sessionsLoading: boolean
  currentSessionId: string | null
  newChat: () => void
  selectSession: (id: string) => Promise<void>
  deleteSession: (id: string) => Promise<void>
}

const STORAGE_KEY = "chat-panel-open"
const SESSION_KEY = "chat-current-session"

const ChatContext = createContext<ChatContextType | null>(null)

const INITIAL_MESSAGE: Message = {
  id: "0",
  role: "assistant",
  content:
    "Hi! I can help you manage your expenses. Try asking me to add expenses, check your spending, or analyze your budget.",
  timestamp: new Date(),
}

/** Map a persisted server message onto the client Message shape, dropping the
 *  `tool` role which the conversation UI doesn't render. */
function toClientMessage(m: {
  id: string
  role: string
  content: string
  createdAt: string
}): Message | null {
  if (m.role !== "user" && m.role !== "assistant") return null
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.createdAt),
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)

  const [view, setView] = useState<ChatView>("chat")
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  // The server-side chat session backing this panel. Created lazily on the
  // first message so opening the panel without chatting stores nothing.
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const res = await fetch("/api/chat/sessions")
      if (res.ok) setSessions(await res.json())
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  const loadSession = useCallback(async (id: string) => {
    const res = await fetch(`/api/chat/sessions/${id}`)
    if (!res.ok) throw new Error("Session not found")
    const { messages: rows } = await res.json()
    const loaded = (rows as Parameters<typeof toClientMessage>[0][])
      .map(toClientMessage)
      .filter((m): m is Message => m !== null)
    setMessages(loaded.length > 0 ? loaded : [INITIAL_MESSAGE])
    setCurrentSessionId(id)
  }, [])

  // Restore the persisted open/closed choice and last conversation on mount.
  // We flip `hydrated` on the next animation frame (not in the same commit as
  // setIsOpen) so the restored width is painted instantly, then animations are
  // enabled for subsequent user toggles — no open/close flash on refresh.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") setIsOpen(true)

    const lastId = localStorage.getItem(SESSION_KEY)
    if (lastId) {
      // Best-effort restore; a deleted/foreign session silently falls back to
      // a fresh chat.
      loadSession(lastId).catch(() => localStorage.removeItem(SESSION_KEY))
    }

    const frame = requestAnimationFrame(() => setHydrated(true))
    return () => cancelAnimationFrame(frame)
  }, [loadSession])

  // Persist the open/closed choice whenever it changes (only after restore).
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, String(isOpen))
  }, [isOpen, hydrated])

  // Keep the restored conversation pointer in sync.
  useEffect(() => {
    if (!hydrated) return
    if (currentSessionId) localStorage.setItem(SESSION_KEY, currentSessionId)
    else localStorage.removeItem(SESSION_KEY)
  }, [currentSessionId, hydrated])

  const openChat = () => setIsOpen(true)
  const closeChat = () => setIsOpen(false)
  const toggleChat = () => setIsOpen((prev) => !prev)

  const showHistory = () => {
    void refreshSessions()
    setView("history")
  }
  const showChat = () => setView("chat")

  const newChat = () => {
    setMessages([INITIAL_MESSAGE])
    setCurrentSessionId(null)
    setView("chat")
  }

  const selectSession = useCallback(
    async (id: string) => {
      if (id !== currentSessionId) await loadSession(id)
      setView("chat")
    },
    [currentSessionId, loadSession]
  )

  const deleteSession = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 404) throw new Error("Failed to delete")
      setSessions((prev) => prev.filter((s) => s.id !== id))
      // Deleting the open conversation drops back to a fresh chat.
      if (id === currentSessionId) newChat()
    },
    [currentSessionId]
  )

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: crypto.randomUUID(), timestamp: new Date() },
    ])
  }

  const sendMessage = async (content: string) => {
    addMessage({ role: "user", content })
    setIsTyping(true)
    try {
      let sessionId = currentSessionId
      if (!sessionId) {
        const res = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        if (!res.ok) throw new Error("Failed to start a chat session")
        const session = await res.json()
        sessionId = session.id as string
        setCurrentSessionId(sessionId)
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error ?? "The assistant failed to respond")
      }
      addMessage({ role: "assistant", content: data.content })

      // If the model called any data-mutating tools, notify pages to refetch.
      const MUTATING_TOOLS = new Set([
        "add_expense", "edit_expense", "delete_expense",
        "bulk_add_expenses", "add_category",
      ])
      const toolCalls: { toolName: string }[] = data.toolCalls ?? []
      if (toolCalls.some((tc) => MUTATING_TOOLS.has(tc.toolName))) {
        window.dispatchEvent(new CustomEvent("expense-data-changed"))
      }
    } catch (err) {
      addMessage({
        role: "assistant",
        content:
          err instanceof Error ? err.message : "Something went wrong — please try again.",
        isError: true,
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        hydrated,
        openChat,
        closeChat,
        toggleChat,
        messages,
        sendMessage,
        isTyping,
        view,
        showHistory,
        showChat,
        sessions,
        sessionsLoading,
        currentSessionId,
        newChat,
        selectSession,
        deleteSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChat must be used within ChatProvider")
  return context
}
