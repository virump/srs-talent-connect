import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
      
      // Set cookie with session
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.set('sb-session', JSON.stringify(session), {
        path: '/',
        secure: true,
        sameSite: 'lax'
      })
      
      return response
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}
