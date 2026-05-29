import type { GeneratedContent } from "./section-meta";
import { calibrateRealityScore } from "./score";
import { getVerdictFromScore } from "@/lib/recommendation";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

type IdeaContext = {
  seed: number;
  idea: string;
  domain: string;
  buyer: string;
  wedge: string;
  antiPersona: string;
};

function inferContext(idea: string): IdeaContext {
  const trimmed = idea.trim();
  const lower = trimmed.toLowerCase();
  const seed = hashString(lower);

  if (/marketplace|platform|connect|matching|uber for/.test(lower)) {
    return {
      seed,
      idea: trimmed,
      domain: "two-sided marketplaces",
      buyer: "supply-side operators trying to fill capacity",
      wedge: "liquidity on one side before you obsess over features",
      antiPersona: "users who only show up for promos and never transact",
    };
  }

  if (/b2b|sales|outbound|crm|enterprise|team/.test(lower)) {
    return {
      seed,
      idea: trimmed,
      domain: "B2B workflow tools",
      buyer: "revenue teams with quota pressure and bloated stacks",
      wedge: "one painful daily workflow, not another dashboard",
      antiPersona:
        "IT-led evaluations that take nine months and end in a pilot graveyard",
    };
  }

  if (/consumer|app|mobile|subscription|users/.test(lower)) {
    return {
      seed,
      idea: trimmed,
      domain: "consumer subscriptions",
      buyer: "people with the problem weekly, not once a year",
      wedge: "habit formation in week one, not feature breadth",
      antiPersona: "bargain hunters who churn after the first promo month",
    };
  }

  if (/ai|copilot|gpt|llm|automat/.test(lower)) {
    return {
      seed,
      idea: trimmed,
      domain: "AI-assisted workflows",
      buyer:
        "operators who already pay for the job-to-be-done, not AI tourists",
      wedge: "measurable time saved on one task, not 'AI-powered' branding",
      antiPersona: "teams that want magic without changing how they work",
    };
  }

  return {
    seed,
    idea: trimmed,
    domain: "early-stage software",
    buyer: "founders and small teams with budget authority",
    wedge: "a single painful job done noticeably better",
    antiPersona:
      "enterprises that need SOC 2 before they'll try your landing page",
  };
}

function buildStandardSections(ctx: IdeaContext): GeneratedContent {
  const { seed, domain, buyer, wedge, antiPersona } = ctx;
  const realityScore = calibrateRealityScore(seed, false);

  const verdicts = [
    "Proceed with caution",
    "Promising but unproven",
    "High risk, niche upside",
    "Needs sharper differentiation",
  ] as const;

  const verdict = pick([...verdicts], seed);

  const roastAngles = [
    "Where's the distribution? Who paid you last week?",
    "I've seen this pitch deck nine times this quarter.",
    "Your moat can't be a prompt and a landing page.",
    "Show me pull from customers, not push from your LinkedIn posts.",
  ];

  return {
    problem: `${ctx.idea} — on paper, at least. In practice, ${buyer} in ${domain} already hack together spreadsheets, agencies, and half-broken tools. The pain is real, recurring, and tied to revenue or reputation — but incumbents are one feature launch away from eating your lunch.`,
    targetUsers: [
      `Primary: ${buyer} at companies with 1–50 people and a line item for this problem`,
      "Secondary: consultants and agencies who resell outcomes, not software",
      "Early adopters: people who tried to build this themselves and gave up",
      `NOT: ${antiPersona}`,
    ],
    mvpFeatures: [
      "One input → structured plan in under 90 seconds (no account required for first run)",
      "Kill / proceed verdict with explicit reasoning, not cheerleading",
      "Export to Markdown for co-founder arguments",
      `Wedge test: prove ${wedge} before adding integrations`,
    ],
    userStories: [
      "As a solo founder, I want a brutal plan in one sitting so I don't spend the quarter building the wrong thing.",
      "As a first-time founder, I want investor-style skepticism without scheduling office hours.",
      "As an operator, I want a 30-day validation checklist I can run next week, not someday.",
    ],
    successMetrics: [
      "North star: % of users who mark an idea 'killed' vs. 'building anyway' (honesty signal)",
      "Activation: first full plan in <10 minutes of landing",
      "Retention: 35% WAU at week 4 among users who killed at least one idea",
      "Revenue: $19/mo tier → 6% free-to-paid within 30 days",
    ],
    roadmap: [
      "Week 1: 12 customer discovery calls. No code — manual plans only.",
      "Week 2: Ship generate flow. Charge $29 for concierge autopsies.",
      "Week 3: Save/compare ideas + share links. Target 15 paying users.",
      "Week 4: Launch in founder communities. Track kill rate, not vanity signups.",
    ],
    risks: [
      "Assumption: people want honesty more than hype (often false)",
      "Risk: ChatGPT + a good prompt replaces 80% of the value",
      `Risk: crowded ${domain} — differentiation is storytelling until you have proof`,
      "Risk: founders use this for reassurance, churn when we say 'don't build'",
    ],
    investorRoast: `"${pick([...roastAngles], seed, 1)} You're selling into ${domain} with no repeatable channel yet. ${pick([...roastAngles], seed, 2)} Come back with three prepaid customers and one reason you win besides speed."`,
    realityCheck: `Verdict: ${verdict}. The concept is testable in 30 days if you narrow ICP and stop scope-creeping the MVP. Differentiation and distribution are still unproven — that's normal, but don't confuse a crisp write-up with traction. Estimated chance of $1M ARR in 24 months without a wedge: ~${realityScore}%.`,
    realityScore,
    validationPlan: [
      "List 20 people who already spend money on this job — not friends who 'might use it'",
      "Run 10 problem interviews; ask what they paid last time, not what they'd pay hypothetically",
      "Offer a paid concierge autopsy ($29–$99) before you automate anything",
      "Pre-sell annual access to 3 buyers; refund if you can't deliver value in week one",
      "Kill criterion: fewer than 3 prepaid customers after 30 days of outreach",
    ],
  };
}

