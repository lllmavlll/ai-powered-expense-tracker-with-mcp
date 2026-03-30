import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as authSchema from "./schema/auth"
import * as expensesSchema from "./schema/expenses"
import * as chatSchema from "./schema/chat"

const schema = { ...authSchema, ...expensesSchema, ...chatSchema }
type DbInstance = ReturnType<typeof drizzle<typeof schema>>

let _instance: DbInstance | undefined

function getInstance(): DbInstance {
  if (!_instance) {
    _instance = drizzle(neon(process.env.DATABASE_URL!), { schema })
  }
  return _instance
}

/**
 * Lazy proxy — the neon connection is only created on the first actual query,
 * not at module evaluation time. This allows the Next.js build to succeed
 * without DATABASE_URL being set in the build environment.
 */
export const db = new Proxy({} as DbInstance, {
  get(_, prop) {
    const instance = getInstance()
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(instance)
    }
    return value
  },
}) as DbInstance

/** Explicit function form — same lazy singleton, useful in API routes. */
export function getDb(): DbInstance {
  return getInstance()
}
