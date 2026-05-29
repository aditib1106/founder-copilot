export type RecommendationVerdict = "build" | "validate" | "kill";

export type Recommendation = {
  verdict: RecommendationVerdict;
  label: "Build it" | "Validate first" | "Kill it";
  rationale: string;
  weekendAnswer: string;
};

const WEEKEND_ANSWERS: Record<RecommendationVerdict, string[]> = {
  build: [
    "Yes — if you already have pull or distribution, a weekend prototype is reasonable.",
    "Yes — but scope it to one workflow and ship something people can pay for by Monday.",
    "Yes — only if you're testing with real buyers, not polishing in isolation.",
  ],
  validate: [
    "Not yet — use the weekend for customer conversations, not a repo.",
    "Probably not — unless you leave Sunday with prepaid interest or a clear kill decision.",
    "Only if validation is the goal — five calls beat five features.",
  ],
  kill: [
    "No — the score and story don't justify the opportunity cost right now.",
    "No — fix the thesis or the ICP before you invest weekends.",
    "No — park this and work on something with clearer demand signals.",
  ],
};

function pickByScore<T>(items: T[], score: number): T {
  return items[score % items.length];
}

/** Unified thresholds: 0–20 kill, 21–50 validate, 51+ build. */
export function getVerdictFromScore(
  realityScore: number
): RecommendationVerdict {
  if (realityScore <= 20) return "kill";
  if (realityScore <= 50) return "validate";
  return "build";
}

/**
 * Maps reality score to build / validate / kill.
 * Rationale tone matches the score band — no defaulting to validate.
 */
export function getRecommendation(realityScore: number): Recommendation {
  const verdict = getVerdictFromScore(realityScore);

  const labels: Record<RecommendationVerdict, Recommendation["label"]> = {
    build: "Build it",
    validate: "Validate first",
    kill: "Kill it",
  };

  const rationales: Record<RecommendationVerdict, string> = {
    build: `~${realityScore}% estimated odds — the analysis landed in "build" territory: real pain, plausible wedge, or early pull worth betting a focused sprint. Ship narrow; prove retention and revenue, not narrative.`,
    validate: `~${realityScore}% estimated odds — not dead, not ready. The roast and risks leave too many open questions for a full build. Run a 2–4 week validation with explicit kill criteria before you commit a quarter.`,
    kill: `~${realityScore}% estimated odds — the analysis surfaced structural, regulatory, or market headwinds that outweigh the upside. Kill this version or pivot sharply; don't mistake a clever story for traction.`,
  };

  return {
    verdict,
    label: labels[verdict],
    rationale: rationales[verdict],
    weekendAnswer: pickByScore(WEEKEND_ANSWERS[verdict], realityScore),
  };
}

export const VERDICT_ACCENT: Record<
  RecommendationVerdict,
  "emerald" | "amber" | "rose"
> = {
  build: "emerald",
  validate: "amber",
  kill: "rose",
};
