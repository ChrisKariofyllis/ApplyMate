import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const detailsBodySchema = z.object({
  matchId: z.string().trim().min(1),
  details: z.string().trim().min(1).max(5000),
  allowedInCv: z.boolean().optional().default(true),
});

const MAX_FACT_VALUE_LENGTH = 10_000;

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = detailsBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { matchId, details, allowedInCv } = parsed.data;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        profile: true,
        job: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const jobTitle = match.job.title;
    const jobCompany = match.job.company ?? "Unknown company";
    const factKey = `job_${match.jobId}_additional_details`;
    const contextualValue = `Additional candidate information for the job "${jobTitle}" at "${jobCompany}": ${details}`;
    const contextualDetails = `Additional details submitted for job "${jobTitle}" at "${jobCompany}".`;

    const factCreated = await prisma.$transaction(async (tx) => {
      const existing = await tx.fact.findFirst({
        where: {
          profileId: match.profileId,
          key: factKey,
          confidence: "user_confirmed",
          allowedInCv: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (existing) {
        const separator = "\n\n---\n\n";
        let nextValue = `${existing.value}${separator}${contextualValue}`;
        if (nextValue.length > MAX_FACT_VALUE_LENGTH) {
          nextValue = nextValue.slice(0, MAX_FACT_VALUE_LENGTH);
        }

        let nextDetails = existing.details
          ? `${existing.details}${separator}${contextualDetails}`
          : contextualDetails;
        if (nextDetails.length > MAX_FACT_VALUE_LENGTH) {
          nextDetails = nextDetails.slice(0, MAX_FACT_VALUE_LENGTH);
        }

        return tx.fact.update({
          where: { id: existing.id },
          data: {
            value: nextValue,
            details: nextDetails,
            allowedInCv,
            confidence: "user_confirmed",
            source: "user_input",
          },
        });
      }

      let value = contextualValue;
      if (value.length > MAX_FACT_VALUE_LENGTH) {
        value = value.slice(0, MAX_FACT_VALUE_LENGTH);
      }

      return tx.fact.create({
        data: {
          profileId: match.profileId,
          category: "other",
          key: factKey,
          value,
          details: contextualDetails,
          confidence: "user_confirmed",
          source: "user_input",
          allowedInCv,
        },
      });
    });

    return NextResponse.json({
      success: true,
      factCreated,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
