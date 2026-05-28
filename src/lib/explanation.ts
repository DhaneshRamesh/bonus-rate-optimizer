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

  // ── Deterministic Overrides for Ineligibility ────────────────────────────
  if (eligibility.status === "not_eligible") {
    const reason = eligibility.unmetConditions[0]?.explanation || "you do not meet the requirements";
    return `Based on the details entered, this account is not currently eligible for the advertised bonus rate because ${reason} The calculation uses the standard/base rate instead. You can verify the condition on the provider's product page.`;
  }

  if (eligibility.status === "at_risk") {
    const reason = eligibility.unmetConditions[0]?.explanation || "you may miss a monthly requirement";
    return `Based on the details entered, you may miss this bonus rate because ${reason} The expected return shown is based on the rate you are likely to earn under these assumptions.`;
  }

  // ── Situation sentence (Likely Eligible) ──────────────────────────────────
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

  // ── Conditions detail ─────────────────────────────────────────────────────
  if (isNoFuss) {
    parts.push(
      `It has no monthly deposit, card purchase, or balance growth requirements.`
    );
  } else if (eligibility.metConditions.length > 0) {
    const list = eligibility.metConditions.map(c => c.label).join("; ");
    parts.push(`Conditions you meet: ${list}.`);
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
  // Omitted for likely_eligible since this is now only for likely_eligible anyway.

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
