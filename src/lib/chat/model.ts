import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { queryTerms, tokenize } from "@/lib/knowledge/retrieve";
import type { PreparedTurn } from "./pipeline";

/**
 * Model layer. Two modes:
 *  - live: Claude via the official Anthropic SDK (needs ANTHROPIC_API_KEY)
 *  - mock: no key configured. A deterministic, clearly labelled extractive
 *    answer built from the same retrieved text, so the demo and the tests
 *    work without spending money.
 */

export type ModelMode = "live" | "mock";

export const DEFAULT_MODEL = "claude-opus-5-5";

export function modelMode(): ModelMode {
  if (process.env.CHAT_MODE === "mock") return "mock";
  return process.env.ANTHROPIC_API_KEY ? "live" : "mock";
}

export function modelName(): string {
  return modelMode() === "live" ? (process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL) : "mock (no model)";
}

export class ModelError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  // Reads ANTHROPIC_API_KEY from the server environment; never sent to the browser.
  client ??= new Anthropic({ maxRetries: 1, timeout: 45_000 });
  return client;
}

export async function* streamAnswer(turn: PreparedTurn, signal?: AbortSignal): AsyncGenerator<string> {
  if (process.env.SIMULATE_MODEL_FAILURE === "1") {
    throw new ModelError("The assistant model is unavailable right now (simulated failure).", true);
  }
  if (modelMode() === "mock") {
    yield* mockAnswer(turn);
    return;
  }
  yield* liveAnswer(turn, signal);
}

async function* liveAnswer(turn: PreparedTurn, signal?: AbortSignal): AsyncGenerator<string> {
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  try {
    const stream = anthropic().beta.messages.stream(
      {
        model,
        // Deliberately short: answers are 2-5 sentences in a chat bubble.
        max_tokens: 2048,
        // Chat Q&A over a small context: low effort keeps latency down.
        output_config: { effort: "low" },
        // On a safety-classifier decline, let the API retry on a suitable fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: turn.system,
        messages: turn.messages,
      },
      { signal },
    );

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      throw new ModelError("The assistant couldn't answer that request. Try rephrasing your question.", false);
    }
  } catch (err) {
    if (err instanceof ModelError) throw err;
    if (err instanceof Anthropic.APIUserAbortError) return;
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      throw new ModelError("The assistant is misconfigured (model credentials rejected).", false);
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new ModelError("The assistant is busy right now. Please try again in a moment.", true);
    }
    if (err instanceof Anthropic.BadRequestError) {
      throw new ModelError("The assistant couldn't process that message.", false);
    }
    if (err instanceof Anthropic.APIConnectionError || err instanceof Anthropic.InternalServerError) {
      throw new ModelError("The assistant model is unreachable right now. Please try again.", true);
    }
    if (err instanceof Anthropic.APIError) {
      throw new ModelError("The assistant model returned an error. Please try again.", true);
    }
    throw err;
  }
}

/** Extractive mock: the first relevant sentences of the best-matching section. */
async function* mockAnswer(turn: PreparedTurn): AsyncGenerator<string> {
  const parts: string[] = [];
  const top = turn.retrieved[0];
  const { selected, unavailable, intents } = turn.media;

  if (selected.length > 0) {
    parts.push(
      `Here ${selected.length > 1 ? "are" : "is"} the ${selected.map((m) => (m.kind === "pdf" ? "brochure" : "video")).join(" and the ")} below.` +
        (selected.some((m) => m.isDemo) ? " The brochure is demo material made for this prototype." : ""),
    );
  }
  for (const u of unavailable) {
    parts.push(`Sorry, I don't have ${u.requested === "video" || u.requested === "brochure" ? "that" : `a ${u.kind === "pdf" ? "document for" : "video of"} ${u.requested}`}. ${u.reason}`);
  }
  if (intents.length === 0 || (selected.length === 0 && unavailable.length === 0)) {
    if (top) {
      // Pick the sentences from the top sections that share the most words with the question.
      const q = queryTerms(turn.question);
      const candidates = turn.retrieved.slice(0, 2).flatMap((r, rank) =>
        (r.text.match(/[^.!?]+[.!?]+/g) ?? [r.text]).map((sentence, i) => ({
          sentence: sentence.trim(),
          heading: r.heading,
          score: tokenize(sentence).filter((t) => q.has(t)).length - rank * 0.5 - i * 0.01,
        })),
      );
      const best = candidates.sort((a, b) => b.score - a.score).slice(0, 2);
      parts.push(`From the Greedy Adventures website: ${best.map((b) => b.sentence).join(" ")}`);
    } else {
      parts.push(
        "The Greedy Adventures website doesn't cover that, so I can't answer it reliably. Please contact Greedy Adventures directly.",
      );
    }
  }
  parts.push("\n\n(Mock mode: no AI model is connected, so this answer is extracted directly from the website text.)");

  const full = parts.join(" ");
  for (const chunk of full.match(/[\s\S]{1,24}(\s|$)/g) ?? [full]) {
    await new Promise((r) => setTimeout(r, 12));
    yield chunk;
  }
}
