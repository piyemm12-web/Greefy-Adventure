"use client";

import type { DataMessagePartProps, TextMessagePartProps } from "@assistant-ui/react";
import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import type { MediaPartData, SourcesPartData } from "./adapter";
import { DownloadIcon, ExternalIcon, FileIcon, PlayIcon, WarningIcon } from "./icons";

/**
 * Model output is rendered as React text nodes only (no innerHTML), so a
 * reply can never inject markup. Supports paragraphs, "- " bullets and **bold**.
 */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4 ? (
      <strong key={i} className="font-semibold">
        {chunk.slice(2, -2)}
      </strong>
    ) : (
      chunk
    ),
  );
}

export function SafeText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        if (lines.length > 0 && lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
          return (
            <ul key={i} className="space-y-1 pl-4">
              {lines.map((l, j) => (
                <li key={j} className="list-disc marker:text-primary">
                  {inline(l.replace(/^\s*[-•*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function TextPart({ text }: TextMessagePartProps) {
  return <SafeText text={text} />;
}

const cardEnter = {
  initial: { opacity: 0, y: 8, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { type: "spring" as const, duration: 0.45, bounce: 0 },
};

function DemoBadge() {
  return (
    <span className="rounded-[2px] bg-chalk px-2 py-0.5 text-[11px] font-semibold tracking-wide text-heading uppercase">
      Demo material
    </span>
  );
}

function VideoPlayer({ url, poster, title, pageUrl }: { url: string; poster?: string; title: string; pageUrl?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex items-start gap-2 rounded-[2px] bg-muted p-3 text-sm text-body-strong">
        <WarningIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          The video couldn&apos;t load here.{" "}
          <a className="font-medium text-primary underline underline-offset-2" href={pageUrl ?? url} target="_blank" rel="noopener noreferrer">
            Watch it on greedyadventures.com
          </a>
          .
        </p>
      </div>
    );
  }
  return (
    <video
      className="aspect-video w-full rounded-[2px] bg-primary object-cover"
      controls
      playsInline
      preload="none"
      poster={poster}
      onError={() => setFailed(true)}
      aria-label={title}
      data-cursor="play"
    >
      <source src={url} type="video/mp4" onError={() => setFailed(true)} />
    </video>
  );
}

export function MediaPart(props: DataMessagePartProps) {
  const data = props.data as MediaPartData;
  return (
    <div className="mt-3 space-y-2.5">
      {data.cards.map((card) => (
        <motion.figure
          key={card.id}
          {...cardEnter}
          className="overflow-hidden rounded-[2px] border border-line bg-white shadow-[0_1px_0_rgba(18,49,63,0.04)]"
        >
          {card.kind === "video" && (
            <div className="p-2 pb-0">
              <VideoPlayer url={card.url} poster={card.posterUrl} title={card.title} pageUrl={card.pageUrl} />
            </div>
          )}
          <figcaption className="flex items-start gap-3 p-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[2px] bg-tint text-primary" aria-hidden>
              {card.kind === "pdf" ? <FileIcon className="size-4.5" /> : <PlayIcon className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-semibold text-heading">{card.title}</p>
                {card.isDemo && <DemoBadge />}
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-body-strong">{card.description}</p>
              <p className="mt-1 text-[12px] text-muted-fg">
                {card.sizeLabel ? `${card.sizeLabel} · ` : ""}
                {card.origin}
              </p>
              {card.kind === "pdf" ? (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <a
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press inline-flex items-center gap-1.5 rounded-[2px] bg-primary px-3.5 py-1.5 text-[13px] font-medium text-white"
                  >
                    <ExternalIcon className="size-3.5" /> Open PDF
                  </a>
                  <a
                    href={card.url}
                    download
                    className="press inline-flex items-center gap-1.5 rounded-[2px] border border-line px-3.5 py-1.5 text-[13px] font-medium text-heading"
                  >
                    <DownloadIcon className="size-3.5" /> Download
                  </a>
                </div>
              ) : (
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary underline-offset-2 hover:underline"
                >
                  <ExternalIcon className="size-3.5" /> Watch the video in a new tab
                </a>
              )}
            </div>
          </figcaption>
        </motion.figure>
      ))}
      {data.unavailable.map((u) => (
        <motion.div
          key={`${u.kind}-${u.requested}`}
          {...cardEnter}
          role="note"
          className="flex items-start gap-2.5 rounded-[2px] border border-dashed border-line bg-muted p-3 text-[13px] text-body-strong"
        >
          <WarningIcon className="mt-0.5 size-4 shrink-0 text-muted-fg" />
          <p>
            <span className="font-semibold text-heading">Not available: </span>
            {u.reason}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export function SourcesPart(props: DataMessagePartProps) {
  const data = props.data as SourcesPartData;
  return (
    <div className="mt-3 border-t border-line pt-2.5">
      <p className="text-[11px] font-semibold tracking-wide text-muted-fg uppercase">Sources</p>
      <ul className="mt-1 space-y-0.5">
        {data.sources.map((s) => (
          <li key={`${s.url}-${s.heading}`}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] text-primary underline-offset-2 hover:underline"
            >
              {s.heading} · {s.title.split(" | ")[0].split(" — ")[0]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
