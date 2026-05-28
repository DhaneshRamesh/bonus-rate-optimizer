"use client";

import type { RankedAccount, RankAccountsResult } from "@/types/ranking";
import { getDistinctRecommendationCards } from "@/lib/ranking";

import type { SelectedCard, SelectedCategory } from "./optimizer-page";

interface ResultsSummaryProps {
  results: RankAccountsResult;
  selectedCard: SelectedCard | null;
  onSelect: (category: SelectedCategory, accountId: string) => void;
}

interface CategoryCardProps {
  title: string;
  subtitle: string;
  category: SelectedCategory;
  ranked?: RankedAccount;
  selectedCard: SelectedCard | null;
  onSelect: (category: SelectedCategory, accountId: string) => void;
  accent: string;
  note?: string;
}

function CategoryCard({
  title,
  subtitle,
  category,
  ranked,
  selectedCard,
  onSelect,
  accent,
  note,
}: CategoryCardProps) {
  if (!ranked) return null;

  const isSelected =
    selectedCard?.category === category && selectedCard?.accountId === ranked.account.id;
  const statusColor =
    ranked.eligibility.status === "likely_eligible"
      ? "text-emerald-700 font-semibold"
      : ranked.eligibility.status === "at_risk"
        ? "text-amber-700 font-semibold"
        : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={() => onSelect(category, ranked.account.id)}
      className={`text-left w-full rounded-3xl border p-5 transition-all duration-300 ${
        isSelected
          ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20 bg-card -translate-y-0.5"
          : "border-border shadow-sm hover:border-primary/40 bg-card/60 hover:bg-card hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
          style={{ background: accent + "20", color: accent }}
        >
          {title}
        </span>
        {isSelected && (
          <span className="text-xs font-medium text-foreground">Selected ✓</span>
        )}
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug mb-0.5">
        {ranked.account.provider}
      </p>
      <p className="text-xs text-muted-foreground mb-3">{ranked.account.productName}</p>
      <div className="flex items-end gap-3">
        <div>
          <p className="text-2xl font-bold text-foreground leading-none">
            {ranked.effectiveRatePa.toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">est. rate p.a.</p>
        </div>
        <div className="mb-0.5">
          <p className={`text-sm font-semibold ${statusColor}`}>
            {ranked.eligibility.status === "likely_eligible"
              ? "Likely eligible"
              : ranked.eligibility.status === "at_risk"
                ? "At risk"
                : "Base rate only"}
          </p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {note && (
        <div className="mt-3 pt-3 border-t border-border/50 text-[10px] leading-tight text-muted-foreground/80">
          {note}
        </div>
      )}
    </button>
  );
}

export function ResultsSummary({ results, selectedCard, onSelect }: ResultsSummaryProps) {
  const distinct = getDistinctRecommendationCards(results);

  let noFussSubtitle = "no monthly conditions";
  let noFussNote = "";
  if (distinct.noFussIsDuplicate) {
    noFussSubtitle = "also best no-fuss";
  } else if (results.bestNoFuss && distinct.displayNoFuss && results.bestNoFuss.account.id !== distinct.displayNoFuss.account.id) {
    noFussNote = `${results.bestNoFuss.account.productName} has the highest no-fuss score, so we're showing the next-best distinct option.`;
  }

  let flexibleSubtitle = "withdraw freely";
  let flexibleNote = "";
  if (distinct.flexibleIsDuplicate) {
    flexibleSubtitle = "also best flexible access";
  } else if (results.bestFlexibleWithdrawals && distinct.displayFlexible && results.bestFlexibleWithdrawals.account.id !== distinct.displayFlexible.account.id) {
    flexibleNote = `${results.bestFlexibleWithdrawals.account.productName} has the highest flexible score, so we're showing the next-best distinct option.`;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <CategoryCard
        title="Best match"
        subtitle="highest est. return"
        category="best-match"
        ranked={distinct.displayBestMatch}
        selectedCard={selectedCard}
        onSelect={onSelect}
        accent="#FF7B40"
      />
      <CategoryCard
        title="No-fuss option"
        subtitle={noFussSubtitle}
        category="no-fuss"
        ranked={distinct.displayNoFuss}
        selectedCard={selectedCard}
        onSelect={onSelect}
        accent="#059669"
        note={noFussNote}
      />
      <CategoryCard
        title="Flexible access"
        subtitle={flexibleSubtitle}
        category="flexible-access"
        ranked={distinct.displayFlexible}
        selectedCard={selectedCard}
        onSelect={onSelect}
        accent="#7C3AED"
        note={flexibleNote}
      />
    </div>
  );
}
