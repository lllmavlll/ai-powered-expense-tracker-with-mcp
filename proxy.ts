import { auth } from "@/auth"
import type { NextRequest, NextFetchEvent } from "next/server"

// Next.js 16 renamed the `middleware` convention to `proxy` and statically
// requires the default export to be a literal function (a call expression like
// `export default auth(...)` is rejected). next-auth's lazy config also makes
// auth() async, so we call it in its inline form here and keep the access /
// redirect rules in the `authorized` callback in auth.ts.
export default function proxy(req: NextRequest, event: NextFetchEvent) {
  return (
    auth as unknown as (
      req: NextRequest,
      event: NextFetchEvent
    ) => Promise<Response>
  )(req, event)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
