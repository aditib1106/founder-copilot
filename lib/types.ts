export type SectionIconType =
  | "problem"
  | "users"
  | "features"
  | "stories"
  | "metrics"
  | "roadmap"
  | "risks"
  | "roast"
  | "reality"
  | "validation"
  | "recommendation";

export type RecommendationVerdict = "build" | "validate" | "kill";

export type SectionAccent =
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "sky"
  | "orange";

export type SectionId =
  | "problem"
  | "users"
  | "mvp"
  | "stories"
  | "metrics"
  | "roadmap"
  | "risks"
  | "roast"
  | "reality"
  | "validation"
  | "recommendation";

export type OutputSection = {
  id: SectionId;
  title: string;
  subtitle: string;
  icon: SectionIconType;
  accent: SectionAccent;
  content: string | string[];
  /** Parsed probability for the Reality Check card (0–100). */
  realityScore?: number;
  /** Build / Kill Recommendation card only. */
  recommendationVerdict?: RecommendationVerdict;
  recommendationLabel?: string;
  weekendAnswer?: string;
};

export type GenerateSource = "mock" | "anthropic";

export type GenerateResponse = {
  sections: OutputSection[];
  source: GenerateSource;
  brutalityMode: boolean;
};

export type GenerateRequestBody = {
  idea: string;
  brutalityMode?: boolean;
};

export type GenerateOptions = {
  brutalityMode?: boolean;
};
