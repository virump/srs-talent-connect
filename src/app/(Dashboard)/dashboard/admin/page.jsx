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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
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
      const { count: studentCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      const { count: providerCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'provider')

      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      const { count: enrollmentCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalStudents: studentCount || 0,
        totalProviders: providerCount || 0,
        totalCourses: courseCount || 0,
        totalEnrollments: enrollmentCount || 0
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading Admin Panel...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-600">Total Students</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalStudents}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-gray-600">Total Providers</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalProviders}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-gray-600">Total Courses</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalCourses}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-gray-600">Total Enrollments</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalEnrollments}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              users.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{user.full_name || 'Anonymous User'}</p>
                    <p className="text-sm text-gray-500">{user.email} ({user.role})</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
          <div className="space-y-3">
            {courses.length === 0 ? (
              <p className="text-gray-500">No courses found.</p>
            ) : (
              courses.map(course => (
                <div key={course.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{course.title}</p>
                    <p className="text-sm text-gray-500">
                      by {course.users?.full_name || 'Unknown Provider'}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    ${course.price}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
