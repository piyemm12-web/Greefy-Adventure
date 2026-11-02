import { connection } from "next/server";
import { KNOWLEDGE_SOURCES } from "@/lib/knowledge/sources";
import { MEDIA_CATALOG } from "@/lib/media/catalog";
import { modelMode, modelName } from "@/lib/chat/model";

/** Read-only listing of everything the chatbot can use. Public content only. */
export async function GET() {
  await connection(); // mode depends on runtime env, so don't prerender
  return Response.json({
    mode: modelMode(),
    model: modelName(),
    sources: KNOWLEDGE_SOURCES,
    media: MEDIA_CATALOG,
  });
}
