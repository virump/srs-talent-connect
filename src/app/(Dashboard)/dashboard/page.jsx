'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [applications, setApplications] = useState([])
  const [currentCourses, setCurrentCourses] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    pendingApplications: 0,
    acceptedApplications: 0
  })
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setUser(userData)

      // Fetch courses based on role
      if (userData.role === 'student') {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            *,
            courses (*)
          `)
          .eq('user_id', user.id)
        
        const coursesData = enrollments?.map(e => ({
          ...e.courses,
          progress: Math.floor(Math.random() * 100) // Temporary: Replace with actual progress
        })) || []
        
        setCourses(coursesData)
        setCurrentCourses(coursesData.filter(c => c.progress < 100))

        // Fetch activities
        const { data: progresses } = await supabase
          .from('user_progress')
          .select('*, course_lessons(*)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5)

        setActivities(progresses?.map(p => ({
          id: p.id,
          type: p.completed ? 'completion' : 'progress',
          description: `Completed lesson: ${p.course_lessons.title}`,
          timestamp: p.completed_at || p.created_at
        })) || [])

        // Fetch applications
        const { data: apps } = await supabase
          .from('applications')
          .select(`
            *,
            opportunities (
              title,
              company_name,
              type
            )
          `)
          .eq('user_id', user.id)
        setApplications(apps || [])

        // Calculate stats
        setStats({
          totalCourses: enrollments?.length || 0,
          completedCourses: enrollments?.filter(e => e.status === 'completed').length || 0,
          pendingApplications: apps?.filter(a => a.status === 'pending').length || 0,
          acceptedApplications: apps?.filter(a => a.status === 'accepted').length || 0
        })
      }
    }
  }

  const renderProviderDashboard = () => (
    <>
      <div className="flex gap-4 mb-8">
        <Card className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
          <h3 className="font-medium text-blue-100">Total Courses</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
          <p className="text-sm text-blue-100 mt-4">
            {stats.activeStudents} Active Students
          </p>
        </Card>
        <Card className="flex-1 bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
          <h3 className="font-medium text-green-100">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">${stats.totalRevenue}</p>
          <p className="text-sm text-green-100 mt-4">
            This Month: ${stats.monthlyRevenue}
          </p>
        </Card>
        <Card className="flex-1 bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
          <h3 className="font-medium text-purple-100">Job Postings</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalJobs}</p>
          <p className="text-sm text-purple-100 mt-4">
            {stats.activeApplications} Active Applications
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Course Activity</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/courses">View All</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {courses.slice(0, 5).map(course => (
              <div key={course.id} 
                   className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-600">
                    {course.enrolled_count} students enrolled
                  </p>
                </div>
                <Badge variant={course.status === 'published' ? 'success' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/opportunities">View All</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {applications.slice(0, 5).map(app => (
              <div key={app.id} 
                   className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h3 className="font-medium">{app.user.full_name}</h3>
                  <p className="text-sm text-gray-600">{app.position}</p>
                </div>
                <Badge>{app.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )

  const renderStudentDashboard = () => (
    <>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-sm font-medium text-blue-600">Enrolled Courses</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalCourses}</p>
          <div className="mt-4 h-1 bg-blue-200 rounded">
            <div 
              className="h-1 bg-blue-500 rounded" 
              style={{width: `${(stats.completedCourses/stats.totalCourses) * 100}%`}}
            />
          </div>
          <p className="text-sm text-blue-600 mt-2">
            {stats.completedCourses} completed
          </p>
        </Card>
        
        {/* ...similar cards for applications, certifications, etc... */}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-6">Current Courses</h2>
          {currentCourses.map(course => (
            <div key={course.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{course.title}</h3>
                <p className="text-sm text-gray-600">
                  {course.progress}% Complete
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded">
                <div 
                  className="h-2 bg-green-500 rounded"
                  style={{width: `${course.progress}%`}}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'completion' ? 'bg-green-100' :
                  activity.type === 'enrollment' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {/* Activity icon */}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp))} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )

  if (!user) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.full_name}</h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </div>
        {user.role === 'provider' && (
          <div className="space-x-4">
            <Button onClick={() => router.push('/dashboard/courses/create')}>
              Create Course
            </Button>
            <Button onClick={() => router.push('/dashboard/opportunities/create')}>
              Post Job
            </Button>
          </div>
        )}
      </div>

      {user.role === 'provider' ? renderProviderDashboard() : renderStudentDashboard()}
    </div>
  )
}
