import type { EligibilityStatus, SavingsAccountOffer } from "@/types/accounts";
import type { ConditionCheck } from "@/types/ranking";
import type { UserProfile } from "@/types/user";

/** Returns the most severe status from a set of condition checks. */
export function worstStatus(statuses: EligibilityStatus[]): EligibilityStatus {
  if (statuses.includes("not_eligible")) return "not_eligible";
  if (statuses.includes("at_risk")) return "at_risk";
  return "likely_eligible";
}

/**
 * Derives the overall EligibilityStatus from a completed set of condition checks.
 * Pure function — no side effects.
 */
export function deriveEligibilityStatus(checks: ConditionCheck[]): EligibilityStatus {
  if (checks.length === 0) return "likely_eligible";
  return worstStatus(checks.map((c) => c.status));
}

/**
 * Evaluates every bonus condition on an offer against the user's profile.
 * Returns one ConditionCheck per applicable condition.
 * Deterministic: same inputs always produce identical outputs.
 */
export function checkAllConditions(
  offer: SavingsAccountOffer,
  profile: UserProfile
): ConditionCheck[] {
  const checks: ConditionCheck[] = [];

  // ── Monthly deposit ──────────────────────────────────────────────────────
  if (offer.monthlyDepositRequirement !== undefined) {
    const required = offer.monthlyDepositRequirement;
    const actual = profile.monthlyExternalDeposit;
    // at_risk when depositing 50–99% of the requirement
    const status: EligibilityStatus =
      actual >= required ? "likely_eligible" :
      actual >= required * 0.5 ? "at_risk" :
      "not_eligible";

    checks.push({
      conditionKey: "monthly_deposit",
      label: "Monthly deposit",
      required: `$${required.toLocaleString()}+/mo`,
      actual: `$${actual.toLocaleString()}/mo`,
      status,
      gapAction:
        status !== "likely_eligible"
          ? `Deposit at least $${required.toLocaleString()} per month into this account`
          : undefined,
    });
  }

  // ── Card purchases ───────────────────────────────────────────────────────
  if (offer.monthlyCardPurchaseRequirement !== undefined) {
    const required = offer.monthlyCardPurchaseRequirement;
    const actual = profile.monthlyCardPurchases;
    // at_risk when 1 or 2 below the requirement
    const status: EligibilityStatus =
      actual >= required ? "likely_eligible" :
      actual >= required - 2 ? "at_risk" :
      "not_eligible";

    checks.push({
      conditionKey: "card_purchases",
      label: "Card purchases",
      required: `${required}+/mo`,
      actual: `${actual}/mo`,
      status,
      gapAction:
        status !== "likely_eligible"
          ? `Make at least ${required} card purchases per month`
          : undefined,
    });
  }

  // ── Balance growth ───────────────────────────────────────────────────────
  if (offer.monthlyGrowthRequirement) {
    const growth = profile.monthlyNetSavingsGrowth;
    // at_risk when growing by a small positive amount (could easily slip negative)
    const status: EligibilityStatus =
      growth > 100 ? "likely_eligible" :
      growth > 0   ? "at_risk" :
      "not_eligible";

    checks.push({
      conditionKey: "balance_growth",
      label: "Balance growth",
      required: "Must grow each month",
      actual:
        growth > 0
          ? `+$${growth.toLocaleString()}/mo`
          : `$${growth.toLocaleString()}/mo`,
      status,
      gapAction:
        status !== "likely_eligible"
          ? "Ensure your balance grows every month (deposits exceed withdrawals)"
          : undefined,
    });
  }

  // ── Linked account ───────────────────────────────────────────────────────
  if (offer.requiresLinkedAccount) {
    const willing = profile.willingToOpenLinkedAccount;
    checks.push({
      conditionKey: "linked_account",
      label: "Linked account",
      required: `Open a ${offer.provider} transaction account`,
      actual: willing ? "Willing to open" : "Not willing",
      status: willing ? "likely_eligible" : "not_eligible",
      gapAction: willing
        ? undefined
        : `Open a linked everyday transaction account with ${offer.provider}`,
    });
  }

  // ── Age — minimum ────────────────────────────────────────────────────────
  if (offer.ageMin !== undefined) {
    const met = profile.age >= offer.ageMin;
    checks.push({
      conditionKey: "age_min",
      label: "Minimum age",
      required: `${offer.ageMin}+`,
      actual: `Age ${profile.age}`,
      status: met ? "likely_eligible" : "not_eligible",
      gapAction: undefined, // cannot change age
    });
  }

  // ── Age — maximum ────────────────────────────────────────────────────────
  if (offer.ageMax !== undefined) {
    const met = profile.age <= offer.ageMax;
    checks.push({
      conditionKey: "age_max",
      label: "Maximum age",
      required: `Under ${offer.ageMax + 1}`,
      actual: `Age ${profile.age}`,
      status: met ? "likely_eligible" : "not_eligible",
      gapAction: undefined,
    });
  }

  // ── Withdrawal flexibility ───────────────────────────────────────────────
  // Flag as at_risk when the user wants flexible withdrawals but the account
  // restricts them. Not not_eligible — depends on actual cash flow behaviour.
  if (offer.withdrawalFlexibility !== "full" && profile.wantsFlexibleWithdrawals) {
    checks.push({
      conditionKey: "withdrawal_flexibility",
      label: "Withdrawal flexibility",
      required:
        offer.withdrawalFlexibility === "growth-sensitive"
          ? "Balance must grow each month"
          : "Withdrawals via linked account only",
      actual: "Wants flexible access",
      status: "at_risk",
      gapAction:
        "Consider whether this account's withdrawal restrictions fit your cash flow needs",
    });
  }

  return checks;
}
