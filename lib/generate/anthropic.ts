import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedContent } from "./section-meta";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

const BASE_SYSTEM_PROMPT = `You are Founder Copilot, a brutally honest startup advisor for YC-style founders.
Given a startup idea, produce structured analysis that helps founders decide whether to build it.
Be specific to the idea. Be skeptical but constructive. Investor roast should sound like a real VC partner.
Include one "NOT:" anti-persona line in targetUsers.
realityScore must be an integer 8-65: estimated % chance of $1M ARR in 24 months without a distribution wedge. The score MUST match the severity of investorRoast, risks, and realityCheck — if you cite structural flaws, regulatory risk, shrinking markets, or missing distribution, score ≤20 and recommend kill in realityCheck prose. Use 21-50 only when the idea is genuinely uncertain (worth testing, not building yet). Use 51+ only with clear pull, wedge, or paid demand. Do not inflate scores to be polite.
Respond with valid JSON only — no markdown fences, no commentary outside the JSON object.`;

const BRUTALITY_ADDENDUM = `

BRUTALITY MODE IS ON:
- investorRoast: significantly harsher — dismissive, memorable, no softening. Sound like a partner who has zero fear of offending the founder.
- realityCheck: deeply skeptical; default toward "don't build" unless evidence is overwhelming.
- realityScore: must align with harsh roast — structural/regulatory/market kills should be ≤20. Do not cluster everything in 21-50.
- validationPlan: every step must focus on DISPROVING the idea, surfacing kill criteria, and finding reasons NOT to build. Do not encourage or motivate.`;

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
  return Math.min(65, Math.max(8, Math.round(score)));
}

/** Strip optional markdown code fences from model output. */
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

/**
 * Generate plan content via Anthropic Messages API.
 * Requires ANTHROPIC_API_KEY. Optional ANTHROPIC_MODEL.
 */
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
    temperature: brutalityMode ? 0.85 : 0.7,
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
