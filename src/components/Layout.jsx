import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { useAppContext } from "../context/AppContext"
import { X } from "lucide-react"

export default function Layout() {
  const { notifications, removeNotification } = useAppContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="sm:ml-64 flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] sm:min-w-[300px] animate-in slide-in-from-bottom-5">
            <span className="flex-1 text-sm">{notif.message}</span>
            <button onClick={() => removeNotification(notif.id)} className="text-primary-foreground/80 hover:text-primary-foreground shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
