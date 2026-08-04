"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { JobInput } from "@/components/jobs/JobInput";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type JobListItem = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  status: string;
  descriptionRaw: string;
  createdAt: string;
  summary?: string | null;
};

function nullToEmpty(value: string | null | undefined): string {
  return value?.trim() ? value : "";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function truncateText(value: string, maxLength = 180): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function mapJob(raw: unknown): JobListItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.title !== "string") {
    return null;
  }

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
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : String(record.createdAt ?? ""),
    summary:
      typeof record.summary === "string"
        ? record.summary
        : record.summary === null
          ? null
          : undefined,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) {
      return data.error;
    }
  } catch {
    // ignore parse errors
  }
  return "Something went wrong. Please try again.";
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        setLoadError(await readErrorMessage(response));
        setJobs([]);
        return;
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data)) {
        setLoadError("Unexpected response while loading jobs.");
        setJobs([]);
        return;
      }

      const mapped = data
        .map((item) => mapJob(item))
        .filter((item): item is JobListItem => item !== null);

      setJobs(mapped);
    } catch {
      setLoadError("Unable to load jobs.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  async function handleAnalyze(data: { url?: string; text?: string }) {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        setAnalyzeError(await readErrorMessage(response));
        return;
      }

      const payload = (await response.json()) as {
        job?: unknown;
        summary?: string;
      };

      const mapped = mapJob(payload.job);
      if (mapped) {
        const withSummary: JobListItem = {
          ...mapped,
          summary:
            typeof payload.summary === "string" ? payload.summary : mapped.summary,
        };
        setJobs((current) => [
          withSummary,
          ...current.filter((job) => job.id !== withSummary.id),
        ]);
      } else {
        await loadJobs();
      }

      setSuccessMessage("Job analyzed successfully.");
      setInputKey((current) => current + 1);
    } catch {
      setAnalyzeError("Unable to analyze job.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[900px] space-y-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Jobs
            </h1>
            <Link
              href="/"
              className="text-sm text-blue-700 underline underline-offset-4"
            >
              Back to home
            </Link>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Paste a job URL or description to analyze requirements, then open a
            job to run matching against your career profile.
          </p>
        </header>

        <Card title="Analyze a job">
          <JobInput
            key={inputKey}
            onSubmit={handleAnalyze}
            isLoading={isAnalyzing}
          />
        </Card>

        {analyzeError ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {analyzeError}
          </p>
        ) : null}

        {successMessage ? (
          <p
            role="status"
            className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            {successMessage}
          </p>
        ) : null}

        <section className="space-y-4" aria-live="polite">
          <h2 className="text-xl font-semibold text-zinc-900">Saved jobs</h2>

          {isLoading ? (
            <div className="flex items-center gap-3 text-zinc-700">
              <LoadingSpinner className="h-5 w-5" />
              <p>Loading jobs...</p>
            </div>
          ) : null}

          {!isLoading && loadError ? (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {loadError}
            </p>
          ) : null}

          {!isLoading && !loadError && jobs.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-600">
                No jobs yet. Analyze a job posting to get started.
              </p>
            </Card>
          ) : null}

          {!isLoading && !loadError
            ? jobs.map((job) => {
                const company = nullToEmpty(job.company);
                const location = nullToEmpty(job.location);
                const salary = nullToEmpty(job.salary);
                const summary =
                  typeof job.summary === "string" && job.summary.trim()
                    ? job.summary.trim()
                    : null;
                const preview = summary ?? truncateText(job.descriptionRaw);

                return (
                  <Card key={job.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-zinc-900">
                            {job.title}
                          </h3>
                          <Badge status={job.status} />
                        </div>

                        <div className="space-y-1 text-sm text-zinc-600">
                          {company ? <p>{company}</p> : null}
                          {location ? <p>{location}</p> : null}
                          {salary ? <p>{salary}</p> : null}
                          {job.createdAt ? (
                            <p>Added {formatDate(job.createdAt)}</p>
                          ) : null}
                        </div>

                        {preview ? (
                          <p className="text-sm leading-relaxed text-zinc-700">
                            {preview}
                          </p>
                        ) : null}
                      </div>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        View Match
                      </Link>
                    </div>
                  </Card>
                );
              })
            : null}
        </section>
      </div>
    </main>
  );
}
