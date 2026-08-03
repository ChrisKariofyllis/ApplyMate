import OpenAI from "openai";
import { z } from "zod";

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

export async function getStructuredResponse<T>(
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string,
  zodSchema: z.ZodType<T>
): Promise<T | null> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed: unknown = JSON.parse(content);
    const result = zodSchema.safeParse(parsed);

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}
