import { alignContentScore } from "./align-score";
import type { GeneratedContent } from "./section-meta";
import { calibrateRealityScore } from "./score";
const ARCHETYPE_SCORE_BIAS: Record<IdeaArchetype, number> = {
  interview: -2,
  "chief-of-staff": 2,
  "job-offer-risk": 0,
  "founder-validation": 0,
  "founder-therapy": -4,
  "email-meeting": 0,
  linkedin: -2,
  subscription: 1,
  "b2b-sales": 3,
  marketplace: -3,
  "chrome-extension": 0,
  general: 0,
};

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

type IdeaArchetype =
  | "interview"
  | "chief-of-staff"
  | "job-offer-risk"
  | "founder-validation"
  | "founder-therapy"
  | "email-meeting"
  | "linkedin"
  | "subscription"
  | "b2b-sales"
  | "marketplace"
  | "chrome-extension"
  | "general";

type IdeaProfile = {
  seed: number;
  idea: string;
  archetype: IdeaArchetype;
};

function detectArchetype(lower: string): IdeaArchetype {
  if (
    /interview|hiring|recruit|transcri|note-taking|scorecard|candidate|anti-cheat/.test(
      lower
    )
  ) {
    return "interview";
  }
  if (
    /chief of staff|slack.*(email|meeting)|watches slack|forgot to do/.test(
      lower
    )
  ) {
    return "chief-of-staff";
  }
  if (
    /job offer|accept a job|before you join|startup.*die|likely.*die/.test(
      lower
    ) &&
    /extension|browser/.test(lower)
  ) {
    return "job-offer-risk";
  }
  if (
    /google sheet|sheet with anxiety|startup idea is secretly/.test(lower)
  ) {
    return "founder-validation";
  }
  if (/linkedin|humblebrag|plain english/.test(lower)) {
    return "linkedin";
  }
  if (
    /subscription|churn|retention|monthly box|dog owner|vet-grade|supplement/.test(
      lower
    )
  ) {
    return "subscription";
  }
  if (
    /salesforce|crm|sales call|outbound|cold email|sdr|b2b/.test(lower)
  ) {
    return "b2b-sales";
  }
  if (/email/.test(lower) && /meeting/.test(lower)) {
    return "email-meeting";
  }
  if (/marketplace|two-sided|uber for|matching/.test(lower)) {
    return "marketplace";
  }
  if (
    /therapy|pivot/.test(lower) &&
    /founder/.test(lower)
  ) {
    return "founder-therapy";
  }
  if (/chrome extension|browser extension/.test(lower)) {
    return "chrome-extension";
  }
  return "general";
}

function profileIdea(idea: string): IdeaProfile {
  const trimmed = idea.trim();
  const lower = trimmed.toLowerCase();
  return {
    seed: hashString(lower),
    idea: trimmed,
    archetype: detectArchetype(lower),
  };
}

type SectionBuilder = (profile: IdeaProfile) => Omit<GeneratedContent, "realityScore">;

