'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Briefcase, BookOpen, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabaseClient'
import { AuthDialog } from '@/components/auth/auth-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/opportunities', label: 'Opportunities', icon: Briefcase },
]

export function Navbar() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [checking, setChecking] = useState(true)
  const [authDialog, setAuthDialog] = useState({ isOpen: false, mode: 'login' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setUser(data)
          setUserRole(data?.role)
          localStorage.setItem('cached_user', JSON.stringify(data))
        }
      } else {
        setUser(null)
        setUserRole(null)
        localStorage.removeItem('cached_user')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      const cachedUser = localStorage.getItem('cached_user')
      if (cachedUser) {
        const userData = JSON.parse(cachedUser)
        setUser(userData)
        setUserRole(userData.role)
      } else {
        setUser(null)
        setUserRole(null)
      }
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await checkUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserRole(null)
        localStorage.removeItem('cached_user')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Elevate the bar once the page scrolls, so it separates from content.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile sheet on navigation.
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAuthModeChange = (mode) => {
    setAuthDialog((prev) => ({ ...prev, mode, isOpen: true }))
  }

  const handleAuthClose = () => {
    setAuthDialog((prev) => ({ ...prev, isOpen: false }))
  }

  const avatarSrc = user?.avatar_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_url}`
    : null

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-300',
          scrolled
            ? 'border-border bg-background/80 shadow-soft backdrop-blur-xl supports-[backdrop-filter]:bg-background/70'
            : 'border-transparent bg-background/60 backdrop-blur-sm'
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          {/* Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-soft transition-transform duration-300 ease-out-back group-hover:scale-105 group-hover:-rotate-6">
              S
            </span>
            <span className="text-lg font-bold tracking-tight md:text-xl">SRS</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {/* Animated active underline */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-primary transition-transform duration-300 ease-out-expo',
                    isActive(link.href) ? 'scale-x-100' : 'scale-x-0'
                  )}
                />
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />

            {checking ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton shape="circle" className="h-10 w-10" />
              </div>
            ) : user ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="rounded-full outline-none ring-offset-2 ring-offset-background transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                    >
                      <Avatar src={avatarSrc} name={user.full_name || user.email} size="md" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-60">
                    <div className="flex items-center gap-3 p-2">
                      <Avatar src={avatarSrc} name={user.full_name || user.email} size="sm" />
                      <div className="min-w-0 flex-1">
                        {user.full_name && (
                          <p className="truncate text-sm font-medium">{user.full_name}</p>
                        )}
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    {userRole && (
                      <div className="px-2 pb-2">
                        <Badge variant="brand" className="capitalize">
                          {userRole}
                        </Badge>
                      </div>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setAuthDialog({ isOpen: true, mode: 'login' })}
                >
                  Log in
                </Button>
                <Button
                  variant="brand"
                  onClick={() => setAuthDialog({ isOpen: true, mode: 'register' })}
                >
                  Get started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <Menu
                className={cn(
                  'absolute h-5 w-5 transition-all duration-300 ease-out-expo',
                  isMenuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                )}
              />
              <X
                className={cn(
                  'absolute h-5 w-5 transition-all duration-300 ease-out-expo',
                  isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                )}
              />
            </button>
          </div>
        </div>

        {/* Mobile sheet — always mounted so it can animate both ways */}
        <div
          className={cn(
            'overflow-hidden border-t bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out-expo md:hidden',
            isMenuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="space-y-1 px-4 py-4">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl border bg-card p-3">
                <Avatar src={avatarSrc} name={user.full_name || user.email} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.full_name || 'Your account'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                {userRole && (
                  <Badge variant="brand" className="capitalize">
                    {userRole}
                  </Badge>
                )}
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <div className="my-3 h-px bg-border" />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setAuthDialog({ isOpen: true, mode: 'login' })
                    setIsMenuOpen(false)
                  }}
                >
                  Log in
                </Button>
                <Button
                  variant="brand"
                  className="w-full"
                  onClick={() => {
                    setAuthDialog({ isOpen: true, mode: 'register' })
                    setIsMenuOpen(false)
                  }}
                >
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthDialog
        isOpen={authDialog.isOpen}
        mode={authDialog.mode}
        onClose={() => {
          handleAuthClose()
          setIsMenuOpen(false)
        }}
        onModeChange={handleAuthModeChange}
      />
    </>
  )
}
