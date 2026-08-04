import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generatedResumeSchema } from "@/lib/ai/schemas";
import { generateResumeHtml } from "@/lib/pdf/generate-pdf";

const exportBodySchema = z.object({
  resumeId: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = exportBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { resumeId } = parsed.data;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        profile: true,
        job: true,
        match: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    let resumeContent: z.infer<typeof generatedResumeSchema>;
    try {
      if (!resume.contentJson) {
        return NextResponse.json(
          { error: "Invalid resume content" },
          { status: 422 }
        );
      }

      const parsedContent: unknown = JSON.parse(resume.contentJson);
      const validated = generatedResumeSchema.safeParse(parsedContent);

      if (!validated.success) {
        return NextResponse.json(
          { error: "Invalid resume content" },
          { status: 422 }
        );
      }

      resumeContent = validated.data;
    } catch {
      return NextResponse.json(
        { error: "Invalid resume content" },
        { status: 422 }
      );
    }

    const html = generateResumeHtml(resumeContent, resume.profile);

    await prisma.resume.update({
      where: { id: resume.id },
      data: { status: "exported" },
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'attachment; filename="applymate-resume.html"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
