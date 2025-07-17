'use client'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function CourseDetails() {
  const params = useParams()
  const [course, setCourse] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCourse()
    checkEnrollment()
  }, [params.id])

  const fetchCourse = async () => {
    const { data } = await supabase
      .from('courses')
      .select(`
        *,
        users!courses_provider_id_fkey (
          full_name,
          email
        )
      `)
      .eq('id', params.id)
      .single()
    setCourse(data)
  }

  const checkEnrollment = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', params.id)
        .eq('user_id', user.id)
        .single()
      setIsEnrolled(!!data)
    }
  }

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('enrollments')
        .insert([
          {
            user_id: user.id,
            course_id: params.id
          }
        ])
      if (error) throw error
      setIsEnrolled(true)
    } catch (error) {
      console.error('Error enrolling:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!course) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto p-6">
        {course.thumbnail_url && (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${course.thumbnail_url}`}
            alt={course.title}
            className="w-full h-64 object-cover mb-6 rounded"
          />
        )}
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600">by {course.users.full_name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold mb-2">${course.price}</p>
            {!isEnrolled ? (
              <Button 
                onClick={handleEnroll} 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            ) : (
              <Button variant="outline" size="lg">
                Already Enrolled
              </Button>
            )}
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">About this course</h2>
          <p>{course.description}</p>
        </div>
      </Card>
    </div>
  )
}