const ARCHETYPE_BUILDERS: Record<IdeaArchetype, SectionBuilder> = {
  interview: (p) => {
    const antiCheat = /anti-cheat|bypass|protection/i.test(p.idea);
    return {
    problem: antiCheat
      ? `${p.idea} — recruiters do need better debriefs, but anything that looks like bypassing anti-cheating or surveillance rules is a legal minefield before it's a product. The pain is real; the compliance story is the whole company.`
      : `${p.idea} — hiring teams actually need comparable signal when IT kills recording and transcription. That's a real budget line (bad hires, agency fees, HM time). The catch: legal and security will fight you the second you look like you're smuggling data out of interviews.`,
    targetUsers: [
      "In-house recruiters running 8–20 structured interviews per week at 200–2,000 person companies",
      "Hiring managers who own debriefs but refuse another tab in Greenhouse",
      "Recruiting ops leads writing compliance rules after a recorded interview leaks",
      "NOT: campus recruiting at firms that still allow full recording everywhere",
    ],
    mvpFeatures: [
      "Live prompt panel that works with manual typing only — no audio upload required",
      "Post-interview scorecard that maps answers to rubric competencies in under 3 minutes",
      "\"Compliance mode\" export: what was said, what was inferred, what cannot be stored",
      "Side-by-side candidate comparison on rubric scores, not transcript length",
    ],
    userStories: [
      "As a recruiter, I want suggested follow-up questions when a candidate gives a vague product answer so I don't leave the loop wishing I'd probed harder.",
      "As a hiring manager, I want a one-page debrief I can paste into Greenhouse without rewatching anything.",
      "As recruiting ops, I want defaults that auto-redact PII so legal stops blocking my pilot.",
    ],
    successMetrics: [
      "North star: debriefs submitted within 2 hours of interview (target: 70%+)",
      "Quality: hiring manager edits <20% of auto-generated scorecard bullets",
      "Retention: 3+ interviews/week per seat for 4 consecutive weeks",
      "Revenue: $79/seat/mo when teams replace one agency interview-prep license",
    ],
    roadmap: [
      "Week 1: Shadow 5 recruiters through live loops — document what they do when Zoom AI is off",
      "Week 2: Manual scorecards for 10 interviews; charge $199 for a 'debrief sprint' pilot",
      "Week 3: Ship typing-only copilot + PDF export; integrate read-only with Greenhouse",
      "Week 4: Measure whether HM hire/no-hire confidence rises vs. their last 10 hires",
    ],
    risks: [
      "Assumption: teams will type during interviews instead of treating it as surveillance",
      "Risk: Greenhouse/Lever ship native rubric AI and bundle it free",
      "Risk: candidates complain — employer brand damage kills rollout",
      "Risk: you're a feature inside Metaview/HireVue's enterprise bundle within 18 months",
    ],
    investorRoast: antiCheat
      ? `"Congrats, you invented 'Zoom but the compliance team hates you.' I'll tweet the deck for the memes, not the check."`
      : pick(
          [
            `"Your pitch is 'Greenhouse, but we type faster.' I've got 200 apps in my inbox that say that. Bring me one Head of Talent who disabled recording and still paid you."`,
            `"Legal will treat you like malware with a pricing page. Fun roast, scary term sheet."`,
          ],
          p.seed
        ),
    realityCheck: antiCheat
      ? "Bypassing interview protections is the kind of idea that gets a cease-and-desist before it gets ARR. Validate only if counsel signs off in writing — otherwise this is a kill."
      : pick(
          [
            "There's real pain when tools get disabled — teams still debrief on vibes. Worth testing with recruiters who already work under no-recording rules, but legal review will pace your revenue.",
            "Could work as compliance-friendly scorecards, not shadow recording. Distribution is HR leaders who already feel post-interview chaos.",
          ],
          p.seed,
          1
        ),
    validationPlan: [
      "Get 8 recruiters to forward you their 'tools disabled' email from IT — that's your ICP filter",
      "Run 5 live interviews where you only take notes by hand + your product; compare HM satisfaction to their norm",
      "Ask: \"What did you pay for Metaview, BrightHire, or interview prep last year?\"",
      "Pre-sell a 30-day pilot to one eng hiring loop — success = they renew without you chasing",
      "Kill if legal blocks 2 pilots in a row for the same reason (recording, storage, or candidate consent)",
    ],
  };
  },

  "chief-of-staff": (p) => ({
    problem: `${p.idea} — founders already drown in Slack, email, and calendar debris; the pain is forgetting the follow-through, not lacking another dashboard. Teams pay for chiefs of staff, EAs, and tools like Notion reminders — so budget exists. The hard part: trust, privacy, and not becoming Clippy with a YC bio.`,
    targetUsers: [
      "Seed founders with 3–15 people and no EA yet",
      "COOs at startups where the CEO is the bottleneck on every decision",
      "Founders who live in Slack but still drop balls on fundraising, hiring, and customer follow-ups",
      "NOT: enterprises that require on-prem and 6-month security reviews on day one",
    ],
    mvpFeatures: [
      "Read-only Slack + Gmail connectors; daily \"you dropped these 5 threads\" digest",
      "Meeting summary → action items with owners (no auto-send without approval)",
      "Founder-only snooze: \"remind me when investor X goes quiet for 3 days\"",
    ],
    userStories: [
      "As a founder, I want a 7am list of promises I made yesterday so I don't ghost investors.",
      "As a co-founder, I want shared accountability without another project management cult.",
      "As a CEO, I want prep for board week without re-reading 400 Slack threads.",
    ],
    successMetrics: [
      "North star: actions marked done within 48h of surfacing",
      "Retention: 5+ digests opened per week for 4 weeks",
      "Willingness to pay: $49–99/mo founder tier with <10% churn month 2",
      "Trust: zero incidents of misfired external messages in pilot",
    ],
    roadmap: [
      "Week 1: 10 founders forward inboxes manually — you send the digest by hand",
      "Week 2: Slack read-only OAuth + one-click approve actions",
      "Week 3: Charge $49; measure balls dropped vs. baseline week",
      "Week 4: Add calendar context; kill features that founders ignore",
    ],
    risks: [
      "Assumption: founders grant inbox access — many won't",
      "Risk: Slack or Google changes API terms",
      "Risk: one wrong auto-send destroys trust forever",
      "Risk: incumbents (Notion AI, Superhuman) add \"founder chief\" templates",
    ],
    investorRoast: `"You're building a chief of staff that reads everything and apologizes later. My DMs are already a cemetery of 'AI executive assistant' launches — screenshot this roast, not my term sheet."`,
    realityCheck:
      "Pain is obvious and founders already spend on EAs and chaos tax. Distribution is founder Twitter and accelerators — crowded, but plausible. Score hinges on trust and retention, not novelty.",
    validationPlan: [
      "Run manual digests for 8 founders — they must reply \"caught something I missed\"",
      "Ask what they pay EA/tools today — need a number, not vibes",
      "Pre-sell $49/mo before auto-actions ship",
      "Kill if <4 of 8 still want week 3 digest",
    ],
  }),

  "job-offer-risk": (p) => ({
    problem: `${p.idea} — candidates want the truth before they join; Glassdoor is stale and the recruiter is literally paid to lie. A sharp take on runway, churn, and founder drama could spread. Monetization is fuzzy (candidates don't pay much), but virality and recruiting partnerships exist.`,
    targetUsers: [
      "Senior engineers comparing two startup offers",
      "PMs leaving Big Tech who want signal beyond the recruiter deck",
      "Recruiters who want to pre-qualify fit (controversial)",
      "NOT: new grads optimizing for brand names only",
    ],
    mvpFeatures: [
      "Paste offer details + company → risk report (runway, layoff news, glassdoor drift)",
      "Chrome overlay on Greenhouse/LinkedIn job pages",
      "Shareable \"offer autopsy\" card (viral loop)",
    ],
    userStories: [
      "As a candidate, I want to know if the startup is default-alive before I sign.",
      "As a founder hiring, I want fewer surprises when candidates ghost after reading Reddit.",
      "As a user, I want one meme-quality line I can send the group chat.",
    ],
    successMetrics: [
      "North star: reports generated per active user per week",
      "Virality: 20% share report externally",
      "Revenue: $19 one-off report or B2B recruiter seats",
      "Accuracy: users rate \"would have changed decision\" >30%",
    ],
    roadmap: [
      "Week 1: Manually research 15 companies; publish teardown threads",
      "Week 2: Ship paste-box MVP; no extension",
      "Week 3: Chrome extension on job pages; track shares",
      "Week 4: Pitch recruiting firms on white-label reports",
    ],
    risks: [
      "Assumption: candidates pay — many want free tea only",
      "Risk: libel if you're wrong about runway",
      "Risk: founders attack you for hurting hiring",
      "Risk: data sources stale → wrong advice",
    ],
    investorRoast: `"You're the Glassdoor for people who still think they're joining Stripe. Fun product, brutal liability, and candidates won't subscribe."`,
    realityCheck:
      "Memorable and shareable; pain is real for candidates. Business model and legal risk keep this in validate territory unless you nail data sources and a paying channel.",
    validationPlan: [
      "Ship 20 manual reports; need 500 waitlist signups",
      "Ask users: \"Would you pay $19 before signing?\"",
      "Talk to one recruiting agency about sponsored reports",
      "Kill if share rate <10% after 100 reports",
    ],
  }),

  "founder-validation": (p) => ({
    problem: `${p.idea} — founders don't lack ideas; they lack a forcing function before they register a domain. Most \"validation\" is a Notion page, a Twitter poll, and convincing themselves that annoyance equals willingness to pay. Your bet: make that embarrassment visible before they spend six months building.`,
    targetUsers: [
      "Solo founders about to quit their job for an idea they haven't sold yet",
      "Two-person teams where one founder is hype and the other is nervous",
      "Accelerator applicants who need a sanity check before demo day narratives harden",
      "NOT: VCs doing diligence — they want data rooms, not cheeky diagnostics",
    ],
    mvpFeatures: [
      "Paste idea → get a blunt \"sheet vs. startup\" score with specific missing proof",
      "Checklist of 5 experiments that cost <$500 and take <14 days",
      "Shareable roast card founders can post (viral loop, if they're brave enough)",
      "Compare 2 ideas side-by-side on the same rubric",
    ],
    userStories: [
      "As a founder, I want to know if I'm building a feature, a consulting gig, or a company before I incorporate.",
      "As a co-founder, I want a third-party jerk in the room so we stop debating vibes.",
      "As an accelerator lead, I want fellows to arrive with kill criteria already documented.",
    ],
    successMetrics: [
      "North star: % of runs that end in \"don't build yet\" (if it's always \"build,\" you're a toy)",
      "Activation: first roast shared to X/LinkedIn within 24h",
      "Retention: founder runs 2+ ideas in 30 days",
      "Revenue: $29 one-time deep dive or $12/mo for unlimited roasts",
    ],
    roadmap: [
      "Week 1: Roast 20 ideas manually in DMs; collect which lines make founders angry vs. act",
      "Week 2: Ship automated version; charge $29 for \"founder autopsy\" calls",
      "Week 3: Add experiment templates (pre-sell, fake door, concierge)",
      "Week 4: Partner with one micro-VC or accelerator for cohort batch runs",
    ],
    risks: [
      "Assumption: founders will pay to feel bad — many want validation, not truth",
      "Risk: ChatGPT + one good prompt replaces 90% of the roast",
      "Risk: you're marketing entertainment, not outcomes — novelty churn after one post",
      "Risk: YC partners telling founders \"just talk to users\" steals your authority",
    ],
    investorRoast: pick(
      [
        `"You're selling a mirror to people who came for a hug. What's the retention after the first roast tweet? I've seen 40 'startup idea graders' die in Consumer × Founder Twitter."`,
        `"Your CAC is founder memes and your LTV is one session. Where's the data asset that compounds?"`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Fun, shareable, possibly viral — but the paying customer is narrow. Works if you become the default step before incorporation, not a one-off party trick.",
        "Strong copy angle; weak moat unless you store longitudinal kill/build decisions and prove you saved runway.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "Charge 15 founders $29 before they see full output — refund if NPS < 8",
      "Track: did they run the suggested experiment within 7 days? (follow-up email)",
      "Interview founders who killed ideas — what convinced them?",
      "Kill if >60% say \"fun but I built anyway\" after paying",
      "Double down only if 3+ refer another founder unprompted",
    ],
  }),

  "founder-therapy": (p) => ({
    problem: `${p.idea} — the unspoken problem is that founders can't tell burnout from a bad market, and therapists don't understand cap tables. You're sitting in an awkward overlap: mental health stigma on one side, and \"just pivot\" cargo culting on the other. The product only works if people trust you with both their feelings and their P&L.`,
    targetUsers: [
      "Seed founders who hit PMF doubt after 18 months of grinding",
      "Former big-company builders turned founders who feel guilty about slowing down",
      "Founder spouses/partners who see the crash before the board does",
      "NOT: clinical patients needing licensed care — you'll create liability",
    ],
    mvpFeatures: [
      "20-minute structured intake: symptoms vs. business facts (runway, growth, co-founder conflict)",
      "Decision tree output: rest / pivot / persevere with explicit triggers",
      "Warm handoff copy to licensed therapists who take founders (curated list, not therapy itself)",
      "Private journal export founders can bring to a real counselor",
    ],
    userStories: [
      "As a founder, I want to know if I'm avoiding hard company decisions because I'm depressed.",
      "As a founder, I want a framework my co-founder will accept so \"pivot\" isn't just panic.",
      "As a coach, I want a prep packet before our session so we don't waste hour one on context.",
    ],
    successMetrics: [
      "North star: self-reported \"clarity score\" +7 points after session (be honest in surveys)",
      "Safety: 100% of crisis-language flags routed to human-reviewed resources",
      "Retention: 2+ check-ins in 30 days without feeling like a clinical app",
      "Revenue: $49/session or $129/mo founder membership — only if licensed partners co-sign",
    ],
    roadmap: [
      "Week 1: Interview 12 founders who pivoted — how did they know it wasn't just burnout?",
      "Week 2: Partner with 2 licensed therapists for paid pilot disclaimers",
      "Week 3: Ship intake + decision memo; no AI diagnosis language",
      "Week 4: Measure whether users took a concrete company action within 14 days",
    ],
    risks: [
      "Assumption: founders will admit mental strain to a software product",
      "Risk: practicing medicine without a license — one bad outcome ends the company",
      "Risk: pivot advice is wrong but confident — destroys trust and maybe the company",
      "Risk: free therapy benefits at employers absorb this as EAP feature",
    ],
    investorRoast: pick(
      [
        `"You're one bad week away from a TechCrunch headline you won't survive. Who's your clinical director? What's your malpractice carrier?"`,
        `"Founders will tell their therapist things they'll never tell your onboarding form. This might be a newsletter, not a venture scale business."`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Important problem, brutal regulatory and trust bar. Could work as a curated founder coaching layer — not as \"AI therapy.\"",
        "If you're not licensed and not peer-led with real clinicians, stay tiny and charge for clarity memos, not treatment.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "Run 10 paid sessions with licensed advisor in the loop — you take notes only",
      "Ask users: \"What action did you take within 48h?\" — pivot counts only with written criteria",
      "Kill if anyone describes it as replacing therapy",
      "Pre-sell 5 founders at $199 for monthly check-in — must renew month 2",
      "Do not scale paid ads until legal review of copy in your top 3 states",
    ],
  }),

  "email-meeting": (p) => ({
    problem: `${p.idea} — everyone's inbox is a graveyard of threads that should've been two lines or one 15-minute call. The pain isn't reading email faster; it's the social cost of pushing back when calendar culture treats responsiveness as performance. Your extension wins only if it feels like backing someone up, not calling them lazy.`,
    targetUsers: [
      "ICs at 100–500 person companies drowning in cross-functional threads",
      "EMs and PMs who become accidental meeting machines",
      "Chiefs of staff and chiefs of chaos who guard exec calendars",
      "NOT: external sales reps — their job is meetings",
    ],
    mvpFeatures: [
      "Gmail/Outlook sidebar: \"meeting risk\" score with one-sentence rationale",
      "Suggested reply: \"This can be async\" template tuned to tone (boss vs. peer)",
      "Weekly personal stats: hours saved vs. meetings accepted",
      "Snooze + summarize thread before you accept calendar invite",
    ],
    userStories: [
      "As a PM, I want a nudge before I click Accept so I stop bleeding afternoons.",
      "As an IC, I want polite pushback language my manager won't read as attitude.",
      "As a team lead, I want aggregate meeting load on my reports without surveillance vibes.",
    ],
    successMetrics: [
      "North star: meetings declined or shortened within 7 days of install",
      "Activation: first \"saved you a meeting\" notification within 48h",
      "Retention: extension active 4 weeks later on workdays",
      "Revenue: $8/mo individual or $12/seat team — must beat \"just use email rules\"",
    ],
    roadmap: [
      "Week 1: Install on 10 volunteers; log threads they regret turning into meetings",
      "Week 2: Chrome Web Store MVP — Gmail only, English only",
      "Week 3: Add Outlook if 3 teams ask; charge teams $99/mo up to 20 seats",
      "Week 4: Publish anonymized \"meeting could've been email\" leaderboard for viral demo",
    ],
    risks: [
      "Assumption: people want to be told their email should stay email — politics vary by culture",
      "Risk: Google/Microsoft ship \"meeting likelihood\" in native client",
      "Risk: managers interpret tool as disengagement",
      "Risk: privacy review blocks reading email content on enterprise Google Workspace",
    ],
    investorRoast: pick(
      [
        `"Superhuman already lives in the inbox. What's your distribution — Product Hunt and pray?"`,
        `"Calendly, Slack, and every 'async culture' consultant already sell this narrative. You're a feature."`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Relatable pain, crowded graveyard of productivity extensions. Win on tone and manager-safe defaults, not ML.",
        "Enterprise sales are slow; prosumer viral is possible but rarely durable at $1M ARR.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "Ship to 30 users; measure accepted invites before/after for 2 weeks",
      "Ask: \"Did anyone get mad at you for using this?\" — if yes, fix tone",
      "Team pilot: one eng manager sponsors 8 seats prepaid",
      "Kill if <40% still installed after 30 days",
      "Don't build Outlook until Gmail cohort proves habit",
    ],
  }),

  linkedin: (p) => ({
    problem: `${p.idea} — LinkedIn rewards performance posting. Founders, sellers, and job-seekers need to decode what's being sold versus what's being said. The gap isn't literacy; it's that calling out humblebrags out loud burns bridges. A private translator has snackable value; a public one has meme value.`,
    targetUsers: [
      "Founders fundraising who need to parse investor posts without eye strain",
      "Job seekers trying to read team culture between the lines of VP posts",
      "B2B sellers researching prospects before calls",
      "NOT: people who earn reach from posting humblebrags themselves",
    ],
    mvpFeatures: [
      "Paste post URL or text → plain-English translation + \"what they want from you\"",
      "Tone slider: cynical founder / recruiter / journalist",
      "Browser extension overlay on feed (read-only, no auto-posting)",
      "Share card generator for quote-tweet dunking (optional, viral)",
    ],
    userStories: [
      "As a founder, I want to know if a \"thrilled to announce\" post means they're actually growing.",
      "As a seller, I want prep bullets before a discovery call based on their last 5 posts.",
      "As a user, I want entertainment without commenting something I'll regret.",
    ],
    successMetrics: [
      "North star: translations per weekly active user (target: 10+)",
      "Virality: share cards posted to X with watermark",
      "Retention: 3+ week streak during job search or fundraise",
      "Revenue: $6/mo consumer or $19/mo power seller tier",
    ],
    roadmap: [
      "Week 1: Manually translate 50 viral posts; tweet the best; measure follows",
      "Week 2: Ship paste-box MVP; no extension yet",
      "Week 3: Chrome overlay for feed; watch LinkedIn ToS like a hawk",
      "Week 4: Launch \"plain English\" digest newsletter as backup channel",
    ],
    risks: [
      "Assumption: LinkedIn doesn't throttle or block unofficial clients",
      "Risk: model outputs libel-adjacent insults — one screenshot kills you",
      "Risk: novelty wears off after the joke format gets copied",
      "Risk: LinkedIn adds native \"summarize tone\" in Creator tools",
    ],
    investorRoast: pick(
      [
        `"You're a meme generator with ARR aspirations. Where's the B2B buyer who expenses this?"`,
        `"LinkedIn's API story is a graveyard. You're one policy change from zero."`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Great top-of-funnel energy; hard to defend. Might be a media brand, not a SaaS company.",
        "If sellers pay, prove it books meetings — not just laughs.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "Post 20 translations manually; need 1,000 email signups to justify build",
      "Charge $49/year early access before extension exists",
      "Interview 10 sellers: did translation change their outbound?",
      "Kill if LinkedIn sends cease & desist on extension prototype",
      "Track whether users return after fundraising/job hunt ends — expect churn cliff",
    ],
  }),

  subscription: (p) => ({
    problem: `${p.idea} — dog parents already spend silly money on health and treats; vet-grade positioning can mean real repeat buying if the product delivers. Subscription boxes live or die on month-two retention, not launch-day Twitter. The pain is trust (is this actually vet-grade?) and churn, not lack of dog owners.`,
    targetUsers: [
      "DTC founders with 500–5,000 active subscribers and rising cancel rates",
      "Subscription box founders whose COGS eat revival campaigns",
      "Consumer apps with annual plans and weak week-4 habit",
      "NOT: enterprise SaaS with 12-month contracts — different physics",
    ],
    mvpFeatures: [
      "Cancel flow interceptor with offer experiments (pause, skip, downgrade)",
      "Cohort dashboard: which SKU/acquisition channel churns fastest",
      "Win-back SMS/email sequences triggered by payment failure, not guesswork",
      "Post-cancel survey that feeds one actionable weekly founder memo",
    ],
    userStories: [
      "As a DTC founder, I want to know if churn is price, product, or novelty before I discount.",
      "As a growth lead, I want to see which influencer drove tourists who cancel in 30 days.",
      "As a customer, I want an honest pause option so I don't chargeback.",
    ],
    successMetrics: [
      "North star: net revenue retention on pilot brands (target: +5–8 points in 90 days)",
      "Activation: first cancel-save or survey insight within 14 days of install",
      "Retention: founder checks memo 3 Mondays in a row",
      "Revenue: % of saved MRR or flat $299/mo per brand",
    ],
    roadmap: [
      "Week 1: Pull Stripe + Shopify data for 3 friendly brands; find top cancel reasons",
      "Week 2: Ship cancel flow A/B for one brand; measure save rate",
      "Week 3: Add win-back automation; charge on performance + base fee",
      "Week 4: Case study: dollars saved vs. your fee — that's your only sales deck",
    ],
    risks: [
      "Assumption: brands will let you touch cancel flow (many treat it as sacred)",
      "Risk: Recharge, Skio, or Stripe apps copy saves in one sprint",
      "Risk: saving discounts trains customers to threaten cancel for coupons",
      "Risk: you're blamed when product quality is the real issue",
    ],
    investorRoast: pick(
      [
        `"Retention tooling is a graveyard of agencies pretending to be software. What's your hook beyond a prettier exit survey?"`,
        `"Show me incremental gross profit saved, not emails sent."`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Real economics if you move save rate on real volume. Commodity unless you own the cancel moment in Shopify checkout.",
        "Performance pricing aligns incentives — use it or you'll look like another churn dashboard.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "One brand gives you cancel flow access — baseline save rate documented",
      "Run 2 offer variants; need statistically visible lift (even n=200)",
      "Ask CFO: \"What's save rate worth per point?\" — price from that",
      "Kill if save rate doesn't beat their control in 30 days",
      "Expand only when referral comes from another DTC founder, not agency",
    ],
  }),

  "b2b-sales": (p) => ({
    problem: `${p.idea} — sales teams already pay for CRM hygiene and call intelligence; updating Salesforce after calls is a tax everyone recognizes. Pain is obvious, budget exists (Gong, Chorus, CRM add-ons). You still have to beat incumbents and prove reps actually use it daily.`,
    targetUsers: [
      "Founders selling $5k–$50k ACV deals themselves before first sales hire",
      "5-person outbound teams at Series A SaaS with flat reply rates",
      "Agencies white-labeling outbound for clients who blame the tool",
      "NOT: enterprise reps with 9-month cycles and SE support",
    ],
    mvpFeatures: [
      "ICP scrape + reason-to-reach-out line tied to a specific trigger (funding, hiring, tech stack)",
      "Reply-rate board by subject line and first sentence — no vanity opens",
      "CRM push (HubSpot only) with \"why this thread died\" post-mortem",
      "Founder mode: 20 high-quality emails/day cap to prevent spray-and-pray",
    ],
    userStories: [
      "As a founder, I want 10 emails that sound like I researched them, not a sequence factory.",
      "As an SDR lead, I want to kill templates that get marked spam.",
      "As a buyer, I want to understand why you're emailing in 5 seconds or I archive.",
    ],
    successMetrics: [
      "North star: positive reply rate on pilot inboxes (benchmark: 5%+ for cold)",
      "Activation: first sent campaign within 48h of signup",
      "Retention: inbox connected 8 weeks later",
      "Revenue: $99/seat/mo or 10% of pipeline sourced — pick one model",
    ],
    roadmap: [
      "Week 1: Send 200 emails manually for 2 founders; document what got replies",
      "Week 2: Productize only the steps that changed outcomes — not whole stack",
      "Week 3: HubSpot integration; charge $99 after 14-day reply-rate trial",
      "Week 4: Publish reply-rate teardown thread — sell methodology, not AI",
    ],
    risks: [
      "Assumption: better copy beats list quality — it usually doesn't",
      "Risk: email providers throttle new domains — your customers blame you",
      "Risk: incumbents bundle generative copy free",
      "Risk: CAC via paid ads exceeds LTV on $99 seat",
    ],
    investorRoast: pick(
      [
        `"Apollo has the data, Outreach has the seat, OpenAI has the sentence. You're renting positioning."`,
        `"Where's one customer who 3× reply rate and will say it on a reference call?"`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Crowded, but founders still pay when reply rate moves. You need a narrow vertical (e.g., dev tools to CTOs) not \"all B2B.\"",
        "Distribution is the product — cold email tools without a list wedge are dead on arrival.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "Run founder-led outbound for 2 customers — charge for results + tool",
      "Track positive replies per 100 sends; kill if below their baseline",
      "Ask: \"What tool did you cancel to try this?\" — budget replacement signal",
      "Pre-sell 3 annual seats before building sequences feature",
      "Kill if deliverability issues hit >30% of pilots",
    ],
  }),

  marketplace: (p) => ({
    problem: `${p.idea} — marketplaces fail when you launch before one side shows up drunk and the other leaves early. Chicken-and-egg isn't a slide — it's Tuesday. Until density exists in one city, one vertical, or one supply niche, you're running a classifieds site with extra steps.`,
    targetUsers: [
      "Supply-side hustlers who need utilization (drivers, hosts, freelancers, clinics)",
      "Demand with urgent, repeat need — not one-off curiosity clicks",
      "City or vertical launcher who can physically shake hands with first 50 suppliers",
      "NOT: national launch day fantasies",
    ],
    mvpFeatures: [
      "Manual concierge matching in one geography — software records outcomes only",
      "Supply onboarding in <10 minutes with instant \"first job\" guarantee",
      "Demand waitlist with SLA promise (\"matched in 2 hours or credit\")",
      "Ledger both sides trust for payment disputes",
    ],
    userStories: [
      "As supply, I want my first paid gig this week, not a profile in a desert.",
      "As demand, I want to trust quality without reading 40 reviews on day one.",
      "As launcher, I want to see liquidity by hour, not MAU.",
    ],
    successMetrics: [
      "North star: % of supply active 4+ times in 14 days",
      "Liquidity: median time to match <2 hours in pilot city",
      "Repeat: 40%+ demand comes back within 30 days",
      "Take rate: only raise after 100 completed transactions",
    ],
    roadmap: [
      "Week 1: 30 supply interviews — what would make them try a new channel?",
      "Week 2: Hand-match 50 transactions via text + spreadsheet",
      "Week 3: Ship thin app; still phone concierge for edge cases",
      "Week 4: One neighborhood or vertical only — resist expansion FOMO",
    ],
    risks: [
      "Assumption: you can subsidize one side long enough to matter",
      "Risk: incumbents drop fees in your wedge overnight",
      "Risk: disintermediation — users exchange numbers after match one",
      "Risk: regulatory surprise in your vertical (health, labor, money transmission)",
    ],
    investorRoast: pick(
      [
        `"Uber for X is where venture dollars go to nap. What's your liquidity proof in one zip code?"`,
        `"Two-sided markets need a concrete wedge — what's yours besides an app?"`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Marketplaces are valid and brutal. Your idea lives or dies on launcher hustle, not feature lists.",
        "If you're not willing to be the first 500 matches yourself, don't raise.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "Complete 50 manual matches before custom dev beyond landing + SMS",
      "Measure repeat from demand — one-time tourists mean kill",
      "Ask supply: \"What % of income would this need to be to go full-time?\"",
      "Kill if match time stalls above 24h for a week",
      "Expand geography only when week-over-week repeat grows without subsidies",
    ],
  }),

  "chrome-extension": (p) => ({
    problem: `${p.idea} — browser extensions die on permissions scares, broken Manifest updates, and users who install once then forget. The job has to be so obvious in the first 60 seconds that reinstalling after a laptop swap is automatic.`,
    targetUsers: [
      "Knowledge workers living in Gmail, Notion, or Salesforce tabs",
      "Teams who won't approve another SaaS login but will tolerate an extension",
      "Power users who pay $5–15/mo for personal productivity",
      "NOT: mobile-first users — wrong surface",
    ],
    mvpFeatures: [
      "Single-job extension: do one thing when you click the icon, no settings maze",
      "Onboarding in 3 screens max with instant \"aha\" on current tab",
      "Usage reminder only when context matches (not daily spam notifications)",
      "Export/snippet copy to clipboard — frictionless output",
    ],
    userStories: [
      "As a user, I want the extension to work on the tab I already have open.",
      "As a user, I want to know what data leaves my browser before I pin it.",
      "As a team lead, I want optional SSO later — not day one.",
    ],
    successMetrics: [
      "North star: 3+ meaningful uses per week per install",
      "Store: 4.5+ rating with <5% \"doesn't work on my setup\" reviews",
      "Retention: still pinned after 28 days",
      "Revenue: $7/mo pro or team pack at $5/seat × 10 min",
    ],
    roadmap: [
      "Week 1: 15 user tests on install → first value moment; cut every extra click",
      "Week 2: Chrome Web Store submit; soft launch in one community",
      "Week 3: Fix top 3 breakage reports (Gmail vs. Superhuman vs. Outlook web)",
      "Week 4: Add team billing only if 5 teams asked unprompted",
    ],
    risks: [
      "Assumption: Chrome Web Store discovery replaces marketing (it won't)",
      "Risk: platform policy change bricks core feature",
      "Risk: users fear extension reading page content",
      "Risk: host app UI change breaks selector overnight",
    ],
    investorRoast: pick(
      [
        `"Extensions are hobbies until they're distribution. What's your path to 100k weekly active without SEO spam?"`,
        `"Google can unlist you before your seed closes."`,
      ],
      p.seed
    ),
    realityCheck: pick(
      [
        "Viable as a focused prosumer tool if job-to-be-done is razor thin and review-proof.",
        "Team expansion is rare; plan for solo payments and brutal support load.",
      ],
      p.seed,
      1
    ),
    validationPlan: [
      "Ship MVP; 100 installs organically — no paid ads",
      "Watch uninstall reasons in survey popup",
      "Pre-sell annual to 20 users at $49 before team features",
      "Kill if week-4 retention <25%",
      "Document exactly which host pages break — if >3, narrow scope",
    ],
  }),

  general: (p) => {
    const snippet =
      p.idea.length > 120 ? `${p.idea.slice(0, 117)}…` : p.idea;
    return {
      problem: `${snippet} — the interesting question is whether anyone will pay before Notion, spreadsheets, and a half-built competitor already solve "good enough." Pain has to show up on a calendar or a P&L, not just in a founder's head at 11pm.`,
      targetUsers: [
        "People who already spend money or time hacking a workaround for this exact job",
        "Small teams (2–15) who can buy with a credit card in one meeting",
        "Early adopters who tried the DIY version and hit a wall",
        "NOT: enterprises that need security review before a pilot",
      ],
      mvpFeatures: [
        "One screen that delivers the core outcome in under 5 minutes",
        "Export or shareable output a buyer can forward to a skeptical co-founder",
        "Usage cap on free tier that forces a paid decision after real value",
        "Manual concierge backdoor for first 10 customers — learn before you automate",
      ],
      userStories: [
        "As a buyer, I want to finish the job today without onboarding calls.",
        "As a founder selling this, I want proof users returned unprompted in week two.",
        "As a skeptic, I want to see what I get before I connect my main account.",
      ],
      successMetrics: [
        "North star: weekly active users completing the core job (define it numerically)",
        "Activation: first success <1 hour from signup",
        "Retention: 30% still active week 4",
        "Revenue: first 10 customers pay before you build v2",
      ],
      roadmap: [
        "Week 1: 15 interviews — last time they spent money on this problem",
        "Week 2: Concierge delivery for 5 users; charge even if product is ugly",
        "Week 3: Ship thinnest automated version; measure drop-off step by step",
        "Week 4: Double down on the acquisition channel that brought paying users",
      ],
      risks: [
        "Assumption: the job is frequent enough to support subscription",
        "Risk: incumbents add your feature as a checkbox",
        "Risk: you're selling vitamins — nice, not necessary",
        "Risk: founders are the only users (tiny market)",
      ],
      investorRoast: pick(
        [
          `"I still don't know who writes the check or why they can't live without this in 90 days."`,
          `"Your demo is clear; your distribution story is missing."`,
        ],
        p.seed
      ),
      realityCheck: pick(
        [
          "Could be real; needs sharper ICP and proof someone prepaid. Default stance: validate before you code.",
          "Write down the kill criterion now — most ideas fail distribution, not product.",
        ],
        p.seed,
        1
      ),
      validationPlan: [
        "Find 10 people who paid for something adjacent in the last 12 months",
        "Pre-sell 3 at a price that hurts slightly — refunds if no value week one",
        "Run one channel hard (community, outbound, partnership) — ignore the rest",
        "Kill if zero prepaid after 30 days of real outreach",
        "If they pay but don't return week 2, fix retention before features",
      ],
    };
  },
};

function buildSections(profile: IdeaProfile): GeneratedContent {
  const builder = ARCHETYPE_BUILDERS[profile.archetype];
  const sections = builder(profile);
  const realityScore = calibrateRealityScore(
    profile.seed,
    false,
    ARCHETYPE_SCORE_BIAS[profile.archetype]
  );

  return {
    ...sections,
    realityCheck: sections.realityCheck,
    realityScore,
  };
}

function applyBrutality(
  content: GeneratedContent,
  profile: IdeaProfile
): GeneratedContent {
  const brutalRoastPrefix = pick(
    [
      "I'll be direct:",
      "Here's the uncomfortable version:",
      "Stripped of politeness:",
    ],
    profile.seed
  );

  const baseCheck = content.realityCheck.split("Estimated")[0].trim();

  return {
    ...content,
    investorRoast: `${brutalRoastPrefix} ${content.investorRoast.replace(/^["']|["']$/g, "")}`,
    realityCheck: `${baseCheck} The analysis below flags serious structural or execution risk — score reflects that, not optimism.`,
    validationPlan: [
      "List three ways this idea dies in 90 days — assign an owner to test each",
      "Talk to 8 people who said no to something similar; capture exact objections",
      "Run a kill-week: only questions that could change your mind to \"stop\"",
      "Require prepaid pilot or LOI before you write production code",
      ...content.validationPlan.slice(0, 2),
    ],
  };
}

/**
 * Mock generator — archetype-specific, skeptical-founder tone.
 * Used when ANTHROPIC_API_KEY is not set.
 */
export function generateMockContent(
  idea: string,
  brutalityMode = false
): GeneratedContent {
  const profile = profileIdea(idea);
  let content = buildSections(profile);
  if (brutalityMode) content = applyBrutality(content, profile);
  return alignContentScore(content);
}
