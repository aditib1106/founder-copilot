/**
 * Seed-based score before content alignment.
 * Spread across kill / validate / build — no default pile-up in validate.
 * ~32% kill (8–20), ~33% validate (21–50), ~35% build (51–65).
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
    if (bucket < 38) score = 8 + (seed % 13);
    else if (bucket < 72) score = 20 + ((seed + jitter) % 28);
    else score = 49 + (seed % 14);
  } else if (bucket < 32) {
    score = 8 + (seed % 13);
  } else if (bucket < 65) {
    score = 21 + ((seed + jitter) % 30);
  } else {
    score = 51 + (seed % 15);
  }

  return Math.min(65, Math.max(8, score + archetypeBias));
}
