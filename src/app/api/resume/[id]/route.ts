import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatedResumeSchema } from "@/lib/ai/schemas";

type ResumeRouteContext = {
  params: { id: string };
};

export async function GET(
  _request: Request,
  context: ResumeRouteContext
) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: context.params.id },
      include: {
        profile: true,
        job: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

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

      return NextResponse.json({
        resume,
        generatedResume: validated.data,
      });
    } catch {
      return NextResponse.json(
        { error: "Invalid resume content" },
        { status: 422 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
