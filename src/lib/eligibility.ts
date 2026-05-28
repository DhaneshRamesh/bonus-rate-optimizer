import type { EligibilityStatus, SavingsAccountOffer } from "@/types/accounts";
import type { ConditionCheck, EligibilityResult, EligibilityReason } from "@/types/ranking";
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

export function checkEligibility(
  user: UserProfile,
  account: SavingsAccountOffer
): EligibilityResult {
  const sourceUrl = account.sourceUrl || "#";
  const sourceLabel = account.sourceLabel || "Provider terms need verification before production use.";

  const metConditions: EligibilityReason[] = [];
  const unmetConditions: EligibilityReason[] = [];
  const warnings: EligibilityReason[] = [];
  let status: EligibilityStatus = "likely_eligible";
  let hardIneligible = false;

  const pushReason = (
    arr: EligibilityReason[],
    statusType: "met" | "unmet" | "warning",
    key: EligibilityReason["conditionKey"],
    label: string,
    explanation: string,
    req?: string | number | boolean,
    act?: string | number | boolean
  ) => {
    arr.push({
      conditionKey: key,
      status: statusType,
      label,
      explanation,
      requiredValue: req,
      userValue: act,
      sourceUrl,
      sourceLabel,
    });
  };

  // ── Age — hard blockers, early return ────────────────────────────────────
  if (account.ageMin !== undefined && user.age < account.ageMin) {
    pushReason(
      unmetConditions,
      "unmet",
      "age",
      "Age requirement not met",
      `This account requires you to be at least ${account.ageMin} years old.`,
      `${account.ageMin}+`,
      user.age
    );
    return { status: "not_eligible", hardIneligible: true, metConditions, unmetConditions, warnings };
  }
  if (account.ageMax !== undefined && user.age > account.ageMax) {
    pushReason(
      unmetConditions,
      "unmet",
      "age",
      "Age requirement not met",
      `This account requires you to be ${account.ageMax} years old or younger.`,
      `<= ${account.ageMax}`,
      user.age
    );
    return { status: "not_eligible", hardIneligible: true, metConditions, unmetConditions, warnings };
  }

  // ── Linked account ───────────────────────────────────────────────────────
  if (account.requiresLinkedAccount) {
    if (user.willingToOpenLinkedAccount) {
      pushReason(
        metConditions,
        "met",
        "linked_account",
        "Linked account",
        `You are willing to open the required linked transaction account with ${account.provider}.`,
        true,
        true
      );
    } else {
      pushReason(
        unmetConditions,
        "unmet",
        "linked_account",
        "Linked account required",
        `The bonus rate requires opening a linked transaction account with ${account.provider}.`,
        true,
        false
      );
      status = "not_eligible";
      hardIneligible = true; // Rule: linked account refusal is a hard disqualifier
    }
  }

  // ── Monthly deposit ──────────────────────────────────────────────────────
  if (account.monthlyDepositRequirement !== undefined) {
    const required = account.monthlyDepositRequirement;
    const actual = user.monthlyExternalDeposit;
    if (actual >= required) {
      pushReason(
        metConditions,
        "met",
        "monthly_deposit",
        "Monthly deposit",
        `You meet the $${required.toLocaleString()} monthly deposit requirement.`,
        `$${required.toLocaleString()}`,
        `$${actual.toLocaleString()}`
      );
    } else {
      pushReason(
        unmetConditions,
        "unmet",
        "monthly_deposit",
        "Deposit shortfall",
        `You must deposit at least $${required.toLocaleString()} per month.`,
        `$${required.toLocaleString()}`,
        `$${actual.toLocaleString()}`
      );
      if (status !== "not_eligible") status = "at_risk";
    }
  }

  // ── Card purchases ───────────────────────────────────────────────────────
  if (account.monthlyCardPurchaseRequirement !== undefined) {
    const required = account.monthlyCardPurchaseRequirement;
    const actual = user.monthlyCardPurchases;
    if (actual >= required) {
      pushReason(
        metConditions,
        "met",
        "card_purchases",
        "Card purchases",
        `You meet the requirement of ${required} card purchases per month.`,
        required,
        actual
      );
    } else {
      pushReason(
        unmetConditions,
        "unmet",
        "card_purchases",
        "Card purchases shortfall",
        `You must make at least ${required} card purchases per month.`,
        required,
        actual
      );
      if (status !== "not_eligible") status = "at_risk";
    }
  }

  // ── Balance growth ───────────────────────────────────────────────────────
  if (account.monthlyGrowthRequirement) {
    const growth = user.monthlyNetSavingsGrowth;
    if (growth > 100) {
      pushReason(
        metConditions,
        "met",
        "monthly_growth",
        "Balance growth",
        "Your balance is projected to grow each month.",
        "Positive growth",
        `+$${growth.toLocaleString()}`
      );
    } else {
      pushReason(
        unmetConditions,
        "unmet",
        "monthly_growth",
        "Balance growth at risk",
        "Your balance must grow each month (excluding interest) to earn the bonus.",
        "Positive growth",
        growth > 0 ? `+$${growth.toLocaleString()}` : `$${growth.toLocaleString()}`
      );
      if (status !== "not_eligible") status = "at_risk";
    }
  }

  // ── Withdrawal flexibility warning ───────────────────────────────────────
  if (account.withdrawalFlexibility !== "full" && user.wantsFlexibleWithdrawals) {
    if (status === "likely_eligible") status = "at_risk";
    pushReason(
      unmetConditions,
      "unmet",
      "withdrawal_flexibility",
      "Withdrawal restrictions",
      account.withdrawalFlexibility === "growth-sensitive"
        ? "Any net withdrawal this month forfeits the bonus rate."
        : "Withdrawals must be made via a linked account.",
      "No/limited withdrawals",
      "Needs flexibility"
    );
  }

  // ── Intro rate warning ───────────────────────────────────────────────────
  if (account.introRatePa !== undefined && account.introMonths !== undefined) {
    if (user.isNewCustomerForIntro) {
      pushReason(
        warnings,
        "warning",
        "intro_eligibility",
        "Introductory rate applies",
        `The ${account.introRatePa}% p.a. rate applies for the first ${account.introMonths} months only.`,
        "New customer",
        "New customer"
      );
    } else {
      pushReason(
        warnings,
        "warning",
        "intro_eligibility",
        "Introductory rate ineligible",
        `The advertised intro rate is for new customers only. The standard ongoing rate is used instead.`,
        "New customer",
        "Existing customer"
      );
    }
  }

  // ── Balance cap warning ──────────────────────────────────────────────────
  if (account.capAmount !== undefined) {
    if (user.balance > account.capAmount) {
      pushReason(
        warnings,
        "warning",
        "balance_cap",
        "Balance exceeds cap",
        `The bonus rate applies only to balances up to $${account.capAmount.toLocaleString()}. The excess earns a lower base rate.`,
        `<= $${account.capAmount.toLocaleString()}`,
        `$${user.balance.toLocaleString()}`
      );
    } else {
      pushReason(
        metConditions,
        "met",
        "balance_cap",
        "Within balance cap",
        `Your balance is under the $${account.capAmount.toLocaleString()} cap for the maximum rate.`,
        `<= $${account.capAmount.toLocaleString()}`,
        `$${user.balance.toLocaleString()}`
      );
    }
  }

  // ── Stale data warning ───────────────────────────────────────────────────
  pushReason(
    warnings,
    "warning",
    "provider_terms",
    "Verify provider terms",
    `Rates last verified ${account.lastChecked} — always confirm current terms at the provider.`,
    undefined,
    undefined
  );

  return { status, hardIneligible, metConditions, unmetConditions, warnings };
}
