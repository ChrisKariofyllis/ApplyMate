import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type JobRouteContext = {
  params: { id: string };
};

export async function GET(_request: Request, context: JobRouteContext) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: context.params.id },
      include: { matches: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
