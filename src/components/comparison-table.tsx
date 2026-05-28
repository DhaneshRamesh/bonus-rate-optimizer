"use client";

import type { RankedAccount } from "@/types/ranking";

interface ComparisonTableProps {
  results: RankedAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_STYLE = {
  likely_eligible: "bg-emerald-100 text-emerald-800 font-semibold",
  at_risk: "bg-amber-100 text-amber-800 font-semibold",
  not_eligible: "bg-muted text-muted-foreground",
};

const STATUS_LABEL = {
  likely_eligible: "Likely eligible",
  at_risk: "At risk",
  not_eligible: "Not eligible",
};

function conditionSummary(ranked: RankedAccount): string {
  const { account } = ranked;
  const parts: string[] = [];
  if (account.monthlyDepositRequirement)
    parts.push(`$${account.monthlyDepositRequirement.toLocaleString()} deposit`);
  if (account.monthlyCardPurchaseRequirement)
    parts.push(`${account.monthlyCardPurchaseRequirement}+ card txns`);
  if (account.monthlyGrowthRequirement) parts.push("balance growth");
  if (account.requiresLinkedAccount) parts.push("linked account");
  if (parts.length === 0) return "None";
  return parts.join(", ");
}

export function ComparisonTable({ results, selectedId, onSelect }: ComparisonTableProps) {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">All accounts compared</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Click any row to view details</p>
      </div>
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-4 py-4 whitespace-nowrap">
                Account
              </th>
              <th className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-4 whitespace-nowrap">
                Your rate
              </th>
              <th className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-4 whitespace-nowrap">
                Max rate
              </th>
              <th className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-4 whitespace-nowrap">
                Est. annual
              </th>
              <th className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-4 whitespace-nowrap">
                Gain vs current
              </th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-4 whitespace-nowrap">
                Eligibility
              </th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-4 py-4 whitespace-nowrap">
                Monthly conditions
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((ranked, i) => {
              const isSelected = selectedId === ranked.account.id;
              const gainPositive = ranked.extraAnnualBenefit >= 0;

              return (
                <tr
                  key={ranked.account.id}
                  onClick={() => onSelect(ranked.account.id)}
                  className={`border-b border-border/50 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-orange-50/70 text-foreground ring-1 ring-inset ring-orange-200"
                      : "text-muted-foreground hover:bg-muted/40"
                  } ${!isSelected && (i % 2 === 0 ? "bg-card" : "bg-muted/10")}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-foreground whitespace-nowrap">
                          {ranked.account.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">{ranked.account.productName}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1 whitespace-nowrap">
                          {ranked.account.sourceLabel || "Provider terms"} · {ranked.account.lastChecked ? `Last checked ${ranked.account.lastChecked}` : "Source needs verification"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-right font-semibold text-foreground whitespace-nowrap tabular-nums">
                    {ranked.effectiveRatePa.toFixed(2)}%
                  </td>
                  <td className="px-3 py-4 text-right text-muted-foreground whitespace-nowrap tabular-nums">
                    {ranked.account.totalMaxRatePa.toFixed(2)}%
                  </td>
                  <td className="px-3 py-4 text-right font-medium text-foreground whitespace-nowrap tabular-nums">
                    ${ranked.annualInterest.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
                  </td>
                  <td
                    className={`px-3 py-4 text-right font-bold whitespace-nowrap tabular-nums ${
                      gainPositive ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {gainPositive ? "+" : ""}$
                    {Math.abs(ranked.extraAnnualBenefit).toLocaleString("en-AU", {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-3 py-4 text-left">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLE[ranked.eligibility.status]}`}
                      >
                        {STATUS_LABEL[ranked.eligibility.status]}
                      </span>
                      {ranked.eligibility.status !== "likely_eligible" && ranked.eligibility.unmetConditions.length > 0 && (
                        <>
                          <span className="text-[11px] text-muted-foreground leading-tight">
                            {ranked.eligibility.unmetConditions[0].label}
                          </span>
                          <a
                            href={ranked.eligibility.unmetConditions[0].sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-muted-foreground underline hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Provider terms
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                    {conditionSummary(ranked)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
