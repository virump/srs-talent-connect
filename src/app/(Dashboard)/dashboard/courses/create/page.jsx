'use client'
import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function CreateCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: null,
    modules: [{ title: '', lessons: [{ title: '', content: '', duration: '' }] }]
  })

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: '', lessons: [] }]
    })
  }

  const addLesson = (moduleIndex) => {
    const newModules = [...formData.modules]
    newModules[moduleIndex].lessons.push({ title: '', content: '', duration: '' })
    setFormData({ ...formData, modules: newModules })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please login first')

      // Upload thumbnail
      let thumbnailUrl = null
      if (formData.thumbnail) {
        const fileExt = formData.thumbnail.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('course-thumbnails')
          .upload(fileName, formData.thumbnail)
        if (!uploadError) thumbnailUrl = fileName
      }

      // Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert([{
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          provider_id: user.id,
          thumbnail_url: thumbnailUrl,
          status: 'published'
        }])
        .select()
        .single()

      if (courseError) throw courseError

      // Create modules and lessons
      for (let [moduleIndex, module] of formData.modules.entries()) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .insert([{
            course_id: course.id,
            title: module.title,
            order_index: moduleIndex + 1
          }])
          .select()
          .single()

        if (moduleError) throw moduleError

        // Create lessons for this module
        const lessonsToInsert = module.lessons.map((lesson, lessonIndex) => ({
          module_id: moduleData.id,
          title: lesson.title,
          content: lesson.content,
          duration: parseInt(lesson.duration),
          order_index: lessonIndex + 1
        }))

        const { error: lessonsError } = await supabase
          .from('course_lessons')
          .insert(lessonsToInsert)

        if (lessonsError) throw lessonsError
      }

      toast.success('Course created successfully')
      router.push('/dashboard/courses')
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Course Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Course Details</h2>
            <Input
              placeholder="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <Textarea
              placeholder="Course Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows={4}
            />
            <Input
              type="number"
              placeholder="Price ($)"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
              min="0"
              step="0.01"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({...formData, thumbnail: e.target.files[0]})}
            />
          </div>

          {/* Modules and Lessons */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Course Content</h2>
              <Button type="button" onClick={addModule} variant="outline">
                Add Module
              </Button>
            </div>

            {formData.modules.map((module, moduleIndex) => (
              <Card key={moduleIndex} className="p-4 space-y-4">
                <Input
                  placeholder="Module Title"
                  value={module.title}
                  onChange={(e) => {
                    const newModules = [...formData.modules]
                    newModules[moduleIndex].title = e.target.value
                    setFormData({...formData, modules: newModules})
                  }}
                  required
                />

                <div className="space-y-4 pl-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Lesson Title"
                        value={lesson.title}
                        onChange={(e) => {
                          const newModules = [...formData.modules]
                          newModules[moduleIndex].lessons[lessonIndex].title = e.target.value
                          setFormData({...formData, modules: newModules})
                        }}
                        required
                      />
                      <Input
                        placeholder="Content"
                        value={lesson.content}
                        onChange={(e) => {
                          const newModules = [...formData.modules]
                          newModules[moduleIndex].lessons[lessonIndex].content = e.target.value
                          setFormData({...formData, modules: newModules})
                        }}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={lesson.duration}
                        onChange={(e) => {
                          const newModules = [...formData.modules]
                          newModules[moduleIndex].lessons[lessonIndex].duration = e.target.value
                          setFormData({...formData, modules: newModules})
                        }}
                        required
                      />
                    </div>
                  ))}
                  <Button 
                    type="button"
                    onClick={() => addLesson(moduleIndex)}
                    variant="ghost"
                    size="sm"
                  >
                    Add Lesson
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
