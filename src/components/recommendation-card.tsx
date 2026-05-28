"use client";

import type { RankedAccount } from "@/types/ranking";
import type { UserProfile } from "@/types/user";

interface RecommendationCardProps {
  ranked: RankedAccount;
  profile: UserProfile;
}

const STATUS_CONFIG = {
  likely_eligible: {
    label: "Likely eligible",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  at_risk: {
    label: "At risk",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  not_eligible: {
    label: "Base rate only",
    bg: "bg-stone-100",
    text: "text-stone-500",
    dot: "bg-stone-400",
  },
};

const TAG_COLORS: Record<string, string> = {
  "Best Match": "bg-orange-100 text-orange-700",
  "No Fuss": "bg-emerald-100 text-emerald-700",
  "Flexible Access": "bg-violet-100 text-violet-700",
  "Intro Rate": "bg-sky-100 text-sky-700",
  "Age Restricted": "bg-rose-100 text-rose-700",
  "Balance Cap": "bg-amber-100 text-amber-700",
};

export function RecommendationCard({ ranked, profile }: RecommendationCardProps) {
  const { account, eligibility, annualInterest, extraAnnualBenefit, effectiveRatePa } = ranked;
  const status = STATUS_CONFIG[eligibility.status];
  const gainPositive = extraAnnualBenefit >= 0;

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-1">
            {account.provider}
          </p>
          <h3 className="text-lg font-bold text-stone-900">{account.productName}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Tags */}
      {ranked.categoryTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ranked.categoryTags.map((tag) => (
            <span
              key={tag}
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                TAG_COLORS[tag] ?? "bg-stone-100 text-stone-600"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Rate and interest highlight */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="text-3xl font-bold text-stone-900 leading-none">
            {effectiveRatePa.toFixed(2)}%
          </p>
          <p className="text-xs text-stone-500 mt-1">est. rate p.a.</p>
          <p className="text-xs text-stone-400 mt-0.5">
            Max {account.totalMaxRatePa.toFixed(2)}% p.a.
          </p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-3xl font-bold text-stone-900 leading-none">
            ${annualInterest.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-stone-500 mt-1">est. annual interest</p>
          <p
            className={`text-xs font-semibold mt-0.5 ${gainPositive ? "text-emerald-600" : "text-rose-500"}`}
          >
            {gainPositive ? "+" : ""}$
            {Math.abs(extraAnnualBenefit).toLocaleString("en-AU", {
              maximumFractionDigits: 0,
            })}{" "}
            vs your current {profile.currentRatePa}%
          </p>
        </div>
      </div>

      {/* Rank reasons */}
      {ranked.rankReasons.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Why this account
          </p>
          <ul className="space-y-1">
            {ranked.rankReasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm text-stone-700">
                <span className="mt-0.5 text-orange-400 font-bold leading-none">·</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {ranked.risks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Things to watch
          </p>
          <ul className="space-y-1">
            {ranked.risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2 text-sm text-amber-700">
                <span className="mt-0.5 text-amber-400 font-bold leading-none">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source */}
      <p className="text-xs text-stone-300">
        Data last checked {account.lastChecked} ·{" "}
        <a
          href={account.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-stone-400"
        >
          {account.sourceLabel}
        </a>
      </p>
    </div>
  );
}
