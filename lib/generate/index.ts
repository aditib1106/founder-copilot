import type { GenerateOptions, GenerateResponse } from "@/lib/types";
import {
  generateWithAnthropic,
  isAnthropicConfigured,
} from "./anthropic";
import { generateMockContent } from "./mock";
import { buildSections } from "./section-meta";

/**
 * Main generation entry point.
 * Uses Anthropic when ANTHROPIC_API_KEY is set; otherwise falls back to mock.
 */
export async function generatePlan(
  idea: string,
  options: GenerateOptions = {}
): Promise<GenerateResponse> {
  const brutalityMode = Boolean(options.brutalityMode);

  if (isAnthropicConfigured()) {
    const content = await generateWithAnthropic(idea, brutalityMode);
    return {
      sections: buildSections(content, { brutalityMode }),
      source: "anthropic",
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

export { isAnthropicConfigured };
