import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Menu,
  X,
  LogOut,
  LogIn,
  Video,
  GraduationCap,
  BarChart3,
  BookOpen,
  FileText,
  PlusCircle,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  Newspaper,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const baseNavigation = [
  { name: 'Home', href: '/home', icon: BookOpen },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Practice', href: '/practice', icon: BookOpen },
  { name: 'Exam Builder', href: '/exam-builder', icon: FileText },
  { name: 'Question Builder', href: '/question-builder', icon: PlusCircle },
  { name: 'Study Groups', href: '/study-groups', icon: Users },
  { name: 'Flashcards', href: '/flashcards', icon: CreditCard },
]

const Layout = ({ children, profile }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isAuthenticated = Boolean(user)

  const navigation = useMemo(() => {
    const items = [...baseNavigation]
    const meetingItem = user
      ? user.role === 'student'
        ? { name: 'Student Meetings', href: '/student-meetings', icon: Video }
        : { name: 'Tutor Meetings', href: '/tutor-meetings', icon: GraduationCap }
      : { name: 'Meetings', href: '/student-meetings', icon: Video }

    items.push(meetingItem)

    if (user) {
      items.push({ name: 'Settings', href: '/settings', icon: SettingsIcon })
    }
    return items
  }, [user])

  const isActive = (href) => location.pathname === href
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.displayName ||
    user?.username ||
    'Guest'
  const secondaryLine = user
    ? user.role === 'student'
      ? user?.grade || user?.school || 'Student'
      : user?.role === 'tutor'
        ? user?.preferredSubject || user?.subject || 'Tutor'
        : ''
    : 'Browse & explore'
  const roleLabel = user?.role || 'Guest'
  const workspaceLabel = user
    ? user.role === 'student'
      ? 'Student Workspace'
      : user.role === 'tutor'
        ? 'Tutor Workspace'
        : 'Workspace'
    : 'Guest Workspace'

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MT</span>
            </div>
            <span className="text-xl font-bold text-slate-800">MathTutor Pro</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User profile section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{secondaryLine}</p>
                <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
                {profile?.progress?.overall != null && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Progress</span>
                      <span>{profile.progress.overall}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${profile.progress.overall}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isAuthenticated ? (
              <Button variant="outline" size="icon" onClick={logout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="gap-1 px-2.5 py-1 text-xs"
                onClick={() => navigate('/login')}
                title="Login"
              >
                <LogIn className="h-3 w-3" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium text-slate-600">
                {workspaceLabel} - {displayName}
              </span>
            </div>
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={logout} className="hidden lg:inline-flex gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden lg:inline-flex gap-1 px-3 py-1 text-sm"
              >
                <LogIn className="h-3 w-3" />
                Login
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout








