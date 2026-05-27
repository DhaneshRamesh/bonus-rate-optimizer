import type { AccountCondition, ConditionCheck, UserProfile } from "@/types";

/**
 * Evaluates a single account condition against a user profile.
 * Returns a structured result with met/not-met status and a gap action.
 * Pure function — no side effects, fully testable.
 */
export function checkCondition(
  condition: AccountCondition,
  profile: UserProfile
): ConditionCheck {
  switch (condition.type) {
    case "min_monthly_deposit": {
      const required = condition.amount ?? 0;
      const met = profile.monthlyDeposit >= required;
      return {
        condition,
        met,
        userValueLabel: `$${profile.monthlyDeposit.toLocaleString()}/mo`,
        requiredValueLabel: `$${required.toLocaleString()}/mo`,
        gapAction: met
          ? null
          : `Deposit at least $${required.toLocaleString()} per month`,
      };
    }

    case "balance_growth": {
      return {
        condition,
        met: profile.balanceWillGrow,
        userValueLabel: profile.balanceWillGrow ? "Growing" : "Not growing",
        requiredValueLabel: "Must grow each month",
        gapAction: profile.balanceWillGrow
          ? null
          : "Ensure your balance grows each month (deposits exceed withdrawals)",
      };
    }

    case "no_withdrawals": {
      return {
        condition,
        met: profile.balanceWillGrow,
        userValueLabel: profile.balanceWillGrow ? "No withdrawals" : "Making withdrawals",
        requiredValueLabel: "No withdrawals that month",
        gapAction: profile.balanceWillGrow
          ? null
          : "Avoid making any withdrawals during the month",
      };
    }

    case "min_card_transactions": {
      const required = condition.count ?? 0;
      const met = profile.monthlyCardTransactions >= required;
      const accountNote = condition.linkedAccount
        ? ` with your ${condition.linkedAccount}`
        : "";
      return {
        condition,
        met,
        userValueLabel: `${profile.monthlyCardTransactions} txns/mo`,
        requiredValueLabel: `${required}+ txns/mo`,
        gapAction: met
          ? null
          : `Make at least ${required} card purchases per month${accountNote}`,
      };
    }

    case "linked_account_required": {
      const accountName = condition.linkedAccount ?? "linked account";
      return {
        condition,
        met: profile.willingToLinkAccount,
        userValueLabel: profile.willingToLinkAccount ? "Willing to link" : "Not interested",
        requiredValueLabel: accountName,
        gapAction: profile.willingToLinkAccount
          ? null
          : `Open a ${accountName} as your everyday transaction account`,
      };
    }

    case "age_max": {
      const maxAge = condition.maxAge ?? 999;
      const met = profile.age <= maxAge;
      return {
        condition,
        met,
        userValueLabel: `Age ${profile.age}`,
        requiredValueLabel: `${maxAge} or under`,
        gapAction: null, // cannot change age
      };
    }
  }
}
