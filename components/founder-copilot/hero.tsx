export function Hero() {
  return (
    <section className="relative px-6 pb-4 pt-16 text-center sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          For founders who confuse motion with progress
        </p>
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
          Most startup ideas{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            should die.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          Founder Copilot turns rough ideas into product plans, then tries to
          convince you{" "}
          <span className="text-zinc-200">not</span> to build them.
        </p>
      </div>
    </section>
  );
}
