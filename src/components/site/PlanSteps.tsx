"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PLAN } from "@/lib/site-content";

/**
 * "From check-in to touchdown": topics on the left, explanation on the right.
 * - Topics slide in from left to right (staggered) the first time the list scrolls into view.
 * - Choosing a topic slides its explanation in from the left on the right-hand side.
 * - While on screen it auto-advances every 6 s (progress bar on the active topic) until the
 *   visitor picks a topic themselves; no auto-advance under reduced motion.
 * - Keyboard: a vertical tablist (↑/↓, Home/End; ←/→ on the horizontal mobile row).
 */

const AUTO_MS = 6000;
const EASE = [0.22, 1, 0.36, 1] as const;

export function PlanSteps() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hovering, setHovering] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const inView = useInView(root, { amount: 0.35 });
  const entered = useInView(root, { once: true, amount: 0.2 });
  const running = auto && !reduced && inView && !hovering;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % PLAN.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [running, active]);

  const choose = useCallback((i: number, focus = false) => {
    setAuto(false);
    setActive(i);
    if (focus) tabs.current[i]?.focus();
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = PLAN.length - 1;
    const map: Record<string, number> = {
      ArrowDown: active === last ? 0 : active + 1,
      ArrowRight: active === last ? 0 : active + 1,
      ArrowUp: active === 0 ? last : active - 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    if (e.key in map) {
      e.preventDefault();
      choose(map[e.key], true);
    }
  };

  // Mobile: keep the active topic visible in the horizontal row (scrolls the row only, not the page).
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = list.current;
    const tab = tabs.current[active];
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - 24, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const step = PLAN[active];

  return (
    <div
      ref={root}
      className="mt-16 grid gap-10 min-[769px]:mt-20 min-[1025px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[1025px]:gap-16"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Topics */}
      <div
        ref={list}
        role="tablist"
        aria-label="Steps of the day"
        aria-orientation="vertical"
        onKeyDown={onKey}
        className="bt-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-1 min-[769px]:-mx-10 min-[769px]:px-10 min-[1025px]:mx-0 min-[1025px]:flex-col min-[1025px]:gap-0 min-[1025px]:sticky min-[1025px]:top-32 min-[1025px]:self-start min-[1025px]:overflow-visible min-[1025px]:border-t min-[1025px]:border-line min-[1025px]:px-0 min-[1025px]:pb-0"
      >
        {PLAN.map((s, i) => {
          const isActive = i === active;
          return (
            <motion.button
              key={s.title}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`plan-tab-${i}`}
              aria-selected={isActive}
              aria-controls="plan-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => choose(i)}
              initial={reduced ? false : { opacity: 0, x: -48 }}
              animate={entered || reduced ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.7, ease: EASE, delay: 0.08 * i }}
              className={`group relative flex shrink-0 items-center gap-5 overflow-hidden rounded-[4px] border px-5 py-4 text-left transition-colors duration-200 min-[1025px]:rounded-none min-[1025px]:border-0 min-[1025px]:border-b min-[1025px]:border-line min-[1025px]:px-0 min-[1025px]:py-7 ${
                isActive ? "border-primary bg-primary text-white min-[1025px]:bg-transparent min-[1025px]:text-heading" : "border-line text-heading/55 hover:text-heading"
              }`}
            >
              {/* Active marker slides between topics (desktop). */}
              {isActive && (
                <motion.span
                  layoutId="plan-marker"
                  aria-hidden
                  className="absolute inset-y-0 left-0 hidden w-[3px] bg-primary min-[1025px]:block"
                  transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                />
              )}
              <span
                className={`font-display text-[28px] leading-none tracking-[1px] transition-[transform,color] duration-300 ease-[var(--ease-enter)] min-[1025px]:text-[44px] ${
                  isActive ? "text-white min-[1025px]:translate-x-6 min-[1025px]:text-primary" : "text-current group-hover:translate-x-1"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`font-display text-[20px] leading-[1.05] tracking-[1.2px] whitespace-nowrap uppercase transition-transform duration-300 ease-[var(--ease-enter)] min-[1025px]:text-[30px] min-[1025px]:whitespace-normal ${
                  isActive ? "min-[1025px]:translate-x-6" : "group-hover:translate-x-1"
                }`}
              >
                {s.title}
              </span>
              <span
                aria-hidden
                className={`ml-auto hidden text-[20px] transition-[opacity,transform] duration-300 min-[1025px]:block ${
                  isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                }`}
              >
                →
              </span>
              {/* Auto-advance progress. */}
              {isActive && running && (
                <motion.span
                  key={`progress-${active}`}
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-cream/80 min-[1025px]:-bottom-px min-[1025px]:bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <div id="plan-panel" role="tabpanel" aria-labelledby={`plan-tab-${active}`} className="relative min-[1025px]:min-h-[640px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={active}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: -40, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24, filter: "blur(4px)", transition: { duration: 0.18 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden rounded-[6px] border border-line bg-white shadow-[0_40px_80px_-60px_rgba(16,42,53,0.6)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <motion.div
                className="absolute inset-0"
                initial={reduced ? false : { scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
              >
                <Image src={step.image} alt={step.alt} fill sizes="(min-width: 1025px) 55vw, 100vw" className="object-cover" />
              </motion.div>
              <span className="absolute top-5 left-5 rounded-[2px] bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-[1.4px] text-heading uppercase">
                Step {active + 1} of {PLAN.length}
              </span>
            </div>
            <div className="p-7 min-[769px]:p-10">
              <h3 className="m-0 font-display text-[34px] leading-none tracking-[1.5px] text-heading uppercase min-[769px]:text-[44px]">{step.title}</h3>
              <p className="m-0 mt-5 text-[18px] leading-relaxed text-heading">{step.text}</p>
              <p className="m-0 mt-3 max-w-[560px] text-[16px] leading-relaxed text-body">{step.detail}</p>
              <ul className="m-0 mt-7 flex list-none flex-wrap gap-2.5 p-0">
                {step.facts.map((f) => (
                  <li key={f} className="rounded-[2px] bg-chalk px-3 py-1.5 text-[11px] font-bold tracking-[1.2px] text-primary uppercase">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex items-center justify-between gap-4 border-t border-line pt-6">
                <button
                  type="button"
                  onClick={() => choose(active === 0 ? PLAN.length - 1 : active - 1)}
                  className="press text-[11px] font-bold tracking-[1.4px] text-heading/60 uppercase hover:text-heading"
                >
                  ← Previous
                </button>
                <span className="text-[12px] tracking-[1px] text-muted-fg tabular-nums">
                  {String(active + 1).padStart(2, "0")} / {String(PLAN.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => choose((active + 1) % PLAN.length)}
                  className="press text-[11px] font-bold tracking-[1.4px] text-heading uppercase hover:text-primary"
                >
                  Next step →
                </button>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
