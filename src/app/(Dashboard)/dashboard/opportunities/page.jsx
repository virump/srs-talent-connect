'use client'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from '@/lib/supabaseClient'
import { Badge } from "@/components/ui/badge"

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [type, setType] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOpportunities()
  }, [type])

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          users!provider_id (
            full_name,
            company_name
          )
        `)
        .eq('status', 'active')

      if (type !== 'all') {
        query = query.eq('type', type)
      }

      const { data } = await query
      setOpportunities(data || [])
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (opportunityId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('applications')
        .insert([
          {
            opportunity_id: opportunityId,
            user_id: user.id
          }
        ])

      if (error) throw error
      alert('Application submitted successfully!')
    } catch (error) {
      console.error('Error applying:', error)
    }
  }

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Jobs & Internships</h1>
          <p className="text-gray-600">Find your next opportunity</p>
        </div>
        <div className="flex gap-4">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Opportunities</SelectItem>
              <SelectItem value="job">Jobs</SelectItem>
              <SelectItem value="internship">Internships</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="max-w-xs"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpportunities.map(opp => (
          <Card key={opp.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{opp.title}</h3>
                  <p className="text-gray-600">{opp.company_name}</p>
                </div>
                <Badge variant={opp.type === 'job' ? 'default' : 'secondary'}>
                  {opp.type}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">{opp.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{opp.location}</p>
                  </div>
                  <div>
                    <span className="font-medium">Salary:</span>
                    <p>{opp.salary_range}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Posted {new Date(opp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Button onClick={() => handleApply(opp.id)}>Apply Now</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
