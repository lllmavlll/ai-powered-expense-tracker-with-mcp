import { Sidebar, MobileTopbar } from "@/components/layout/sidebar"
import { ChatPanel } from "@/components/layout/chat-panel"
import { TimezoneSync } from "@/components/layout/timezone-sync"
import { ChatFAB } from "@/components/expenses/chat-fab"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <TimezoneSync />
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <MobileTopbar />
        <div className="flex flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
          <ChatPanel />
        </div>
      </div>
      <ChatFAB />
    </div>
  )
}
