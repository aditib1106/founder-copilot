"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOADING_STEPS } from "@/lib/placeholder-data";
import type { GenerateResponse, OutputSection } from "@/lib/types";
import { Header } from "./header";
import { Hero } from "./hero";
import { IdeaInput } from "./idea-input";
import { LoadingState } from "./loading-state";
import { OutputGrid } from "./output-grid";

const MIN_LOADING_MS = 1800;
const STEP_INTERVAL_MS = 600;

export function FounderCopilotApp() {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sections, setSections] = useState<OutputSection[]>([]);
  const [source, setSource] = useState<GenerateResponse["source"] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [brutalityMode, setBrutalityMode] = useState(false);
  const [resultBrutality, setResultBrutality] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState("");
  const loadingStartedAt = useRef<number>(0);

  const handleGenerate = useCallback(async () => {
    const trimmed = idea.trim();
    if (trimmed.length <= 10 || isLoading) return;

    setIsLoading(true);
    setShowOutput(false);
    setHasResults(false);
    setLoadingStep(0);
    setError(null);
    setSections([]);
    setSource(null);
    loadingStartedAt.current = Date.now();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed, brutalityMode }),
      });

      const data = (await response.json()) as GenerateResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate plan");
      }

      const elapsed = Date.now() - loadingStartedAt.current;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setSections(data.sections);
      setSource(data.source);
      setGeneratedIdea(trimmed);
      setResultBrutality(Boolean(data.brutalityMode));
      setHasResults(true);
      requestAnimationFrame(() => setShowOutput(true));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [idea, isLoading, brutalityMode]);

  useEffect(() => {
    if (!isLoading) return;

    const stepTimer = setInterval(() => {
      setLoadingStep((prev) =>
        prev < LOADING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, STEP_INTERVAL_MS);

    return () => clearInterval(stepTimer);
  }, [isLoading]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        <div className="absolute -right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-teal-500/[0.04] blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />
        <Hero />
        <IdeaInput
          idea={idea}
          onIdeaChange={setIdea}
          brutalityMode={brutalityMode}
          onBrutalityModeChange={setBrutalityMode}
          onGenerate={() => void handleGenerate()}
          isLoading={isLoading}
          hasResults={hasResults}
        />

        {error && (
          <div className="mx-auto mb-4 max-w-3xl px-6">
            <p
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200"
            >
              {error}
            </p>
          </div>
        )}

        {isLoading && <LoadingState activeStep={loadingStep} />}
        {hasResults && !isLoading && sections.length > 0 && (
          <OutputGrid
            idea={generatedIdea}
            sections={sections}
            source={source}
            brutalityMode={resultBrutality}
            visible={showOutput}
          />
        )}

        <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-sm text-zinc-600">
          <p>
            Founder Copilot · Kill bad ideas before they kill your runway.
          </p>
        </footer>
      </div>
    </div>
  );
}
