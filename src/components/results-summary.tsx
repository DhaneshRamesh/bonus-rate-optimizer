"use client";

import type { RankedAccount, RankAccountsResult } from "@/types/ranking";

interface ResultsSummaryProps {
  results: RankAccountsResult;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface CategoryCardProps {
  title: string;
  subtitle: string;
  ranked?: RankedAccount;
  selectedId: string | null;
  onSelect: (id: string) => void;
  accent: string;
}

function CategoryCard({
  title,
  subtitle,
  ranked,
  selectedId,
  onSelect,
  accent,
}: CategoryCardProps) {
  if (!ranked) return null;

  const isSelected = selectedId === ranked.account.id;
  const statusColor =
    ranked.eligibility.status === "likely_eligible"
      ? "text-emerald-600"
      : ranked.eligibility.status === "at_risk"
        ? "text-amber-600"
        : "text-stone-400";

  return (
    <button
      type="button"
      onClick={() => onSelect(ranked.account.id)}
      className={`text-left w-full rounded-2xl border p-5 transition-all ${
        isSelected
          ? "border-orange-400 shadow-md ring-1 ring-orange-300"
          : "border-stone-200 hover:border-orange-300 hover:shadow-sm"
      } bg-white`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
          style={{ background: accent + "20", color: accent }}
        >
          {title}
        </span>
        {isSelected && (
          <span className="text-xs font-medium text-orange-500">Selected ✓</span>
        )}
      </div>
      <p className="text-sm font-semibold text-stone-900 leading-snug mb-0.5">
        {ranked.account.provider}
      </p>
      <p className="text-xs text-stone-500 mb-3">{ranked.account.productName}</p>
      <div className="flex items-end gap-3">
        <div>
          <p className="text-2xl font-bold text-stone-900 leading-none">
            {ranked.effectiveRatePa.toFixed(2)}%
          </p>
          <p className="text-xs text-stone-400 mt-0.5">est. rate p.a.</p>
        </div>
        <div className="mb-0.5">
          <p className={`text-sm font-semibold ${statusColor}`}>
            {ranked.eligibility.status === "likely_eligible"
              ? "Likely eligible"
              : ranked.eligibility.status === "at_risk"
                ? "At risk"
                : "Base rate only"}
          </p>
          <p className="text-xs text-stone-400">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

export function ResultsSummary({ results, selectedId, onSelect }: ResultsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <CategoryCard
        title="Best match"
        subtitle="highest est. return"
        ranked={results.bestMaxReturn}
        selectedId={selectedId}
        onSelect={onSelect}
        accent="#F97316"
      />
      <CategoryCard
        title="No fuss"
        subtitle="no monthly conditions"
        ranked={results.bestNoFuss}
        selectedId={selectedId}
        onSelect={onSelect}
        accent="#059669"
      />
      <CategoryCard
        title="Flexible access"
        subtitle="withdraw freely"
        ranked={results.bestFlexibleWithdrawals}
        selectedId={selectedId}
        onSelect={onSelect}
        accent="#7C3AED"
      />
    </div>
  );
}
