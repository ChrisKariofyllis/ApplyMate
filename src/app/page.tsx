import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: "👤",
    title: "Build your profile",
    description:
      "Capture confirmed experience, education, and skills so every match starts from real facts.",
    href: "/profile",
    cta: "Open Profile",
  },
  {
    icon: "🎯",
    title: "Analyze job fit",
    description:
      "Compare a job against your profile, see strengths and gaps, and answer clarifying questions.",
    href: "/jobs",
    cta: "Browse Jobs",
  },
  {
    icon: "📄",
    title: "Generate a tailored resume",
    description:
      "Create a resume draft from a match using only allowed, user-confirmed facts.",
    href: "/jobs",
    cta: "Go to Jobs",
  },
] as const;

const primaryCtaClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:scale-[1.02] hover:from-cyan-400 hover:to-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500";

const secondaryCtaClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-500/70 bg-transparent px-6 py-2.5 text-sm font-semibold text-cyan-400 transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500";

export default function Home() {
  return (
    <main className="bg-[#0a0a0a]">
      <section className="relative overflow-hidden border-b border-[#2a2a2a]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.12),_transparent_55%)]"
        />
        <div className="app-container relative py-16 sm:py-24">
          <p className="text-sm font-medium tracking-wide text-cyan-400">
            Career matching workspace
          </p>
          <h1 className="mt-3 max-w-2xl text-balance text-4xl font-bold tracking-tight text-cyan-400 sm:text-5xl">
            ApplyMate
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Match jobs to your confirmed career facts, close information gaps,
            and generate tailored resume drafts — without inventing experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/profile" className={primaryCtaClass}>
              Get started with Profile
            </Link>
            <Link href="/jobs" className={secondaryCtaClass}>
              View Jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="app-container py-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-50">
            How ApplyMate helps
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
            A focused workflow for profile, match analysis, and resume drafting.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="flex h-full flex-col">
              <span aria-hidden="true" className="text-2xl">
                {feature.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-50">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
              <div className="mt-5">
                <Link
                  href={feature.href}
                  className={cn(
                    "text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                  )}
                >
                  {feature.cta} →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
