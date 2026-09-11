'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Banknote,
  Briefcase,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  MapPin,
  SearchX,
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { supabase } from '@/lib/supabaseClient'
import { formatRelativeTime } from '@/lib/utils'

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'job', label: 'Jobs' },
  { value: 'internship', label: 'Internships' },
]

function OpportunitySkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton shape="text" className="h-5 w-2/3" />
          <Skeleton shape="text" className="w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-5">
        <SkeletonText lines={2} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Skeleton shape="text" className="w-24" />
        <Skeleton shape="text" className="w-24" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <Skeleton shape="text" className="w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [type, setType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applyingId, setApplyingId] = useState(null)
  const router = useRouter()

  const fetchOpportunities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('opportunities')
        .select('*, users!opportunities_provider_id_fkey (full_name, company_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (type !== 'all') {
        query = query.eq('type', type)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setOpportunities(data ?? [])
    } catch (err) {
      console.error('Error fetching opportunities:', err)
      setError(err.message ?? 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  // Track which roles the viewer already applied to, so the button can
  // reflect that instead of failing on the unique constraint.
  useEffect(() => {
    let cancelled = false

    const loadApplications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('applications')
        .select('opportunity_id')
        .eq('user_id', user.id)

      if (!cancelled && data) {
        setAppliedIds(new Set(data.map((row) => row.opportunity_id)))
      }
    }

    loadApplications()
    return () => {
      cancelled = true
    }
  }, [])

  const handleApply = async (opportunityId) => {
    setApplyingId(opportunityId)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to apply')
        router.push('/auth/login')
        return
      }

      const { error: insertError } = await supabase
        .from('applications')
        .insert([{ opportunity_id: opportunityId, user_id: user.id }])

      if (insertError) {
        // 23505 = unique_violation: the user already applied.
        if (insertError.code === '23505') {
          setAppliedIds((prev) => new Set(prev).add(opportunityId))
          toast.info('You have already applied to this role')
          return
        }
        throw insertError
      }

      setAppliedIds((prev) => new Set(prev).add(opportunityId))
      toast.success('Application submitted', {
        description: 'You can track its status from your dashboard.',
      })
    } catch (err) {
      console.error('Error applying:', err)
      toast.error('Could not submit your application', {
        description: err.message ?? 'Please try again in a moment.',
      })
    } finally {
      setApplyingId(null)
    }
  }

  const filteredOpportunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return opportunities

    return opportunities.filter((opp) =>
      [opp.title, opp.company_name, opp.location, opp.users?.company_name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    )
  }, [opportunities, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Jobs &amp; internships
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? 'Finding open roles…'
              : `${opportunities.length} open role${opportunities.length === 1 ? '' : 's'} right now`}
          </p>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search roles, companies, locations…"
          aria-label="Search opportunities"
          wrapperClassName="w-full sm:max-w-xs"
        />
      </div>

      {/* Type filter */}
      <div
        role="group"
        aria-label="Filter by opportunity type"
        className="inline-flex rounded-lg border bg-card p-1 shadow-soft"
      >
        {typeFilters.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={type === option.value}
            onClick={() => setType(option.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              type === option.value
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <OpportunitySkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Briefcase}
          title="We couldn't load opportunities"
          description={error}
          action={
            <Button variant="brand" onClick={fetchOpportunities}>
              Try again
            </Button>
          }
        />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title={type === 'all' ? 'No open roles yet' : `No ${type}s available`}
          description="New opportunities are posted regularly — check back soon."
          action={
            type !== 'all' ? (
              <Button variant="outline" onClick={() => setType('all')}>
                View all opportunities
              </Button>
            ) : null
          }
        />
      ) : filteredOpportunities.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matches found"
          description={`Nothing matched "${searchQuery}".`}
          action={
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="stagger-children grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredOpportunities.map((opp) => {
            const hasApplied = appliedIds.has(opp.id)
            const company = opp.company_name || opp.users?.company_name || 'Company'

            return (
              // Wrapper holds the stagger animation so the Card keeps its hover lift.
              <div key={opp.id} className="flex">
                <Card interactive className="flex w-full flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">
                        {opp.title}
                      </h3>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{company}</p>
                    </div>
                    <Badge variant={opp.type === 'job' ? 'default' : 'info'} className="capitalize">
                      {opp.type}
                    </Badge>
                  </div>

                  {opp.description && (
                    <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                      {opp.description}
                    </p>
                  )}

                  {Array.isArray(opp.requirements) && opp.requirements.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {opp.requirements.slice(0, 4).map((requirement) => (
                        <Badge key={requirement} variant="muted">
                          {requirement}
                        </Badge>
                      ))}
                      {opp.requirements.length > 4 && (
                        <Badge variant="muted">+{opp.requirements.length - 4} more</Badge>
                      )}
                    </div>
                  )}

                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Location</dt>
                        <dd className="truncate font-medium">{opp.location || 'Not specified'}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Banknote
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Salary</dt>
                        <dd className="truncate font-medium">
                          {opp.salary_range || 'Not disclosed'}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      Posted {formatRelativeTime(opp.created_at)}
                    </span>

                    {hasApplied ? (
                      <Button variant="subtle" disabled className="pointer-events-none">
                        <Check />
                        Applied
                      </Button>
                    ) : (
                      <Button
                        variant="brand"
                        loading={applyingId === opp.id}
                        loadingText="Applying…"
                        onClick={() => handleApply(opp.id)}
                      >
                        Apply now
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
