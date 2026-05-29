import { LogoIcon } from "./icons";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050508]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-emerald-400" />
          <span className="text-lg font-semibold tracking-tight text-white">
            Founder Copilot
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#examples" className="transition-colors hover:text-white">
            Examples
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:inline">
            Weekend Build · Live Demo
          </span>
          <a
            href="#how-it-works"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Roast my idea
          </a>
        </div>
      </div>
    </header>
  );
}
