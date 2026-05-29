"use client";

type BrutalityToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export function BrutalityToggle({
  enabled,
  onChange,
  disabled = false,
}: BrutalityToggleProps) {
  return (
    <div
      className={`rounded-xl border transition-colors duration-300 ${
        enabled
          ? "border-rose-500/25 bg-rose-500/[0.04]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium transition-colors ${
                enabled ? "text-rose-100" : "text-zinc-200"
              }`}
            >
              Brutality Mode
            </span>
            {enabled && (
              <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                On
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {enabled
              ? "Maximum skepticism engaged"
              : "Balanced honesty (still not a hype man)"}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Brutality Mode"
          disabled={disabled}
          onClick={() => onChange(!enabled)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled ? "bg-rose-500/90" : "bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <p className="border-t border-rose-500/15 px-4 py-2.5 text-xs leading-relaxed text-rose-200/70">
          Brutality Mode optimizes for truth, not motivation.
        </p>
      )}
    </div>
  );
}
