"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { MatchResult, Question } from "@/types";
import { MatchReport } from "@/components/match/MatchReport";
import { QuestionsPanel } from "@/components/match/QuestionsPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type JobRequirementItem = {
  skill: string;
  level: string;
  yearsRequired?: number | null;
};

type DbMatch = {
  id: string;
  jobId: string;
  profileId: string;
  overallScore: number | null;
  strengthsJson: string | null;
  gapsJson: string | null;
  questionsJson: string | null;
  recommendation: string | null;
  createdAt: string;
};

type JobDetails = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  status: string;
  descriptionRaw: string;
  requirementsJson: string | null;
  niceToHaveJson: string | null;
  matches: DbMatch[];
};

const RECOMMENDATIONS = [
  "strong_match",
  "good_match",
  "possible",
  "long_shot",
] as const;

type Recommendation = (typeof RECOMMENDATIONS)[number];

function safeParseArray(value: string | null | undefined): unknown[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseStringArray(value: string | null | undefined): string[] {
  return safeParseArray(value).filter(
    (item): item is string => typeof item === "string"
  );
}

function parseRequirements(
  value: string | null | undefined
): JobRequirementItem[] {
  const items: JobRequirementItem[] = [];

  for (const item of safeParseArray(value)) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const record = item as Record<string, unknown>;
    if (typeof record.skill !== "string") {
      continue;
    }
    items.push({
      skill: record.skill,
      level: typeof record.level === "string" ? record.level : "required",
      yearsRequired:
        typeof record.yearsRequired === "number"
          ? record.yearsRequired
          : record.yearsRequired === null
            ? null
            : undefined,
    });
  }

  return items;
}

function parseQuestions(value: string | null | undefined): Question[] {
  const items: Question[] = [];

  for (const item of safeParseArray(value)) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const record = item as Record<string, unknown>;
    if (
      typeof record.text !== "string" ||
      typeof record.context !== "string" ||
      typeof record.factKey !== "string"
    ) {
      continue;
    }
    items.push({
      text: record.text,
      context: record.context,
      factKey: record.factKey,
    });
  }

  return items;
}

function parseRecommendation(
  value: string | null | undefined
): Recommendation {
  if (
    value &&
    (RECOMMENDATIONS as readonly string[]).includes(value)
  ) {
    return value as Recommendation;
  }
  return "possible";
}

function buildMatchResultFromDb(match: DbMatch): MatchResult {
  return {
    overallScore:
      typeof match.overallScore === "number" ? match.overallScore : 0,
    strengths: parseStringArray(match.strengthsJson),
    gaps: parseStringArray(match.gapsJson),
    questions: parseQuestions(match.questionsJson),
    recommendation: parseRecommendation(match.recommendation),
  };
}

function pickLatestMatch(matches: DbMatch[]): DbMatch | null {
  if (matches.length === 0) {
    return null;
  }

  return [...matches].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  })[0];
}

