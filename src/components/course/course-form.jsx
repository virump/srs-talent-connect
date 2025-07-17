'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabaseClient'

export function CourseForm({ onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let thumbnailUrl = null

      if (thumbnail) {
        const fileExt = thumbnail.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from('course-thumbnails')
          .upload(fileName, thumbnail)
        if (uploadError) throw uploadError
        thumbnailUrl = data.path
      }

      const { error } = await supabase.from('courses').insert([
        {
          title,
          description,
          price: parseFloat(price),
          provider_id: user.id,
          thumbnail_url: thumbnailUrl,
          status: 'published'
        }
      ])
      if (error) throw error
      onSuccess?.()
    } catch (error) {
      console.error('Error creating course:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Course Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Course Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setThumbnail(e.target.files[0])}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Course'}
      </Button>
    </form>
  )
}
