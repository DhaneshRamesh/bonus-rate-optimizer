import { describe, expect, it, vi, afterEach } from "vitest";
import { polishExplanation } from "@/lib/explain-polisher";

const BASE = "Based on what you entered, Macquarie Bank Savings Account is a straightforward option with no monthly conditions to track. The estimated annual interest is $1,188, which is $313 more than what you'd earn at your current 3.50% rate assumption.";

afterEach(() => {
  vi.restoreAllMocks();
});

// ── No API keys → deterministic fallback ─────────────────────────────────────

describe("polishExplanation — no API keys", () => {
  it("returns the base explanation unchanged", async () => {
    const result = await polishExplanation(BASE, {});
    expect(result.explanation).toBe(BASE);
    expect(result.source).toBe("deterministic_fallback");
  });

  it("does not call fetch when no keys are set", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    await polishExplanation(BASE, {});
    expect(spy).not.toHaveBeenCalled();
  });

  it("handles empty string gracefully", async () => {
    const result = await polishExplanation("", {});
    expect(result.source).toBe("deterministic_fallback");
    expect(result.explanation).toBe("");
  });

  it("handles whitespace-only string gracefully", async () => {
    const result = await polishExplanation("   ", {});
    expect(result.source).toBe("deterministic_fallback");
  });
});

// ── Anthropic API failure → deterministic fallback ───────────────────────────

describe("polishExplanation — Anthropic API fails", () => {
  it("returns fallback on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));
    const result = await polishExplanation(BASE, { anthropicKey: "sk-fake" });
    expect(result.source).toBe("deterministic_fallback");
    expect(result.explanation).toBe(BASE);
  });

  it("returns fallback on non-2xx response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 })
    );
    const result = await polishExplanation(BASE, { anthropicKey: "sk-fake" });
    expect(result.source).toBe("deterministic_fallback");
  });

  it("returns fallback when response text is suspiciously short", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ content: [{ text: "Hi." }] }), { status: 200 })
    );
    const result = await polishExplanation(BASE, { anthropicKey: "sk-fake" });
    expect(result.source).toBe("deterministic_fallback");
  });

  it("returns fallback when response body is malformed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ unexpected: "shape" }), { status: 200 })
    );
    const result = await polishExplanation(BASE, { anthropicKey: "sk-fake" });
    expect(result.source).toBe("deterministic_fallback");
  });
});

// ── OpenAI API failure → deterministic fallback ──────────────────────────────

describe("polishExplanation — OpenAI API fails", () => {
  it("returns fallback on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));
    const result = await polishExplanation(BASE, { openaiKey: "sk-fake" });
    expect(result.source).toBe("deterministic_fallback");
  });

  it("returns fallback on non-2xx response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 429 })
    );
    const result = await polishExplanation(BASE, { openaiKey: "sk-fake" });
    expect(result.source).toBe("deterministic_fallback");
  });
});

// ── Anthropic success → ai_polished ──────────────────────────────────────────

describe("polishExplanation — Anthropic success", () => {
  it("returns ai_polished with the LLM text", async () => {
    const polished = "This account has no monthly conditions. You'd earn about $1,188 a year, which is $313 more than your current rate.";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ content: [{ text: polished }] }),
        { status: 200 }
      )
    );
    const result = await polishExplanation(BASE, { anthropicKey: "sk-fake" });
    expect(result.source).toBe("ai_polished");
    expect(result.explanation).toBe(polished);
  });

  it("calls the Anthropic messages endpoint", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ content: [{ text: "Polished text that is definitely long enough." }] }),
        { status: 200 }
      )
    );
    await polishExplanation(BASE, { anthropicKey: "sk-fake" });
    expect(spy).toHaveBeenCalledOnce();
    expect((spy.mock.calls[0][0] as string)).toContain("anthropic.com");
  });
});

// ── Anthropic fails, OpenAI succeeds → ai_polished ───────────────────────────

describe("polishExplanation — Anthropic fails, OpenAI fallback succeeds", () => {
  it("falls through to OpenAI and returns ai_polished", async () => {
    const polished = "OpenAI polished version of the explanation that is reasonably long.";
    let calls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      calls++;
      if (calls === 1) throw new Error("Anthropic unavailable");
      return new Response(
        JSON.stringify({ choices: [{ message: { content: polished } }] }),
        { status: 200 }
      );
    });

    const result = await polishExplanation(BASE, {
      anthropicKey: "sk-anthropic-fake",
      openaiKey: "sk-openai-fake",
    });
    expect(result.source).toBe("ai_polished");
    expect(result.explanation).toBe(polished);
    expect(calls).toBe(2);
  });

  it("returns deterministic fallback when both fail", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("all fail"));
    const result = await polishExplanation(BASE, {
      anthropicKey: "sk-a",
      openaiKey: "sk-o",
    });
    expect(result.source).toBe("deterministic_fallback");
    expect(result.explanation).toBe(BASE);
  });
});
