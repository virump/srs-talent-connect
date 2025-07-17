'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabaseClient'
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserCircle, Menu } from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [authDialog, setAuthDialog] = useState({ isOpen: false, mode: 'login' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
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
    }
  }

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    setAuthDialog(prev => ({ ...prev, mode, isOpen: true }))
  }

  const handleAuthClose = () => {
    setAuthDialog(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <nav className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold">SRS</h1>
        </Link>

        <button 
          className="md:hidden p-2 hover:bg-accent rounded-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ">
                    {user.avatar_url ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_url}`}
                        alt={user.full_name}
                        className="h-full w-full rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-6 w-6" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.full_name && <p className="font-medium">{user.full_name}</p>}
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setAuthDialog({ isOpen: true, mode: 'login' })}
              >
                Login
              </Button>
              <Button
                onClick={() => setAuthDialog({ isOpen: true, mode: 'register' })}
              >
                Register
              </Button>
            </div>
          )}
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b md:hidden p-4 space-y-4">
            {user ? (
              <>
                <Link href="/dashboard" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setAuthDialog({ isOpen: true, mode: 'login' })
                    setIsMenuOpen(false)
                  }}
                >
                  Login
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => {
                    setAuthDialog({ isOpen: true, mode: 'register' })
                    setIsMenuOpen(false)
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <AuthDialog 
        isOpen={authDialog.isOpen}
        mode={authDialog.mode}
        onClose={() => {
          handleAuthClose()
          setIsMenuOpen(false)
        }}
        onModeChange={handleAuthModeChange}
      />
    </nav>
  )
}
