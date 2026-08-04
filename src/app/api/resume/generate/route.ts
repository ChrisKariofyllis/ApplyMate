import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOpenAIClient, getStructuredResponse } from "@/lib/ai/client";
import { generatedResumeSchema } from "@/lib/ai/schemas";

const generateBodySchema = z.object({
  matchId: z.string().trim().min(1),
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

const SYSTEM_PROMPT = `You are a resume writer. Create a tailored resume from verified candidate data only.

Return ONLY valid JSON matching this exact shape:
{
  "sections": [
    {
      "title": "string",
      "content": "string"
    }
  ],
  "factsUsed": ["string"]
}

Required sections in order when applicable:
1. Professional Summary
2. Key Skills
3. Professional Experience
4. Education
5. Certifications (only if allowed certification facts exist)
6. Languages (only if allowed language facts exist)

Rules:
- Tailor the resume to the specific job.
- Use ONLY allowed facts where allowedInCv is true and confidence is user_confirmed.
- Use the provided experience and education records as verified profile data.
- Do not invent companies, dates, titles, achievements, skills, certifications, or languages.
- factsUsed must list only fact keys that were actually used.
- Keep section content plain text suitable for an ATS-friendly resume.
- Use line breaks within content where helpful.`;

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = generateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { matchId } = parsed.data;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        job: true,
        profile: {
          include: {
            facts: true,
            experience: { orderBy: { sortOrder: "asc" } },
            education: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const allowedFacts = match.profile.facts.filter(
      (fact) => fact.allowedInCv === true && fact.confidence === "user_confirmed"
    );

    const requirements = safeJsonParseArray(match.job.requirementsJson);
    const niceToHave = safeJsonParseArray(match.job.niceToHaveJson);
    const strengths = safeJsonParseArray(match.strengthsJson);
    const gaps = safeJsonParseArray(match.gapsJson);
    const questions = safeJsonParseArray(match.questionsJson);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    const client = createOpenAIClient(apiKey);

    const userPrompt = `Generate a tailored resume as JSON only.

Job:
${JSON.stringify(
  {
    title: match.job.title,
    company: match.job.company,
    location: match.job.location,
    salary: match.job.salary,
    requirements,
    niceToHave,
    descriptionRaw: match.job.descriptionRaw.slice(0, 30_000),
  },
  null,
  2
)}

Match context:
${JSON.stringify(
  {
    overallScore: match.overallScore,
    recommendation: match.recommendation,
    strengths,
    gaps,
    questions,
  },
  null,
  2
)}

Profile:
${JSON.stringify(
  {
    fullName: match.profile.fullName,
    email: match.profile.email,
    phone: match.profile.phone,
    location: match.profile.location,
    linkedin: match.profile.linkedin,
    summary: match.profile.summary,
  },
  null,
  2
)}

Allowed user-confirmed facts (allowedInCv=true only):
${JSON.stringify(allowedFacts, null, 2)}

Verified experience:
${JSON.stringify(match.profile.experience, null, 2)}

Verified education:
${JSON.stringify(match.profile.education, null, 2)}`;

    const generatedResume = await getStructuredResponse(
      client,
      SYSTEM_PROMPT,
      userPrompt,
      generatedResumeSchema
    );

    if (!generatedResume) {
      return NextResponse.json(
        { error: "Unable to generate resume" },
        { status: 502 }
      );
    }

    const savedResume = await prisma.resume.create({
      data: {
        matchId: match.id,
        jobId: match.jobId,
        profileId: match.profileId,
        contentJson: JSON.stringify(generatedResume),
        status: "draft",
      },
    });

    return NextResponse.json({
      resume: savedResume,
      generatedResume,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
