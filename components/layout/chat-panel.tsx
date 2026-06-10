"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Plus, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/context/chat-context"
import { MessageBubble } from "@/components/chat/message-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatHistory } from "@/components/chat/chat-history"

function ChatBody() {
  const {
    closeChat,
    messages,
    sendMessage,
    isTyping,
    view,
    showHistory,
    newChat,
  } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (view === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, view])

  const handleSend = (content: string) => {
    void sendMessage(content)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Assistant</p>
            <p className="text-xs text-muted-foreground">
              Ask about your expenses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={newChat}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="New chat"
            title="New chat"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={showHistory}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Chat history"
            title="Chat history"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeChat}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {view === "history" ? (
        <ChatHistory />
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </>
      )}
    </div>
  )
}

export function ChatPanel() {
  const { isOpen, closeChat, hydrated } = useChat()

  return (
    <>
      {/* Desktop: inline animated panel */}
      <motion.div
        // Render collapsed in the SSR/pre-hydration paint so a closed panel
        // never flashes open at its intrinsic content width before JS runs.
        initial={{ width: 0 }}
        animate={{ width: isOpen ? 400 : 0 }}
        // Snap to the restored width on first paint; animate user toggles after.
        transition={
          hydrated
            ? { type: "spring", damping: 30, stiffness: 280 }
            : { duration: 0 }
        }
        className="hidden lg:block flex-shrink-0 overflow-hidden border-l bg-background"
      >
        <div className="w-[400px] h-full">
          <ChatBody />
        </div>
      </motion.div>

      {/* Mobile/tablet: full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeChat}
              className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
            />
            <motion.div
              key="chat-mobile"
              // Skip the slide-in when restoring an already-open panel on refresh.
              initial={hydrated ? { x: "100%" } : false}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-background border-l shadow-xl"
            >
              <ChatBody />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
