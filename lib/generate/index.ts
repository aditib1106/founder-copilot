import type { GenerateOptions, GenerateResponse } from "@/lib/types";
import { generateMockContent } from "./mock";
import { buildSections } from "./section-meta";
import { generateWithOpenAI, isOpenAIConfigured } from "./openai";

/**
 * Main generation entry point.
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise falls back to mock.
 */
export async function generatePlan(
  idea: string,
  options: GenerateOptions = {}
): Promise<GenerateResponse> {
  const brutalityMode = Boolean(options.brutalityMode);

  if (isOpenAIConfigured()) {
    const content = await generateWithOpenAI(idea, brutalityMode);
    return {
      sections: buildSections(content, { brutalityMode }),
      source: "openai",
      brutalityMode,
    };
  }

  const content = generateMockContent(idea, brutalityMode);
  return {
    sections: buildSections(content, { brutalityMode }),
    source: "mock",
    brutalityMode,
  };
}

export { isOpenAIConfigured };
