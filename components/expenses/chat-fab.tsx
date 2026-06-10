"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useChat } from "@/context/chat-context"

export function ChatFAB() {
  const { toggleChat, isOpen } = useChat()

  return (
    <motion.button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hidden lg:flex items-center justify-center hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      // The desktop panel is an inline 400px column on the right; slide the FAB
      // left by that width when open so it rides just outside the panel edge
      // instead of overlapping it.
      animate={{ rotate: isOpen ? 20 : 0, x: isOpen ? -400 : 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
      aria-label="Toggle AI chat"
    >
      <Sparkles className="w-5 h-5" />
    </motion.button>
  )
}
