import type { EligibilityStatus, SavingsAccountOffer } from "@/types/accounts";
import type { ConditionCheck, RankedAccount } from "@/types/ranking";
import type { UserProfile } from "@/types/user";

// ── Legacy helper (used by analyzeOffer in ranking.ts) ────────────────────────

/**
 * Builds a brief eligibility summary from raw condition checks.
 * Used internally by analyzeOffer — not intended for end-user display.
 */
export function buildConditionSummary(
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

// ── Primary explainability function ──────────────────────────────────────────

/**
 * Builds a plain-English explanation of a RankedAccount relative to the user.
 *
 * Tone: simple, helpful, transparent. Not financial advice.
 * No hype. No "you should switch now."
 *
 * Covers: eligibility status, conditions detail, interest vs current rate,
 * intro-rate note, balance-cap note, growth-sensitive withdrawal warning,
 * and a nudge toward simpler options when the account is complex and at risk.
 */
export function buildExplanation(ranked: RankedAccount, user: UserProfile): string {
  const { account, eligibility, annualInterest, extraAnnualBenefit, isNoFuss } = ranked;
  const parts: string[] = [];

  // ── Situation sentence ────────────────────────────────────────────────────
  if (eligibility.hardIneligible) {
    return (
      `${account.provider} ${account.productName} has an age restriction — ` +
      `based on what you entered, you are not eligible for this account.`
    );
  }

  if (eligibility.status === "likely_eligible") {
    if (isNoFuss) {
      parts.push(
        `Based on what you entered, ${account.provider} ${account.productName} is ` +
        `a straightforward option with no monthly conditions to track.`
      );
    } else {
      parts.push(
        `Based on what you entered, ${account.provider} ${account.productName} looks ` +
        `like a good fit — you meet all the conditions to earn the bonus rate.`
      );
    }
  } else if (eligibility.status === "at_risk") {
    parts.push(
      `Based on what you entered, ${account.provider} ${account.productName} could ` +
      `earn you the bonus — but some conditions are currently at risk. ` +
      `The interest estimate uses the base rate only as a conservative figure.`
    );
  } else {
    parts.push(
      `Based on what you entered, you would earn only the base rate of ` +
      `${account.baseRatePa}% p.a. on ${account.provider} ${account.productName}.`
    );
  }

  // ── Conditions detail ─────────────────────────────────────────────────────
  if (isNoFuss) {
    parts.push(
      `It has no monthly deposit, card purchase, or balance growth requirements.`
    );
  } else if (eligibility.status === "likely_eligible" && eligibility.metConditions.length > 0) {
    const list = eligibility.metConditions.join("; ");
    parts.push(`Conditions you meet: ${list}.`);
  } else if (eligibility.unmetConditions.length > 0) {
    const n = eligibility.unmetConditions.length;
    const list = eligibility.unmetConditions.join("; ");
    parts.push(`Condition${n > 1 ? "s" : ""} not currently met: ${list}.`);
  }

  // ── Interest vs current rate ──────────────────────────────────────────────
  const absGap = Math.abs(extraAnnualBenefit);
  const gapStr =
    extraAnnualBenefit >= 0
      ? `$${absGap.toFixed(0)} more`
      : `$${absGap.toFixed(0)} less`;

  parts.push(
    `The estimated annual interest is $${annualInterest.toFixed(0)}, which is ${gapStr} ` +
    `than what you'd earn at your current ${user.currentRatePa}% rate assumption.`
  );

  // ── Intro rate note ───────────────────────────────────────────────────────
  if (account.introRatePa !== undefined && account.introMonths !== undefined) {
    if (user.isNewCustomerForIntro) {
      parts.push(
        `As a new customer, you'd earn ${account.introRatePa}% p.a. for the ` +
        `first ${account.introMonths} months, then the rate adjusts automatically.`
      );
    } else {
      parts.push(
        `This account offers a ${account.introRatePa}% p.a. introductory rate for new ` +
        `customers — the estimate above uses the ongoing rate as you're not a new customer.`
      );
    }
  }

  // ── Balance cap note ──────────────────────────────────────────────────────
  if (account.capAmount !== undefined) {
    if (user.balance > account.capAmount) {
      const excess = (user.balance - account.capAmount).toLocaleString();
      parts.push(
        `Your balance exceeds the $${account.capAmount.toLocaleString()} cap — ` +
        `only that portion earns the bonus rate. ` +
        `The remaining $${excess} earns ${account.baseRatePa}% p.a. instead.`
      );
    } else {
      parts.push(
        `Your full balance sits within the $${account.capAmount.toLocaleString()} cap, ` +
        `so all of it earns the bonus rate.`
      );
    }
  }

  // ── Growth-sensitive withdrawal warning ───────────────────────────────────
  if (
    account.withdrawalFlexibility === "growth-sensitive" &&
    eligibility.status === "likely_eligible"
  ) {
    parts.push(
      `One thing to keep in mind: this account requires your balance to grow each ` +
      `month. Any net withdrawal could forfeit the bonus for that month.`
    );
  }

  // ── Simpler-option nudge (at-risk + complex account) ─────────────────────
  if (!isNoFuss && eligibility.status === "at_risk" && account.conditionComplexityScore >= 3) {
    parts.push(
      `If tracking monthly conditions feels difficult, the no-fuss accounts in ` +
      `this comparison may be easier to maintain consistently.`
    );
  }

  return parts.join(" ");
}

// ── Static copy functions ─────────────────────────────────────────────────────

/**
 * Standard disclosure text for this concept demo.
 * Must accompany any interest estimates shown to users.
 */
export function buildDisclosureText(): string {
  return (
    "This concept demo uses a curated dataset of publicly available product information. " +
    "It provides general information only and does not take your objectives, financial situation " +
    "or needs into account. Rates, terms and eligibility criteria can change. " +
    "Please verify the latest provider information before making any decision."
  );
}

/**
 * Plain-English description of the estimation methodology.
 * Suitable for a "How is this calculated?" disclosure panel.
 */
export function buildMethodologyText(): string {
  return (
    "Estimated annual interest uses a simple non-compounding model: balance × rate ÷ 100. " +
    "Real banks typically calculate interest daily and may compound it monthly — actual " +
    "earnings will differ. For accounts with an introductory rate, Year 1 interest is a " +
    "weighted blend of the intro and ongoing rates proportional to the number of months each applies. " +
    "Where a balance cap applies, the bonus rate is used on the capped portion only and " +
    "the base rate on any excess. Eligibility is assessed against your stated habits — " +
    "the tool does not verify your actual banking behaviour."
  );
}
