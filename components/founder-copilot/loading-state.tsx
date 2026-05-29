"use client";

import { LOADING_STEPS } from "@/lib/placeholder-data";

type LoadingStateProps = {
  activeStep: number;
};

export function LoadingState({ activeStep }: LoadingStateProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-400/30" />
          <div
            className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-teal-400 border-l-teal-400/30"
            style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-emerald-400">FC</span>
          </div>
        </div>
        <p className="text-sm font-medium text-zinc-300">
          {LOADING_STEPS[activeStep] ?? LOADING_STEPS[LOADING_STEPS.length - 1]}
        </p>
        <div className="flex gap-1.5">
          {LOADING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= activeStep
                  ? "w-8 bg-emerald-500"
                  : "w-2 bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-800/60" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-zinc-800/80" />
              <div className="h-3 w-5/6 rounded bg-zinc-800/60" />
              <div className="h-3 w-4/6 rounded bg-zinc-800/40" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
