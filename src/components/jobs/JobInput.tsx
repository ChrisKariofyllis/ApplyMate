"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
          className="mb-1.5 block text-sm font-medium text-slate-300"
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
          className="field-textarea"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-400">
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
