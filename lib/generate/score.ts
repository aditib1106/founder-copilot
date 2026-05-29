/**
 * Calibrates mock reality scores so most ideas land in 21–50 (Validate first).
 * ~15% Kill (≤20), ~70% Validate (21–50), ~15% Build (51+).
 */
export function calibrateRealityScore(seed: number, brutalityMode: boolean): number {
  const bucket = seed % 100;
  const jitter = seed % 5;

  if (brutalityMode) {
    if (bucket < 22) return 12 + (seed % 9);
    if (bucket < 88) return 24 + ((seed + jitter) % 22);
    return 52 + (seed % 10);
  }

  if (bucket < 18) return 14 + (seed % 7);
  if (bucket < 88) return 26 + ((seed + jitter) % 23);
  return 54 + (seed % 11);
}
