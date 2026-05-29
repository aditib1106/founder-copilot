import Anthropic from "@anthropic-ai/sdk";
import { SCORE_GUIDELINES, TONE_GUIDELINES } from "./prompt-tone";
import type { GeneratedContent } from "./section-meta";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

const BASE_SYSTEM_PROMPT = `You are Founder Copilot — a skeptical founder friend, not a consultant.
Given a startup idea, produce structured analysis that helps founders decide whether to build it.

${TONE_GUIDELINES}

${SCORE_GUIDELINES}

Include one "NOT:" anti-persona line in targetUsers.
Respond with valid JSON only — no markdown fences, no commentary outside the JSON object.`;

const BRUTALITY_ADDENDUM = `

BRUTALITY MODE IS ON:
- investorRoast: harsher and funnier — still specific, still screenshot-worthy.
- realityCheck: more skeptical prose, but still explain WHY the score fits; do not auto-score everything ≤15.
- validationPlan: focus on disproving the idea, but include one "what would change your mind" step.`;

const JSON_SCHEMA_DESCRIPTION = `Return valid JSON only with this exact shape:
{
  "problem": "string",
  "targetUsers": ["string", ...],
  "mvpFeatures": ["string", ...],
  "userStories": ["string", ...],
  "successMetrics": ["string", ...],
  "roadmap": ["string", ...],
  "risks": ["string", ...],
  "investorRoast": "string",
  "realityCheck": "string",
  "realityScore": number,
  "validationPlan": ["string", ...]
}`;

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(5, Math.round(score)));
}

function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

function parseGeneratedContent(raw: string): GeneratedContent {
  const parsed = JSON.parse(extractJsonPayload(raw)) as GeneratedContent;

  if (
    typeof parsed.problem !== "string" ||
    !Array.isArray(parsed.targetUsers) ||
    typeof parsed.investorRoast !== "string" ||
    typeof parsed.realityScore !== "number"
  ) {
    throw new Error("Anthropic response missing required fields");
  }

  return {
    problem: parsed.problem,
    targetUsers: parsed.targetUsers,
    mvpFeatures: parsed.mvpFeatures ?? [],
    userStories: parsed.userStories ?? [],
    successMetrics: parsed.successMetrics ?? [],
    roadmap: parsed.roadmap ?? [],
    risks: parsed.risks ?? [],
    investorRoast: parsed.investorRoast,
    realityCheck: parsed.realityCheck,
    realityScore: clampScore(parsed.realityScore),
    validationPlan: parsed.validationPlan ?? [],
  };
}

export async function generateWithAnthropic(
  idea: string,
  brutalityMode = false
): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  const systemPrompt =
    BASE_SYSTEM_PROMPT + (brutalityMode ? BRUTALITY_ADDENDUM : "");

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    temperature: brutalityMode ? 0.8 : 0.65,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `${JSON_SCHEMA_DESCRIPTION}\n\nStartup idea:\n${idea}`,
      },
    ],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!text.trim()) {
    throw new Error("Anthropic returned an empty response");
  }

  return parseGeneratedContent(text);
}
