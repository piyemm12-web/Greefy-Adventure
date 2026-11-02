import type { ChatModelAdapter, ThreadAssistantMessagePart, ThreadMessage } from "@assistant-ui/react";
import type { ChatEvent, ChatTurn, MediaCard, SourceRef, UnavailableCard } from "@/lib/chat/protocol";

/** Data-part payloads rendered by the chat UI (see ChatParts.tsx). */
export type MediaPartData = { cards: MediaCard[]; unavailable: UnavailableCard[]; demoMode: boolean };
export type SourcesPartData = { sources: SourceRef[] };

function textOf(message: ThreadMessage): string {
  return message.content
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function mediaIdsOf(message: ThreadMessage): string[] {
  const ids: string[] = [];
  for (const p of message.content) {
    if (p.type === "data" && p.name === "media") ids.push(...(p.data as MediaPartData).cards.map((c) => c.id));
  }
  return ids;
}

/** Thread → compact history the server validates. The whole conversation is sent, so follow-ups work. */
function toTurns(messages: readonly ThreadMessage[]): ChatTurn[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      text: textOf(m).slice(0, 2000),
      mediaIds: m.role === "assistant" ? mediaIdsOf(m) : undefined,
    }))
    .filter((t) => t.role === "user" || t.text.length > 0 || (t.mediaIds?.length ?? 0) > 0)
    .slice(-24);
}

export const sseChatAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    let response: Response;
    try {
      response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toTurns(messages) }),
        signal: abortSignal,
      });
    } catch (err) {
      if (abortSignal.aborted) return;
      throw new Error("Couldn't reach the assistant. Check your connection and try again.", { cause: err });
    }

    if (!response.ok || !response.body) {
      const detail = await response.json().catch(() => null);
      throw new Error(detail?.error ?? `The assistant returned an error (${response.status}).`);
    }

    let text = "";
    let media: MediaPartData | null = null;
    let sources: SourceRef[] = [];

    const build = (): ThreadAssistantMessagePart[] => {
      const parts: ThreadAssistantMessagePart[] = [];
      if (text) parts.push({ type: "text", text });
      if (media && (media.cards.length || media.unavailable.length)) {
        parts.push({ type: "data", name: "media", data: media });
      }
      if (sources.length && text) parts.push({ type: "data", name: "sources", data: { sources } satisfies SourcesPartData });
      return parts;
    };

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as ChatEvent;
          switch (event.type) {
            case "meta":
              media = { cards: event.media, unavailable: event.unavailable, demoMode: event.mode === "mock" };
              sources = event.sources;
              yield { content: build() };
              break;
            case "text":
              text += event.delta;
              yield { content: build() };
              break;
            case "error":
              // Keep anything already delivered (e.g. the brochure) and mark the turn as failed.
              yield {
                content: build(),
                status: { type: "incomplete", reason: "error", error: event.message },
              };
              return;
            case "done":
              yield { content: build(), status: { type: "complete", reason: "stop" } };
              return;
          }
        }
      }
    } catch (err) {
      if (abortSignal.aborted) return;
      throw new Error("The connection to the assistant dropped. Please try again.", { cause: err });
    }
    yield { content: build(), status: { type: "incomplete", reason: "error", error: "The answer was cut off. Please try again." } };
  },
};
