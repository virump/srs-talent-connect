'use client'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { CourseDialog } from "@/components/course/course-dialog"

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select(`
        *,
        users!courses_provider_id_fkey (
          full_name
        )
      `)
      .eq('status', 'published')
    setCourses(data || [])
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCourseClick = (course) => {
    setSelectedCourse(course)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Available Courses</h1>
        <Input
          className="max-w-xs"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <Card 
            key={course.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCourseClick(course)}
          >
            <div className="relative">
              {course.thumbnail_url && (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${course.thumbnail_url}`}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t"
                />
              )}
              <div className="absolute top-2 right-2">
                <Badge>${course.price}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {course.users.full_name}</p>
              <p className="text-sm text-gray-700 line-clamp-2 mb-4">{course.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>⭐ 4.5</span>
                  <span>|</span>
                  <span>500 students</span>
                </div>
                <Button variant="ghost" size="sm">Learn More</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <CourseDialog
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  )
}
