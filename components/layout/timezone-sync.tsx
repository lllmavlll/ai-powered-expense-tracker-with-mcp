"use client"

import { useEffect } from "react"

export function TimezoneSync() {
  useEffect(() => {
    let cancelled = false

    async function syncIfDefault() {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (!browserTz) return

      const res = await fetch("/api/user")
      if (cancelled || !res.ok) return
      const user = await res.json()
      if (user.timezone && user.timezone !== "UTC") return

      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: browserTz }),
      })
    }

    syncIfDefault()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
