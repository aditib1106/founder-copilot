import { getRecommendation, VERDICT_ACCENT } from "@/lib/recommendation";
import type { OutputSection, SectionId } from "@/lib/types";
import { alignContentScore } from "./align-score";

type SectionMeta = Pick<
  OutputSection,
  "id" | "title" | "subtitle" | "icon" | "accent"
>;

export const SECTION_ORDER: SectionId[] = [
  "problem",
  "users",
  "mvp",
  "stories",
  "metrics",
  "roadmap",
  "risks",
  "roast",
  "reality",
  "validation",
  "recommendation",
];

export const SECTION_META: Record<SectionId, SectionMeta> = {
  problem: {
    id: "problem",
    title: "Problem Statement",
    subtitle: "The pain you're claiming to solve",
    icon: "problem",
    accent: "emerald",
  },
  users: {
    id: "users",
    title: "Target Users",
    subtitle: "Who actually has this problem",
    icon: "users",
    accent: "sky",
  },
  mvp: {
    id: "mvp",
    title: "MVP Features",
    subtitle: "Smallest thing worth shipping",
    icon: "features",
    accent: "violet",
  },
  stories: {
    id: "stories",
    title: "User Stories",
    subtitle: "Jobs to be done, written for humans",
    icon: "stories",
    accent: "amber",
  },
  metrics: {
    id: "metrics",
    title: "Success Metrics",
    subtitle: "How you'll know it's working",
    icon: "metrics",
    accent: "emerald",
  },
  roadmap: {
    id: "roadmap",
    title: "30 Day Roadmap",
    subtitle: "Week-by-week execution plan",
    icon: "roadmap",
    accent: "sky",
  },
  risks: {
    id: "risks",
    title: "Risks & Assumptions",
    subtitle: "What could kill this idea",
    icon: "risks",
    accent: "rose",
  },
  roast: {
    id: "roast",
    title: "Investor Roast",
    subtitle: "What a skeptical partner would say",
    icon: "roast",
    accent: "orange",
  },
  reality: {
    id: "reality",
    title: "Reality Check",
    subtitle: "Honest score from Founder Copilot",
    icon: "reality",
    accent: "amber",
  },
  validation: {
    id: "validation",
    title: "First Customer Validation Plan",
    subtitle: "Talk to humans before you write code",
    icon: "validation",
    accent: "emerald",
  },
  recommendation: {
    id: "recommendation",
    title: "Build / Kill Recommendation",
    subtitle: "The only verdict that matters",
    icon: "recommendation",
    accent: "emerald",
  },
};

/** Raw content shape returned by Anthropic or mock generators before merging metadata. */
export type GeneratedContent = {
  problem: string;
  targetUsers: string[];
  mvpFeatures: string[];
  userStories: string[];
  successMetrics: string[];
  roadmap: string[];
  risks: string[];
  investorRoast: string;
  realityCheck: string;
  realityScore: number;
  validationPlan: string[];
};

type BuildSectionsOptions = {
  brutalityMode?: boolean;
};

export function buildSections(
  content: GeneratedContent,
  options: BuildSectionsOptions = {}
): OutputSection[] {
  const aligned = alignContentScore(content);
  const recommendation = getRecommendation(aligned.realityScore);

  const contentById: Record<SectionId, string | string[]> = {
    problem: aligned.problem,
    users: aligned.targetUsers,
    mvp: aligned.mvpFeatures,
    stories: aligned.userStories,
    metrics: aligned.successMetrics,
    roadmap: aligned.roadmap,
    risks: aligned.risks,
    roast: aligned.investorRoast,
    reality: aligned.realityCheck,
    validation: aligned.validationPlan,
    recommendation: recommendation.rationale,
  };

  return SECTION_ORDER.map((id) => {
    const meta = SECTION_META[id];
    const section: OutputSection = {
      ...meta,
      content: contentById[id],
    };

    if (id === "reality") {
      section.realityScore = aligned.realityScore;
    }

    if (id === "recommendation") {
      section.accent = VERDICT_ACCENT[recommendation.verdict];
      section.content = recommendation.rationale;
      section.recommendationVerdict = recommendation.verdict;
      section.recommendationLabel = recommendation.label;
      section.weekendAnswer = recommendation.weekendAnswer;
    }

    return section;
  });
}
