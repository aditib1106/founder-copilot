export type RecommendationVerdict = "kill" | "validate" | "build" | "serious-build";

export type RecommendationLabel =
  | "Kill it"
  | "Validate first"
  | "Build it"
  | "Seriously build this";

export type Recommendation = {
  verdict: RecommendationVerdict;
  label: RecommendationLabel;
  rationale: string;
  weekendAnswer: string;
};

const WEEKEND_ANSWERS: Record<RecommendationVerdict, string[]> = {
  "serious-build": [
    "Yes — and block the weekend. You have enough signal that shipping beats another notion doc.",
    "Yes — treat it like a sprint with customers, not a science project.",
    "Yes — but ship one narrow slice and invoice someone by Sunday night.",
  ],
  build: [
    "Yes — if you already have pull or a channel, a weekend prototype is reasonable.",
    "Yes — scope one painful slice and get it in front of buyers by Monday.",
    "Yes — only if you're testing with paying humans, not polishing alone.",
  ],
  validate: [
    "Not yet — spend the weekend on calls and pre-sells, not a repo.",
    "Maybe — if you come back with prepaid interest or a clear kill decision.",
    "Only if validation is the goal — five real conversations beat five features.",
  ],
  kill: [
    "No — the math and story don't justify the opportunity cost right now.",
    "No — fix the thesis or pick a sharper problem before you burn weekends.",
    "No — park this unless discovery completely changes the picture.",
  ],
};

function pickByScore<T>(items: T[], score: number): T {
  return items[score % items.length];
}

/** 0–15 kill, 16–45 validate, 46–70 build, 71–100 seriously build. */
export function getVerdictFromScore(
  realityScore: number
): RecommendationVerdict {
  if (realityScore <= 15) return "kill";
  if (realityScore <= 45) return "validate";
  if (realityScore <= 70) return "build";
  return "serious-build";
}

export function getRecommendationLabel(score: number): RecommendationLabel {
  const verdict = getVerdictFromScore(score);
  const labels: Record<RecommendationVerdict, RecommendationLabel> = {
    kill: "Kill it",
    validate: "Validate first",
    build: "Build it",
    "serious-build": "Seriously build this",
  };
  return labels[verdict];
}

export function getRecommendation(realityScore: number): Recommendation {
  const verdict = getVerdictFromScore(realityScore);

  const labels: Record<RecommendationVerdict, RecommendationLabel> = {
    kill: "Kill it",
    validate: "Validate first",
    build: "Build it",
    "serious-build": "Seriously build this",
  };

  const rationales: Record<RecommendationVerdict, string> = {
    kill: `~${realityScore}% — we're in kill territory. The write-up surfaced blockers (legal, tiny market, weak pain, or no believable path to customers) that outweigh the upside. Don't grind on this version.`,
    validate: `~${realityScore}% — validate first. There's something here worth testing, but the roast and risks still have open holes. Run a tight 2–4 week sprint with prepaid or kill criteria before you commit a quarter.`,
    build: `~${realityScore}% — build it, but stay narrow. Pain looks real, spending exists, and distribution isn't fantasy. Ship a wedge and prove people pay and come back.`,
    "serious-build": `~${realityScore}% — seriously build this (rare). Pain, spending, and distribution line up unusually well. Move fast on a focused wedge — this is one of the few ideas that earns full-time obsession right now.`,
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
  "emerald" | "amber" | "rose" | "sky"
> = {
  kill: "rose",
  validate: "amber",
  build: "emerald",
  "serious-build": "sky",
};
