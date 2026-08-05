import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOpenAIClient, getStructuredResponse } from "@/lib/ai/client";
import { matchResultSchema } from "@/lib/ai/schemas";

const matchBodySchema = z.object({
  jobId: z.string().trim().min(1),
});

function safeJsonParseArray(value: string | null): unknown[] {
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

const SYSTEM_PROMPT = `You are a career match analyst. Compare a candidate profile against a job posting.

Return ONLY valid JSON matching this exact shape:
{
  "overallScore": 0,
  "strengths": [],
  "gaps": [],
  "questions": [
    {
      "text": "string",
      "context": "string",
      "factKey": "string"
    }
  ],
  "recommendation": "strong_match"
}

Rules:
- overallScore must be a number from 0 to 10.
- strengths: provide 3 to 5 strengths.
- gaps: provide 2 to 4 gaps or weaknesses.
- questions: provide 0 to 3 clarification questions for missing information.
- recommendation must be exactly one of: "strong_match", "good_match", "possible", "long_shot".
- Use ONLY the provided user-confirmed facts that are allowed in a CV.
- Do not invent experience, skills, achievements, or facts that are not provided.
- If there are no allowed facts, treat this as missing information and do not invent experience.
- Compare the facts against the job requirements and nice-to-have items.`;

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = matchBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { jobId } = parsed.data;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const profile = await prisma.profile.findFirst({
      include: {
        facts: true,
        experience: { orderBy: { sortOrder: "asc" } },
        education: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const allowedFacts = profile.facts.filter(
      (fact) => fact.confidence === "user_confirmed" && fact.allowedInCv === true
    );

    const requirements = safeJsonParseArray(job.requirementsJson);
    const niceToHave = safeJsonParseArray(job.niceToHaveJson);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    const client = createOpenAIClient(apiKey);

    const userPrompt = `Compare this candidate profile with the job posting and return JSON only.

Job:
${JSON.stringify(
  {
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    requirements,
    niceToHave,
    descriptionRaw: job.descriptionRaw.slice(0, 30_000),
  },
  null,
  2
)}

Allowed user-confirmed facts (allowedInCv=true only):
${JSON.stringify(allowedFacts, null, 2)}

Experience context:
${JSON.stringify(profile.experience, null, 2)}

Education context:
${JSON.stringify(profile.education, null, 2)}`;

    const result = await getStructuredResponse(
      client,
      SYSTEM_PROMPT,
      userPrompt,
      matchResultSchema
    );

    if (!result) {
      return NextResponse.json(
        { error: "Unable to analyze match" },
        { status: 502 }
      );
    }

    const matchData = {
      overallScore: result.overallScore,
      strengthsJson: JSON.stringify(result.strengths),
      gapsJson: JSON.stringify(result.gaps),
      questionsJson: JSON.stringify(result.questions),
      recommendation: result.recommendation,
    };

    const savedMatch = await prisma.$transaction(async (tx) => {
      const existingMatch = await tx.match.findFirst({
        where: {
          jobId: job.id,
          profileId: profile.id,
        },
        orderBy: { createdAt: "desc" },
      });

      const match = existingMatch
        ? await tx.match.update({
            where: { id: existingMatch.id },
            data: matchData,
          })
        : await tx.match.create({
            data: {
              jobId: job.id,
              profileId: profile.id,
              ...matchData,
            },
          });

      await tx.job.update({
        where: { id: job.id },
        data: { status: "matched" },
      });

      return match;
    });

    return NextResponse.json({
      match: savedMatch,
      result,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
