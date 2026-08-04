import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Build your profile",
    description:
      "Capture confirmed experience, education, and skills so every match starts from real facts.",
    href: "/profile",
    cta: "Open Profile",
  },
  {
    title: "Analyze job fit",
    description:
      "Compare a job against your profile, see strengths and gaps, and answer clarifying questions.",
    href: "/jobs",
    cta: "Browse Jobs",
  },
  {
    title: "Generate a tailored resume",
    description:
      "Create a resume draft from a match using only allowed, user-confirmed facts.",
    href: "/jobs",
    cta: "Go to Jobs",
  },
] as const;

const primaryCtaClass =
  "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-800";

const secondaryCtaClass =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-slate-100";

export default function Home() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="app-container py-14 sm:py-20">
          <p className="text-sm font-medium tracking-wide text-blue-600">
            Career matching workspace
          </p>
          <h1 className="mt-3 max-w-2xl text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            ApplyMate
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
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
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            How ApplyMate helps
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            A focused workflow for profile, match analysis, and resume drafting.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="flex h-full flex-col">
              <h3 className="text-base font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
              <div className="mt-5">
                <Link
                  href={feature.href}
                  className={cn(
                    "text-sm font-medium text-blue-600 transition-colors hover:text-blue-700",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
