import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { retrieve } from "@/lib/knowledge/retrieve";
import { prepareTurn } from "@/lib/chat/pipeline";
import { chatRequestSchema } from "@/lib/chat/protocol";
import { ModelError, streamAnswer } from "@/lib/chat/model";

const headings = (q: string, context?: string[]) => retrieve(q, { context }).map((r) => r.heading);

describe("retrieval", () => {
  it("finds inclusions for the package question", () => {
    expect(headings("What is included in the package?")).toContain("What's included");
  });
  it("finds prices", () => {
    expect(headings("How much does the VIP cost?")[0]).toBe("Packages and prices");
  });
  it("finds cancellation policy", () => {
    expect(headings("Can I get a refund if I cancel?").some((h) => /cancel|Refund/i.test(h))).toBe(true);
  });
  it("finds pickup", () => {
    expect(headings("Is there a Bangkok pickup?")).toContain("Good to know (FAQ)");
  });
  it("returns nothing for off-topic questions", () => {
    expect(retrieve("What is the wifi password at the hotel?")).toEqual([]);
  });
  it("keeps topic on follow-ups via earlier user turns", () => {
    expect(headings("and the VIP one?", ["How much is the Deluxe package?"])).toContain("Packages and prices");
  });
});

describe("prepareTurn", () => {
  it("puts retrieved text and attached media into the system prompt", () => {
    const t = prepareTurn([{ role: "user", text: "Send me the brochure and a video." }]);
    expect(t.system).toContain("WEBSITE CONTEXT");
    expect(t.contextBlock).toContain("PDF: Sea View Skydiving brochure [DEMO material]");
    expect(t.contextBlock).toContain("VIDEO: Sea View jump: main film");
    expect(t.mediaCards.map((m) => m.kind)).toEqual(["pdf", "video"]);
  });
  it("remembers the conversation and annotates previously shared media", () => {
    const t = prepareTurn([
      { role: "user", text: "Can you send me a brochure?" },
      { role: "assistant", text: "Here it is.", mediaIds: ["sea-view-brochure"] },
      { role: "user", text: "Thanks. Which package has the edited film?" },
    ]);
    expect(t.messages).toHaveLength(3);
    expect(t.messages[1].content).toContain("[Attached in this reply: Sea View Skydiving brochure]");
    expect(t.mediaCards).toEqual([]);
  });
  it("marks missing information explicitly", () => {
    const t = prepareTurn([{ role: "user", text: "What is the weight limit?" }]);
    expect(t.retrieved.every((r) => !/weight/i.test(r.text))).toBe(true);
  });
});

describe("input validation", () => {
  it("rejects empty, oversize and assistant-last payloads", () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: [{ role: "user", text: "   " }] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: [{ role: "user", text: "x".repeat(2001) }] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: [{ role: "assistant", text: "hi" }] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: [{ role: "system", text: "hi" }] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: [{ role: "user", text: "hi" }] }).success).toBe(true);
  });
});

describe("model layer fallback", () => {
  afterEach(() => vi.unstubAllEnvs());

  async function collect(q: string) {
    let text = "";
    for await (const d of streamAnswer(prepareTurn([{ role: "user", text: q }]))) text += d;
    return text;
  }

  it("mock mode answers from website text and labels itself", async () => {
    vi.stubEnv("CHAT_MODE", "mock");
    const text = await collect("How high is the jump?");
    expect(text).toContain("13,000 ft");
    expect(text).toContain("Mock mode");
  });
  it("mock mode says when information is missing", async () => {
    vi.stubEnv("CHAT_MODE", "mock");
    expect(await collect("What is the wifi password at the hotel?")).toMatch(/doesn't cover that/);
  });
  it("mock mode says when a requested file is unavailable", async () => {
    vi.stubEnv("CHAT_MODE", "mock");
    expect(await collect("Can you send me the waiver as a PDF?")).toMatch(/don't have/);
  });
  it("model failure surfaces as a retryable ModelError", async () => {
    vi.stubEnv("SIMULATE_MODEL_FAILURE", "1");
    await expect(collect("How high is the jump?")).rejects.toBeInstanceOf(ModelError);
  });
});
