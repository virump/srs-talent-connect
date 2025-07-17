'use client'
import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function CreateOpportunity() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'job',
    location: '',
    salaryRange: '',
    requirements: '',
    deadline: '',
    companyName: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please login first')

      // Get company info from user profile
      const { data: userData } = await supabase
        .from('users')
        .select('company_name')
        .eq('id', user.id)
        .single()

      const { error } = await supabase.from('opportunities').insert([{
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        salary_range: formData.salaryRange,
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        provider_id: user.id,
        company_name: userData?.company_name || formData.companyName,
        deadline: formData.deadline,
        status: 'active',
        created_at: new Date().toISOString()
      }])

      if (error) throw error

      toast.success('Opportunity posted successfully')
      router.push('/dashboard/opportunities')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Post New Opportunity</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., New York, NY or Remote"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the role and responsibilities"
                rows={6}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Salary Range</label>
              <Input
                value={formData.salaryRange}
                onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
                placeholder="e.g., $80,000 - $100,000"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Application Deadline</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Requirements (comma-separated)</label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                placeholder="e.g., React, 3+ years experience, Bachelor's degree"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Opportunity'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
