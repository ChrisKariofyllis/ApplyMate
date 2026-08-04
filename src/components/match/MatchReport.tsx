import type { MatchResult } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { Card } from "@/components/ui/Card";

type MatchReportProps = {
  match: MatchResult;
};

function formatRecommendation(value: MatchResult["recommendation"]): string {
  return value.replaceAll("_", " ");
}

export function MatchReport({ match }: MatchReportProps) {
  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-900">Match report</h2>
          <Badge status={formatRecommendation(match.recommendation)} />
        </div>
        <ScoreCircle score={match.overallScore} size="md" />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Strengths">
          {match.strengths.length === 0 ? (
            <p className="text-sm text-zinc-500">No strengths listed.</p>
          ) : (
            <ul className="space-y-2">
              {match.strengths.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-zinc-800"
                >
                  <span aria-hidden="true" className="text-emerald-600">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Gaps">
          {match.gaps.length === 0 ? (
            <p className="text-sm text-zinc-500">No gaps listed.</p>
          ) : (
            <ul className="space-y-2">
              {match.gaps.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 rounded-md bg-amber-50 px-2 py-1.5 text-sm text-amber-900"
                >
                  <span aria-hidden="true">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Clarification questions">
        {match.questions.length === 0 ? (
          <p className="text-sm text-zinc-500">No questions needed.</p>
        ) : (
          <ol className="list-decimal space-y-3 pl-5">
            {match.questions.map((question) => (
              <li key={question.factKey} className="text-sm text-zinc-800">
                <p className="font-medium">{question.text}</p>
                <p className="mt-1 text-zinc-600">{question.context}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
