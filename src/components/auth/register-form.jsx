'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'  // Replace react-toastify with sonner

export function RegisterForm({ onSuccess, onLoginClick }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First create the auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) throw signUpError

      if (data?.user) {
        // Then create the user profile
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email: email.trim(),
          full_name: fullName,
          role: role,
          created_at: new Date().toISOString()
        })

        if (insertError) {
          // Rollback auth user creation if profile creation fails
          await supabase.auth.signOut()
          throw insertError
        }

        toast.success('Registration successful! Please check your email.')
        
        // Wait before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000))
        onSuccess?.()
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      <Card className="w-[350px]">
        <CardHeader>
          <h2 className="text-2xl font-bold">Register</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="provider">Course Provider</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onLoginClick}
          className="text-blue-600 hover:underline"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}
