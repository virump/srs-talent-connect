'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BriefcaseBusiness,
  ChevronsLeft,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    roles: ['student', 'provider', 'admin'],
  },
  { href: '/dashboard/courses', label: 'Courses', icon: LibraryBig, roles: ['student', 'provider'] },
  {
    href: '/dashboard/opportunities',
    label: 'Opportunities',
    icon: BriefcaseBusiness,
    roles: ['student', 'provider'],
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: UserRound,
    roles: ['student', 'provider', 'admin'],
  },
  { href: '/dashboard/admin', label: 'Admin Panel', icon: Settings, roles: ['admin'] },
]

const COLLAPSE_KEY = 'srs-sidebar-collapsed'

/** Sidebar shape shown while auth resolves — avoids a bare "Loading..." string. */
function SidebarSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 shrink-0 border-r bg-card p-5 md:block">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton shape="text" className="w-24" />
            <Skeleton shape="text" className="h-3 w-16" />
          </div>
        </div>
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 bg-muted/30 p-8">
        <Skeleton shape="text" className="h-8 w-64" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="mt-6">
          <SkeletonText lines={4} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Restore the collapsed rail preference.
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1')
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        // Non-fatal: the preference just won't persist.
      }
      return next
    })
  }

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // Close the drawer on Escape.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Redirect unauthenticated users from an effect, not during render.
  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setSigningOut(false)
    }
  }

  if (loading) return <SidebarSkeleton />
  if (!user) return <SidebarSkeleton />

  const filteredNavItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  )

  const avatarSrc = user?.avatar_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_url}`
    : null

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname?.startsWith(href)

  const sidebarWidth = collapsed ? 'md:w-[4.5rem]' : 'md:w-64'

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile scrim */}
      <div
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-all duration-300 ease-out-expo md:sticky md:top-0 md:h-screen md:translate-x-0',
          sidebarWidth,
          isSidebarOpen ? 'translate-x-0 shadow-lift' : '-translate-x-full'
        )}
      >
        {/* User card */}
        <div className={cn('flex items-center gap-3 border-b p-4', collapsed && 'md:justify-center')}>
          <Avatar src={avatarSrc} name={user.full_name || user.email} size="md" status="online" />
          <div className={cn('min-w-0 flex-1', collapsed && 'md:hidden')}>
            <p className="truncate text-sm font-semibold">{user.full_name || 'Your account'}</p>
            {user.role && (
              <Badge variant="brand" className="mt-1 capitalize">
                {user.role}
              </Badge>
            )}
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Tooltip
                key={item.href}
                content={collapsed ? item.label : null}
                side="right"
                delay={100}
                wrapperClassName="w-full"
              >
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    collapsed && 'md:justify-center md:px-0',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {/* Active rail marker */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300 ease-out-expo',
                      active ? 'opacity-100' : 'scale-y-0 opacity-0'
                    )}
                  />
                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-transform duration-200',
                      !active && 'group-hover:scale-110'
                    )}
                  />
                  <span className={cn('truncate', collapsed && 'md:hidden')}>{item.label}</span>
                </Link>
              </Tooltip>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'hidden w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:flex',
              collapsed && 'md:justify-center md:px-0'
            )}
          >
            <ChevronsLeft
              className={cn(
                'h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-out-expo',
                collapsed && 'rotate-180'
              )}
            />
            <span className={cn(collapsed && 'md:hidden')}>Collapse</span>
          </button>

          <Tooltip
            content={collapsed ? 'Sign out' : null}
            side="right"
            delay={100}
            wrapperClassName="w-full"
          >
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60',
                collapsed && 'md:justify-center md:px-0'
              )}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span className={cn(collapsed && 'md:hidden')}>
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </span>
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Dashboard</span>
        </div>

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div key={pathname} className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
