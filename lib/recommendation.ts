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
 * Same thresholds in all modes — brutality affects copy elsewhere, not the bands.
 */
export function getRecommendation(realityScore: number): Recommendation {
  const verdict = getVerdictFromScore(realityScore);

  const labels: Record<RecommendationVerdict, Recommendation["label"]> = {
    build: "Build it",
    validate: "Validate first",
    kill: "Kill it",
  };

  const rationales: Record<RecommendationVerdict, string> = {
    build: `~${realityScore}% estimated odds — unusually strong for an early idea. You likely have real pain, a plausible wedge, or early pull. Still ship small and prove retention, not slide decks.`,
    validate: `~${realityScore}% estimated odds — right where most ideas land. Promising enough to test, not proven enough to go all-in. Run a tight validation sprint before you commit months.`,
    kill: `~${realityScore}% estimated odds — weak on timing, differentiation, or demand signals. Don't grind on this version; pivot or pick a sharper problem.`,
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
