"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BRAND, HERO_FILM, SITE } from "@/lib/site-content";

/* ------------------------------------------------------------------ */
/* Header: transparent over the hero film, turns solid once you scroll past it. */

const NAV = [
  { href: "#packages", label: "Packages" },
  { href: "#plan", label: "The plan" },
  { href: "#details", label: "Details" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-cursor-zone="plane"
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-300 ${
        solid ? "bg-white/95 text-heading shadow-[0_1px_0_rgba(18,49,63,0.08)] backdrop-blur-md" : "bg-transparent text-white"
      }`}
    >
      <div className="wrap flex h-[72px] items-center gap-8 min-[769px]:h-[80px]">
        <a href={SITE} className="relative block h-[34px] w-[124px] shrink-0" aria-label="Greedy Adventures home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={solid ? BRAND.logoDark : BRAND.logoLight} alt="Greedy Adventures" className="h-full w-full object-contain object-left" />
        </a>
        <nav aria-label="Page sections" className="ml-auto hidden items-center gap-9 min-[1025px]:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-[12px] font-bold tracking-[1.4px] uppercase opacity-85 transition-opacity hover:opacity-100">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-5 min-[1025px]:ml-9">
          {/* Knowledge view (required by the brief): one link, visible at every size. */}
          <Link href="/knowledge" className="text-[11px] font-bold tracking-[1.2px] whitespace-nowrap uppercase opacity-85 transition-opacity hover:opacity-100 min-[1025px]:text-[12px] min-[1025px]:tracking-[1.4px]">
            Knowledge
          </Link>
          <a
            href="#packages"
            className={`press inline-flex h-10 items-center rounded-[2px] border px-3.5 text-[11px] whitespace-nowrap sm:px-5 font-bold tracking-[1.2px] uppercase ${
              solid ? "border-primary bg-primary text-white hover:bg-primary-hover" : "border-white/70 hover:bg-white hover:text-heading"
            }`}
          >
            Book a jump
          </a>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Full-bleed hero film: autoplays muted; a canopy sways while it buffers. */

export function HeroFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    v.play().catch(() => setPlaying(false));
  }, [reduced]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => undefined);
    else v.pause();
  };

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        src={HERO_FILM.src}
        poster={HERO_FILM.poster}
        muted
        loop
        playsInline
        preload={reduced ? "none" : "auto"}
        onCanPlay={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={HERO_FILM.label}
      />
      <AnimatePresence>
        {!ready && !reduced && (
          <motion.div key="loader" className="pointer-events-none absolute inset-0 -z-10 grid place-items-center" exit={{ opacity: 0, transition: { duration: 0.4 } }}>
            <svg viewBox="0 0 48 52" width="54" height="58" aria-hidden className="canopy-loader opacity-80">
              <path d="M4 18C8 6 40 6 44 18c-3.5-2-7-2-10 0-3.3-2-6.7-2-10 0-3.3-2-6.7-2-10 0-3-2-6.5-2-10 0z" fill="#fff" />
              <path d="M5 18.5 23 39M15 17 23.5 39M33 17 24.5 39M43 18.5 25 39" stroke="#fff" strokeWidth="0.9" opacity="0.7" />
              <circle cx="24" cy="41" r="2.6" fill="#fff" />
              <path d="M24 43.5v6" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={toggle}
        className="press absolute top-[96px] right-6 z-10 inline-flex items-center gap-2 rounded-[2px] border border-white/30 bg-black/30 px-3 py-2 text-[10px] font-bold tracking-[1.4px] text-white uppercase backdrop-blur-sm hover:bg-black/50 min-[769px]:right-10 min-[769px]:top-[104px] min-[1025px]:right-16"
        aria-label={playing ? "Pause background film" : "Play background film"}
      >
        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
          {playing ? (
            <>
              <rect x="2" y="1.5" width="2.6" height="9" fill="currentColor" />
              <rect x="7.4" y="1.5" width="2.6" height="9" fill="currentColor" />
            </>
          ) : (
            <path d="M2.5 1.5v9l8-4.5z" fill="currentColor" />
          )}
        </svg>
        {playing ? "Pause film" : "Play film"}
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Package media: Deluxe/VIP previews are short films that play only while on screen. */

export function PackageMedia({ image, video, alt }: { image: string; video: string | null; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  const cls = "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-enter)] group-hover:scale-[1.04]";
  return video ? (
    <video ref={ref} className={cls} src={video} poster={image} muted loop playsInline preload="none" aria-label={alt} />
  ) : (
    <Image src={image} alt={alt} fill sizes="(min-width: 769px) 33vw, 100vw" className={cls} />
  );
}
