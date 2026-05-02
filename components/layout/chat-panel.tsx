"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/context/chat-context"
import { MessageBubble } from "@/components/chat/message-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { ChatInput } from "@/components/chat/chat-input"

const MOCK_RESPONSES = [
  "Got it! I've added that expense for you.",
  "Here's a summary of your spending this month: ₹10,556 across 15 transactions.",
  "Your top spending category is Shopping at ₹6,298 this month.",
  "Done! The expense has been updated.",
  "I can see you spent ₹3,130 on Food this month. That's about 30% of your total.",
]

function ChatBody() {
  const { closeChat, messages, addMessage, isTyping, setIsTyping } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = (content: string) => {
    addMessage({ role: "user", content })
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const response =
        MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
      addMessage({ role: "assistant", content: response })
    }, 1200 + Math.random() * 800)
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
    </div>
  )
}

export function ChatPanel() {
  const { isOpen, closeChat } = useChat()

  return (
    <>
      {/* Desktop: inline animated panel */}
      <motion.div
        animate={{ width: isOpen ? 400 : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
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
              initial={{ x: "100%" }}
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
