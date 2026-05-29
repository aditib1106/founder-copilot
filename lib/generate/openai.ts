import type { GeneratedContent } from "./section-meta";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

const BASE_SYSTEM_PROMPT = `You are Founder Copilot, a brutally honest startup advisor for YC-style founders.
Given a startup idea, produce structured analysis that helps founders decide whether to build it.
Be specific to the idea. Be skeptical but constructive. Investor roast should sound like a real VC partner.
Include one "NOT:" anti-persona line in targetUsers.
realityScore must be an integer 8-65: estimated % chance of $1M ARR in 24 months without a distribution wedge. Most ideas should score 21-50. Reserve ≤20 for genuinely weak ideas. Reserve 51+ for unusual strength, clear distribution, or customer pull.`;

const BRUTALITY_ADDENDUM = `

BRUTALITY MODE IS ON:
- investorRoast: significantly harsher — dismissive, memorable, no softening. Sound like a partner who has zero fear of offending the founder.
- realityCheck: deeply skeptical; default toward "don't build" unless evidence is overwhelming.
- realityScore: still use 8-65 scale; lean 18-42 unless the idea is clearly exceptional or clearly weak. Be tough in prose, not by inventing artificially low numbers.
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

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function clampScore(score: number): number {
  return Math.min(65, Math.max(8, Math.round(score)));
}

function parseGeneratedContent(
  raw: string,
  brutalityMode: boolean
): GeneratedContent {
  const parsed = JSON.parse(raw) as GeneratedContent;

  if (
    typeof parsed.problem !== "string" ||
    !Array.isArray(parsed.targetUsers) ||
    typeof parsed.investorRoast !== "string" ||
    typeof parsed.realityScore !== "number"
  ) {
    throw new Error("OpenAI response missing required fields");
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
 * Generate plan content via OpenAI Chat Completions API.
 * Requires OPENAI_API_KEY. Optional OPENAI_MODEL (defaults to gpt-4o-mini).
 */
export async function generateWithOpenAI(
  idea: string,
  brutalityMode = false
): Promise<GeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const systemPrompt =
    BASE_SYSTEM_PROMPT + (brutalityMode ? BRUTALITY_ADDENDUM : "");

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: brutalityMode ? 0.85 : 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${JSON_SCHEMA_DESCRIPTION}\n\nStartup idea:\n${idea}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API error (${response.status}): ${errorBody.slice(0, 200)}`
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return parseGeneratedContent(content, brutalityMode);
}
