"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { UserProfile } from "@/lib/types";

interface ProfileFormProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
}

function formatCurrencyLabel(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

interface SliderFieldProps {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderField({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <span className="text-sm font-semibold text-primary tabular-nums">
          {displayValue}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? (v as number[])[0] : (v as number))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min === 0 ? "0" : min >= 1000 ? formatCurrencyLabel(min) : min}</span>
        <span>{max >= 1000 ? formatCurrencyLabel(max) : max}</span>
      </div>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleField({ label, description, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    onChange({ ...profile, [key]: value });

  return (
    <div className="space-y-6">
      <SliderField
        label="Your age"
        value={profile.age}
        displayValue={`${profile.age} yrs`}
        min={18}
        max={80}
        step={1}
        onChange={(v) => update("age", v)}
      />

      <SliderField
        label="Current savings balance"
        value={profile.currentBalance}
        displayValue={formatCurrencyLabel(profile.currentBalance)}
        min={0}
        max={250_000}
        step={1_000}
        onChange={(v) => update("currentBalance", v)}
      />

      <SliderField
        label="Monthly deposit"
        value={profile.monthlyDeposit}
        displayValue={`${formatCurrencyLabel(profile.monthlyDeposit)}/mo`}
        min={0}
        max={5_000}
        step={100}
        onChange={(v) => update("monthlyDeposit", v)}
      />

      <SliderField
        label="Monthly card transactions"
        value={profile.monthlyCardTransactions}
        displayValue={`${profile.monthlyCardTransactions} txns`}
        min={0}
        max={30}
        step={1}
        onChange={(v) => update("monthlyCardTransactions", v)}
      />

      <div className="border-t border-border pt-5 space-y-4">
        <ToggleField
          label="Balance will grow each month"
          description="Your deposits will exceed any withdrawals"
          value={profile.balanceWillGrow}
          onChange={(v) => update("balanceWillGrow", v)}
        />

        <ToggleField
          label="Open to a linked transaction account"
          description="Some accounts require opening an everyday account with the same bank"
          value={profile.willingToLinkAccount}
          onChange={(v) => update("willingToLinkAccount", v)}
        />

        <ToggleField
          label="New customer at this bank"
          description="Unlocks intro bonus rates (varies by account)"
          value={profile.isNewCustomer}
          onChange={(v) => update("isNewCustomer", v)}
        />
      </div>
    </div>
  );
}
