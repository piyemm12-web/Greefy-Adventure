import { z } from "zod";
import { prepareTurn } from "@/lib/chat/pipeline";
import { ModelError, modelMode, modelName, streamAnswer } from "@/lib/chat/model";
import { MAX_MESSAGE_CHARS } from "@/lib/chat/protocol";

export const maxDuration = 60;

const inspectSchema = z.object({
  question: z.string().trim().min(1, "Enter a test question.").max(MAX_MESSAGE_CHARS),
});

/**
 * Runs a single test question through the exact chat pipeline and returns
 * what the model received and what it said. Nothing is stored: the knowledge
 * view never sees real customer conversations.
 */
export async function POST(request: Request) {
  const parsed = inspectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid question." }, { status: 400 });
  }

  const turn = prepareTurn([{ role: "user", text: parsed.data.question }]);
  const started = Date.now();
  let answer = "";
  let error: string | null = null;
  try {
    for await (const delta of streamAnswer(turn, request.signal)) answer += delta;
  } catch (err) {
    error = err instanceof ModelError ? err.message : "Unexpected error while calling the model.";
  }

  return Response.json(
    {
      question: turn.question,
      mode: modelMode(),
      model: modelName(),
      retrieved: turn.retrieved,
      media: {
        reasons: turn.media.reasons,
        selected: turn.media.selected.map((m) => ({ id: m.id, kind: m.kind, title: m.title, isDemo: m.isDemo })),
        unavailable: turn.media.unavailable,
      },
      contextBlock: turn.contextBlock,
      answer,
      error,
      durationMs: Date.now() - started,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
