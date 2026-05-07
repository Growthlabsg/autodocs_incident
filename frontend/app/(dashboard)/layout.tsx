// app/(dashboard)/layout.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useUIStore } from '@/lib/store/useStore'
import { 
  Home, FileText, BarChart3, Zap, MessageSquare, Code, 
  GitBranch, Settings, Book, AlertCircle, Clock, Globe,
  FileText as PostMortem, TrendingUp, Package, Link2, Users, LogOut
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const autoDocsLinks = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/editor', icon: FileText, label: 'Editor' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/workflows', icon: Zap, label: 'Workflows' },
    { href: '/dashboard/assistant', icon: MessageSquare, label: 'Assistant' },
    { href: '/dashboard/agent', icon: Code, label: 'Agent' },
    { href: '/dashboard/mcp', icon: GitBranch, label: 'MCP' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    { href: '/dashboard/docs', icon: Book, label: 'Docs' },
  ]

  const autoIncidentLinks = [
    { href: '/dashboard/incidents', icon: AlertCircle, label: 'Incidents' },
    { href: '/dashboard/oncall', icon: Clock, label: 'On-call' },
    { href: '/dashboard/services', icon: Package, label: 'Services' },
    { href: '/dashboard/status', icon: Globe, label: 'Status Pages' },
    { href: '/dashboard/postmortems', icon: PostMortem, label: 'Post-mortems' },
    { href: '/dashboard/insights', icon: TrendingUp, label: 'Insights' },
    { href: '/dashboard/integrations', icon: Link2, label: 'Integrations' },
    { href: '/dashboard/teams', icon: Users, label: 'Teams' },
  ]

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} z-50`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-700">
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">AutoDocs + AutoIncident</h1>
                <p className="text-xs text-gray-400">by GrowthLab</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {/* AutoDocs Section */}
            {!sidebarCollapsed && (
              <div className="px-3 mb-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AutoDocs</h2>
              </div>
            )}
            {autoDocsLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-teal-400 transition-colors"
              >
                <link.icon size={20} />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </a>
            ))}

            {/* AutoIncident Section */}
            {!sidebarCollapsed && (
              <div className="px-3 mb-2 mt-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AutoIncident</h2>
              </div>
            )}
            {autoIncidentLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors"
              >
                <link.icon size={20} />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </a>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={toggleSidebar}
              className="w-full mb-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {sidebarCollapsed ? '→' : '← Collapse'}
            </button>
            {!sidebarCollapsed && (
              <div className="mb-2">
                <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-400">{user?.email}</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
