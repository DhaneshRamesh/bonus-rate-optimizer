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
    bg: "bg-emerald-100",
    text: "text-emerald-800 font-semibold",
    dot: "bg-emerald-500",
  },
  at_risk: {
    label: "At risk",
    bg: "bg-amber-100",
    text: "text-amber-800 font-semibold",
    dot: "bg-amber-500",
  },
  not_eligible: {
    label: "Not eligible",
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const TAG_COLORS: Record<string, string> = {
  "Best Match": "bg-orange-100 text-orange-800 font-semibold",
  "No Fuss": "bg-emerald-100 text-emerald-800 font-semibold",
  "Flexible Access": "bg-amber-100 text-amber-800 font-semibold",
  "Intro Rate": "bg-sky-100 text-sky-700",
  "Age Restricted": "bg-rose-100 text-rose-700",
  "Balance Cap": "bg-orange-100 text-orange-800 font-semibold",
};

export function RecommendationCard({ ranked, profile }: RecommendationCardProps) {
  const { account, eligibility, annualInterest, extraAnnualBenefit, effectiveRatePa } = ranked;
  const status = STATUS_CONFIG[eligibility.status];
  const gainPositive = extraAnnualBenefit >= 0;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
            {account.provider}
          </p>
          <h3 className="text-lg font-bold text-foreground">{account.productName}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Why section for at_risk or not_eligible */}
      {eligibility.status !== "likely_eligible" && eligibility.unmetConditions.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wide mb-2">
            Why you may miss the bonus
          </p>
          <ul className="space-y-1.5 mb-3">
            {eligibility.unmetConditions.slice(0, 3).map((cond) => (
              <li key={cond.conditionKey} className="flex items-start gap-2 text-sm text-rose-900">
                <span className="mt-0.5 text-rose-800 font-bold leading-none">·</span>
                {cond.explanation}
              </li>
            ))}
          </ul>
          {eligibility.unmetConditions[0]?.sourceUrl && (
            <a
              href={eligibility.unmetConditions[0].sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-rose-700 underline hover:text-rose-900"
            >
              View provider terms
            </a>
          )}
        </div>
      )}

      {/* Tags */}
      {ranked.categoryTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ranked.categoryTags.map((tag) => (
            <span
              key={tag}
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                TAG_COLORS[tag] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Rate and interest highlight */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-orange-50/50 p-4 border border-orange-200/60 shadow-sm flex flex-col justify-center">
          <p className="text-4xl font-bold text-orange-950 leading-none tracking-tight">
            {effectiveRatePa.toFixed(2)}%
          </p>
          <p className="text-[11px] font-bold text-orange-800/80 mt-2 uppercase tracking-wider">est. rate p.a.</p>
          <p className="text-xs text-orange-800/60 mt-0.5">
            Max {account.totalMaxRatePa.toFixed(2)}% p.a.
          </p>
        </div>
        <div className="rounded-2xl bg-muted/30 p-4 border border-border/60 shadow-sm flex flex-col justify-center">
          <p className="text-4xl font-bold text-foreground leading-none tracking-tight">
            ${annualInterest.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">
            {eligibility.status === "at_risk" ? "Expected based on your profile" : "Estimated annual interest"}
          </p>
          <p
            className={`text-xs font-medium mt-0.5 ${gainPositive ? "text-emerald-700" : "text-rose-600"}`}
          >
            {gainPositive ? "+" : ""}$
            {Math.abs(extraAnnualBenefit).toLocaleString("en-AU", {
              maximumFractionDigits: 0,
            })}{" "}
            vs your current {profile.currentRatePa}%
          </p>
        </div>
      </div>

      {/* Potential upside for at-risk accounts */}
      {eligibility.status === "at_risk" && ranked.potentialUpside !== undefined && ranked.potentialUpside > 0 && (
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/60 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <p className="text-[11px] font-bold text-emerald-800/80 uppercase tracking-wider mb-1">
                Potential if conditions are met
              </p>
              <p className="text-2xl font-bold text-emerald-950 leading-none tracking-tight">
                ${ranked.potentialAnnualInterest?.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-700">
                Unlock +${ranked.potentialUpside.toLocaleString("en-AU", { maximumFractionDigits: 0 })}/yr
              </p>
              <p className="text-xs text-emerald-700/80 mt-0.5">
                by meeting: {eligibility.unmetConditions[0]?.label.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rank reasons */}
      {ranked.rankReasons.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Why this account
          </p>
          <ul className="space-y-1">
            {ranked.rankReasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-foreground font-bold leading-none">·</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {ranked.risks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Things to watch
          </p>
          <ul className="space-y-1">
            {ranked.risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-foreground font-bold leading-none">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border pt-4 mt-2">
        <p className="text-xs text-muted-foreground">
          {account.sourceLabel || "Provider terms need verification"} · {account.lastChecked ? `Last checked ${account.lastChecked}` : "Source needs verification"}
        </p>
        <a
          href={account.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-orange-600 underline hover:text-orange-800"
        >
          View provider terms
        </a>
      </div>
    </div>
  );
}
