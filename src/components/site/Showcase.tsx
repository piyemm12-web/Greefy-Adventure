"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CUSTOMER_CLIPS, GALLERY } from "@/lib/site-content";
import { AskButton } from "./ChatActions";

/**
 * "See it. Feel it." — inspired by gallery-play.be's "Work that speaks louder
 * than words": a dark band, an oversized stacked headline, and a 3D ring of
 * real customer clips and dropzone photos that turns as you scroll.
 */

type Item = { kind: "clip"; src: string; poster: string; label: string } | { kind: "photo"; src: string; label: string };

const LABELS = ["Check-in", "Gear up", "The climb", "Door open", "Exit", "Freefall", "Canopy", "Landing"];

const ITEMS: Item[] = CUSTOMER_CLIPS.flatMap((c, i) => {
  const photo = GALLERY[i % GALLERY.length];
  return [
    { kind: "clip" as const, src: c.src, poster: c.poster, label: LABELS[(i * 2) % LABELS.length] },
    { kind: "photo" as const, src: photo.src, label: LABELS[(i * 2 + 1) % LABELS.length] },
  ];
});

const HEADLINE = ["See it.", "Feel it.", "From 13,000 ft."];

/** Faint altitude contour lines, the skydiver's view of the coast. */
function Contours() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 1200" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="currentColor" strokeWidth="1" className="text-white/[0.07]">
        {Array.from({ length: 11 }, (_, i) => {
          const r = 120 + i * 85;
          return (
            <path
              key={i}
              d={`M ${720 - r} 640 C ${720 - r} ${640 - r * 0.62}, ${720 - r * 0.35} ${640 - r * 0.92}, ${760 + r * 0.1} ${640 - r * 0.8}
                 S ${720 + r * 1.05} ${640 - r * 0.25}, ${720 + r} 650 S ${720 + r * 0.42} ${640 + r * 0.86}, 700 ${640 + r * 0.74}
                 S ${720 - r * 1.02} ${640 + r * 0.42}, ${720 - r} 640 Z`}
            />
          );
        })}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/[0.1]">
        <path d="M-20 980 C 220 900, 360 1010, 560 940 S 900 820, 1100 900 S 1380 980, 1480 930" />
        <path d="M-20 1030 C 260 960, 380 1060, 600 990 S 940 880, 1140 950 S 1400 1030, 1480 990" strokeDasharray="4 8" />
      </g>
    </svg>
  );
}

const LIFT = [0, -28, 14, -12, 24, -20, 8, -30, 18, -6, 26, -16];

function RingCard({ item, angle, radius, lift }: { item: Item; angle: number; radius: number; lift: number }) {
  const video = useRef<HTMLVideoElement>(null);
  return (
    <figure
      className="group absolute top-0 left-0 m-0 h-[200px] w-[124px] overflow-hidden rounded-[3px] bg-black shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] [backface-visibility:hidden] sm:h-[280px] sm:w-[170px]"
      style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px) translateY(${lift}px)` }}
      onMouseEnter={() => video.current?.play().catch(() => undefined)}
      onMouseLeave={() => video.current?.pause()}
      onClick={() => {
        const v = video.current;
        if (!v) return;
        if (v.paused) v.play().catch(() => undefined);
        else v.pause();
      }}
      data-cursor={item.kind === "clip" ? "play" : undefined}
    >
      {item.kind === "clip" ? (
        <video ref={video} className="h-full w-full object-cover" src={item.src} poster={item.poster} muted loop playsInline preload="none" aria-label={`Customer clip: ${item.label}`} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="h-full w-full object-cover" src={item.src} alt={item.label} loading="lazy" decoding="async" />
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2.5 font-serif text-[13px] tracking-[0.3px] text-white/90 italic">
        {item.label}
      </figcaption>
    </figure>
  );
}

function Ring() {
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "200px 0px" });
  const [hovered, setHovered] = useState(false);
  const [radius, setRadius] = useState(470);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setRadius(mq.matches ? 300 : 470);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "end start"] });
  const scrollTurn = useTransform(scrollYProgress, [0, 1], [40, -140]);
  const drift = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (inView && !hovered) drift.set(drift.get() - delta * 0.006);
  });
  const rotateY = useTransform(() => scrollTurn.get() + drift.get());

  const step = 360 / ITEMS.length;
  return (
    <div
      ref={stage}
      className="relative mx-auto h-[380px] w-full [perspective:1300px] sm:h-[560px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Customer clips and photos from the dropzone"
      role="group"
    >
      <motion.div
        className="absolute top-1/2 left-1/2 h-[200px] w-[124px] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] sm:h-[280px] sm:w-[170px]"
        style={{ rotateY, rotateX: -6 }}
      >
        {ITEMS.map((item, i) => (
          <RingCard key={`${item.src}-${i}`} item={item} angle={i * step} radius={radius} lift={LIFT[i % LIFT.length]} />
        ))}
      </motion.div>
    </div>
  );
}

/** Reduced motion: the same media as a calm, scrollable strip. */
function StaticStrip() {
  return (
    <ul className="bt-scrollbar m-0 flex list-none gap-4 overflow-x-auto p-0 pb-2">
      {ITEMS.map((item, i) => (
        <li key={`${item.src}-${i}`} className="relative h-[260px] w-[160px] shrink-0 overflow-hidden rounded-[3px] bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="h-full w-full object-cover" src={item.kind === "clip" ? item.poster : item.src} alt={item.label} loading="lazy" />
        </li>
      ))}
    </ul>
  );
}

export function Showcase() {
  const reduced = useReducedMotion();
  return (
    <section
      data-cursor-zone="freefall"
      aria-labelledby="showcase-title"
      className="section bt-ink relative isolate overflow-hidden p-4"
    >
      <Contours />
      <div className="wrap relative">
        <p className="bt-eyebrow text-center !text-accent-on-dark">A glimpse of the jump</p>
        <h2 id="showcase-title" className="mt-8 text-center font-display leading-[0.86] tracking-[2px] text-cream uppercase">
          {HEADLINE.map((line, i) => (
            <motion.span
              key={line}
              className={`block ${i === 2 ? "text-[clamp(2.6rem,9vw,7.5rem)] text-accent-on-dark" : "text-[clamp(4.75rem,15vw,12.5rem)]"}`}
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: i * 0.12 }}
            >
              {line}
            </motion.span>
          ))}
        </h2>
      </div>

      <div className="relative mt-16 min-[769px]:mt-20">{reduced ? <div className="wrap"><StaticStrip /></div> : <Ring />}</div>

      <div className="wrap relative mt-16 grid items-end gap-10 min-[769px]:mt-24 min-[769px]:gap-16 min-[769px]:grid-cols-[minmax(0,380px)_1fr]">
        <p className="m-0 border-t border-white/15 pt-8 text-[16px] leading-relaxed text-on-ink/85">
          Real moments from our customers’ jumps at the Pattaya dropzone: the climb, the door, sixty seconds of freefall and the
          canopy ride along the coast. Hover or tap a clip to play it.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row min-[769px]:justify-end">
          <AskButton question="Can I see a video of the experience?" className="btn-xl bg-white text-heading hover:bg-cream" cursorLabel="Play film">
            Watch the full film
          </AskButton>
          <a href="#packages" className="btn-xl border border-white/70 text-white hover:bg-white/10">
            Choose your package
          </a>
        </div>
      </div>
    </section>
  );
}
