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

// MCP schema
export {
  mcpApiKeys,
  type McpApiKey,
  type NewMcpApiKey,
} from "./schema/mcp"

// BYOK (per-user AI provider keys)
export {
  userAiKeys,
  type UserAiKey,
  type NewUserAiKey,
} from "./schema/ai-keys"
