import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const answerBodySchema = z.object({
  matchId: z.string().trim().min(1),
  questionIndex: z.number().int().min(0),
  answer: z.string().trim().min(1),
  factKey: z.string().trim().min(1),
});

type MatchQuestion = {
  text: string;
  context: string;
  factKey: string;
};

function parseMatchQuestions(questionsJson: string | null): MatchQuestion[] {
  if (!questionsJson) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(questionsJson);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const questions: MatchQuestion[] = [];
    for (const item of parsed) {
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
      questions.push({
        text: record.text,
        context: record.context,
        factKey: record.factKey,
      });
    }
    return questions;
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = answerBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { matchId, questionIndex, answer, factKey } = parsed.data;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { profile: true },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const questions = parseMatchQuestions(match.questionsJson);
    const question = questions[questionIndex];

    if (!question) {
      return NextResponse.json(
        { error: "Invalid question index" },
        { status: 400 }
      );
    }

    if (question.factKey !== factKey) {
      return NextResponse.json(
        { error: "factKey does not match the question" },
        { status: 400 }
      );
    }

    const { factCreated, previousFactsArchived } = await prisma.$transaction(
      async (tx) => {
        const oldFacts = await tx.fact.findMany({
          where: {
            profileId: match.profileId,
            key: factKey,
          },
        });

        const toArchive = oldFacts.filter(
          (fact) =>
            fact.confidence === "user_confirmed" && fact.allowedInCv === true
        );

        if (toArchive.length > 0) {
          await tx.fact.updateMany({
            where: {
              id: { in: toArchive.map((fact) => fact.id) },
            },
            data: {
              allowedInCv: false,
            },
          });
        }

        const created = await tx.fact.create({
          data: {
            profileId: match.profileId,
            category: "skill",
            key: factKey,
            value: answer,
            confidence: "user_confirmed",
            source: "user_input",
            allowedInCv: true,
          },
        });

        return {
          factCreated: created,
          previousFactsArchived: toArchive.length,
        };
      }
    );

    return NextResponse.json({
      success: true,
      factCreated,
      previousFactsArchived,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
