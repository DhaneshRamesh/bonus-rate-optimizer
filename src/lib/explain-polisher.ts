export interface ExplainResult {
  explanation: string;
  source: "ai_polished" | "deterministic_fallback";
}

const SYSTEM_PROMPT =
  "You are rewriting a deterministic savings-account explanation for clarity. " +
  "Do not add facts, rates, recommendations, provider names, conditions, or financial advice. " +
  "Preserve all numbers and caveats exactly. " +
  "Keep the tone simple, transparent, and general-information only.";

const MAX_TOKENS = 400;

async function tryAnthropic(base: string, key: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: base }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const json = await res.json();
  const text: unknown = json?.content?.[0]?.text;
  if (typeof text !== "string" || text.trim().length < 20) throw new Error("empty");
  return text.trim();
}

async function tryOpenAI(base: string, key: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: base },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const json = await res.json();
  const text: unknown = json?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || text.trim().length < 20) throw new Error("empty");
  return text.trim();
}

/**
 * Tries to polish a deterministic explanation with an LLM.
 * The LLM may only simplify language — it must not invent or alter facts.
 * Falls back to the original base text if no key is present or any call fails.
 *
 * Pass `env` to override env vars in tests.
 */
export async function polishExplanation(
  baseExplanation: string,
  env: { anthropicKey?: string; openaiKey?: string } = {}
): Promise<ExplainResult> {
  const anthropicKey = env.anthropicKey ?? process.env.ANTHROPIC_API_KEY;
  const openaiKey = env.openaiKey ?? process.env.OPENAI_API_KEY;

  if (!baseExplanation?.trim()) {
    return { explanation: baseExplanation, source: "deterministic_fallback" };
  }

  if (anthropicKey) {
    try {
      const polished = await tryAnthropic(baseExplanation, anthropicKey);
      return { explanation: polished, source: "ai_polished" };
    } catch {
      // fall through to OpenAI or deterministic fallback
    }
  }

  if (openaiKey) {
    try {
      const polished = await tryOpenAI(baseExplanation, openaiKey);
      return { explanation: polished, source: "ai_polished" };
    } catch {
      // fall through to deterministic fallback
    }
  }

  return { explanation: baseExplanation, source: "deterministic_fallback" };
}
