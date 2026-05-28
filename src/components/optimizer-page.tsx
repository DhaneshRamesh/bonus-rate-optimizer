"use client";

import { useMemo, useState } from "react";
import { ACCOUNTS } from "@/data/accounts";
import { rankAccounts, getDistinctRecommendationCards } from "@/lib/ranking";
import { buildExplanation, buildDisclosureText, buildMethodologyText } from "@/lib/explanation";
import type { UserProfile } from "@/types/user";
import { Hero } from "./hero";
import { AccountForm } from "./account-form";
import { ResultsSummary } from "./results-summary";
import { RecommendationCard } from "./recommendation-card";
import { EligibilityChecklist } from "./eligibility-checklist";
import { ExplanationPanel } from "./explanation-panel";
import { BenefitChart } from "./benefit-chart";
import { ComparisonTable } from "./comparison-table";
import { HowItWorks } from "./how-it-works";
import { HighestRateInsight } from "./highest-rate-insight";

export type SelectedCategory = "best-match" | "no-fuss" | "flexible-access" | "table" | "chart";
export type SelectedCard = {
  category: SelectedCategory;
  accountId: string;
};

const DEFAULT_PROFILE: UserProfile = {
  age: 28,
  balance: 25_000,
  currentRatePa: 3.5,
  monthlyExternalDeposit: 1_000,
  monthlyCardPurchases: 5,
  monthlyNetSavingsGrowth: 300,
  willingToOpenLinkedAccount: true,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

export function OptimizerPage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [selected, setSelected] = useState<SelectedCard | null>(null);

  const results = useMemo(() => rankAccounts(ACCOUNTS, profile), [profile]);

  const distinctCards = useMemo(() => getDistinctRecommendationCards(results), [results]);

  const selectedAccount = useMemo(() => {
    if (selected) {
      if (selected.category === "best-match" && distinctCards.displayBestMatch) return distinctCards.displayBestMatch;
      if (selected.category === "no-fuss" && distinctCards.displayNoFuss) return distinctCards.displayNoFuss;
      if (selected.category === "flexible-access" && distinctCards.displayFlexible) return distinctCards.displayFlexible;
      
      const found = results.overall.find((r) => r.account.id === selected.accountId);
      if (found) return found;
    }
    return distinctCards.displayBestMatch ?? results.overall[0];
  }, [results, selected, distinctCards]);

  const highestRateAccount = useMemo(() => {
    return [...results.overall].sort((a, b) => b.account.totalMaxRatePa - a.account.totalMaxRatePa)[0];
  }, [results]);


  const handleSelect = (category: SelectedCategory, accountId: string) => 
    setSelected({ category, accountId });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="max-w-5xl mx-auto">
        <Hero />
      </div>

      {/* Disclosure banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <div className="rounded-2xl bg-card/80 border border-border/60 px-5 py-3 text-xs text-foreground/80 leading-relaxed">
          <span className="font-semibold text-foreground">Concept demo · not financial advice · sample data only. </span>
          {buildDisclosureText()}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
        <HowItWorks />

        {/* Form */}
        <AccountForm profile={profile} onChange={setProfile} />

        {/* Results summary — 3 category cards */}
        <ResultsSummary
          results={results}
          selectedCard={
            selected
              ? { category: selected.category, accountId: selectedAccount.account.id }
              : distinctCards.displayBestMatch
                ? { category: "best-match", accountId: distinctCards.displayBestMatch.account.id }
                : null
          }
          onSelect={(cat, id) => handleSelect(cat, id)}
        />

        {selectedAccount && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecommendationCard ranked={selectedAccount} profile={profile} />
              <EligibilityChecklist ranked={selectedAccount} />
            </div>

            {/* Explanation */}
            <ExplanationPanel ranked={selectedAccount} profile={profile} />

            {/* Insight */}
            {highestRateAccount && (
              <HighestRateInsight 
                selectedAccount={selectedAccount} 
                highestRateAccount={highestRateAccount} 
              />
            )}
          </div>
        )}

        {/* Benefit chart */}
        <BenefitChart
          results={results.overall}
          selectedId={selected?.accountId ?? (distinctCards.displayBestMatch?.account.id ?? null)}
          onSelect={(id) => handleSelect("chart", id)}
        />

        {/* Comparison table */}
        <ComparisonTable
          results={results.overall}
          selectedId={selected?.accountId ?? (distinctCards.displayBestMatch?.account.id ?? null)}
          onSelect={(id) => handleSelect("table", id)}
        />

        {/* Methodology + full disclosure footer */}
        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <details className="group">
            <summary className="text-sm font-semibold text-foreground/80 cursor-pointer list-none flex items-center justify-between hover:text-foreground">
              <span className="text-xs uppercase tracking-wide">Calculation method</span>
              <span className="transition-transform group-open:rotate-180 opacity-50 text-[10px]">▼</span>
            </summary>
            <div className="mt-4 text-sm text-foreground/80 leading-relaxed space-y-3">
              <ul className="list-disc pl-5 space-y-1.5 marker:text-orange-400">
                <li>We check eligibility conditions first.</li>
                <li>We use the bonus rate only when conditions are met.</li>
                <li>Otherwise we use the base/standard rate.</li>
                <li>Caps, tiers, and intro periods are applied before ranking.</li>
                <li>Ranking is based on expected annual interest, not headline rate.</li>
                <li>AI does not calculate or rank accounts.</li>
                <li className="font-semibold text-orange-900">Always verify before acting.</li>
              </ul>
              <p className="text-[13px] text-muted-foreground pt-2 border-t border-border/50">
                {buildMethodologyText()}
              </p>
            </div>
          </details>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-foreground/60 leading-relaxed">{buildDisclosureText()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
