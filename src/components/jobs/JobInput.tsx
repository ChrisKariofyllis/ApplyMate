"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type JobInputProps = {
  onSubmit: (data: { url?: string; text?: string }) => void | Promise<void>;
  isLoading?: boolean;
};

export function JobInput({ onSubmit, isLoading = false }: JobInputProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = url.trim();
    const trimmedText = text.trim();

    if (!trimmedUrl && !trimmedText) {
      setError("Provide a job URL or paste a job description.");
      return;
    }

    setError(null);
    await onSubmit({
      ...(trimmedUrl ? { url: trimmedUrl } : {}),
      ...(trimmedText ? { text: trimmedText } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Job URL"
        type="url"
        name="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://example.com/job-posting"
        disabled={isLoading}
        autoComplete="off"
      />

      <div className="w-full">
        <label
          htmlFor="job-description"
          className="mb-1.5 block text-sm font-medium text-zinc-800"
        >
          Job description
        </label>
        <textarea
          id="job-description"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={isLoading}
          rows={8}
          placeholder="Paste the full job posting text here..."
          className={cn(
            "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Analyze job
      </Button>
    </form>
  );
}
