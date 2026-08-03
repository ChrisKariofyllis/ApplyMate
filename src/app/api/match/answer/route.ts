import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const answerBodySchema = z.object({
  matchId: z.string().trim().min(1),
  questionIndex: z.number().int().min(0),
  answer: z.string().trim().min(1),
  factKey: z.string().trim().min(1),
});

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

    const { matchId, answer, factKey } = parsed.data;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { profile: true },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const factCreated = await prisma.fact.create({
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
