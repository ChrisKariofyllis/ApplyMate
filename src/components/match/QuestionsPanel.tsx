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
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  function updateAnswer(index: number, value: string) {
    setAnswers((current) => ({ ...current, [index]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emptyIndexes = questions
      .map((_, index) => index)
      .filter((index) => !(answers[index]?.trim()));

    if (emptyIndexes.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setError(null);

    for (let index = 0; index < questions.length; index += 1) {
      const answer = answers[index]?.trim() ?? "";
      if (!answer) {
        continue;
      }
      await onAnswer(index, answer, questions[index].factKey);
    }
  }

  if (questions.length === 0) {
    return (
      <Card title="Questions">
        <p className="text-sm text-zinc-500">No clarification questions.</p>
      </Card>
    );
  }

  return (
    <Card title="Answer clarification questions">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {questions.map((question, index) => {
          const fieldId = `question-${index}`;
          return (
            <div key={`${question.factKey}-${index}`} className="space-y-2">
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
                value={answers[index] ?? ""}
                onChange={(event) => updateAnswer(index, event.target.value)}
                disabled={isLoading}
                rows={3}
                className={cn(
                  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              />
            </div>
          );
        })}

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
          Submit answers
        </Button>
      </form>
    </Card>
  );
}
