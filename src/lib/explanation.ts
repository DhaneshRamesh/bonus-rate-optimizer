import type { SavingsAccount } from "@/types/accounts";
import type { ConditionCheck } from "@/types/ranking";

/**
 * Builds a deterministic plain-English explanation of why a user would or
 * wouldn't earn the bonus rate on a given account.
 *
 * This is the fallback for the AI explanation panel — always present,
 * always accurate, never hallucinates.
 */
export function buildExplanation(
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
    const unmetLabels = conditionChecks
      .filter((c) => !c.met)
      .map((c) => c.condition.shortLabel)
      .join(", ");

    if (metCount === 0) {
      text = `You don't currently meet any of the ${total} conditions, so you'd only earn the base rate of ${account.baseRate}% p.a. Missing: ${unmetLabels}.`;
    } else {
      text = `You meet ${metCount} of ${total} conditions. Missing ${unmet} (${unmetLabels}) means you'd only earn the base rate of ${account.baseRate}% p.a.`;
    }
  }

  if (balanceExceedsCap) {
    text += ` Note: only $${account.balanceCap?.toLocaleString()} of your balance earns the bonus rate.`;
  }

  return text;
}