function mapJob(raw: unknown): JobDetails | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.title !== "string") {
    return null;
  }

  const matchesRaw = Array.isArray(record.matches) ? record.matches : [];
  const matches: DbMatch[] = matchesRaw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const match = item as Record<string, unknown>;
      if (typeof match.id !== "string") {
        return null;
      }
      return {
        id: match.id,
        jobId: typeof match.jobId === "string" ? match.jobId : "",
        profileId: typeof match.profileId === "string" ? match.profileId : "",
        overallScore:
          typeof match.overallScore === "number" ? match.overallScore : null,
        strengthsJson:
          typeof match.strengthsJson === "string" || match.strengthsJson === null
            ? (match.strengthsJson as string | null)
            : null,
        gapsJson:
          typeof match.gapsJson === "string" || match.gapsJson === null
            ? (match.gapsJson as string | null)
            : null,
        questionsJson:
          typeof match.questionsJson === "string" ||
          match.questionsJson === null
            ? (match.questionsJson as string | null)
            : null,
        recommendation:
          typeof match.recommendation === "string" ||
          match.recommendation === null
            ? (match.recommendation as string | null)
            : null,
        createdAt:
          typeof match.createdAt === "string"
            ? match.createdAt
            : String(match.createdAt ?? ""),
      };
    })
    .filter((item): item is DbMatch => item !== null);

  return {
    id: record.id,
    title: record.title,
    company:
      typeof record.company === "string" || record.company === null
        ? (record.company as string | null)
        : null,
    location:
      typeof record.location === "string" || record.location === null
        ? (record.location as string | null)
        : null,
    salary:
      typeof record.salary === "string" || record.salary === null
        ? (record.salary as string | null)
        : null,
    status: typeof record.status === "string" ? record.status : "new",
    descriptionRaw:
      typeof record.descriptionRaw === "string" ? record.descriptionRaw : "",
    requirementsJson:
      typeof record.requirementsJson === "string" ||
      record.requirementsJson === null
        ? (record.requirementsJson as string | null)
        : null,
    niceToHaveJson:
      typeof record.niceToHaveJson === "string" ||
      record.niceToHaveJson === null
        ? (record.niceToHaveJson as string | null)
        : null,
    matches,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) {
      return data.error;
    }
  } catch {
    // ignore
  }
  return "Something went wrong. Please try again.";
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params.id === "string" ? params.id : "";

  const [job, setJob] = useState<JobDetails | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [answeredAnswers, setAnsweredAnswers] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requirements = useMemo(
    () => parseRequirements(job?.requirementsJson),
    [job?.requirementsJson]
  );
  const niceToHave = useMemo(
    () => parseStringArray(job?.niceToHaveJson),
    [job?.niceToHaveJson]
  );

  const loadJob = useCallback(async () => {
    if (!jobId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await fetch(`/api/jobs/${jobId}`);

      if (response.status === 404) {
        setNotFound(true);
        setJob(null);
        setMatchId(null);
        setMatchResult(null);
        setAnsweredAnswers({});
        return;
      }

      if (!response.ok) {
        setError(await readErrorMessage(response));
        setJob(null);
        return;
      }

      const mapped = mapJob(await response.json());
      if (!mapped) {
        setError("Unexpected job response.");
        setJob(null);
        return;
      }

      setJob(mapped);

      const latest = pickLatestMatch(mapped.matches);
      if (latest) {
        setMatchId(latest.id);
        setMatchResult(buildMatchResultFromDb(latest));
        setAnsweredAnswers({});
      } else {
        setMatchId(null);
        setMatchResult(null);
        setAnsweredAnswers({});
      }
    } catch {
      setError("Unable to load job details.");
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void loadJob();
  }, [loadJob]);

  useEffect(() => {
    if (!matchResult || matchResult.questions.length === 0) {
      return;
    }

    const questionKeys = new Set(
      matchResult.questions.map((question) => question.factKey)
    );
    let cancelled = false;

    async function loadAnsweredFacts() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          facts?: Array<{
            key?: string;
            value?: string;
            confidence?: string;
            allowedInCv?: boolean;
          }>;
        };

        if (!Array.isArray(data.facts) || cancelled) {
          return;
        }

        const next: Record<string, string> = {};
        for (const fact of data.facts) {
          if (
            typeof fact.key !== "string" ||
            typeof fact.value !== "string" ||
            !questionKeys.has(fact.key) ||
            fact.confidence !== "user_confirmed" ||
            fact.allowedInCv !== true
          ) {
            continue;
          }
          next[fact.key] = fact.value;
        }

        if (!cancelled) {
          setAnsweredAnswers(next);
        }
      } catch {
        // Keep local answered state if profile facts cannot be loaded.
      }
    }

    void loadAnsweredFacts();

    return () => {
      cancelled = true;
    };
  }, [matchId, matchResult]);

  async function handleAnalyzeMatch() {
    if (!jobId || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }

      const data = (await response.json()) as {
        match?: { id?: string };
        result?: MatchResult;
      };

      if (!data.match?.id || !data.result) {
        setError("Unexpected match response.");
        return;
      }

      setMatchId(data.match.id);
      setMatchResult({
        overallScore: data.result.overallScore,
        strengths: Array.isArray(data.result.strengths)
          ? data.result.strengths
          : [],
        gaps: Array.isArray(data.result.gaps) ? data.result.gaps : [],
        questions: Array.isArray(data.result.questions)
          ? data.result.questions
          : [],
        recommendation: parseRecommendation(data.result.recommendation),
      });
      setAnsweredAnswers({});
      setJob((current) =>
        current ? { ...current, status: "matched" } : current
      );
      setSuccessMessage("Match analysis completed.");
    } catch {
      setError("Unable to analyze match.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleAnswer(
    index: number,
    answer: string,
    factKey: string
  ) {
    if (!matchId) {
      const message = "Match not found.";
      setError(message);
      throw new Error(message);
    }

    setIsAnswering(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/match/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          questionIndex: index,
          answer,
          factKey,
        }),
      });

      if (!response.ok) {
        const message = await readErrorMessage(response);
        setError(message);
        throw new Error(message);
      }

      setAnsweredAnswers((current) => ({
        ...current,
        [factKey]: answer,
      }));
      setSuccessMessage("Answer saved");
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unable to save answer.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsAnswering(false);
    }
  }

  async function handleGenerateResume() {
    if (!matchId || isGeneratingResume) {
      return;
    }

    setIsGeneratingResume(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }

      const data = (await response.json()) as {
        resume?: { id?: string };
      };

      if (!data.resume?.id) {
        setError("Unexpected resume response.");
        return;
      }

      router.push(`/resumes/${data.resume.id}`);
    } catch {
      setError("Unable to generate resume.");
    } finally {
      setIsGeneratingResume(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <div className="mx-auto flex max-w-5xl items-center gap-3 text-slate-300">
          <LoadingSpinner className="h-5 w-5" />
          <p>Loading job details...</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-5xl space-y-4">
          <h1 className="text-2xl font-bold text-cyan-400">Job not found</h1>
          <Link href="/jobs" className="page-link">
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-5xl space-y-4">
          <h1 className="text-2xl font-bold text-cyan-400">Job details</h1>
          {error ? (
            <p role="alert" className="alert-error">
              {error}
            </p>
          ) : (
            <p className="text-sm text-slate-400">Unable to display this job.</p>
          )}
          <Link href="/jobs" className="page-link">
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="space-y-3">
          <Link href="/jobs" className="page-link">
            Back to Jobs
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-cyan-400">
              {job.title}
            </h1>
            <Badge status={job.status} />
          </div>
          <div className="space-y-1 text-sm text-slate-400">
            {job.company ? (
              <p className="font-medium text-slate-300">{job.company}</p>
            ) : null}
            {job.location ? <p>{job.location}</p> : null}
            {job.salary ? (
              <p className="font-mono text-xs text-slate-500">{job.salary}</p>
            ) : null}
          </div>
        </Card>

        {error ? (
          <p role="alert" className="alert-error">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p role="status" className="alert-success">
            {successMessage}
          </p>
        ) : null}

        <Card title="Job description">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {job.descriptionRaw}
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Requirements">
            {requirements.length === 0 ? (
              <p className="text-sm text-slate-500">No requirements available.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {requirements.map((item) => (
                  <li
                    key={`${item.skill}-${item.level}`}
                    className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300"
                  >
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-cyan-500/80">
                      {" "}
                      · {item.level.replaceAll("_", " ")}
                      {typeof item.yearsRequired === "number"
                        ? ` · ${item.yearsRequired}y`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Nice to have">
            {niceToHave.length === 0 ? (
              <p className="text-sm text-slate-500">No nice-to-have items.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {niceToHave.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-slate-600 bg-[#111111] px-3 py-1.5 text-sm text-slate-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Match analysis">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Compare this job with your career profile using only confirmed
              facts.
            </p>
            <Button
              type="button"
              variant="secondary"
              isLoading={isAnalyzing}
              disabled={isAnalyzing || isGeneratingResume || isAnswering}
              onClick={() => {
                void handleAnalyzeMatch();
              }}
            >
              Analyze Match
            </Button>
          </div>
        </Card>

        {matchResult ? (
          <div className="space-y-6">
            <MatchReport match={matchResult} />

            {matchId ? (
              <QuestionsPanel
                key={matchId}
                matchId={matchId}
                questions={matchResult.questions}
                onAnswer={handleAnswer}
                isLoading={isAnswering}
                initialAnswers={answeredAnswers}
              />
            ) : null}

            {matchId ? (
              <Card title="Resume">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-400">
                    Generate a tailored resume from this match using only
                    allowed facts.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    isLoading={isGeneratingResume}
                    disabled={
                      isGeneratingResume || isAnalyzing || isAnswering
                    }
                    onClick={() => {
                      void handleGenerateResume();
                    }}
                  >
                    Generate Tailored Resume
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
