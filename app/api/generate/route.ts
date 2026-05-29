import { generatePlan } from "@/lib/generate";
import type { GenerateRequestBody, GenerateResponse } from "@/lib/types";
import { NextResponse } from "next/server";

const MIN_IDEA_LENGTH = 10;
const MAX_IDEA_LENGTH = 2000;

export async function POST(request: Request) {
  let body: GenerateRequestBody;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const idea = body.idea?.trim() ?? "";

  if (idea.length < MIN_IDEA_LENGTH) {
    return NextResponse.json(
      {
        error: `Idea must be at least ${MIN_IDEA_LENGTH} characters`,
      },
      { status: 400 }
    );
  }

  if (idea.length > MAX_IDEA_LENGTH) {
    return NextResponse.json(
      {
        error: `Idea must be at most ${MAX_IDEA_LENGTH} characters`,
      },
      { status: 400 }
    );
  }

  const brutalityMode = Boolean(body.brutalityMode);

  try {
    const result: GenerateResponse = await generatePlan(idea, { brutalityMode });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/generate]", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
