import { prepareTurn } from "@/lib/chat/pipeline";
import { ModelError, modelMode, streamAnswer } from "@/lib/chat/model";
import { chatRequestSchema, type ChatEvent } from "@/lib/chat/protocol";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid chat request." },
      { status: 400 },
    );
  }

  const turn = prepareTurn(parsed.data.messages);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      // Media and sources go first: if the model then fails, the customer
      // still gets the brochure/video they asked for (fallback behaviour).
      send({
        type: "meta",
        mode: modelMode(),
        sources: turn.sources,
        media: turn.mediaCards,
        unavailable: turn.unavailableCards,
      });

      try {
        for await (const delta of streamAnswer(turn, request.signal)) send({ type: "text", delta });
        send({ type: "done" });
      } catch (err) {
        const known = err instanceof ModelError;
        if (!known) console.error("[chat] unexpected error", err);
        send({
          type: "error",
          message: known ? err.message : "Something went wrong while answering. Please try again.",
          retryable: known ? err.retryable : true,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
