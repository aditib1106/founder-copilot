import type { GeneratedContent } from "./section-meta";

const SCORE_MIN = 8;
const SCORE_MAX = 65;

type SeverityRule = {
  id: string;
  patterns: RegExp[];
  penalty: number;
  /** Hard cap when this signal fires (lowest cap wins). */
  cap?: number;
};

const SEVERITY_RULES: SeverityRule[] = [
  {
    id: "regulatory",
    patterns: [
      /\b(legal|compliance|license|licensed|malpractice|hipaa|fda|regulat|cease and desist|tos\b|policy change|unlist|liability)\b/i,
    ],
    penalty: 20,
    cap: 14,
  },
  {
    id: "structural",
    patterns: [
      /\b(not a company|feature not a company|commodity|graveyard|renting positioning|chicken-and-egg|liquidity|two-sided market|classifi?eds site|not a venture|hobby not)\b/i,
    ],
    penalty: 16,
    cap: 18,
  },
  {
    id: "market",
    patterns: [
      /\b(shrinking|declining|consolidat|incumbent|bundle(s)? free|copy (it )?in one sprint|market'?s consolidating|eating your lunch)\b/i,
    ],
    penalty: 12,
    cap: 22,
  },
  {
    id: "roast_fatal",
    patterns: [
      /\b(i'?d pass|we'?re passing|don'?t raise|kill it|forget your name|come back when|not taking another meeting|hard no|default to no)\b/i,
    ],
    penalty: 14,
    cap: 16,
  },
  {
    id: "distribution",
    patterns: [
      /\b(no distribution|no repeatable channel|no channel|no wedge|who paid you|where'?s the distribution|cac > ltv)\b/i,
    ],
    penalty: 10,
  },
  {
    id: "kill_verdict",
    patterns: [
      /\b(pivot candidate|kill criterion|don'?t build|stop building|negative expected value|walk away|park this)\b/i,
    ],
    penalty: 8,
  },
];

const POSITIVE_RULES: SeverityRule[] = [
  {
    id: "pull",
    patterns: [
      /\b(prepaid|pre-paid|loi\b|customers? (who )?paid|pull from customers|repeatable channel|reference call|10k mrr|\$10k mrr)\b/i,
    ],
    penalty: -12,
  },
  {
    id: "strength",
    patterns: [
      /\b(clear wedge|unusually strong|early pull|proof someone prepaid|liquidity proof)\b/i,
    ],
    penalty: -6,
  },
];

function buildCorpus(content: GeneratedContent): string {
  return [
    content.problem,
    content.investorRoast,
    content.realityCheck,
    ...content.risks,
  ]
    .join(" ")
    .toLowerCase();
}

export type SeverityAnalysis = {
  penalty: number;
  boost: number;
  cap?: number;
  matched: string[];
};

export function analyzeSeverity(content: GeneratedContent): SeverityAnalysis {
  const corpus = buildCorpus(content);
  let penalty = 0;
  let boost = 0;
  let cap: number | undefined;
  const matched: string[] = [];

  for (const rule of SEVERITY_RULES) {
    if (rule.patterns.some((p) => p.test(corpus))) {
      penalty += rule.penalty;
      matched.push(rule.id);
      if (rule.cap !== undefined) {
        cap = cap === undefined ? rule.cap : Math.min(cap, rule.cap);
      }
    }
  }

  for (const rule of POSITIVE_RULES) {
    if (rule.patterns.some((p) => p.test(corpus))) {
      boost += Math.abs(rule.penalty);
      matched.push(`+${rule.id}`);
    }
  }

  return {
    penalty: Math.min(penalty, 40),
    boost: Math.min(boost, 15),
    cap,
    matched,
  };
}

function clampScore(score: number): number {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(score)));
}

export function finalizeRealityScore(
  baseScore: number,
  content: GeneratedContent
): number {
  const { penalty, boost, cap } = analyzeSeverity(content);
  let score = baseScore - penalty + boost;
  if (cap !== undefined) score = Math.min(score, cap);
  return clampScore(score);
}

export function updateRealityCheckScore(
  realityCheck: string,
  score: number
): string {
  const withoutEstimate = realityCheck
    .replace(/\s*Estimated chance of \$1M ARR[^.]*\.?\s*/gi, "")
    .trim();

  const withReplacedPercent = realityCheck.replace(/~\d+%/g, `~${score}%`);
  if (withReplacedPercent !== realityCheck) {
    return withReplacedPercent;
  }

  const base =
    withoutEstimate.length > 0 ? withoutEstimate : realityCheck.trim();
  return `${base} Estimated chance of $1M ARR in 24 months without a clear distribution wedge: ~${score}%.`;
}

/** Align score and reality-check copy with roast, risks, and verdict tone. */
export function alignContentScore(
  content: GeneratedContent
): GeneratedContent {
  const realityScore = finalizeRealityScore(content.realityScore, content);
  return {
    ...content,
    realityScore,
    realityCheck: updateRealityCheckScore(content.realityCheck, realityScore),
  };
}
