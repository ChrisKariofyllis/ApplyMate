"use client";

import { useState } from "react";
import type { Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type QuestionsPanelProps = {
  questions: Question[];
  onAnswer: (
    index: number,
    answer: string,
    factKey: string
  ) => void | Promise<void>;
  isLoading?: boolean;
};

export function QuestionsPanel({
  questions,
  onAnswer,
  isLoading = false,
}: QuestionsPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredKeys, setAnsweredKeys] = useState<Set<string>>(() => new Set());
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateAnswer(factKey: string, value: string) {
    setAnswers((current) => ({ ...current, [factKey]: value }));
  }

  async function handleSubmitOne(index: number, factKey: string) {
    if (answeredKeys.has(factKey) || submittingKey !== null || isLoading) {
      return;
    }

    const answer = answers[factKey]?.trim() ?? "";
    if (!answer) {
      setError("Please enter an answer before submitting.");
      setSuccessMessage(null);
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setSubmittingKey(factKey);

    try {
      await onAnswer(index, answer, factKey);
      setAnsweredKeys((current) => new Set(current).add(factKey));
      setSuccessMessage("Answer saved");
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unable to save answer.";
      setError(message);
    } finally {
      setSubmittingKey(null);
    }
  }

  const visibleQuestions = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => !answeredKeys.has(question.factKey));

  if (visibleQuestions.length === 0) {
    if (successMessage) {
      return (
        <Card title="Answer clarification questions">
          <p role="status" className="text-sm text-emerald-800">
            {successMessage}
          </p>
        </Card>
      );
    }
    return null;
  }

  return (
    <Card title="Answer clarification questions">
      <div className="space-y-5">
        {visibleQuestions.map(({ question, index }) => {
          const fieldId = `question-${question.factKey}`;
          const isSubmitting = submittingKey === question.factKey;
          const disabled = isLoading || submittingKey !== null;

          return (
            <div key={question.factKey} className="space-y-2">
              <label
                htmlFor={fieldId}
                className="block text-sm font-medium text-zinc-900"
              >
                {question.text}
              </label>
              <p className="text-sm text-zinc-600">{question.context}</p>
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
            </div>
          );
        })}

        {successMessage ? (
          <p role="status" className="text-sm text-emerald-800">
            {successMessage}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
