"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Parachute, Plane, Skydiver, Target } from "./figures";

/**
 * Context cursor: the jump, told by the pointer.
 *
 *   data-cursor="plane"   header       → the aircraft
 *   data-cursor="freefall" hero        → skydiver in freefall, tilts with speed
 *   data-cursor="canopy"  content      → parachute open, swings like a pendulum
 *   links / buttons                    → landing target appears under the pointer
 *   data-cursor="play"    videos       → "Play film" label
 *   data-cursor="native"  chat, inputs → real system cursor (text entry needs it)
 *
 * The exact hotspot is a small dot locked to the pointer with no easing, so
 * clicking stays precise; only the figure trails it on a spring.
 * Disabled for touch, coarse pointers and prefers-reduced-motion.
 */

type Figure = "plane" | "freefall" | "canopy";
type Mode = { figure: Figure; interactive: boolean; label: string | null; native: boolean };

const INTERACTIVE = "a, button, summary, label, [role='button'], [role='tab'], select";
const NATIVE = "input, textarea, [contenteditable='true'], [data-cursor='native']";

function resolveMode(target: Element | null): Mode {
  if (!target) return { figure: "canopy", interactive: false, label: null, native: false };
  const native = !!target.closest(NATIVE);
  const zone = target.closest<HTMLElement>("[data-cursor-zone]")?.dataset.cursorZone as Figure | undefined;
  const play = target.closest("[data-cursor='play'], video");
  const labelled = target.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? null;
  return {
    figure: zone ?? "canopy",
    interactive: !!target.closest(INTERACTIVE) || !!play,
    label: play ? "Play film" : labelled,
    native,
  };
}

function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

const swap = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(4px)" },
  transition: { type: "spring" as const, duration: 0.3, bounce: 0.2 },
};

export function ContextCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Figure trails the pointer: soft enough to feel like air, quick enough not to lag.
  const fx = useSpring(x, { stiffness: 520, damping: 40, mass: 0.6 });
  const fy = useSpring(y, { stiffness: 520, damping: 40, mass: 0.6 });

  const vx = useVelocity(x);
  // Freefall: lean into the direction of travel. Canopy: swing the other way, like a pendulum.
  const lean = useSpring(useTransform(vx, [-2000, 0, 2000], [-28, 0, 28], { clamp: true }), { stiffness: 260, damping: 18 });
  const swing = useSpring(useTransform(vx, [-2000, 0, 2000], [22, 0, -22], { clamp: true }), { stiffness: 120, damping: 7 });

  const [mode, setMode] = useState<Mode>({ figure: "freefall", interactive: false, label: null, native: false });
  const [visible, setVisible] = useState(false);
  const [puffs, setPuffs] = useState<{ id: number; x: number; y: number }[]>([]);
  const modeKey = useRef("");
  const puffId = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-context-cursor");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const next = resolveMode(e.target as Element);
      const key = `${next.figure}|${next.interactive}|${next.label}|${next.native}`;
      if (key !== modeKey.current) {
        modeKey.current = key;
        setMode(next);
      }
    };
    const onLeave = () => setVisible(false);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || resolveMode(e.target as Element).native) return;
      const id = ++puffId.current;
      setPuffs((p) => [...p.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setPuffs((p) => p.filter((q) => q.id !== id)), 500);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      root.classList.remove("has-context-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const show = visible && !mode.native;
  const rotate = mode.figure === "canopy" ? swing : mode.figure === "freefall" ? lean : 0;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* Click puff: a small ring where you "landed". */}
      {puffs.map((p) => (
        <span key={p.id} className="cursor-puff" style={{ left: p.x, top: p.y }} />
      ))}

      {/* Landing target over interactive elements, locked to the pointer. */}
      <motion.div className="absolute top-0 left-0" style={{ x, y }}>
        <AnimatePresence>
          {show && mode.interactive && (
            <motion.div
              key="target"
              className="absolute -top-6 -left-6"
              initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.12 } }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.3 }}
            >
              <Target />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Precise hotspot. */}
        <motion.span
          className="absolute -top-[3.5px] -left-[3.5px] block size-[7px] rounded-full bg-primary ring-2 ring-white"
          animate={{ opacity: show ? 1 : 0, scale: mode.interactive ? 0.6 : 1 }}
          transition={{ duration: 0.12 }}
        />
      </motion.div>

      {/* Trailing figure: plane → freefall → canopy depending on page zone. */}
      <motion.div className="absolute top-0 left-0" style={{ x: fx, y: fy }}>
        <motion.div
          className="absolute"
          style={{ left: 14, top: 12, rotate, transformOrigin: mode.figure === "canopy" ? "50% 0%" : "50% 50%" }}
          animate={{ opacity: show ? 1 : 0, scale: show ? (mode.interactive ? 0.9 : 1) : 0.6 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={mode.figure} {...swap}>
              {mode.figure === "plane" ? <Plane /> : mode.figure === "freefall" ? <Skydiver /> : <Parachute />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <AnimatePresence>
          {show && mode.label && (
            <motion.span
              key={mode.label}
              className="absolute top-[74px] left-[12px] rounded-[2px] bg-primary px-2.5 py-1 text-[10px] font-bold tracking-[1.2px] uppercase whitespace-nowrap text-white"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.18 }}
            >
              {mode.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
