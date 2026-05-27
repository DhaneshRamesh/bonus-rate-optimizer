import type {
  AccountCondition,
  AccountResult,
  ConditionCheck,
  SavingsAccount,
  UserProfile,
} from "./types";

function checkCondition(
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
          : "Ensure your balance grows each month (total deposits exceed withdrawals)",
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
        gapAction: null, // can't change age
      };
    }
  }
}

export function analyzeAccount(
  account: SavingsAccount,
  profile: UserProfile
): AccountResult {
  const conditionChecks = account.conditions.map((c) =>
    checkCondition(c, profile)
  );

  const allBonusConditionsMet =
    conditionChecks.length === 0 || conditionChecks.every((c) => c.met);
  const conditionsMetCount = conditionChecks.filter((c) => c.met).length;
  const totalConditions = conditionChecks.length;
  const eligibilityScore =
    totalConditions === 0
      ? 100
      : Math.round((conditionsMetCount / totalConditions) * 100);

  const isIntroApplicable = !!(
    account.introRate &&
    account.introMonths &&
    profile.isNewCustomer
  );

  const effectiveBalance = account.balanceCap
    ? Math.min(profile.currentBalance, account.balanceCap)
    : profile.currentBalance;

  const balanceExceedsCap = !!(
    account.balanceCap && profile.currentBalance > account.balanceCap
  );

  let estimatedRate: number;
  let estimatedAnnualInterest: number;

  if (isIntroApplicable) {
    const introMonths = account.introMonths!;
    const postIntroRate = allBonusConditionsMet
      ? account.baseRate + account.bonusRate
      : account.baseRate;
    // Blended rate across the full year
    estimatedRate =
      (account.introRate! * introMonths + postIntroRate * (12 - introMonths)) /
      12;
    estimatedAnnualInterest = (effectiveBalance * estimatedRate) / 100;
  } else {
    estimatedRate = allBonusConditionsMet
      ? account.baseRate + account.bonusRate
      : account.baseRate;
    estimatedAnnualInterest = (effectiveBalance * estimatedRate) / 100;
  }

  const gapActions = conditionChecks
    .filter((c) => !c.met && c.gapAction)
    .map((c) => c.gapAction!);

  const explanation = buildExplanation(
    account,
    conditionChecks,
    allBonusConditionsMet,
    conditionsMetCount,
    totalConditions,
    estimatedRate,
    isIntroApplicable,
    balanceExceedsCap
  );

  return {
    account,
    conditionChecks,
    allBonusConditionsMet,
    conditionsMetCount,
    totalConditions,
    eligibilityScore,
    estimatedRate,
    estimatedAnnualInterest,
    isIntroApplicable,
    balanceExceedsCap,
    gapActions,
    explanation,
  };
}

function buildExplanation(
  account: SavingsAccount,
  conditionChecks: ConditionCheck[],
  allMet: boolean,
  metCount: number,
  total: number,
  estimatedRate: number,
  isIntroApplicable: boolean,
  balanceExceedsCap: boolean
): string {
  let text: string;

  if (total === 0 && isIntroApplicable) {
    text = `As a new customer, you'd earn ${account.introRate}% p.a. for the first ${account.introMonths} months, then ${account.baseRate}% p.a. automatically — no ongoing conditions required.`;
  } else if (total === 0) {
    text = `No ongoing conditions needed. You earn ${account.baseRate}% p.a. automatically.`;
  } else if (allMet) {
    text = `You meet all ${total} condition${total !== 1 ? "s" : ""} — you'd earn the full ${estimatedRate.toFixed(2)}% p.a.`;
  } else {
    const unmet = total - metCount;
    const unmetConditions = conditionChecks
      .filter((c) => !c.met)
      .map((c) => c.condition.shortLabel)
      .join(", ");
    if (metCount === 0) {
      text = `You don't currently meet any of the ${total} conditions, so you'd only earn the base rate of ${account.baseRate}% p.a. Missing: ${unmetConditions}.`;
    } else {
      text = `You meet ${metCount} of ${total} conditions. Missing ${unmet} (${unmetConditions}) means you'd only earn the base rate of ${account.baseRate}% p.a.`;
    }
  }

  if (balanceExceedsCap) {
    text += ` Note: only $${account.balanceCap?.toLocaleString()} of your balance earns the bonus rate.`;
  }

  return text;
}

export function rankAccounts(
  accounts: SavingsAccount[],
  profile: UserProfile
): AccountResult[] {
  return accounts
    .map((account) => analyzeAccount(account, profile))
    .sort((a, b) => {
      // Primary: highest estimated annual interest
      if (Math.abs(b.estimatedAnnualInterest - a.estimatedAnnualInterest) > 0.01) {
        return b.estimatedAnnualInterest - a.estimatedAnnualInterest;
      }
      // Tiebreak: highest eligibility score
      return b.eligibilityScore - a.eligibilityScore;
    });
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
