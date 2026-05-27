import type { EligibilityStatus, SavingsAccountOffer } from "@/types/accounts";
import type { ConditionCheck, EligibilityResult } from "@/types/ranking";
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

/**
 * High-level eligibility check for UI display.
 * Returns a flat result with human-readable condition labels and advisory warnings.
 * Age failures are hard blockers (hardIneligible: true, early return).
 * Deposit/card/growth failures are behavioural (at_risk, not not_eligible).
 * Deterministic: same inputs always produce identical outputs.
 */
export function checkEligibility(
  user: UserProfile,
  account: SavingsAccountOffer
): EligibilityResult {
  // ── Age — hard blockers, early return ────────────────────────────────────
  if (account.ageMin !== undefined && user.age < account.ageMin) {
    return {
      status: "not_eligible",
      hardIneligible: true,
      metConditions: [],
      unmetConditions: [`Must be at least ${account.ageMin} years old`],
      warnings: [],
    };
  }
  if (account.ageMax !== undefined && user.age > account.ageMax) {
    return {
      status: "not_eligible",
      hardIneligible: true,
      metConditions: [],
      unmetConditions: [`Must be ${account.ageMax} or younger`],
      warnings: [],
    };
  }

  const metConditions: string[] = [];
  const unmetConditions: string[] = [];
  const warnings: string[] = [];
  let status: EligibilityStatus = "likely_eligible";

  // ── Linked account ───────────────────────────────────────────────────────
  if (account.requiresLinkedAccount) {
    const label = `Open a linked ${account.provider} transaction account`;
    if (user.willingToOpenLinkedAccount) {
      metConditions.push(label);
    } else {
      unmetConditions.push(label);
      status = "not_eligible";
    }
  }

  // ── Monthly deposit ──────────────────────────────────────────────────────
  if (account.monthlyDepositRequirement !== undefined) {
    const required = account.monthlyDepositRequirement;
    const actual = user.monthlyExternalDeposit;
    if (actual >= required) {
      metConditions.push(`Deposit $${required.toLocaleString()}+ per month`);
    } else {
      unmetConditions.push(
        `Deposit $${required.toLocaleString()}+ per month (currently $${actual.toLocaleString()})`
      );
      if (status !== "not_eligible") status = "at_risk";
    }
  }

  // ── Card purchases ───────────────────────────────────────────────────────
  if (account.monthlyCardPurchaseRequirement !== undefined) {
    const required = account.monthlyCardPurchaseRequirement;
    const actual = user.monthlyCardPurchases;
    if (actual >= required) {
      metConditions.push(`Make ${required}+ card purchases per month`);
    } else {
      unmetConditions.push(
        `Make ${required}+ card purchases per month (currently ${actual})`
      );
      if (status !== "not_eligible") status = "at_risk";
    }
  }

  // ── Balance growth ───────────────────────────────────────────────────────
  if (account.monthlyGrowthRequirement) {
    const growth = user.monthlyNetSavingsGrowth;
    if (growth > 100) {
      metConditions.push("Balance grows each month");
    } else {
      const actualStr = growth > 0 ? `+$${growth.toLocaleString()}` : `$${growth.toLocaleString()}`;
      unmetConditions.push(`Balance must grow each month (currently ${actualStr}/mo)`);
      if (status !== "not_eligible") status = "at_risk";
    }
  }

  // ── Withdrawal flexibility warning ───────────────────────────────────────
  if (account.withdrawalFlexibility !== "full" && user.wantsFlexibleWithdrawals) {
    if (status === "likely_eligible") status = "at_risk";
    warnings.push(
      account.withdrawalFlexibility === "growth-sensitive"
        ? "Any withdrawal this month forfeits the bonus rate"
        : "Withdrawals must be made via a linked account"
    );
  }

  // ── Intro rate warning ───────────────────────────────────────────────────
  if (account.introRatePa !== undefined && account.introMonths !== undefined) {
    warnings.push(
      `Intro rate of ${account.introRatePa}% p.a. applies for the first ${account.introMonths} months only`
    );
  }

  // ── Balance cap warning ──────────────────────────────────────────────────
  if (account.capAmount !== undefined) {
    warnings.push(
      `Bonus rate applies on balances up to $${account.capAmount.toLocaleString()} only`
    );
  }

  // ── Stale data warning ───────────────────────────────────────────────────
  warnings.push(
    `Rates last verified ${account.lastChecked} — always confirm current terms at ${account.sourceLabel}`
  );

  return { status, hardIneligible: false, metConditions, unmetConditions, warnings };
}
