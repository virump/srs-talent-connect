'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/providers/auth-provider'
import { Menu, X } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) return <div>Loading...</div>
  if (!user) {
    router.push('/auth/login')
    return null
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊', roles: ['student', 'provider', 'admin'] },
    { href: '/dashboard/courses', label: 'Courses', icon: '📚', roles: ['student', 'provider'] },
    { href: '/dashboard/opportunities', label: 'Opportunities', icon: '💼', roles: ['student', 'provider'] },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤', roles: ['student', 'provider', 'admin'] },
    { href: '/dashboard/admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] }
  ]

  const filteredNavItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  return (
    <div className="min-h-screen flex">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm overflow-y-auto transition-transform duration-200
        md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800">Welcome,</h2>
            <p className="text-gray-600">{user?.full_name}</p>
            <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block">
              {user.role}
            </div>
          </div>
          <nav className="space-y-2 flex-grow">
            {filteredNavItems.map(item => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="pt-4 mt-auto border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <span className="mr-2">🚪</span>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gray-50">
        {/* Mobile header with menu button */}
        <div className="sticky top-0 z-10 md:hidden bg-white border-b p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
