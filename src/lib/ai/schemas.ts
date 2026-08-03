import { z } from "zod";

export const jobAnalysisSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  salary: z.string().nullable(),
  requirements: z.array(
    z.object({
      skill: z.string(),
      level: z.enum(["required", "nice_to_have", "preferred"]),
      yearsRequired: z.number().nullable(),
    })
  ),
  niceToHave: z.array(z.string()),
  summary: z.string(),
});

export const matchResultSchema = z.object({
  overallScore: z.number().min(0).max(10),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  questions: z.array(
    z.object({
      text: z.string(),
      context: z.string(),
      factKey: z.string(),
    })
  ),
  recommendation: z.enum([
    "strong_match",
    "good_match",
    "possible",
    "long_shot",
  ]),
});

export const generatedResumeSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  ),
  factsUsed: z.array(z.string()),
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;
export type MatchResultSchema = z.infer<typeof matchResultSchema>;
export type GeneratedResumeSchema = z.infer<typeof generatedResumeSchema>;
