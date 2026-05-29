"use client";

import { EXAMPLE_PROMPTS } from "@/lib/placeholder-data";
import { BrutalityToggle } from "./brutality-toggle";
import { SparklesIcon } from "./icons";

type IdeaInputProps = {
  idea: string;
  onIdeaChange: (value: string) => void;
  brutalityMode: boolean;
  onBrutalityModeChange: (enabled: boolean) => void;
  onGenerate: () => void | Promise<void>;
  isLoading: boolean;
  hasResults: boolean;
};

export function IdeaInput({
  idea,
  onIdeaChange,
  brutalityMode,
  onBrutalityModeChange,
  onGenerate,
  isLoading,
  hasResults,
}: IdeaInputProps) {
  const canGenerate = idea.trim().length > 10 && !isLoading;

  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-3xl px-6 pb-8"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1 shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]">
        <div className="rounded-xl bg-zinc-950/80 p-4 sm:p-5">
          <label htmlFor="startup-idea" className="sr-only">
            Your startup idea
          </label>
          <textarea
            id="startup-idea"
            rows={4}
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            placeholder="Describe your startup idea in a sentence or two. Be specific about who it's for and what problem it solves…"
            className="w-full resize-none bg-transparent text-base leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            disabled={isLoading}
          />
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <BrutalityToggle
              enabled={brutalityMode}
              onChange={onBrutalityModeChange}
              disabled={isLoading}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              {idea.length > 0
                ? `${idea.length} characters`
                : "Minimum 10 characters to generate"}
            </p>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-zinc-950 transition-all hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SparklesIcon className="h-4 w-4" />
              {isLoading
                ? "Analyzing…"
                : hasResults
                  ? "Regenerate plan"
                  : "Generate product plan"}
            </button>
          </div>
        </div>
      </div>

      <div id="examples" className="mt-6">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
          Try an example
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onIdeaChange(prompt)}
              disabled={isLoading}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-left text-xs text-zinc-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-zinc-200 disabled:opacity-50 sm:text-sm"
            >
              {prompt.length > 48 ? `${prompt.slice(0, 48)}…` : prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
