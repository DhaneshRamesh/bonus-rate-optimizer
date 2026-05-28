"use client";

import { useMemo, useState } from "react";
import { ACCOUNTS } from "@/data/accounts";
import { rankAccounts } from "@/lib/ranking";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => rankAccounts(ACCOUNTS, profile), [profile]);

  const selected = useMemo(() => {
    if (selectedId) {
      const found = results.overall.find((r) => r.account.id === selectedId);
      if (found) return found;
    }
    return results.bestMaxReturn ?? results.overall[0];
  }, [results, selectedId]);

  const explanationText = useMemo(
    () => (selected ? buildExplanation(selected, profile) : ""),
    [selected, profile]
  );

  const handleSelect = (id: string) => setSelectedId(id);

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
        {/* Form */}
        <AccountForm profile={profile} onChange={setProfile} />

        {/* Results summary — 3 category cards */}
        <ResultsSummary
          results={results}
          selectedId={selectedId ?? (results.bestMaxReturn?.account.id ?? null)}
          onSelect={handleSelect}
        />

        {/* Primary recommendation + eligibility — 2 col desktop */}
        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecommendationCard ranked={selected} profile={profile} />
            <EligibilityChecklist ranked={selected} />
          </div>
        )}

        {/* Explanation */}
        {explanationText && <ExplanationPanel text={explanationText} />}

        {/* Benefit chart */}
        <BenefitChart
          results={results.overall}
          selectedId={selectedId ?? (results.bestMaxReturn?.account.id ?? null)}
          onSelect={handleSelect}
        />

        {/* Comparison table */}
        <ComparisonTable
          results={results.overall}
          selectedId={selectedId ?? (results.bestMaxReturn?.account.id ?? null)}
          onSelect={handleSelect}
        />

        {/* Methodology + full disclosure footer */}
        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">
              How estimates are calculated
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">{buildMethodologyText()}</p>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-foreground/60 leading-relaxed">{buildDisclosureText()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
