"use client";

import { useEffect, useRef, useState } from "react";
import type { ExplainResult } from "@/lib/explain-polisher";

interface ExplanationPanelProps {
  text: string;
}

export function ExplanationPanel({ text }: ExplanationPanelProps) {
  const [result, setResult] = useState<ExplainResult>({
    explanation: text,
    source: "deterministic_fallback",
  });
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset to deterministic text immediately so the UI is never stale
    setResult({ explanation: text, source: "deterministic_fallback" });

    if (!text.trim()) return;

    // Debounce: wait for sliders to settle before hitting the API
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ baseExplanation: text }),
        });
        if (res.ok) {
          const data: ExplainResult = await res.json();
          setResult(data);
        }
      } catch {
        // keep deterministic fallback — panel already shows it
      } finally {
        setLoading(false);
      }
    }, 900);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
          How this estimate was calculated
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
            loading
              ? "bg-muted text-foreground/60 animate-pulse"
              : result.source === "ai_polished"
                ? "bg-primary/20 text-foreground"
                : "bg-muted text-foreground/70"
          }`}
        >
          {loading
            ? "refining…"
            : result.source === "ai_polished"
              ? "AI polished"
              : "deterministic · no AI"}
        </span>
      </div>
      <p
        className={`text-sm text-foreground leading-relaxed transition-opacity duration-300 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {result.explanation}
      </p>
    </div>
  );
}
