'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { supabase } from '@/lib/supabaseClient'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    phone: '',
    linkedinUrl: '',
    githubUrl: '',
    skills: ''
  })
  const [avatar, setAvatar] = useState(null)
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setFormData({
        fullName: data.full_name || '',
        bio: data.bio || '',
        phone: data.phone || '',
        linkedinUrl: data.linkedin_url || '',
        githubUrl: data.github_url || '',
        skills: (data.skills || []).join(', ')
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let updates = {
        full_name: formData.fullName,
        bio: formData.bio,
        phone: formData.phone,
        linkedin_url: formData.linkedinUrl,
        github_url: formData.githubUrl,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      }

      if (avatar) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${user.id}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar, { upsert: true })
        if (!uploadError) {
          updates.avatar_url = fileName
        }
      }

      if (resume) {
        const fileExt = resume.name.split('.').pop()
        const fileName = `${user.id}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resume, { upsert: true })
        if (!uploadError) {
          updates.resume_url = fileName
        }
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block mb-2">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
              />
            </div>

            <div>
              <label className="block mb-2">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-2">LinkedIn URL</label>
              <Input
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-2">GitHub URL</label>
              <Input
                value={formData.githubUrl}
                onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-2">Skills (comma-separated)</label>
              <Input
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="React, Next.js, TypeScript"
              />
            </div>

            <div>
              <label className="block mb-2">Profile Picture</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </div>
            {profile?.role === 'student' && (
              <div>
                <label className="block mb-2">Resume</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                />
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
