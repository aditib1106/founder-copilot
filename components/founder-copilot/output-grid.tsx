"use client";

import { getShareVerdictData } from "@/lib/share";
import type { GenerateSource, OutputSection } from "@/lib/types";
import { OutputCard } from "./output-card";

type OutputGridProps = {
  idea: string;
  sections: OutputSection[];
  source: GenerateSource | null;
  brutalityMode?: boolean;
  visible: boolean;
};

const SOURCE_LABEL: Record<GenerateSource, string> = {
  mock: "Mock analysis",
  anthropic: "AI-generated",
};

export function OutputGrid({
  idea,
  sections,
  source,
  brutalityMode = false,
  visible,
}: OutputGridProps) {
  const sourceLabel = source ? SOURCE_LABEL[source] : "Generated analysis";
  const subtitle = brutalityMode
    ? `Brutality Mode · ${sourceLabel}`
    : sourceLabel;
  const shareData = getShareVerdictData(idea, sections);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24">
      <div className="mb-8 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-xl font-semibold text-white">Your product plan</h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            brutalityMode
              ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              brutalityMode ? "bg-rose-400" : "bg-emerald-400"
            }`}
          />
          {sections.length} sections complete
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
          <OutputCard
            key={section.id}
            section={section}
            index={index}
            visible={visible}
            shareData={
              section.id === "recommendation" ? shareData : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
