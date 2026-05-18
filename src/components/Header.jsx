import { LogOut, CheckCircle2, Languages, Moon, Sun, Menu } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { useTheme } from "../context/ThemeContext"
import { Avatar } from "./ui/Avatar"
import { Button } from "./ui/Button"

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { language, changeLanguage, t } = useLanguage()
  const { isDark, toggleTheme } = useTheme()

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'bn' : 'en')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Dark Mode Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'} className="h-9 w-9">
          {isDark ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Language Toggle */}
        <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-1.5 h-9 px-2.5" title="Change Language">
          <Languages className="h-4 w-4" />
          <span className="font-semibold text-xs">{language === 'en' ? 'বাং' : 'EN'}</span>
        </Button>

        {/* User Info */}
        <div className="flex items-center gap-2 rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-sm ml-1">
          <div className="flex-col text-right hidden sm:flex">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-sm font-medium leading-none">{user?.name}</span>
              {user?.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
              )}
            </div>
            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
          </div>
          <Avatar src={user?.avatar} alt={user?.name} className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="h-9 w-9">
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  )
}
