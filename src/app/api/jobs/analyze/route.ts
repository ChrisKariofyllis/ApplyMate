import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOpenAIClient, getStructuredResponse } from "@/lib/ai/client";
import { jobAnalysisSchema } from "@/lib/ai/schemas";

const analyzeBodySchema = z.object({
  url: z.string().optional(),
  text: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a job posting analyzer. Extract structured information from the job posting text.

Return ONLY valid JSON matching this exact shape:
{
  "title": "string",
  "company": "string",
  "location": "string",
  "salary": "string ή null",
  "requirements": [
    {
      "skill": "string",
      "level": "required | nice_to_have | preferred",
      "yearsRequired": "number ή null"
    }
  ],
  "niceToHave": ["string"],
  "summary": "2-3 προτάσεις"
}

Rules:
- Do not invent information that is not present in the job posting.
- If a field is unknown, use an empty string for string fields, null for salary/yearsRequired, and empty arrays where appropriate.
- Use level "required", "nice_to_have", or "preferred" only.
- summary must be 2-3 sentences based only on the posting.`;

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = analyzeBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const url = parsed.data.url?.trim() || undefined;
    const text = parsed.data.text?.trim() || undefined;

    if (!url && !text) {
      return NextResponse.json(
        { error: "Either url or text is required" },
        { status: 400 }
      );
    }

    let jobText: string;

    if (text) {
      jobText = text;
    } else {
      try {
        const response = await fetch(url!);
        if (!response.ok) {
          return NextResponse.json(
            { error: "Failed to fetch job URL" },
            { status: 400 }
          );
        }
        jobText = (await response.text()).trim();
      } catch {
        return NextResponse.json(
          { error: "Failed to fetch job URL" },
          { status: 400 }
        );
      }

      if (!jobText) {
        return NextResponse.json(
          { error: "Fetched job content is empty" },
          { status: 400 }
        );
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    const truncatedText = jobText.slice(0, 30_000);
    const client = createOpenAIClient(apiKey);
    const userPrompt = `Analyze the following job posting and return JSON only.\n\n${truncatedText}`;

    const result = await getStructuredResponse(
      client,
      SYSTEM_PROMPT,
      userPrompt,
      jobAnalysisSchema
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to analyze job posting" },
        { status: 502 }
      );
    }

    const savedJob = await prisma.job.create({
      data: {
        url: url ?? null,
        title: result.title,
        company: result.company,
        location: result.location,
        salary: result.salary,
        descriptionRaw: jobText,
        requirementsJson: JSON.stringify(result.requirements),
        niceToHaveJson: JSON.stringify(result.niceToHave),
        status: "analyzed",
      },
    });

    return NextResponse.json({
      job: savedJob,
      requirements: result.requirements,
      niceToHave: result.niceToHave,
      summary: result.summary,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
