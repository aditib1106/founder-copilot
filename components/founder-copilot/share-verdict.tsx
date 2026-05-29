"use client";

import { useCallback, useRef, useState } from "react";
import type { ShareVerdictData } from "@/lib/share";
import { buildTwitterCaption } from "@/lib/share";
import type { RecommendationVerdict } from "@/lib/types";
import { LogoIcon } from "./icons";

const VERDICT_STYLES: Record<
  RecommendationVerdict,
  { badge: string; glow: string; label: string }
> = {
  build: {
    badge: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
    glow: "from-emerald-500/20",
    label: "text-emerald-300",
  },
  validate: {
    badge: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
    glow: "from-amber-500/20",
    label: "text-amber-300",
  },
  kill: {
    badge: "bg-rose-500/20 text-rose-300 ring-rose-500/30",
    glow: "from-rose-500/20",
    label: "text-rose-300",
  },
};

function verdictKey(label: string): RecommendationVerdict {
  if (label === "Build it") return "build";
  if (label === "Kill it") return "kill";
  return "validate";
}

type ShareVerdictProps = {
  data: ShareVerdictData;
};

export function ShareVerdictButton({ data }: ShareVerdictProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"caption" | "image" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const verdict = verdictKey(data.recommendationLabel);
  const styles = VERDICT_STYLES[verdict];

  const handleCopyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildTwitterCaption(data));
      setCopied("caption");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, [data]);

  const handleDownloadImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "founder-copilot-verdict.png";
      link.href = dataUrl;
      link.click();
      setCopied("image");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* fallback: user can screenshot modal */
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <svg
          className="h-4 w-4 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z"
          />
        </svg>
        Share Verdict
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-verdict-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="share-verdict-title"
                className="text-lg font-semibold text-white"
              >
                Share your verdict
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center">
              <div
                ref={cardRef}
                className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#07070c] p-8 text-left shadow-2xl"
                style={{ aspectRatio: "1.91 / 1" }}
              >
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${styles.glow} to-transparent blur-3xl`}
                />
                <div className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <LogoIcon className="h-7 w-7 text-emerald-400" />
                      <span className="text-sm font-semibold tracking-tight text-white">
                        Founder Copilot
                      </span>
                    </div>
                    <p className="mt-5 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                      Startup idea
                    </p>
                    <p className="mt-1.5 line-clamp-3 text-base font-medium leading-snug text-zinc-100">
                      {data.idea}
                    </p>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                        $1M ARR odds (24mo)
                      </p>
                      <p className="text-5xl font-semibold tabular-nums tracking-tight text-white">
                        {data.realityScore}
                        <span className="text-2xl text-zinc-500">%</span>
                      </p>
                    </div>
                    <span
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ${styles.badge}`}
                    >
                      {data.recommendationLabel}
                    </span>
                  </div>

                  <blockquote className="mt-6 border-l-2 border-white/20 pl-4">
                    <p className="text-sm leading-relaxed italic text-zinc-400">
                      &ldquo;{data.roastLine}&rdquo;
                    </p>
                  </blockquote>

                  <p className="mt-4 text-[10px] text-zinc-600">
                    foundercopilot.app · Most startup ideas should die.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => void handleDownloadImage()}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                {copied === "image" ? "Downloaded!" : "Download PNG"}
              </button>
              <button
                type="button"
                onClick={() => void handleCopyCaption()}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
              >
                {copied === "caption" ? "Copied!" : "Copy X caption"}
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-600">
              Screenshot the card or download — optimized for X/Twitter.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
