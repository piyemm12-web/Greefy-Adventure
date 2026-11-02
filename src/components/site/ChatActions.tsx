"use client";

import type { ReactNode } from "react";
import { useChatUI } from "@/components/chat/ChatProvider";

/** A button that opens the chat and asks a question for the visitor. */
export function AskButton({
  question,
  children,
  className,
  cursorLabel,
}: {
  question?: string;
  children: ReactNode;
  className?: string;
  cursorLabel?: string;
}) {
  const { ask, open } = useChatUI();
  return (
    <button
      type="button"
      className={className}
      onClick={() => (question ? ask(question) : open())}
      data-cursor-label={cursorLabel}
    >
      {children}
    </button>
  );
}
