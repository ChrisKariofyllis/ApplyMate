"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type QuestionsPanelProps = {
  matchId: string;
  questions: Question[];
  onAnswer: (
    index: number,
    answer: string,
    factKey: string
  ) => void | Promise<void>;
  isLoading?: boolean;
  initialAnswers?: Record<string, string>;
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

export function QuestionsPanel({
  matchId,
  questions,
  onAnswer,
  isLoading = false,
  initialAnswers = {},
}: QuestionsPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredKeys, setAnsweredKeys] = useState<Set<string>>(() => new Set());
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [answerSuccessMessage, setAnswerSuccessMessage] = useState<string | null>(
    null
  );
  const [answerError, setAnswerError] = useState<string | null>(null);

  const [additionalDetails, setAdditionalDetails] = useState("");
  const [allowedInCv, setAllowedInCv] = useState(true);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsSuccessMessage, setDetailsSuccessMessage] = useState<
    string | null
  >(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    setAnswers((current) => {
      const next = { ...initialAnswers };
      for (const [key, value] of Object.entries(current)) {
        if (!(key in initialAnswers) && value.trim()) {
          next[key] = value;
        }
      }
      return next;
    });

    setAnsweredKeys((current) => {
      const next = new Set(current);
      for (const [key, value] of Object.entries(initialAnswers)) {
        if (value.trim()) {
          next.add(key);
        }
      }
      return next;
    });
  }, [initialAnswers]);

  function updateAnswer(factKey: string, value: string) {
    setAnswers((current) => ({ ...current, [factKey]: value }));
  }

  async function handleSubmitOne(index: number, factKey: string) {
    if (answeredKeys.has(factKey) || submittingKey !== null || isLoading) {
      return;
    }

    const answer = answers[factKey]?.trim() ?? "";
    if (!answer) {
      setAnswerError("Please enter an answer before submitting.");
      setAnswerSuccessMessage(null);
      return;
    }

    setAnswerError(null);
    setAnswerSuccessMessage(null);
    setSubmittingKey(factKey);

    try {
      await onAnswer(index, answer, factKey);
      setAnsweredKeys((current) => new Set(current).add(factKey));
      setAnswers((current) => ({ ...current, [factKey]: answer }));
      setAnswerSuccessMessage("Answer saved");
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unable to save answer.";
      setAnswerError(message);
    } finally {
      setSubmittingKey(null);
    }
  }

  async function handleSaveAdditionalDetails() {
    if (isSavingDetails || isLoading || submittingKey !== null) {
      return;
    }

    const trimmed = additionalDetails.trim();
    if (!trimmed) {
      setDetailsError("Please enter additional details before saving.");
      setDetailsSuccessMessage(null);
      return;
    }

    setIsSavingDetails(true);
    setDetailsError(null);
    setDetailsSuccessMessage(null);

    try {
      const response = await fetch("/api/match/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          details: trimmed,
          allowedInCv,
        }),
      });

      if (!response.ok) {
        setDetailsError(await readErrorMessage(response));
        return;
      }

      setAdditionalDetails("");
      setDetailsSuccessMessage("Additional details saved");
    } catch {
      setDetailsError("Unable to save additional details.");
    } finally {
      setIsSavingDetails(false);
    }
  }

  const detailsDisabled =
    isSavingDetails || isLoading || submittingKey !== null;

  return (
    <div className="space-y-6">
      {questions.length > 0 ? (
        <Card title="Answer clarification questions">
          <div className="space-y-5">
            {questions.map((question, index) => {
              const fieldId = `question-${index}-${question.factKey}`;
              const isAnswered = answeredKeys.has(question.factKey);
              const isSubmitting = submittingKey === question.factKey;
              const disabled =
                isAnswered || isLoading || submittingKey !== null;

              return (
                <div
                  key={`${index}-${question.factKey}`}
                  className="space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor={fieldId}
                      className="block text-sm font-medium text-zinc-900"
                    >
                      {question.text}
                    </label>
                    {isAnswered ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Answered
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-zinc-600">{question.context}</p>

                  {isAnswered ? (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <p className="text-sm text-zinc-800 whitespace-pre-wrap">
                        {answers[question.factKey] ?? ""}
                      </p>
                    </div>
                  ) : (
                    <textarea
                      id={fieldId}
                      name={fieldId}
                      value={answers[question.factKey] ?? ""}
                      onChange={(event) =>
                        updateAnswer(question.factKey, event.target.value)
                      }
                      disabled={disabled}
                      rows={3}
                      className={cn(
                        "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
                        "disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    />
                  )}

                  {!isAnswered ? (
                    <Button
                      type="button"
                      variant="primary"
                      isLoading={isSubmitting}
                      disabled={disabled}
                      onClick={() => {
                        void handleSubmitOne(index, question.factKey);
                      }}
                    >
                      Submit answer
                    </Button>
                  ) : null}
                </div>
              );
            })}

            {answerSuccessMessage ? (
              <p role="status" className="text-sm text-emerald-800">
                {answerSuccessMessage}
              </p>
            ) : null}

            {answerError ? (
              <p role="alert" className="text-sm text-red-600">
                {answerError}
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card title="Additional details">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            Saved details become part of your career profile and may be used for
            future job matches and tailored resumes.
          </p>

          <div className="space-y-2">
            <label
              htmlFor="additional-details"
              className="block text-sm font-medium text-zinc-900"
            >
              Do you want to add more details or experiences for this job?
            </label>
            <textarea
              id="additional-details"
              name="additional-details"
              value={additionalDetails}
              onChange={(event) => setAdditionalDetails(event.target.value)}
              disabled={detailsDisabled}
              rows={4}
              placeholder="Type any additional skills, projects, achievements, responsibilities, or context here..."
              className={cn(
                "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-zinc-800">
            <input
              type="checkbox"
              checked={allowedInCv}
              onChange={(event) => setAllowedInCv(event.target.checked)}
              disabled={detailsDisabled}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <span>Use these details in future tailored resumes</span>
          </label>

          <Button
            type="button"
            variant="primary"
            isLoading={isSavingDetails}
            disabled={detailsDisabled}
            onClick={() => {
              void handleSaveAdditionalDetails();
            }}
          >
            Save additional details
          </Button>

          {detailsSuccessMessage ? (
            <p role="status" className="text-sm text-emerald-800">
              {detailsSuccessMessage}
            </p>
          ) : null}

          {detailsError ? (
            <p role="alert" className="text-sm text-red-600">
              {detailsError}
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
