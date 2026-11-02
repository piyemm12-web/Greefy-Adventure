"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ChatPanel, ChatLauncher } from "@/components/chat/ChatPanel";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { ContextCursor } from "@/components/cursor/ContextCursor";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user": Motion's JS animations honour prefers-reduced-motion too.
    <MotionConfig reducedMotion="user">
      <ChatProvider>
        {children}
        <ChatLauncher />
        <ChatPanel />
        <ContextCursor />
      </ChatProvider>
    </MotionConfig>
  );
}