function applyBrutality(
  content: GeneratedContent,
  ctx: IdeaContext
): GeneratedContent {
  const { seed, domain } = ctx;
  const realityScore = calibrateRealityScore(seed, true);
  const verdictLabel = getVerdictFromScore(realityScore);

  const realityNotes: Record<string, string> = {
    kill: "Signals are weak — treat this as a pivot candidate unless discovery changes the math.",
    validate: "Not dead, not proven — default path is disciplined validation, not a build sprint.",
    build: "Rare bucket in this mode — you still need receipts, not confidence.",
  };

  const brutalRoasts = [
    "I've seen this movie — great demo, no distribution.",
    "The TAM slide is carrying a product that doesn't clear the bar yet.",
    "You're competing with incumbents who already have the trust budget.",
    "Show me one customer who chased you down — not the other way around.",
  ];

  return {
    ...content,
    investorRoast: `${pick([...brutalRoasts], seed)} You're in ${domain} without a clear wedge. ${pick([...brutalRoasts], seed, 2)} I'd need prepaid demand or a channel you own before I'd take another meeting."`,
    realityCheck: `Verdict (${verdictLabel}): ${realityNotes[verdictLabel] ?? realityNotes.validate} Most founders overestimate odds; this lands at ~${realityScore}% for $1M ARR in 24 months without a distribution wedge — adjust up only with evidence, not enthusiasm.`,
    realityScore,
    validationPlan: [
      "Write three falsifiable reasons this idea fails — then try to disprove each one in a week",
      "Interview 10 buyers who said no to similar products; document why, verbatim",
      "Run a 'kill week': only ask questions designed to surface dealbreakers, not encouragement",
      "Attempt to get 5 people to pay upfront; count how many ghost you — that's your signal",
      "If you can't articulate why incumbents lose on one slide, stop building and walk away",
      "Success = clear evidence you should kill it; building anyway is a conscious bet, not denial",
    ],
  };
}

/**
 * Mock generator — personalizes tone and domain without repeating the idea everywhere.
 * Used when OPENAI_API_KEY is not set.
 */
export function generateMockContent(
  idea: string,
  brutalityMode = false
): GeneratedContent {
  const ctx = inferContext(idea);
  const base = buildStandardSections(ctx);
  return brutalityMode ? applyBrutality(base, ctx) : base;
}
