# Bonus Rate Optimizer — Open take-home assessment

## Overview
The Bonus Rate Optimizer is a concept demonstration that calculates and ranks Australian savings accounts based on *realistic* expected returns, rather than headline rates. It evaluates user habits against the complex, often hidden conditions of high-interest savings accounts to determine actual eligibility and yield.

## Problem
Banks frequently advertise high headline "bonus" interest rates to attract deposits, but these rates are often gated behind strict monthly conditions (e.g., minimum deposits, card transaction quotas, no withdrawals, or balance growth). When consumers fail to meet these hidden criteria, they are penalized by reverting to a minimal base rate—sometimes as low as 0.10%—resulting in unexpectedly poor returns. Headline rates are misleading; the true best account depends entirely on individual financial habits.

## What the app does
- **Collects user savings habits**: Gathers data on balance, monthly deposits, card purchases, and withdrawal needs via an interactive profile builder.
- **Checks eligibility conditions**: Deterministically evaluates the user's profile against the fine-print requirements of each account.
- **Calculates expected annual interest**: Projects true annual yield using the bonus rate if conditions are met, or the base rate if they are missed.
- **Ranks accounts by realistic expected outcome**: Sorts recommendations based on the highest expected annual interest, not the advertised maximum rate.
- **Explains the recommendation**: Provides clear, source-backed explanations for why an account won (or lost), highlighting specific eligibility blockers.

## Key product decisions
- **Deterministic recommendation engine**: Financial calculations and ranking logic are strictly rule-based and predictable, ensuring auditability.
- **Static curated dataset**: Uses a structured local dataset rather than relying on LLM hallucinations for rates or terms.
- **AI only for explanation polish**: AI is strictly relegated to a presentation layer, refining deterministic output into plain English. 
- **Visible assumptions and disclaimers**: Clear pedogogical microcopy ("Likely eligible", "Verify before acting") emphasizes that this is an estimation tool, not financial advice.
- **Open-style UI direction**: The UI is designed to feel like a premium, trustworthy consumer fintech product—utilizing soft radiuses, warm colors, and a clean, high-whitespace aesthetic.

## Dataset methodology
- **Curated from publicly available product information**: Data reflects real Australian savings accounts (~early 2025).
- **Sample/demo data**: The data is a snapshot and is intended for demonstration purposes.
- **Last checked date**: Accounts include explicit metadata on when the terms were last verified.
- **Official provider pages preferred**: Direct source URLs are attached to each account for transparency.
- **Rates must be verified before production**: In a real-world scenario, this static dataset would be replaced by a live, verified data feed.

## Recommendation logic
The core engine operates through four sequential phases:
1. `checkEligibility()`: Evaluates the user's profile against an account's terms, returning structured `EligibilityReason` metadata determining if they are `likely_eligible`, `at_risk`, or `not_eligible`.
2. `calculateAnnualInterest()`: Computes the expected yield. If eligible, it applies the bonus rate (respecting balance caps and intro periods). If ineligible, it defaults to the base rate.
3. `rankAccounts()`: Sorts the array of accounts strictly by the computed expected annual interest to find the true best match.
4. `buildExplanation()`: Assembles a deterministic string explaining exactly why the account ranked where it did, and flags any unmet conditions.

## AI usage
AI is not used to make financial calculations or recommendations. The AI layer is optional and only rewrites deterministic explanations in plain English to improve the user experience. If no API key is available (or the request fails), the application gracefully falls back to the rule-based explanation.

## Assumptions and trade-offs
- **Static data instead of live integration**: Hardcoded JSON data is used in place of a live API for the purposes of the demo.
- **Annualised current-balance model**: Calculations assume the current balance remains relatively stable over 12 months for simplicity, rather than simulating compound interest on dynamic monthly contributions.
- **No open banking**: The app relies on self-reported user inputs rather than pulling live transaction data via CDR (Consumer Data Right).
- **No automatic switching**: This is a discovery tool; it does not facilitate account opening or money movement.
- **No personal financial advice**: The output is an estimate based on product terms, not tailored financial advice.
- **No tax treatment**: Interest calculations do not account for individual tax implications or withholding taxes.
- **No daily balance simulation**: Intro rates and caps are calculated on an annualized average basis rather than a daily accrual simulation.

## Running locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Testing
The application includes a suite of unit tests focusing on the core recommendation and eligibility logic to ensure deterministic reliability:
- **Eligibility engine tests**: Verifies strict conditions (e.g., age limits, deposit minimums, linked account requirements).
- **Calculation tests**: Ensures the math behind expected interest correctly handles base rates vs. bonus rates, balance caps, and intro rate periods.
- **Ranking tests**: Validates that accounts are sorted correctly by expected return, prioritizing likely eligible accounts over hard-ineligible ones.
- **Category lenses**: Ensures the `getDistinctRecommendationCards` helper correctly diversifies recommendations for "Best Match", "No Fuss", and "Flexible Access".

## Future improvements
- **Live verified rate feed**: Integrate with a reliable financial data provider or a headless CMS for real-time rate updates.
- **Rate-change monitoring**: Notify users if their current account drops its rate or if a better option becomes available.
- **Open Banking transaction analysis**: Ingest CDR data to automatically populate the user profile (monthly deposits, card transactions) instead of manual sliders.
- **Alerts when user may miss bonus**: Push notifications near the end of the month if the user is 1 card transaction short of hitting their bonus criteria.
- **Broader provider dataset**: Include more tier-2 banks, credit unions, and challenger banks.
- **Richer switching workflow**: Provide direct deep links or integrations to streamline the account opening process.

## Demo links
- **Deployed app**: [Insert Link Here]
- **Walkthrough video**: [Insert Link Here]
