'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, GraduationCap, ImageIcon, LayoutGrid, SearchX, Users } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { supabase } from '@/lib/supabaseClient'
import { CourseDialog } from '@/components/course/course-dialog'
import { formatCurrency } from '@/lib/utils'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most enrolled' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [priceFilter, setPriceFilter] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchCourses = async () => {
      try {
        // Enrollment rows come back embedded so we can show a real
        // student count instead of the previous hardcoded "500 students".
        const { data, error: fetchError } = await supabase
          .from('courses')
          .select('*, users!courses_provider_id_fkey (full_name), enrollments (id)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        if (cancelled) return

        setCourses(
          (data ?? []).map((course) => ({
            ...course,
            enrolledCount: course.enrollments?.length ?? 0,
          }))
        )
      } catch (err) {
        console.error('Error fetching courses:', err)
        if (!cancelled) setError(err.message ?? 'Failed to load courses')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCourses()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = courses.filter((course) => {
      const matchesQuery =
        query.length === 0 ||
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.users?.full_name?.toLowerCase().includes(query)

      const price = Number(course.price) || 0
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'free' && price === 0) ||
        (priceFilter === 'paid' && price > 0)

      return matchesQuery && matchesPrice
    })

    const sorted = [...filtered]
    switch (sort) {
      case 'popular':
        sorted.sort((a, b) => b.enrolledCount - a.enrolledCount)
        break
      case 'price-asc':
        sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
        break
      case 'price-desc':
        sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
        break
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return sorted
  }, [courses, searchQuery, priceFilter, sort])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Available courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? 'Loading the catalogue…'
              : `${courses.length} published course${courses.length === 1 ? '' : 's'} to explore`}
          </p>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search courses, topics, instructors…"
          aria-label="Search courses"
          wrapperClassName="w-full sm:max-w-xs"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Filter by price"
          className="inline-flex rounded-lg border bg-card p-1 shadow-soft"
        >
          {[
            { value: 'all', label: 'All' },
            { value: 'free', label: 'Free' },
            { value: 'paid', label: 'Paid' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={priceFilter === option.value}
              onClick={() => setPriceFilter(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                priceFilter === option.value
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="course-sort" className="sr-only">
            Sort courses
          </label>
          <select
            id="course-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-9 rounded-lg border bg-card px-3 text-sm shadow-soft transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || priceFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setPriceFilter('all')
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={BookOpen}
          title="We couldn't load the courses"
          description={error}
          action={
            <Button variant="brand" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses published yet"
          description="Once providers publish courses, they will appear here."
        />
      ) : visibleCourses.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matches found"
          description={`Nothing matched "${searchQuery}". Try a different search or clear your filters.`}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setPriceFilter('all')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="stagger-children grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => {
            const price = Number(course.price) || 0
            return (
              // Wrapper carries the stagger animation; a `forwards` animation on
              // the Card itself would override its hover-lift transform.
              <div key={course.id} className="flex">
              <Card interactive className="flex w-full flex-col overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedCourse(course)}
                  className="flex flex-1 flex-col text-left outline-none"
                  aria-label={`View details for ${course.title}`}
                >
                  {/* Media */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {course.thumbnail_url ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${course.thumbnail_url}`}
                        alt={course.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-500/15 dark:to-brand-500/5">
                        <ImageIcon className="h-8 w-8 text-brand-500/60" aria-hidden="true" />
                      </div>
                    )}

                    {/* Scrim that deepens on hover for legibility */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <div className="absolute right-3 top-3">
                      <Badge variant={price === 0 ? 'success' : 'default'}>
                        {price === 0 ? 'Free' : formatCurrency(price)}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      by {course.users?.full_name ?? 'Unknown provider'}
                    </p>
                    {course.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        {course.enrolledCount} enrolled
                      </span>
                      <span className="text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        View details →
                      </span>
                    </div>
                  </div>
                </button>
              </Card>
              </div>
            )
          })}
        </div>
      )}

      <CourseDialog
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  )
}
