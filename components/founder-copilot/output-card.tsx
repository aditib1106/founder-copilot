"use client";

import type { ShareVerdictData } from "@/lib/share";
import type { OutputSection, RecommendationVerdict } from "@/lib/types";
import { SectionIcon } from "./icons";
import { ShareVerdictButton } from "./share-verdict";

const accentStyles = {
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
    border: "hover:border-emerald-500/20",
    verdict: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    glow: "shadow-emerald-500/10",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
    border: "hover:border-amber-500/20",
    verdict: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    glow: "shadow-amber-500/10",
  },
  rose: {
    icon: "bg-rose-500/15 text-rose-400 ring-rose-500/20",
    border: "hover:border-rose-500/20",
    verdict: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    glow: "shadow-rose-500/10",
  },
  violet: {
    icon: "bg-violet-500/15 text-violet-400 ring-violet-500/20",
    border: "hover:border-violet-500/20",
    verdict: "",
    glow: "",
  },
  sky: {
    icon: "bg-sky-500/15 text-sky-400 ring-sky-500/20",
    border: "hover:border-sky-500/20",
    verdict: "",
    glow: "",
  },
  orange: {
    icon: "bg-orange-500/15 text-orange-400 ring-orange-500/20",
    border: "hover:border-orange-500/20",
    verdict: "",
    glow: "",
  },
} as const;

const VERDICT_GLYPH: Record<RecommendationVerdict, string> = {
  build: "↑",
  validate: "→",
  kill: "×",
};

type OutputCardProps = {
  section: OutputSection;
  index: number;
  visible: boolean;
  shareData?: ShareVerdictData | null;
};

export function OutputCard({
  section,
  index,
  visible,
  shareData,
}: OutputCardProps) {
  const styles = accentStyles[section.accent];
  const isRoast = section.id === "roast";
  const isReality = section.id === "reality";
  const isRecommendation = section.id === "recommendation";
  const isWide = isRoast || isReality || isRecommendation;

  return (
    <article
      className={`group rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6 transition-all duration-700 ${styles.border} ${
        isWide ? "sm:col-span-2 lg:col-span-3" : ""
      } ${isRecommendation ? `shadow-2xl ${styles.glow}` : ""} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="mb-4 flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
        >
          <SectionIcon type={section.icon} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{section.title}</h3>
          <p className="mt-0.5 text-sm text-zinc-500">{section.subtitle}</p>
        </div>
      </div>

      {isRecommendation && section.recommendationVerdict ? (
        <div className="space-y-5">
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left ${styles.verdict}`}
          >
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/20 text-2xl font-light"
                aria-hidden
              >
                {VERDICT_GLYPH[section.recommendationVerdict]}
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Recommendation
                </p>
                <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {section.recommendationLabel}
                </p>
              </div>
            </div>
          </div>

          {typeof section.content === "string" && (
            <p className="text-sm leading-relaxed text-zinc-400">
              {section.content}
            </p>
          )}

          {section.weekendAnswer && (
            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-5 py-4">
              <p className="text-sm font-medium text-zinc-300">
                Would I spend my weekend building this?
              </p>
              <p className="mt-2 text-base leading-snug text-white">
                {section.weekendAnswer}
              </p>
            </div>
          )}

          {shareData && (
            <div className="flex justify-center pt-2">
              <ShareVerdictButton data={shareData} />
            </div>
          )}
        </div>
      ) : Array.isArray(section.content) ? (
        <ul className="space-y-2.5">
          {section.content.map((item, i) => (
            <li
              key={i}
              className={`flex gap-2.5 text-sm leading-relaxed ${
                item.startsWith("NOT:")
                  ? "text-zinc-500 line-through decoration-zinc-600"
                  : "text-zinc-300"
              }`}
            >
              <span
                className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                  item.startsWith("NOT:")
                    ? "bg-zinc-600"
                    : "bg-emerald-500/80"
                }`}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p
          className={`text-sm leading-relaxed ${
            isRoast
              ? "italic text-orange-200/90"
              : isReality
                ? "text-amber-100/90"
                : "text-zinc-300"
          }`}
        >
          {section.content}
        </p>
      )}

      {isReality && section.realityScore != null && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <div className="text-2xl font-bold tabular-nums text-amber-400">
            {section.realityScore}%
          </div>
          <p className="text-xs text-amber-200/70">
            Estimated probability of $1M ARR in 24 months
          </p>
        </div>
      )}
    </article>
  );
}
