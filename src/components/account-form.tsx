"use client";

import type { UserProfile } from "@/types/user";

interface AccountFormProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
}

/**
 * TODO Phase 3: Profile input form.
 * Sliders for age, balance, currentRatePa, monthlyExternalDeposit,
 * monthlyCardPurchases, monthlyNetSavingsGrowth.
 * Toggles for willingToOpenLinkedAccount, wantsFlexibleWithdrawals,
 * isNewCustomerForIntro.
 */
export function AccountForm({ profile: _profile, onChange: _onChange }: AccountFormProps) {
  return (
    <aside className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-foreground mb-1">Your Profile</h2>
      <p className="text-xs text-muted-foreground">Form inputs — coming in Phase 3</p>
    </aside>
  );
}
