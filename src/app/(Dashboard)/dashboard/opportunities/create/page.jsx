'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateOpportunityPage() {
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('job')
  const [location, setLocation] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [requirements, setRequirements] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to post an opportunity.')
        return
      }

      const reqArray = requirements
        .split(',')
        .map(req => req.trim())
        .filter(Boolean)

      const { error } = await supabase.from('opportunities').insert([
        {
          title,
          company_name: companyName,
          description,
          type,
          location,
          salary_range: salaryRange,
          requirements: reqArray,
          provider_id: user.id,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          status: 'active'
        }
      ])

      if (error) throw error

      toast.success('Opportunity posted successfully!')
      router.push('/dashboard/opportunities')
    } catch (error) {
      console.error('Error posting opportunity:', error)
      toast.error(error.message || 'Failed to post opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Post New Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Opportunity Title</label>
              <Input
                placeholder="e.g. Frontend Developer Intern, Junior Systems Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Opportunity Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job">Full-time Job</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Provide a detailed description of the role and responsibilities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="e.g. Remote, San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range</label>
              <Input
                placeholder="e.g. $60,000 - $80,000 / year, $25 / hour"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Requirements (comma-separated)</label>
              <Input
                placeholder="e.g. React, JavaScript, Git, Communication skills"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Application Deadline</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Posting...' : 'Post Opportunity'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
