"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { GeneratedResume } from "@/types";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type ResumePayload = {
  resume: {
    id: string;
    jobId: string;
    status: string;
    profile?: {
      fullName?: string | null;
    } | null;
    job?: {
      title?: string | null;
      company?: string | null;
    } | null;
  };
  generatedResume: GeneratedResume;
};

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

export default function ResumePage() {
  const params = useParams();
  const resumeId = typeof params.id === "string" ? params.id : "";

  const [data, setData] = useState<ResumePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadResume = useCallback(async () => {
    if (!resumeId) {
      setError("Resume not found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/resume/${resumeId}`);

      if (!response.ok) {
        setError(await readErrorMessage(response));
        setData(null);
        return;
      }

      const payload = (await response.json()) as ResumePayload;

      if (
        !payload.resume ||
        !payload.generatedResume ||
        !Array.isArray(payload.generatedResume.sections)
      ) {
        setError("Unexpected resume response.");
        setData(null);
        return;
      }

      setData({
        resume: payload.resume,
        generatedResume: {
          sections: payload.generatedResume.sections,
          factsUsed: Array.isArray(payload.generatedResume.factsUsed)
            ? payload.generatedResume.factsUsed
            : [],
        },
      });
    } catch {
      setError("Unable to load resume.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    void loadResume();
  }, [loadResume]);

  async function handleDownloadHtml() {
    if (!resumeId || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "applymate-resume.html";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setData((current) =>
        current
          ? {
              ...current,
              resume: { ...current.resume, status: "exported" },
            }
          : current
      );
      setSuccessMessage("Resume HTML downloaded.");
    } catch {
      setError("Unable to download resume.");
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto flex max-w-[900px] items-center gap-3 text-zinc-700">
          <LoadingSpinner className="h-5 w-5" />
          <p>Loading resume...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-[900px] space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900">Resume</h1>
          {error ? (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          ) : (
            <p className="text-sm text-zinc-600">Resume not available.</p>
          )}
          <Link
            href="/jobs"
            className="text-sm text-blue-700 underline underline-offset-4"
          >
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  const profileName = data.resume.profile?.fullName?.trim() || "Career profile";
  const jobTitle = data.resume.job?.title?.trim() || "Job";
  const company = data.resume.job?.company?.trim() || null;
  const jobId = data.resume.jobId;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[900px] space-y-6">
        <header className="space-y-3">
          <Link
            href={`/jobs/${jobId}`}
            className="text-sm text-blue-700 underline underline-offset-4"
          >
            Back to Job
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Tailored Resume
            </h1>
            <Badge status={data.resume.status} />
          </div>
          <div className="space-y-1 text-sm text-zinc-600">
            <p>{profileName}</p>
            <p>
              {jobTitle}
              {company ? ` · ${company}` : ""}
            </p>
          </div>
        </header>

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
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

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600">
              Preview the tailored resume, then download an ATS-friendly HTML
              file.
            </p>
            <Button
              type="button"
              variant="primary"
              isLoading={isDownloading}
              disabled={isDownloading}
              onClick={() => {
                void handleDownloadHtml();
              }}
            >
              Download HTML
            </Button>
          </div>
        </Card>

        <ResumePreview resume={data.generatedResume} />
      </div>
    </main>
  );
}
