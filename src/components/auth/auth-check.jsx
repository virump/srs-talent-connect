'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/providers/auth-provider'

export function AuthCheck() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace('/')
        return
      }
    }

    if (!loading && !user) {
      checkAuth()
    }
  }, [user, loading, router])

  return null
}
