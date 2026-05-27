"use client";

interface ExplanationPanelProps {
  deterministicText: string;
  accountId: string;
}

/**
 * TODO Phase 3: AI explanation panel.
 * Calls /api/explain to get a Claude-generated plain-English summary.
 * Falls back to deterministicText if the API is unavailable or slow.
 */
export function ExplanationPanel({
  deterministicText,
  accountId: _accountId,
}: ExplanationPanelProps) {
  return (
    <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground italic">
      {deterministicText}
    </div>
  );
}
