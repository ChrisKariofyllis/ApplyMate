import type { GeneratedResume } from "@/types";
import { Card } from "@/components/ui/Card";

type ResumePreviewProps = {
  resume: GeneratedResume;
};

export function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <article className="space-y-4">
      <Card className="border-zinc-300 shadow-none">
        <div className="space-y-6">
          {resume.sections.length === 0 ? (
            <p className="text-sm text-zinc-500">No resume sections available.</p>
          ) : (
            resume.sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="border-b border-zinc-300 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-900">
                  {section.title}
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">
                  {section.content}
                </p>
              </section>
            ))
          )}
        </div>
      </Card>

      {resume.factsUsed.length > 0 ? (
        <Card title="Facts used">
          <ul className="flex flex-wrap gap-2">
            {resume.factsUsed.map((fact) => (
              <li
                key={fact}
                className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
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
