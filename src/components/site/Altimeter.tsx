"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useState } from "react";

/**
 * Scroll-linked altimeter: reading the page is the descent.
 * 13,000 ft at the top (exit), freefall to ~5,000 ft, then canopy to landing.
 * Scroll position is the clock, so it is linear (scrubbed), never eased.
 * A slim vertical gauge in the right-hand gutter on wide screens only,
 * so it never covers content.
 */
const PHASES = [
  { until: 0.03, label: "Exit" },
  { until: 0.42, label: "Freefall" },
  { until: 0.97, label: "Canopy" },
  { until: 1.01, label: "Landed" },
];

export function Altimeter() {
  const { scrollYProgress } = useScroll();
  const altitude = useTransform(scrollYProgress, [0, 0.42, 1], [13000, 5000, 0]);
  const display = useTransform(altitude, (a) => (Math.round(a / 50) * 50).toLocaleString("en-US"));
  const needle = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [phase, setPhase] = useState("Exit");

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = PHASES.find((ph) => p < ph.until)?.label ?? "Landed";
    if (next !== phase) setPhase(next);
  });

  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 mix-blend-difference min-[1500px]:flex"
    >
      <span className="font-display text-[15px] leading-none tracking-[1px] text-white tabular-nums">
        <motion.span>{display}</motion.span>
      </span>
      <span className="relative block h-40 w-px bg-white/40">
        <motion.span className="absolute -left-[3.5px] block size-2 rounded-full bg-white" style={{ top: needle }} />
      </span>
      <span className="text-[9px] font-bold tracking-[1.6px] text-white uppercase [writing-mode:vertical-rl]">{phase} · ft</span>
    </aside>
  );
}
