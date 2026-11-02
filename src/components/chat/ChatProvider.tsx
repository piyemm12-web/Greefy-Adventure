"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { sseChatAdapter } from "./adapter";

type ChatUI = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Open the chat and send a question on the customer's behalf. */
  ask: (question: string) => void;
  launcherRef: React.RefObject<HTMLButtonElement | null>;
};

const ChatUIContext = createContext<ChatUI | null>(null);

export function useChatUI(): ChatUI {
  const ctx = useContext(ChatUIContext);
  if (!ctx) throw new Error("useChatUI must be used inside <ChatProvider>");
  return ctx;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime(sseChatAdapter);
  const [isOpen, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the control that opened the chat.
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);
  const ask = useCallback(
    (question: string) => {
      setOpen(true);
      if (!runtime.thread.getState().isRunning) runtime.thread.append(question);
    },
    [runtime],
  );

  const value = useMemo(() => ({ isOpen, open, close, ask, launcherRef }), [isOpen, open, close, ask]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>
    </AssistantRuntimeProvider>
  );
}
