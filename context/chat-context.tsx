"use client"

import { createContext, useContext, useRef, useState, ReactNode } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isError?: boolean
}

interface ChatContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  isTyping: boolean
}

const ChatContext = createContext<ChatContextType | null>(null)

const INITIAL_MESSAGE: Message = {
  id: "0",
  role: "assistant",
  content:
    "Hi! I can help you manage your expenses. Try asking me to add expenses, check your spending, or analyze your budget.",
  timestamp: new Date(),
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)
  // The server-side chat session backing this panel. Created lazily on the
  // first message so opening the panel without chatting stores nothing.
  const sessionIdRef = useRef<string | null>(null)

  const openChat = () => setIsOpen(true)
  const closeChat = () => setIsOpen(false)
  const toggleChat = () => setIsOpen((prev) => !prev)

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
      if (!sessionIdRef.current) {
        const res = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        if (!res.ok) throw new Error("Failed to start a chat session")
        const session = await res.json()
        sessionIdRef.current = session.id
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, content }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error ?? "The assistant failed to respond")
      }
      addMessage({ role: "assistant", content: data.content })
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
        openChat,
        closeChat,
        toggleChat,
        messages,
        sendMessage,
        isTyping,
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
