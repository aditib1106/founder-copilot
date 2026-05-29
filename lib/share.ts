import type { OutputSection } from "@/lib/types";

export type ShareVerdictData = {
  idea: string;
  realityScore: number;
  recommendationLabel: string;
  roastLine: string;
};

export function extractRoastLine(roastContent: string): string {
  const stripped = roastContent.replace(/^["']|["']$/g, "").trim();
  const firstSentence = stripped.split(/(?<=[.!?])\s+/)[0]?.trim() ?? stripped;
  if (firstSentence.length <= 140) return firstSentence;
  return `${firstSentence.slice(0, 137)}…`;
}

export function getShareVerdictData(
  idea: string,
  sections: OutputSection[]
): ShareVerdictData | null {
  const reality = sections.find((s) => s.id === "reality");
  const recommendation = sections.find((s) => s.id === "recommendation");
  const roast = sections.find((s) => s.id === "roast");

  if (
    !reality?.realityScore ||
    !recommendation?.recommendationLabel ||
    !roast ||
    typeof roast.content !== "string"
  ) {
    return null;
  }

  return {
    idea: idea.trim(),
    realityScore: reality.realityScore,
    recommendationLabel: recommendation.recommendationLabel,
    roastLine: extractRoastLine(roast.content),
  };
}

export function buildTwitterCaption(data: ShareVerdictData): string {
  return [
    `Founder Copilot verdict on my idea:`,
    ``,
    `"${data.idea.length > 100 ? `${data.idea.slice(0, 97)}…` : data.idea}"`,
    ``,
    `${data.realityScore}% · ${data.recommendationLabel}`,
    ``,
    data.roastLine,
  ].join("\n");
}
