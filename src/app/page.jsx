import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  GraduationCap,
  LineChart,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/ui/reveal'
import { AnimatedNumber } from '@/components/ui/stat-card'
import { HeroSpotlight } from '@/components/marketing/hero-spotlight'

const stats = [
  { label: 'Active learners', value: 12400, suffix: '+' },
  { label: 'Expert-led courses', value: 320, suffix: '+' },
  { label: 'Hiring partners', value: 180, suffix: '+' },
  { label: 'Placement rate', value: 87, suffix: '%' },
]

const features = [
  {
    icon: BookOpen,
    title: 'Learn',
    description:
      'Structured, expert-led courses with lesson-level progress tracking so you always know exactly where you left off.',
    points: ['Self-paced modules', 'Verified instructors', 'Lifetime access'],
    tone: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Code2,
    title: 'Practice',
    description:
      'Apply what you learn on real, reviewed projects that turn passive watching into a portfolio worth showing.',
    points: ['Hands-on projects', 'Mentor feedback', 'Shareable portfolio'],
    tone: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Briefcase,
    title: 'Grow',
    description:
      'Get matched with internships and roles from partner companies, and track every application in one place.',
    points: ['Curated openings', 'One-click apply', 'Status tracking'],
    tone: 'from-emerald-500 to-teal-500',
  },
]

const steps = [
  {
    icon: GraduationCap,
    title: 'Create your profile',
    description: 'Tell us your goals and current skills. It takes about two minutes.',
  },
  {
    icon: Rocket,
    title: 'Follow a track',
    description: 'Work through courses built around the role you actually want.',
  },
  {
    icon: Award,
    title: 'Get hired',
    description: 'Apply to matched openings with your verified progress attached.',
  },
]

const tracks = [
  'Frontend Engineering',
  'Data Analytics',
  'Product Design',
  'Backend & APIs',
  'Cloud & DevOps',
  'Machine Learning',
  'Mobile Development',
  'Cybersecurity',
]

const trustPoints = [
  { icon: ShieldCheck, label: 'Verified providers' },
  { icon: LineChart, label: 'Progress you can prove' },
  { icon: Users, label: 'Mentor-backed learning' },
]

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        {/* Layered ambient background */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-background to-background dark:from-brand-950/30" />
          <div className="absolute inset-0 bg-grid-dots opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="absolute -left-24 top-[-10%] h-[26rem] w-[26rem] animate-float rounded-full bg-brand-400/25 blur-3xl" />
          <div className="absolute -right-24 top-[10%] h-[22rem] w-[22rem] animate-float-slow rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-[-20%] left-1/3 h-[20rem] w-[20rem] animate-float rounded-full bg-fuchsia-400/15 blur-3xl" />
        </div>

        <HeroSpotlight />

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Link
                href="/dashboard/courses"
                className="group inline-flex items-center gap-2 rounded-full border bg-card/80 py-1.5 pl-1.5 pr-4 text-sm shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Badge variant="brand" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  New
                </Badge>
                <span className="text-muted-foreground">
                  320+ courses now open for enrollment
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Learn the skills.
                <br />
                <span className="text-gradient-animated">Land the role.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
                SRS brings courses, real projects, and hiring partners into one place — so
                the path from learning something new to getting paid for it is a straight
                line.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="xl" variant="brand" className="group w-full sm:w-auto">
                  <Link href="/auth/register">
                    Get started free
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="w-full sm:w-auto">
                  <Link href="/dashboard/courses">
                    <Search />
                    Browse courses
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {trustPoints.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Stats strip */}
          <Reveal delay={400} className="mt-20">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border/60 shadow-card md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group bg-card px-6 py-8 text-center transition-colors duration-300 hover:bg-accent/40"
                >
                  <dd className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </dd>
                  <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="brand">How it works</Badge>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps, one platform
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Most platforms stop at the video. SRS follows through to the offer letter.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 100}>
              <article className="group relative h-full overflow-hidden rounded-2xl border bg-card p-7 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lift">
                {/* Wash that fades in on hover */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.tone} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.07]`}
                />

                <div className="relative">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.tone} text-white shadow-soft transition-transform duration-300 ease-out-back group-hover:scale-110 group-hover:-rotate-6`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>

                  <ul className="mt-5 space-y-2">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Steps ────────────────────────────────────────────── */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal direction="right">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                From first lesson to first offer
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">
                Your progress is tracked, verified, and attached to every application —
                so employers see what you can do, not just what you claim.
              </p>
              <Button asChild variant="subtle" size="lg" className="group mt-8">
                <Link href="/auth/register">
                  Start your track
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </Reveal>

            <ol className="relative space-y-4">
              {/* Connecting spine */}
              <span
                aria-hidden="true"
                className="absolute left-[27px] top-6 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-primary/40 via-border to-transparent sm:block"
              />
              {steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 120} as="li">
                  <div className="group relative flex gap-5 rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift">
                    <div className="relative shrink-0">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-xl bg-primary/30 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                      />
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tabular-nums text-primary">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="mt-0.5 font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── Tracks ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="brand">Popular tracks</Badge>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Pick a direction
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {tracks.map((track) => (
              <Link
                key={track}
                href="/dashboard/courses"
                className="group inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm font-medium shadow-soft transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-primary/40 hover:bg-accent hover:text-accent-foreground hover:shadow-lift"
              >
                {track}
                <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-24">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl border bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-16 text-center shadow-lift md:px-16 md:py-20">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-grid-dots opacity-20" />
              <div className="absolute -right-16 -top-16 h-64 w-64 animate-float rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-10 h-64 w-64 animate-float-slow rounded-full bg-white/10 blur-2xl" />
            </div>

            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start building your career?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-white/80">
              Join thousands of learners already on a track. Free to start, no card
              required.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="xl"
                className="group w-full bg-white text-brand-700 shadow-soft hover:bg-white/90 sm:w-auto"
              >
                <Link href="/auth/register">
                  Create free account
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="w-full border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white sm:w-auto"
              >
                <Link href="/auth/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  )
}
