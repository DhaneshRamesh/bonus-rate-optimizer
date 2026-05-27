import type { EligibilityStatus, SavingsAccountOffer } from "@/types/accounts";
import type { ConditionCheck } from "@/types/ranking";

/**
 * Builds a deterministic plain-English explanation of the account result.
 * This is the always-present fallback — the AI panel (Phase 3) can optionally
 * enhance it, but this version is always accurate and never hallucinates.
 */
export function buildExplanation(
  offer: SavingsAccountOffer,
  conditionChecks: ConditionCheck[],
  eligibilityStatus: EligibilityStatus,
  estimatedRatePa: number,
  isIntroApplicable: boolean,
  balanceAboveCap: boolean
): string {
  const totalConditions = conditionChecks.filter(
    (c) => c.conditionKey !== "withdrawal_flexibility"
  ).length;
  const metCount = conditionChecks.filter(
    (c) => c.status === "likely_eligible" && c.conditionKey !== "withdrawal_flexibility"
  ).length;

  let text: string;

  if (totalConditions === 0 && isIntroApplicable) {
    text =
      `As a new customer, you'd earn ${offer.introRatePa}% p.a. for the first ` +
      `${offer.introMonths} months, then ${offer.baseRatePa}% p.a. automatically ` +
      `— no ongoing conditions required.`;
  } else if (totalConditions === 0) {
    text = `No ongoing conditions needed — you'd earn ${offer.baseRatePa}% p.a. automatically.`;
  } else if (eligibilityStatus === "likely_eligible") {
    text =
      `You meet all ${totalConditions} condition${totalConditions !== 1 ? "s" : ""} ` +
      `— you'd earn the full ${estimatedRatePa.toFixed(2)}% p.a.`;
  } else if (eligibilityStatus === "at_risk") {
    const atRiskChecks = conditionChecks.filter((c) => c.status === "at_risk");
    const riskLabels = atRiskChecks.map((c) => c.label).join(", ");
    text =
      `You meet ${metCount} of ${totalConditions} condition${totalConditions !== 1 ? "s" : ""} ` +
      `but are at risk on: ${riskLabels}. You'd likely earn only the base rate of ` +
      `${offer.baseRatePa}% p.a. if these conditions aren't consistently met.`;
  } else {
    const unmetChecks = conditionChecks.filter((c) => c.status === "not_eligible");
    const unmetLabels = unmetChecks.map((c) => c.label).join(", ");
    if (metCount === 0) {
      text =
        `You don't currently meet any of the ${totalConditions} condition${totalConditions !== 1 ? "s" : ""} ` +
        `— you'd only earn the base rate of ${offer.baseRatePa}% p.a. ` +
        `Missing: ${unmetLabels}.`;
    } else {
      text =
        `You meet ${metCount} of ${totalConditions} conditions, but ${unmetLabels} ` +
        `prevent you from earning the bonus. You'd earn only the base rate of ` +
        `${offer.baseRatePa}% p.a.`;
    }
  }

  if (balanceAboveCap && offer.capAmount) {
    text += ` Note: only the first $${offer.capAmount.toLocaleString()} of your balance earns the bonus rate.`;
  }

  return text;
}
