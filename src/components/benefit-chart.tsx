"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { RankedAccount } from "@/types/ranking";

interface BenefitChartProps {
  results: RankedAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface ChartEntry {
  id: string;
  name: string;
  value: number;
  annualInterest: number;
  status: string;
}

function buildLabel(account: { provider: string; productName: string }): string {
  const p = account.provider.replace(" Bank", "").replace(" Savings", "");
  return `${p} · ${account.productName}`;
}

export function BenefitChart({ results, selectedId, onSelect }: BenefitChartProps) {
  const data: ChartEntry[] = [...results]
    .sort((a, b) => b.extraAnnualBenefit - a.extraAnnualBenefit)
    .map((r) => ({
      id: r.account.id,
      name: buildLabel(r.account),
      value: Math.round(r.extraAnnualBenefit),
      annualInterest: Math.round(r.annualInterest),
      status: r.eligibility.status,
    }));

  const barColor = (entry: ChartEntry) => {
    if (entry.id === selectedId) return "#FF7B40"; // primary
    if (entry.value >= 0) return "#FFB28B"; // soft orange
    return "#FCA5A5";
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Annual gain vs your current rate
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click a bar to select that account
        </p>
      </div>
      <ResponsiveContainer width="100%" height={data.length * 44 + 20}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
          barSize={18}
        >
          <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="#E8E3DF" />
          <XAxis
            type="number"
            tickFormatter={(v) =>
              v === 0 ? "$0" : `${v > 0 ? "+" : ""}$${Math.abs(v).toLocaleString("en-AU")}`
            }
            tick={{ fontSize: 11, fill: "#8B8580", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fontSize: 11, fill: "#1E1A17", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(rawValue, _name, item) => {
              const value = typeof rawValue === "number" ? rawValue : 0;
              const entry = item.payload as ChartEntry;
              return [
                `$${entry.annualInterest.toLocaleString("en-AU")} est. interest (${value >= 0 ? "+" : ""}$${Math.abs(value).toLocaleString("en-AU")} vs current)`,
                "Annual benefit",
              ];
            }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: "1px solid #E8E3DF",
              background: "#FFFFFF",
              color: "#1E1A17",
              fontWeight: 600,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          />
          <ReferenceLine x={0} stroke="#D6D3D1" strokeWidth={1} />
          <Bar
            dataKey="value"
            isAnimationActive={false}
            radius={[0, 8, 8, 0]}
            cursor="pointer"
            onClick={(barData) => {
              const entry = barData as unknown as ChartEntry;
              onSelect(entry.id);
            }}
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={barColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
