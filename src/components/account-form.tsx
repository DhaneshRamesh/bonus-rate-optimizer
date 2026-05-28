"use client";

import type { UserProfile } from "@/types/user";

interface AccountFormProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
}

function fmt(value: number, type: "currency" | "rate" | "count" | "age") {
  if (type === "currency")
    return "$" + value.toLocaleString("en-AU", { maximumFractionDigits: 0 });
  if (type === "rate") return value.toFixed(2) + "% p.a.";
  if (type === "count") return String(value);
  return String(value);
}

interface SliderFieldProps {
  label: string;
  micro: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
}

function SliderField({
  label,
  micro,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer hover:opacity-90 transition-opacity"
        style={{
          accentColor: "var(--color-primary)",
          background: `linear-gradient(to right, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-border) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      <p className="text-xs text-muted-foreground leading-snug">{micro}</p>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  micro: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleField({ label, micro, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{micro}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-inner ${
          value ? "bg-primary text-primary-foreground" : "bg-muted shadow-sm"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function AccountForm({ profile, onChange }: AccountFormProps) {
  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    onChange({ ...profile, [key]: value });

  return (
    <aside id="form" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-0.5">
            Your profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Drag the sliders — results update instantly.
          </p>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Try a sample profile
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({
                ...profile,
                wantsFlexibleWithdrawals: true,
                willingToOpenLinkedAccount: false,
                monthlyCardPurchases: 0,
                monthlyNetSavingsGrowth: 0,
                monthlyExternalDeposit: 500,
              })}
              className="text-xs font-semibold px-3.5 py-2 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all duration-200"
            >
              Simple saver
            </button>
            <button
              type="button"
              onClick={() => onChange({
                ...profile,
                willingToOpenLinkedAccount: true,
                monthlyCardPurchases: 5,
                monthlyNetSavingsGrowth: 500,
                monthlyExternalDeposit: 2000,
              })}
              className="text-xs font-semibold px-3.5 py-2 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all duration-200"
            >
              Bonus chaser
            </button>
            <button
              type="button"
              onClick={() => onChange({
                ...profile,
                wantsFlexibleWithdrawals: true,
                monthlyNetSavingsGrowth: -200,
                monthlyCardPurchases: 2,
                monthlyExternalDeposit: 1000,
              })}
              className="text-xs font-semibold px-3.5 py-2 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all duration-200"
            >
              Frequent withdrawer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        <SliderField
          label="Age"
          micro="Some accounts have age restrictions"
          value={profile.age}
          min={18}
          max={80}
          step={1}
          displayValue={`${profile.age} yrs`}
          onChange={(v) => set("age", v)}
        />
        <SliderField
          label="Savings balance"
          micro="Balance caps affect the bonus rate on some accounts"
          value={profile.balance}
          min={0}
          max={200_000}
          step={1_000}
          displayValue={fmt(profile.balance, "currency")}
          onChange={(v) => set("balance", v)}
        />
        <SliderField
          label="Current rate"
          micro="Your existing account's interest rate"
          value={profile.currentRatePa}
          min={0}
          max={6}
          step={0.05}
          displayValue={fmt(profile.currentRatePa, "rate")}
          onChange={(v) => set("currentRatePa", v)}
        />
        <SliderField
          label="Monthly deposit"
          micro="External income deposited each month (payroll, transfer)"
          value={profile.monthlyExternalDeposit}
          min={0}
          max={10_000}
          step={100}
          displayValue={fmt(profile.monthlyExternalDeposit, "currency")}
          onChange={(v) => set("monthlyExternalDeposit", v)}
        />
        <SliderField
          label="Card purchases / month"
          micro="Debit or credit card transactions (some accounts require 5+)"
          value={profile.monthlyCardPurchases}
          min={0}
          max={30}
          step={1}
          displayValue={`${profile.monthlyCardPurchases} txns`}
          onChange={(v) => set("monthlyCardPurchases", v)}
        />
        <SliderField
          label="Net savings growth"
          micro="How much your balance grows (or shrinks) each month"
          value={profile.monthlyNetSavingsGrowth}
          min={-2_000}
          max={5_000}
          step={100}
          displayValue={
            profile.monthlyNetSavingsGrowth >= 0
              ? `+${fmt(profile.monthlyNetSavingsGrowth, "currency")}`
              : fmt(profile.monthlyNetSavingsGrowth, "currency")
          }
          onChange={(v) => set("monthlyNetSavingsGrowth", v)}
        />
      </div>

      <div className="border-t border-border pt-4 space-y-0">
        <ToggleField
          label="Willing to open a linked transaction account"
          micro="Required by some providers to unlock the bonus rate"
          value={profile.willingToOpenLinkedAccount}
          onChange={(v) => set("willingToOpenLinkedAccount", v)}
        />
        <ToggleField
          label="Need flexible withdrawals"
          micro="Growth-sensitive accounts forfeit the bonus if balance dips"
          value={profile.wantsFlexibleWithdrawals}
          onChange={(v) => set("wantsFlexibleWithdrawals", v)}
        />
        <ToggleField
          label="New customer at this provider"
          micro="Unlocks introductory rate offers for the first few months"
          value={profile.isNewCustomerForIntro}
          onChange={(v) => set("isNewCustomerForIntro", v)}
        />
      </div>
    </aside>
  );
}
