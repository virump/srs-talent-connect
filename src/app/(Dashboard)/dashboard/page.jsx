'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react'

import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatCard } from '@/components/ui/stat-card'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { formatCurrency, formatRelativeTime, percentage } from '@/lib/utils'

/** Section shell so every panel on the page shares one header treatment. */
function Panel({ title, description, action, children, className }) {
  return (
    <Card className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton shape="text" className="h-8 w-72" />
        <Skeleton shape="text" className="w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[9.5rem]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <Skeleton shape="text" className="h-5 w-40" />
          <div className="mt-6 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton shape="text" className="w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <Skeleton shape="text" className="h-5 w-32" />
          <div className="mt-6">
            <SkeletonText lines={5} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [courses, setCourses] = useState([])
  const [applications, setApplications] = useState([])
  const [activities, setActivities] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    lessonsCompleted: 0,
    activeStudents: 0,
    totalRevenue: 0,
    totalJobs: 0,
    activeApplications: 0,
  })

  const router = useRouter()

  /**
   * Real per-course progress: completed lessons over total lessons.
   * The previous implementation used Math.random(), so the bars changed on
   * every render and meant nothing.
   */
  const loadStudentData = useCallback(async (userId) => {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*, courses (*)')
      .eq('user_id', userId)

    if (enrollmentError) throw enrollmentError

    const enrolled = (enrollments ?? []).filter((e) => e.courses)
    const courseIds = enrolled.map((e) => e.courses.id)

    // Map lessons -> course so progress can be computed per course.
    let lessonToCourse = new Map()
    if (courseIds.length > 0) {
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, course_id')
        .in('course_id', courseIds)

      const moduleIds = (modules ?? []).map((m) => m.id)
      const moduleToCourse = new Map((modules ?? []).map((m) => [m.id, m.course_id]))

      if (moduleIds.length > 0) {
        const { data: lessons } = await supabase
          .from('course_lessons')
          .select('id, module_id')
          .in('module_id', moduleIds)

        lessonToCourse = new Map(
          (lessons ?? []).map((l) => [l.id, moduleToCourse.get(l.module_id)])
        )
      }
    }

    const { data: progressRows } = await supabase
      .from('user_progress')
      .select('id, lesson_id, completed, completed_at, course_lessons (title)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false, nullsFirst: false })

    const completedByCourse = new Map()
    const totalByCourse = new Map()

    lessonToCourse.forEach((courseId) => {
      totalByCourse.set(courseId, (totalByCourse.get(courseId) ?? 0) + 1)
    })

    ;(progressRows ?? []).forEach((row) => {
      if (!row.completed) return
      const courseId = lessonToCourse.get(row.lesson_id)
      if (!courseId) return
      completedByCourse.set(courseId, (completedByCourse.get(courseId) ?? 0) + 1)
    })

    const coursesData = enrolled.map((enrollment) => {
      const course = enrollment.courses
      const totalLessons = totalByCourse.get(course.id) ?? 0
      const completedLessons = completedByCourse.get(course.id) ?? 0
      return {
        ...course,
        enrollmentStatus: enrollment.status,
        totalLessons,
        completedLessons,
        progress:
          enrollment.status === 'completed'
            ? 100
            : percentage(completedLessons, totalLessons),
      }
    })

    setCourses(coursesData)

    setActivities(
      (progressRows ?? [])
        .filter((row) => row.completed_at)
        .slice(0, 6)
        .map((row) => ({
          id: row.id,
          type: row.completed ? 'completion' : 'progress',
          description: row.course_lessons?.title
            ? `Completed lesson: ${row.course_lessons.title}`
            : 'Lesson progress updated',
          timestamp: row.completed_at,
        }))
    )

    const { data: apps } = await supabase
      .from('applications')
      .select('*, opportunities (title, company_name, type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setApplications(apps ?? [])

    setStats((prev) => ({
      ...prev,
      totalCourses: enrolled.length,
      completedCourses: enrolled.filter((e) => e.status === 'completed').length,
      lessonsCompleted: (progressRows ?? []).filter((r) => r.completed).length,
      pendingApplications: (apps ?? []).filter((a) => a.status === 'pending').length,
      acceptedApplications: (apps ?? []).filter((a) => a.status === 'accepted').length,
    }))
  }, [])

  /**
   * The provider branch previously fetched nothing at all, so every provider
   * stat rendered as `undefined` (and "$undefined" for revenue).
   */
  const loadProviderData = useCallback(async (userId) => {
    const { data: providerCourses, error: courseError } = await supabase
      .from('courses')
      .select('*, enrollments (id, status)')
      .eq('provider_id', userId)
      .order('created_at', { ascending: false })

    if (courseError) throw courseError

    const withCounts = (providerCourses ?? []).map((course) => ({
      ...course,
      enrolledCount: course.enrollments?.length ?? 0,
    }))
    setCourses(withCounts)

    const { data: providerOpportunities } = await supabase
      .from('opportunities')
      .select('*, applications (id, status)')
      .eq('provider_id', userId)
      .order('created_at', { ascending: false })

    const opportunitiesData = (providerOpportunities ?? []).map((opp) => ({
      ...opp,
      applicationCount: opp.applications?.length ?? 0,
    }))
    setOpportunities(opportunitiesData)

    // Applications across all of this provider's opportunities.
    const opportunityIds = opportunitiesData.map((o) => o.id)
    let providerApplications = []
    if (opportunityIds.length > 0) {
      const { data: apps } = await supabase
        .from('applications')
        .select(
          '*, users!applications_user_id_fkey (full_name, avatar_url), opportunities (title, type)'
        )
        .in('opportunity_id', opportunityIds)
        .order('created_at', { ascending: false })
      providerApplications = apps ?? []
    }
    setApplications(providerApplications)

    const totalEnrollments = withCounts.reduce((sum, c) => sum + c.enrolledCount, 0)
    const totalRevenue = withCounts.reduce(
      (sum, c) => sum + (Number(c.price) || 0) * c.enrolledCount,
      0
    )

    setStats((prev) => ({
      ...prev,
      totalCourses: withCounts.length,
      publishedCourses: withCounts.filter((c) => c.status === 'published').length,
      activeStudents: totalEnrollments,
      totalRevenue,
      totalJobs: opportunitiesData.length,
      activeApplications: providerApplications.filter((a) => a.status === 'pending').length,
    }))
  }, [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/auth/login')
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        if (userError) throw userError
        if (cancelled) return

        setUser(userData)

        if (userData?.role === 'provider' || userData?.role === 'admin') {
          await loadProviderData(authUser.id)
        } else {
          await loadStudentData(authUser.id)
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
        if (!cancelled) setError(err.message ?? 'Something went wrong')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [router, loadProviderData, loadStudentData])

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <EmptyState
        icon={Activity}
        title="We couldn't load your dashboard"
        description={error}
        action={
          <Button variant="brand" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    )
  }

  const isProvider = user?.role === 'provider' || user?.role === 'admin'
  const inProgressCourses = courses.filter((c) => (c.progress ?? 0) < 100)

  /* ── Provider view ─────────────────────────────────────────── */
  const providerView = (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total courses"
          value={stats.totalCourses}
          icon={BookOpen}
          tone="brand"
          hint={`${stats.publishedCourses ?? 0} published`}
        />
        <StatCard
          label="Enrolled students"
          value={stats.activeStudents}
          icon={Users}
          tone="info"
          hint="Across all your courses"
        />
        <StatCard
          label="Total revenue"
          value={stats.totalRevenue}
          prefix="$"
          icon={DollarSign}
          tone="success"
          hint="Price × enrollments"
        />
        <StatCard
          label="Open postings"
          value={stats.totalJobs}
          icon={Briefcase}
          tone="warning"
          hint={`${stats.activeApplications} pending applications`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Your courses"
          description="Enrollment activity at a glance"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/courses">
                View all
                <ArrowRight />
              </Link>
            </Button>
          }
        >
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Publish your first course to start reaching learners."
              action={
                <Button variant="brand" asChild>
                  <Link href="/dashboard/courses/create">
                    <Plus />
                    Create course
                  </Link>
                </Button>
              }
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="space-y-2">
              {courses.slice(0, 5).map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-transparent p-3 transition-all duration-200 hover:border-border hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrolledCount} enrolled · {formatCurrency(course.price)}
                      </p>
                    </div>
                    <StatusBadge status={course.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent applications"
          description="People applying to your postings"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/opportunities">
                View all
                <ArrowRight />
              </Link>
            </Button>
          }
        >
          {applications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Post a job or internship to start receiving applications."
              action={
                <Button variant="brand" asChild>
                  <Link href="/dashboard/opportunities/create">
                    <Plus />
                    Post opportunity
                  </Link>
                </Button>
              }
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="space-y-2">
              {applications.slice(0, 5).map((app) => (
                <li
                  key={app.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={app.users?.full_name || 'Applicant'} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {app.users?.full_name ?? 'Applicant'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.opportunities?.title ?? 'Opportunity'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )

  /* ── Student view ──────────────────────────────────────────── */
  const studentView = (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Enrolled courses"
          value={stats.totalCourses}
          icon={BookOpen}
          tone="brand"
          progress={percentage(stats.completedCourses, stats.totalCourses)}
          progressLabel={`${stats.completedCourses} completed`}
        />
        <StatCard
          label="Lessons completed"
          value={stats.lessonsCompleted}
          icon={CheckCircle2}
          tone="success"
          hint="Keep the streak going"
        />
        <StatCard
          label="Pending applications"
          value={stats.pendingApplications}
          icon={Clock}
          tone="warning"
          hint="Awaiting a response"
        />
        <StatCard
          label="Offers accepted"
          value={stats.acceptedApplications}
          icon={BadgeCheck}
          tone="info"
          hint="Congratulations!"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Current courses"
          description="Pick up where you left off"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/courses">
                Browse
                <ArrowRight />
              </Link>
            </Button>
          }
        >
          {inProgressCourses.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={
                courses.length === 0 ? 'You are not enrolled yet' : 'All caught up!'
              }
              description={
                courses.length === 0
                  ? 'Find a course that matches where you want to go next.'
                  : 'You have completed every course you are enrolled in.'
              }
              action={
                <Button variant="brand" asChild>
                  <Link href="/dashboard/courses">
                    <Sparkles />
                    Explore courses
                  </Link>
                </Button>
              }
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="space-y-5">
              {inProgressCourses.map((course) => (
                <li key={course.id} className="group">
                  <Link href={`/dashboard/courses/${course.id}`} className="block">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                        {course.title}
                      </p>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {course.totalLessons > 0
                          ? `${course.completedLessons}/${course.totalLessons} lessons`
                          : 'No lessons yet'}
                      </span>
                    </div>
                    <Progress
                      value={course.progress}
                      variant={course.progress >= 100 ? 'success' : 'brand'}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity">
          {activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Nothing here yet"
              description="Complete a lesson and it will show up here."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ol className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      activity.type === 'completion'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                    }`}
                  >
                    {activity.type === 'completion' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      {applications.length > 0 && (
        <Panel
          title="Your applications"
          description="Every role you have applied to"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/opportunities">
                Find more
                <ArrowRight />
              </Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {applications.slice(0, 6).map((app) => (
              <li
                key={app.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {app.opportunities?.title ?? 'Opportunity'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {app.opportunities?.company_name ?? '—'}
                    {app.created_at && ` · applied ${formatRelativeTime(app.created_at)}`}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  )

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isProvider
              ? "Here's how your courses and postings are performing."
              : "Here's what's happening with your learning."}
          </p>
        </div>

        {isProvider && (
          <div className="flex flex-wrap gap-2">
            <Button variant="brand" asChild>
              <Link href="/dashboard/courses/create">
                <Plus />
                Create course
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/opportunities/create">
                <Briefcase />
                Post job
              </Link>
            </Button>
          </div>
        )}
      </div>

      {isProvider ? providerView : studentView}
    </div>
  )
}
