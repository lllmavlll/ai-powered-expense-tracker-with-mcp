import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { getDb, users } from "@/lib/db"

/**
 * JWT strategy — no DrizzleAdapter needed.
 * Sessions are stateless JWTs stored in cookies.
 * User creation is handled by our custom /api/auth/register endpoint.
 * The accounts/sessions/verificationTokens tables remain in the schema
 * for future OAuth provider support.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // getDb() is called inside the async callback — only at request time, not build time
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
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
