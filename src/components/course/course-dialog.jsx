'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { BookOpen, ImageIcon, Users } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/utils'

export function CourseDialog({ course, isOpen, onClose }) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkEnrollment = async () => {
      if (!course?.id) {
        setIsEnrolled(false)
        return
      }

      setChecking(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) setIsEnrolled(false)
          return
        }

        // maybeSingle(): `single()` treated "not enrolled" as an error.
        const { data } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', course.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (!cancelled) setIsEnrolled(Boolean(data))
      } catch (error) {
        console.error('Error checking enrollment:', error)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    checkEnrollment()
    return () => {
      cancelled = true
    }
  }, [course?.id])

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to enroll')
        onClose()
        return
      }

      const { error } = await supabase
        .from('enrollments')
        .insert([{ user_id: user.id, course_id: course.id }])

      if (error) {
        // 23505 = unique_violation
        if (error.code === '23505') {
          setIsEnrolled(true)
          toast.info('You are already enrolled in this course')
          return
        }
        throw error
      }

      setIsEnrolled(true)
      toast.success('Enrolled successfully', {
        description: `${course.title} has been added to your dashboard.`,
      })
      onClose()
    } catch (error) {
      console.error('Error enrolling:', error)
      toast.error('Failed to enroll in course', {
        description: error.message ?? 'Please try again in a moment.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!course) return null

  const price = Number(course.price) || 0
  const providerName = course.users?.full_name ?? 'Unknown provider'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle className="sr-only">{course.title}</DialogTitle>
          <DialogDescription className="sr-only">
            View details and enroll in {course.title}
          </DialogDescription>
        </DialogHeader>

        {/* Media */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
          {course.thumbnail_url ? (
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${course.thumbnail_url}`}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-500/15 dark:to-brand-500/5">
              <ImageIcon className="h-10 w-10 text-brand-500/60" aria-hidden="true" />
            </div>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
          />

          <div className="absolute right-4 top-4">
            <Badge variant={isEnrolled ? 'success' : price === 0 ? 'success' : 'default'}>
              {isEnrolled ? 'Enrolled' : price === 0 ? 'Free' : formatCurrency(price)}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <h2 className="text-balance text-2xl font-bold tracking-tight">{course.title}</h2>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <Avatar name={providerName} size="xs" />
              <span className="text-sm text-muted-foreground">{providerName}</span>
            </span>
            {typeof course.enrolledCount === 'number' && (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden="true" />
                {course.enrolledCount} enrolled
              </span>
            )}
          </div>

          <div className="mt-6">
            <h3 className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
              About this course
            </h3>
            <p className="mt-2 whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground">
              {course.description || 'No description provided for this course yet.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 p-6">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-bold">{price === 0 ? 'Free' : formatCurrency(price)}</p>
          </div>

          {isEnrolled ? (
            <Button variant="outline" size="lg" asChild>
              <Link href={`/dashboard/courses/${course.id}`}>Go to course</Link>
            </Button>
          ) : (
            <Button
              variant="brand"
              size="lg"
              onClick={handleEnroll}
              loading={loading || checking}
              loadingText={loading ? 'Enrolling…' : 'Checking…'}
            >
              Enroll now
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
