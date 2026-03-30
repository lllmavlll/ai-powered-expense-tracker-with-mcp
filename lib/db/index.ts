export { db, getDb } from "./client"

// Auth schema
export {
  users,
  accounts,
  sessions,
  verificationTokens,
  type User,
  type NewUser,
} from "./schema/auth"

// Expenses schema
export {
  categories,
  expenses,
  DEFAULT_CATEGORIES,
  type Category,
  type NewCategory,
  type Expense,
  type NewExpense,
} from "./schema/expenses"

// Chat schema
export {
  chatSessions,
  chatMessages,
  type ChatSession,
  type NewChatSession,
  type ChatMessage,
  type NewChatMessage,
} from "./schema/chat"
