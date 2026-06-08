import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import {
  getDb,
  users,
  accounts,
  sessions,
  verificationTokens,
  categories,
  DEFAULT_CATEGORIES,
} from "@/lib/db"

// Lazy config: NextAuth evaluates this per request, not at module import, so
// the DB connection (which needs DATABASE_URL) is never created at build time
// when Next.js collects page data. DrizzleAdapter needs the real db instance
// (not the lazy proxy) for its dialect detection, hence getDb() here.
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [user] = await getDb()
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  events: {
    // Seed default categories for new OAuth (Google) sign-ups.
    // Credentials users are seeded in /api/auth/register.
    async createUser({ user }) {
      if (!user.id) return
      await getDb()
        .insert(categories)
        .values(
          DEFAULT_CATEGORIES.map((cat) => ({
            userId: user.id!,
            name: cat.name,
            color: cat.color,
            isDefault: true,
          }))
        )
        .catch(() => {})
    },
  },
  callbacks: {
    // Runs in the proxy (middleware) to gate access. Redirect logic lives here
    // because the lazy config form makes auth() async, so the auth((req)=>…)
    // wrapper can't be used directly in proxy.ts.
    authorized({ request, auth }) {
      const isLoggedIn = !!auth
      const { pathname } = request.nextUrl

      const isAuthPage = pathname === "/login"
      const isApiAuth = pathname.startsWith("/api/auth")
      const isPublic = isAuthPage || isApiAuth

      if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl))
      }
      // Returning false redirects unauthenticated users to pages.signIn (/login).
      if (!isLoggedIn && !isPublic) return false
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id
      // Re-fetch from DB when the client calls useSession().update() after a profile save.
      if (trigger === "update" && token.id) {
        const [fresh] = await getDb()
          .select({ name: users.name, email: users.email, image: users.image })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1)
        if (fresh) {
          token.name = fresh.name
          token.email = fresh.email
          token.picture = fresh.image
        }
      }
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.name) session.user.name = token.name as string
      if (token.email) session.user.email = token.email as string
      if (token.picture) session.user.image = token.picture as string
      return session
    },
  },
}))
