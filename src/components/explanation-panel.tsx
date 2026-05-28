"use client";

interface ExplanationPanelProps {
  text: string;
}

export function ExplanationPanel({ text }: ExplanationPanelProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          How this estimate was calculated
        </span>
        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">
          deterministic · no AI
        </span>
      </div>
      <p className="text-sm text-stone-700 leading-relaxed">{text}</p>
    </div>
  );
}
