"use client";

import {
  ActionBarPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useChatUI } from "./ChatProvider";
import { MediaPart, SourcesPart, TextPart } from "./ChatParts";
import { CanopyIcon, CloseIcon, RetryIcon, SendIcon, StopIcon } from "./icons";

const SUGGESTIONS = [
  "What is included in the package?",
  "Can you send me a brochure?",
  "Can I see a video of the experience?",
  "Send me the brochure and a video.",
];

const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

export function ChatLauncher() {
  const { isOpen, open, launcherRef } = useChatUI();
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          ref={launcherRef}
          type="button"
          onClick={open}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
          transition={{ duration: 0.22, ease: PANEL_EASE }}
          className="press fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-[2px] bg-primary p-3 text-[12px] sm:py-3 sm:pr-5 sm:pl-3.5 font-bold tracking-[1.2px] uppercase text-white shadow-[0_10px_30px_-10px_rgba(18,49,63,0.6)] sm:right-6 sm:bottom-6"
          aria-haspopup="dialog"
          data-cursor-label="Ask us"
        >
          <span className="grid size-8 place-items-center rounded-[2px] bg-cream text-heading">
            <CanopyIcon className="size-5" />
          </span>
          <span className="max-sm:sr-only">Ask about this jump</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function ChatPanel() {
  const { isOpen, close } = useChatUI();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.15, ease: PANEL_EASE } }}
          transition={{ duration: 0.28, ease: PANEL_EASE }}
          style={{ transformOrigin: "bottom right" }}
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(720px,calc(100dvh-3rem))] sm:w-[420px] sm:rounded-[2px] sm:border sm:border-line sm:shadow-[0_30px_80px_-20px_rgba(18,49,63,0.45)]"
          data-cursor="native"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="grid size-9 place-items-center rounded-[2px] bg-primary text-cream" aria-hidden>
              <CanopyIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="chat-title" className="font-display text-[22px] leading-none tracking-[1.5px] text-heading uppercase">
                Sea View jump assistant
              </h2>
              <p className="text-[12.5px] text-muted-fg">Answers from the Greedy Adventures website</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="press grid size-9 place-items-center rounded-[2px] text-body-strong hover:bg-muted"
              aria-label="Close chat"
            >
              <CloseIcon className="size-4.5" />
            </button>
          </header>

          <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
            <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-2" aria-live="polite">
              <ThreadPrimitive.Empty>
                <Welcome />
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
            </ThreadPrimitive.Viewport>
            <Composer inputRef={inputRef} />
          </ThreadPrimitive.Root>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function Welcome() {
  return (
    <div className="flex flex-1 flex-col justify-end gap-4 pb-2">
      <div className="rounded-[2px] bg-white p-4 text-[14.5px] leading-relaxed text-heading shadow-[0_1px_0_rgba(18,49,63,0.05)]">
        Hi! Ask me anything about the Sea View tandem jump: packages, prices, the day&apos;s plan or cancellations.
        I can also send you the brochure or a video of the jump.
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
        {SUGGESTIONS.map((s) => (
          <ThreadPrimitive.Suggestion
            key={s}
            prompt={s}
            send
            className="press rounded-[2px] border border-line bg-white px-3 py-1.5 text-left text-[13px] text-heading hover:border-primary"
          >
            {s}
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
      <p className="text-[12px] text-muted-fg">
        Prototype: no bookings or payments.{" "}
        <Link href="/knowledge" className="underline underline-offset-2 hover:text-heading">
          See what the assistant knows
        </Link>
        .
      </p>
    </div>
  );
}

const bubbleEnter = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: PANEL_EASE },
};

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <motion.div
        {...bubbleEnter}
        className="max-w-[85%] rounded-[2px] bg-primary px-3.5 py-2 text-[14.5px] leading-relaxed text-white"
      >
        <MessagePrimitive.Parts components={{ Text: TextPart }} />
      </motion.div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  const isWaiting = useAuiState(
    (s) => s.message.status?.type === "running" && !s.message.parts.some((p) => p.type === "text"),
  );
  return (
    <MessagePrimitive.Root className="flex flex-col items-start">
      <motion.div
        {...bubbleEnter}
        className="w-full max-w-[92%] rounded-[2px] bg-white px-3.5 py-2.5 text-[14.5px] leading-relaxed text-heading shadow-[0_1px_0_rgba(18,49,63,0.05)]"
      >
        {isWaiting && <Typing />}
        <MessagePrimitive.Parts
          components={{
            Text: TextPart,
            data: { by_name: { media: MediaPart, sources: SourcesPart } },
          }}
        />
        <MessagePrimitive.Error>
          <ErrorPrimitive.Root
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-[2px] border border-red-200 bg-red-50 p-2.5 text-[13px] text-red-800"
          >
            <div className="flex-1">
              <ErrorPrimitive.Message />
            </div>
            <ActionBarPrimitive.Reload className="press inline-flex shrink-0 items-center gap-1 rounded-[2px] bg-white px-2.5 py-1 text-[12px] font-medium text-red-800 ring-1 ring-red-200">
              <RetryIcon className="size-3.5" /> Retry
            </ActionBarPrimitive.Reload>
          </ErrorPrimitive.Root>
        </MessagePrimitive.Error>
      </motion.div>
    </MessagePrimitive.Root>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-2 py-1 text-[13px] text-muted-fg" role="status">
      <span className="typing-dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      Checking the dropzone notes…
    </div>
  );
}

function Composer({ inputRef }: { inputRef: React.RefObject<HTMLTextAreaElement | null> }) {
  return (
    <div className="border-t border-line p-3">
      <ComposerPrimitive.Root className="flex items-end gap-2 rounded-[2px] border border-line bg-white p-1.5 pl-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <ComposerPrimitive.Input
          ref={inputRef}
          rows={1}
          maxLength={2000}
          placeholder="Ask about packages, prices, the plan…"
          aria-label="Message the assistant"
          className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-[15px] text-heading outline-none placeholder:text-muted-fg"
        />
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send
            className="press grid size-9 shrink-0 place-items-center rounded-[2px] bg-primary text-white disabled:opacity-35"
            aria-label="Send message"
          >
            <SendIcon className="size-4.5" />
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel
            className="press grid size-9 shrink-0 place-items-center rounded-[2px] bg-muted text-heading"
            aria-label="Stop generating"
          >
            <StopIcon className="size-4" />
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </ComposerPrimitive.Root>
    </div>
  );
}
