import { getRecommendationLabel } from "@/lib/recommendation";
import type { GeneratedContent } from "./section-meta";

const SCORE_MIN = 5;
const SCORE_MAX = 100;

/** Only these justify ≤15 — reserved for true kills. */
const KILL_RULES: {
  id: string;
  patterns: RegExp[];
  cap: number;
}[] = [
  {
    id: "legal_regulatory",
    patterns: [
      /\b(illegal|unlicensed practice|malpractice|hipaa violation|fda approval required|anti-cheat|anti-cheating|bypass.*(protection|detection)|surveillance without consent)\b/i,
    ],
    cap: 12,
  },
  {
    id: "feature_not_company",
    patterns: [
      /\b(clearly (just )?a feature|not a company|weekend project with delusions|hobby not a business|wrapping gpt around)\b/i,
    ],
    cap: 14,
  },
  {
    id: "no_pain",
    patterns: [
      /\b(no one (will )?pay|nobody pays|vitamin not painkiller|nice to have only|no meaningful pain|solution in search of)\b/i,
    ],
    cap: 13,
  },
  {
    id: "tiny_market",
    patterns: [
      /\b(tiny market|market too small|TAM.*(tiny|too small)|nobody needs this at scale)\b/i,
    ],
    cap: 14,
  },
  {
    id: "impossible_distribution",
    patterns: [
      /\b(no path to (customers|users)|impossible to reach (buyers|customers)|cannot get distribution|no way to acquire)\b/i,
    ],
    cap: 13,
  },
];

const SOFT_NEGATIVE: {
  id: string;
  patterns: RegExp[];
  penalty: number;
}[] = [
  {
    id: "crowded",
    patterns: [/\b(crowded|incumbent|commodity|graveyard of)\b/i],
    penalty: 4,
  },
  {
    id: "uncertain",
    patterns: [/\b(unproven|unclear wedge|still unproven|not proven)\b/i],
    penalty: 3,
  },
];

const STRONG_POSITIVE: { patterns: RegExp[]; floor: number } = {
  patterns: [
    /\b(pain is (real|obvious)|already spend|already paying|willingness to pay|people pay for|budget for this|clear demand|repeat purchases|strong demand)\b/i,
    /\b(distribution path|path to customers|can sell via|founders already buy|line item|prepaid|pre-paid)\b/i,
  ],
  floor: 40,
};

const POSITIVE_BOOST: { patterns: RegExp[]; boost: number }[] = [
  {
    patterns: [
      /\b(prepaid|pre-paid|loi\b|customers? (who )?paid|pull from customers|10k mrr|\$10k mrr|renew without chasing)\b/i,
    ],
    boost: 12,
  },
  {
    patterns: [/\b(seriously build|unusually strong|exceptional|clear wedge)\b/i],
    boost: 8,
  },
];

function buildCorpus(content: GeneratedContent): string {
  return [
    content.problem,
    content.investorRoast,
    content.realityCheck,
    ...content.risks,
    ...content.successMetrics,
  ].join(" ");
}

export type SeverityAnalysis = {
  killCap?: number;
  softPenalty: number;
  boost: number;
  floor?: number;
  matched: string[];
};

export function analyzeSeverity(content: GeneratedContent): SeverityAnalysis {
  const corpus = buildCorpus(content);
  let killCap: number | undefined;
  let softPenalty = 0;
  let boost = 0;
  let floor: number | undefined;
  const matched: string[] = [];

  for (const rule of KILL_RULES) {
    if (rule.patterns.some((p) => p.test(corpus))) {
      matched.push(`kill:${rule.id}`);
      killCap =
        killCap === undefined ? rule.cap : Math.min(killCap, rule.cap);
    }
  }

  for (const rule of SOFT_NEGATIVE) {
    if (rule.patterns.some((p) => p.test(corpus))) {
      softPenalty += rule.penalty;
      matched.push(rule.id);
    }
  }
  softPenalty = Math.min(softPenalty, 12);

  if (STRONG_POSITIVE.patterns.some((p) => p.test(corpus))) {
    floor = STRONG_POSITIVE.floor;
    matched.push("+strong_signals");
  }

  for (const rule of POSITIVE_BOOST) {
    if (rule.patterns.some((p) => p.test(corpus))) {
      boost += rule.boost;
      matched.push("+boost");
    }
  }
  boost = Math.min(boost, 18);

  return { killCap, softPenalty, boost, floor, matched };
}

function clampScore(score: number): number {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(score)));
}

export function finalizeRealityScore(
  baseScore: number,
  content: GeneratedContent
): number {
  const { killCap, softPenalty, boost, floor } = analyzeSeverity(content);
  let score = baseScore - softPenalty + boost;

  if (killCap !== undefined) {
    score = Math.min(score, killCap);
  } else if (floor !== undefined) {
    score = Math.max(score, floor);
  }

  return clampScore(score);
}

function buildWhyExplanation(
  score: number,
  analysis: SeverityAnalysis
): string {
  const label = getRecommendationLabel(score);
  const parts: string[] = [];

  if (analysis.killCap !== undefined) {
    parts.push(
      "we hit serious blockers (legal, weak pain, tiny market, or no path to customers)"
    );
  } else if (score >= 71) {
    parts.push(
      "pain looks obvious, buyers already spend, and distribution isn't a fantasy"
    );
  } else if (score >= 46) {
    parts.push(
      "the upside is real enough to build a narrow wedge, with risks still on the table"
    );
  } else if (score >= 16) {
    parts.push(
      "there's a thread worth pulling, but too many open questions for a full build sprint"
    );
  } else {
    parts.push("the downside dominates the upside on current evidence");
  }

  if (analysis.matched.includes("+strong_signals")) {
    parts.push("existing spending and demand showed up in the analysis");
  }
  if (analysis.softPenalty > 0 && !analysis.killCap) {
    parts.push("crowded space or unproven wedge pulled the number down slightly");
  }

  return `Why ~${score}% → ${label}: ${parts.join("; ")}.`;
}

export function updateRealityCheckScore(
  realityCheck: string,
  score: number,
  whyExplanation?: string
): string {
  const stripped = realityCheck
    .replace(/\s*Estimated chance of \$1M ARR[^.]*\.?\s*/gi, "")
    .replace(/\s*Why ~\d+%[^.]*\.\s*/gi, "")
    .trim();

  const estimate = `Estimated chance of $1M ARR in 24 months without a distribution wedge: ~${score}%.`;
  const why = whyExplanation ?? "";

  return [stripped, estimate, why].filter(Boolean).join(" ");
}

export function alignContentScore(
  content: GeneratedContent
): GeneratedContent {
  const analysis = analyzeSeverity(content);
  const realityScore = finalizeRealityScore(content.realityScore, content);
  const why = buildWhyExplanation(realityScore, analysis);

  return {
    ...content,
    realityScore,
    realityCheck: updateRealityCheckScore(
      content.realityCheck,
      realityScore,
      why
    ),
  };
}
