/**
 * Wire protocol between /api/chat and the browser: newline-delimited JSON.
 * Shared by server and client so both sides agree on the shape.
 */
import { z } from "zod";

export const MAX_MESSAGES = 24;
export const MAX_MESSAGE_CHARS = 2000;

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().max(MAX_MESSAGE_CHARS),
        /** Media ids shared on this assistant turn, so follow-ups can refer to them. */
        mediaIds: z.array(z.string().max(64)).max(4).optional(),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES)
    .refine((m) => m[m.length - 1]?.role === "user", "Last message must be from the user")
    .refine((m) => (m[m.length - 1]?.text.length ?? 0) > 0, "Message is empty"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatTurn = ChatRequest["messages"][number];

export type SourceRef = { title: string; url: string; heading: string; capturedAt: string };

export type MediaCard = {
  id: string;
  kind: "pdf" | "video";
  title: string;
  description: string;
  url: string;
  posterUrl?: string;
  isDemo: boolean;
  origin: string;
  pageUrl?: string;
  sizeLabel?: string;
};

export type UnavailableCard = { kind: "pdf" | "video"; requested: string; reason: string };

export type ChatEvent =
  | { type: "meta"; mode: "live" | "mock"; sources: SourceRef[]; media: MediaCard[]; unavailable: UnavailableCard[] }
  | { type: "text"; delta: string }
  | { type: "error"; message: string; retryable: boolean }
  | { type: "done" };
