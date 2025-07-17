'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { supabase } from '@/lib/supabaseClient'

export default function CompanyProfile() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    website: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCompanyProfile()
  }, [])

  const fetchCompanyProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('company_name, bio, linkedin_url')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setFormData({
          companyName: data.company_name || '',
          companyDescription: data.bio || '',
          website: data.linkedin_url || '',
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('users')
        .update({
          company_name: formData.companyName,
          bio: formData.companyDescription,
          linkedin_url: formData.website,
        })
        .eq('id', user.id)

      if (error) throw error
      alert('Company profile updated successfully!')
    } catch (error) {
      console.error('Error updating company profile:', error)
      alert('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Company Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Company Name</label>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Company Description</label>
            <Textarea
              value={formData.companyDescription}
              onChange={(e) => setFormData({...formData, companyDescription: e.target.value})}
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-2">Website</label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
