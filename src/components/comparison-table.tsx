"use client";

import type { RankedAccount } from "@/types/ranking";

interface ComparisonTableProps {
  results: RankedAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_STYLE = {
  likely_eligible: "bg-emerald-100 text-emerald-700",
  at_risk: "bg-amber-100 text-amber-700",
  not_eligible: "bg-stone-100 text-stone-500",
};

const STATUS_LABEL = {
  likely_eligible: "Likely eligible",
  at_risk: "At risk",
  not_eligible: "Base rate",
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
    <div className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100">
        <h3 className="text-sm font-semibold text-stone-900">All accounts compared</h3>
        <p className="text-xs text-stone-400 mt-0.5">Click any row to view details</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              <th className="text-left text-xs font-semibold text-stone-500 px-5 py-3 whitespace-nowrap">
                Account
              </th>
              <th className="text-right text-xs font-semibold text-stone-500 px-4 py-3 whitespace-nowrap">
                Your rate
              </th>
              <th className="text-right text-xs font-semibold text-stone-500 px-4 py-3 whitespace-nowrap">
                Max rate
              </th>
              <th className="text-right text-xs font-semibold text-stone-500 px-4 py-3 whitespace-nowrap">
                Est. annual
              </th>
              <th className="text-right text-xs font-semibold text-stone-500 px-4 py-3 whitespace-nowrap">
                Gain vs current
              </th>
              <th className="text-center text-xs font-semibold text-stone-500 px-4 py-3 whitespace-nowrap">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-stone-500 px-5 py-3 whitespace-nowrap">
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
                  className={`border-b border-stone-50 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-orange-50"
                      : i % 2 === 0
                        ? "hover:bg-stone-50/80 bg-white"
                        : "hover:bg-stone-50/80 bg-stone-50/30"
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-stone-900 whitespace-nowrap">
                          {ranked.account.provider}
                        </p>
                        <p className="text-xs text-stone-400">{ranked.account.productName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-stone-800 whitespace-nowrap tabular-nums">
                    {ranked.effectiveRatePa.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3.5 text-right text-stone-400 whitespace-nowrap tabular-nums">
                    {ranked.account.totalMaxRatePa.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-stone-800 whitespace-nowrap tabular-nums">
                    ${ranked.annualInterest.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-semibold whitespace-nowrap tabular-nums ${
                      gainPositive ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {gainPositive ? "+" : ""}$
                    {Math.abs(ranked.extraAnnualBenefit).toLocaleString("en-AU", {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLE[ranked.eligibility.status]}`}
                    >
                      {STATUS_LABEL[ranked.eligibility.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-500 max-w-[200px]">
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
