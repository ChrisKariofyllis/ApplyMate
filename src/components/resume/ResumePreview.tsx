import type { GeneratedResume } from "@/types";
import { Card } from "@/components/ui/Card";

type ResumePreviewProps = {
  resume: GeneratedResume;
};

export function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <article className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="space-y-6">
          {resume.sections.length === 0 ? (
            <p className="text-sm text-slate-500">No resume sections available.</p>
          ) : (
            resume.sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-900">
                  {section.title}
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {section.content}
                </p>
              </section>
            ))
          )}
        </div>
      </div>

      {resume.factsUsed.length > 0 ? (
        <Card title="Facts used">
          <ul className="flex flex-wrap gap-2">
            {resume.factsUsed.map((fact) => (
              <li
                key={fact}
                className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs text-cyan-300"
              >
                {fact}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </article>
  );
}
