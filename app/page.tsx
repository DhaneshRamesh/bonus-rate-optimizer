"use client";

import { AccountCard } from "@/components/AccountCard";
import { ProfileForm } from "@/components/ProfileForm";
import { ACCOUNTS } from "@/lib/accounts";
import { formatCurrency, rankAccounts } from "@/lib/engine";
import type { UserProfile } from "@/lib/types";
import { useState } from "react";

const DEFAULT_PROFILE: UserProfile = {
  age: 28,
  currentBalance: 25_000,
  monthlyDeposit: 1_000,
  monthlyCardTransactions: 5,
  balanceWillGrow: true,
  willingToLinkAccount: true,
  isNewCustomer: false,
};

export default function Home() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const results = rankAccounts(ACCOUNTS, profile);
  const topResult = results[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground leading-tight text-lg">
                Bonus Rate Optimizer
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                by Open — Concept Demo
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs text-muted-foreground">
              8 accounts · Public AU data
            </p>
          </div>
        </div>
      </header>

      {/* Hero summary bar */}
      {topResult && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 items-center">
            <p className="text-sm text-muted-foreground">
              Based on your profile:
            </p>
            <p className="text-sm font-semibold text-foreground">
              Best match —{" "}
              <span className="text-primary">
                {topResult.account.bank} {topResult.account.accountName}
              </span>{" "}
              at{" "}
              <span className="text-primary">
                {topResult.estimatedRate.toFixed(2)}% p.a.
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Est.{" "}
              <span className="font-medium text-foreground">
                {new Intl.NumberFormat("en-AU", {
                  style: "currency",
                  currency: "AUD",
                  maximumFractionDigits: 0,
                }).format(topResult.estimatedAnnualInterest)}
              </span>{" "}
              / year on {formatCurrency(profile.currentBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar: Profile Form */}
          <aside className="lg:w-80 xl:w-96 shrink-0">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h2 className="font-semibold text-foreground mb-1">
                  Your Profile
                </h2>
                <p className="text-xs text-muted-foreground mb-5 leading-snug">
                  Adjust these to match your actual situation. Results update
                  instantly.
                </p>
                <ProfileForm profile={profile} onChange={setProfile} />
              </div>
            </div>
          </aside>

          {/* Results panel */}
          <section className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">
                  Accounts ranked for you
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sorted by estimated annual interest · {results.length} accounts
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {results.map((result, i) => (
                <AccountCard
                  key={result.account.id}
                  result={result}
                  rank={i + 1}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="border-t border-border bg-white mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Concept demo only.</strong>{" "}
            This tool provides estimated figures based on the details you enter
            and a curated dataset of publicly available Australian savings
            account information (~early 2025). Rates, conditions, and
            eligibility criteria change frequently. This is not financial
            advice. Always verify current terms directly with the provider
            before making any financial decisions. Open does not currently
            offer this product.
          </p>
        </div>
      </footer>
    </div>
  );
}
