"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatRate } from "@/lib/engine";
import type { AccountResult } from "@/lib/types";
import { CheckCircle2, ChevronDown, ChevronUp, Info, XCircle } from "lucide-react";
import { useState } from "react";

interface AccountCardProps {
  result: AccountResult;
  rank: number;
}

export function AccountCard({ result, rank }: AccountCardProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    account,
    conditionChecks,
    allBonusConditionsMet,
    eligibilityScore,
    estimatedRate,
    estimatedAnnualInterest,
    isIntroApplicable,
    balanceExceedsCap,
    gapActions,
    explanation,
    conditionsMetCount,
    totalConditions,
  } = result;

  const eligibilityLabel =
    eligibilityScore === 100
      ? "Fully eligible"
      : eligibilityScore >= 50
      ? "Partially eligible"
      : "Not eligible";

  const eligibilityColor =
    eligibilityScore === 100
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : eligibilityScore >= 50
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";

  const isTopPick = rank === 1;

  return (
    <Card
      className={`overflow-hidden transition-shadow hover:shadow-md ${
        isTopPick ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Bank logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
              style={{ backgroundColor: account.bankColor }}
            >
              {account.bankInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                {account.bank}
              </p>
              <h3 className="font-semibold text-foreground leading-tight truncate">
                {account.accountName}
              </h3>
            </div>
          </div>

          {/* Right side badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isTopPick && (
              <span className="text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                Top Pick
              </span>
            )}
            <span
              className={`text-xs font-medium border px-2.5 py-0.5 rounded-full ${eligibilityColor}`}
            >
              {eligibilityLabel}
            </span>
          </div>
        </div>

        {/* Rate display */}
        <div className="mt-3 flex items-end gap-3 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Estimated rate
            </p>
            <p className="text-3xl font-bold text-foreground leading-none">
              {formatRate(estimatedRate)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                p.a.
              </span>
            </p>
          </div>
          {estimatedRate < account.advertisedRate && (
            <div className="text-sm text-muted-foreground line-through">
              {formatRate(account.advertisedRate)} advertised
            </div>
          )}
          {isIntroApplicable && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
              Blended (intro applies)
            </Badge>
          )}
        </div>

        {/* Annual interest estimate */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-muted-foreground text-sm">Estimated</span>
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat("en-AU", {
              style: "currency",
              currency: "AUD",
              maximumFractionDigits: 0,
            }).format(estimatedAnnualInterest)}
          </span>
          <span className="text-muted-foreground text-sm">/ year</span>
          {balanceExceedsCap && (
            <span className="text-xs text-amber-600 flex items-center gap-0.5 ml-1">
              <Info size={12} />
              capped at {formatCurrency(account.balanceCap!)}
            </span>
          )}
        </div>

        {/* Eligibility progress bar */}
        {totalConditions > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {conditionsMetCount} of {totalConditions} condition
                {totalConditions !== 1 ? "s" : ""} met
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {eligibilityScore}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  eligibilityScore === 100
                    ? "bg-emerald-500"
                    : eligibilityScore >= 50
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${eligibilityScore}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Explanation */}
        <p className="text-sm text-muted-foreground italic mb-3">
          {explanation}
        </p>

        {/* Expand / collapse conditions */}
        {totalConditions > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-2"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {expanded ? "Hide" : "Show"} conditions
          </button>
        )}

        {expanded && totalConditions > 0 && (
          <ul className="space-y-2 mb-3">
            {conditionChecks.map((check, i) => (
              <li key={i} className="flex items-start gap-2">
                {check.met ? (
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 mt-0.5 shrink-0"
                  />
                ) : (
                  <XCircle
                    size={16}
                    className="text-red-400 mt-0.5 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {check.condition.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You: {check.userValueLabel} · Required:{" "}
                    {check.requiredValueLabel}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Gap actions */}
        {gapActions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1.5">
              To unlock the bonus rate:
            </p>
            <ul className="space-y-1">
              {gapActions.map((action, i) => (
                <li
                  key={i}
                  className="text-xs text-amber-700 flex items-start gap-1.5"
                >
                  <span className="mt-0.5 shrink-0">→</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {account.notes.length > 0 && expanded && (
          <div className="mt-3 space-y-0.5">
            {account.notes.map((note, i) => (
              <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="shrink-0">·</span>
                {note}
              </p>
            ))}
          </div>
        )}

        {/* Source note */}
        {expanded && (
          <p className="text-xs text-muted-foreground/60 mt-2 border-t border-border pt-2">
            {account.sourceNote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
