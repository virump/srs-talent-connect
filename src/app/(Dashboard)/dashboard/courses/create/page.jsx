'use client'
import { CourseForm } from '@/components/course/course-form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateCoursePage() {
  const router = useRouter()
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm onSuccess={() => {
            toast.success('Course created successfully!')
            router.push('/dashboard/courses')
          }} />
        </CardContent>
      </Card>
    </div>
  )
}
