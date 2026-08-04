import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  achievements: z.string().optional(),
  tools: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const factSchema = z.object({
  category: z.string(),
  key: z.string(),
  value: z.string(),
  details: z.string().optional(),
  confidence: z.string().optional(),
  source: z.string().optional(),
  allowedInCv: z.boolean().optional(),
});

const profileBodySchema = z.object({
  fullName: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  summary: z.string().optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  facts: z.array(factSchema).optional(),
});

const profileInclude = {
  facts: true,
  experience: { orderBy: { sortOrder: "asc" as const } },
  education: { orderBy: { sortOrder: "asc" as const } },
};

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      include: profileInclude,
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const parsed = profileBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const data = parsed.data;
    const experience = data.experience ?? [];
    const education = data.education ?? [];
    const shouldReplaceFacts = data.facts !== undefined;
    const facts = data.facts ?? [];

    const experienceCreate = experience.map((item, index) => ({
      company: item.company,
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate,
      isCurrent: item.isCurrent ?? false,
      description: item.description,
      achievements: item.achievements,
      tools: item.tools,
      sortOrder: index,
    }));

    const educationCreate = education.map((item, index) => ({
      institution: item.institution,
      degree: item.degree,
      field: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      sortOrder: index,
    }));

    const factsCreate = facts.map((item) => ({
      category: item.category,
      key: item.key,
      value: item.value,
      details: item.details,
      confidence: item.confidence ?? "user_confirmed",
      source: item.source ?? "user_input",
      allowedInCv: item.allowedInCv ?? true,
    }));

    const existing = await prisma.profile.findFirst();

    if (!existing) {
      const profile = await prisma.$transaction(async (tx) => {
        return tx.profile.create({
          data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            linkedin: data.linkedin,
            summary: data.summary,
            experience: { create: experienceCreate },
            education: { create: educationCreate },
            facts: { create: factsCreate },
          },
          include: profileInclude,
        });
      });

      return NextResponse.json(profile, { status: 201 });
    }

    const profile = await prisma.$transaction(async (tx) => {
      await tx.experience.deleteMany({ where: { profileId: existing.id } });
      await tx.education.deleteMany({ where: { profileId: existing.id } });

      if (shouldReplaceFacts) {
        await tx.fact.deleteMany({ where: { profileId: existing.id } });
      }

      return tx.profile.update({
        where: { id: existing.id },
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin,
          summary: data.summary,
          experience: { create: experienceCreate },
          education: { create: educationCreate },
          ...(shouldReplaceFacts ? { facts: { create: factsCreate } } : {}),
        },
        include: profileInclude,
      });
    });

    return NextResponse.json(profile, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
