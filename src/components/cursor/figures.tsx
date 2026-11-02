import { useId } from "react";

/**
 * Cursor figures. Drawn in the dropzone's canopy colours (black + yellow)
 * with a light halo so they read on both the photo hero and sand sections.
 */

const INK = "#12313f"; // brand primary
const CANOPY = "#f5b81a"; // dropzone canopy yellow

export function Skydiver() {
  // Belly-to-earth arch, seen from above: the freefall position.
  return (
    <svg viewBox="0 0 48 48" width="58" height="58" aria-hidden className="cursor-halo">
      <g className="freefall-bob" stroke={INK} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M24 21 15.5 17.5 12 9.5M24 21l8.5-3.5L36 9.5" strokeWidth="3.4" />
        <path d="M22.2 30.5 17.5 37 19.5 44M25.8 30.5 30.5 37 28.5 44" strokeWidth="3.4" />
        <path d="M24 19v11.5" strokeWidth="6.5" />
        <circle cx="24" cy="13.2" r="4.2" fill={CANOPY} strokeWidth="2" />
      </g>
    </svg>
  );
}

export function Parachute() {
  const clip = useId();
  // Ram-air canopy with alternating black/yellow cells, lines to a jumper.
  return (
    <svg viewBox="0 0 48 52" width="60" height="65" aria-hidden className="cursor-halo">
      <defs>
        <clipPath id={clip}>
          <path d="M4 18C8 6 40 6 44 18c-3.5-2-7-2-10 0-3.3-2-6.7-2-10 0-3.3-2-6.7-2-10 0-3-2-6.5-2-10 0z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="48" height="20" fill={CANOPY} />
        {[9.5, 21, 32.5].map((x) => (
          <rect key={x} x={x} y="0" width="5.5" height="20" fill={INK} />
        ))}
      </g>
      <path
        d="M4 18C8 6 40 6 44 18c-3.5-2-7-2-10 0-3.3-2-6.7-2-10 0-3.3-2-6.7-2-10 0-3-2-6.5-2-10 0z"
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 18.5 23 39M15 17 23.5 39M33 17 24.5 39M43 18.5 25 39" stroke={INK} strokeWidth="0.9" opacity="0.75" />
      <g stroke={INK} strokeLinecap="round">
        <path d="M24 41.5v6.5" strokeWidth="3.6" />
        <path d="M22.5 48.5 21 51M25.5 48.5 27 51" strokeWidth="2" />
      </g>
      <circle cx="24" cy="39.2" r="2.6" fill={CANOPY} stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}

export function Plane() {
  return (
    <svg viewBox="0 0 48 48" width="54" height="54" aria-hidden className="cursor-halo">
      <g fill={INK}>
        <path d="M6 24.5c0-1.6 1.3-2.8 2.9-2.8H35l6.5-5.2c.6-.5 1.5-.1 1.5.7v14.3c0 .8-.9 1.2-1.5.7L37 28.5H8.9C7.3 28.5 6 26.1 6 24.5z" />
        <path d="M18 22 26 11h4l-3.5 11zM20 28.4l5.5 6.6h3.5l-2.4-6.6z" />
      </g>
      <path d="M10.5 24.6h3M16 24.6h2.2M20.5 24.6h2.2" stroke={CANOPY} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Landing target shown over clickable things: "aim here". */
export function Target() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden>
      <circle cx="24" cy="24" r="21" fill="none" stroke={CANOPY} strokeWidth="2.5" />
      <circle cx="24" cy="24" r="13" fill="none" stroke={INK} strokeWidth="2" opacity="0.85" />
      <circle cx="24" cy="24" r="5" fill={CANOPY} stroke={INK} strokeWidth="1.5" />
    </svg>
  );
}
