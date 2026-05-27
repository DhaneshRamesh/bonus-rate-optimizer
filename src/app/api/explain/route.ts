import { NextRequest, NextResponse } from "next/server";

/**
 * TODO Phase 3: AI explanation endpoint.
 *
 * Accepts a POST with { accountId, deterministicExplanation, profile } and
 * returns a Claude-generated plain-English explanation of the recommendation.
 *
 * Falls back to the deterministic explanation if the API key is absent or
 * the request times out. The deterministic fallback is always surfaced in the
 * UI even while the AI response is loading.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.deterministicExplanation) {
    return NextResponse.json({ error: "Missing deterministicExplanation" }, { status: 400 });
  }

  // Placeholder response — will call Anthropic SDK in Phase 3
  return NextResponse.json({
    explanation: body.deterministicExplanation,
    source: "deterministic",
  });
}
