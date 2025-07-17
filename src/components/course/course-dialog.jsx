'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from 'sonner'

export function CourseDialog({ course, isOpen, onClose }) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkEnrollment()
  }, [course?.id])

  const checkEnrollment = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && course) {
      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', course.id)
        .eq('user_id', user.id)
        .single()
      setIsEnrolled(!!data)
    }
  }

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to enroll')
        onClose()
        return
      }

      const { error } = await supabase
        .from('enrollments')
        .insert([{ user_id: user.id, course_id: course.id }])

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error('You are already enrolled in this course')
        } else {
          throw error
        }
        return
      }

      setIsEnrolled(true)
      toast.success('Successfully enrolled in course!')
      onClose()
    } catch (error) {
      console.error('Error enrolling:', error)
      toast.error('Failed to enroll in course')
    } finally {
      setLoading(false)
    }
  }

  if (!course) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Course Details</DialogTitle>
          <DialogDescription className="sr-only">
            View details and enroll in {course.title}
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-48">
          {course.thumbnail_url ? (
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${course.thumbnail_url}`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No thumbnail available</span>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge variant={isEnrolled ? "success" : "default"}>
              {isEnrolled ? "Enrolled" : `$${course.price}`}
            </Badge>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
          <p className="text-gray-600 mb-4">by {course.users?.full_name}</p>
          
          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold mb-2">About this course</h3>
            <p>{course.description}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Duration: 8 weeks</p>
              <p>Level: Beginner</p>
            </div>
            {!isEnrolled ? (
              <Button 
                onClick={handleEnroll} 
                disabled={loading || isEnrolled}
                size="lg"
              >
                {loading ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            ) : (
              <Button variant="outline" size="lg">
                Go to Course
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
