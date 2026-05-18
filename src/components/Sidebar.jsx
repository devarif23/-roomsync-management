import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Receipt, FileBarChart, UserCircle, X, Home, ShieldCheck } from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const { t } = useLanguage()

  const links = [
    { to: "/", icon: LayoutDashboard, label: t('dashboard') },
    ...(user?.role === "admin" ? [
      { to: "/admin", icon: ShieldCheck, label: 'Admin Panel' },
      { to: "/members", icon: Users, label: t('members') },
    ] : []),
    { to: "/expenses", icon: Receipt, label: t('expenses') },
    { to: "/reports", icon: FileBarChart, label: t('reports') },
    { to: "/profile", icon: UserCircle, label: t('profile') },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card transition-transform duration-300 ease-in-out",
        "sm:translate-x-0 sm:z-40",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <div className="mb-6 px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">RoomSync</span>
            </div>
            <button onClick={onClose} className="sm:hidden p-1 rounded-md hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="space-y-1.5 font-medium flex-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-lg p-2.5 transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="ml-3">{link.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="border-t pt-3 mt-3 px-2">
            <div className="text-xs text-muted-foreground text-center">
              © 2026 Arif jahan
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
