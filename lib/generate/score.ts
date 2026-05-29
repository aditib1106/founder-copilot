/**
 * Seed-based score before content alignment.
 * ~12% kill, ~58% validate, ~25% build, ~5% seriously build.
 */
export function calibrateRealityScore(
  seed: number,
  brutalityMode: boolean,
  archetypeBias = 0
): number {
  const bucket = seed % 100;
  const jitter = seed % 5;

  let score: number;

  if (brutalityMode) {
    if (bucket < 18) score = 8 + (seed % 8);
    else if (bucket < 76) score = 18 + ((seed + jitter) % 26);
    else if (bucket < 94) score = 46 + (seed % 18);
    else score = 71 + (seed % 12);
  } else if (bucket < 12) {
    score = 9 + (seed % 7);
  } else if (bucket < 70) {
    score = 22 + ((seed + jitter) % 22);
  } else if (bucket < 95) {
    score = 48 + (seed % 20);
  } else {
    score = 72 + (seed % 14);
  }

  return Math.min(85, Math.max(8, score + archetypeBias));
}
