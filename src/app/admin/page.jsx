'use client'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProviders: 0,
    totalCourses: 0,
    totalEnrollments: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch users
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    setUsers(usersData || [])

    // Fetch courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, users!courses_provider_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(10)
    setCourses(coursesData || [])

    // Fetch stats
    const { data: statsData } = await supabase
      .from('users')
      .select('role, count')
      .group('role')
    
    const stats = {
      totalStudents: statsData?.find(s => s.role === 'student')?.count || 0,
      totalProviders: statsData?.find(s => s.role === 'provider')?.count || 0,
      totalCourses: coursesData?.length || 0,
    }
    setStats(stats)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="font-semibold">Total Students</h3>
          <p className="text-2xl">{stats.totalStudents}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Total Providers</h3>
          <p className="text-2xl">{stats.totalProviders}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Total Courses</h3>
          <p className="text-2xl">{stats.totalCourses}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Total Enrollments</h3>
          <p className="text-2xl">{stats.totalEnrollments}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
          <div className="space-y-2">
            {users.map(user => (
              <Card key={user.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
          <div className="space-y-2">
            {courses.map(course => (
              <Card key={course.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{course.title}</p>
                    <p className="text-sm text-gray-600">
                      by {course.users?.full_name}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
