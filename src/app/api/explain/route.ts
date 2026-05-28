import { NextRequest, NextResponse } from "next/server";
import { polishExplanation } from "@/lib/explain-polisher";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { baseExplanation } = (body as { baseExplanation?: unknown }) ?? {};

  if (typeof baseExplanation !== "string" || !baseExplanation.trim()) {
    return NextResponse.json({ error: "baseExplanation required" }, { status: 400 });
  }

  const result = await polishExplanation(baseExplanation);
  return NextResponse.json(result);
}
