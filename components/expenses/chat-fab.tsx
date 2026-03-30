"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useChat } from "@/context/chat-context"

export function ChatFAB() {
  const { toggleChat, isOpen } = useChat()

  return (
    <motion.button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      animate={isOpen ? { rotate: 20 } : { rotate: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Toggle AI chat"
    >
      <Sparkles className="w-5 h-5" />
    </motion.button>
  )
}
