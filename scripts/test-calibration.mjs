import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Dynamic import compiled path won't work easily — use tsx via spawning
const ideas = [
  "AI chief of staff for founders",
  "Browser extension that predicts startup failure before accepting a job",
  "AI that automatically updates Salesforce from sales calls",
  "Interview copilot that bypasses anti-cheating protections",
  "Subscription box for dog owners who want vet-grade supplements",
];

async function main() {
  const { generateMockContent } = await import(
    pathToFileURL(path.join(root, "lib/generate/mock.ts")).href
  );
  const { getRecommendationLabel } = await import(
    pathToFileURL(path.join(root, "lib/recommendation.ts")).href
  );

  console.log("Calibration test (mock generator)\n");

  for (const idea of ideas) {
    const content = generateMockContent(idea, false);
    const label = getRecommendationLabel(content.realityScore);
    console.log(`Idea: ${idea}`);
    console.log(`  Score: ${content.realityScore}% → ${label}`);
    console.log("");
  }
}

main().catch(console.error);
