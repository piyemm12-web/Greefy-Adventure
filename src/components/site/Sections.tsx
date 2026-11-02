import Image from "next/image";
import Link from "next/link";
import { BRAND, FAQ, FOOTER_ADVENTURES, INCLUDED, PACKAGES, PLAN, SITE, thb } from "@/lib/site-content";
import { AskButton } from "./ChatActions";
import { Reveal } from "./Reveal";
import { PlanSteps } from "./PlanSteps";
import { HeroFilm, PackageMedia } from "./SiteClient";

/*
 * Page layout inspired by gallery-play.be: full-bleed alternating dark/light
 * bands, oversized stacked headlines, media-led cards, a sticky title column,
 * a giant FAQ heading and a split closing call to action. Brand fonts,
 * colours and media stay Greedy Adventures'.
 */

/** Thin column guides + a long arc, the editorial grid behind dark bands. */
export function GridLines({ arcs = true }: { arcs?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="wrap grid h-full grid-cols-4 min-[769px]:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={`border-l border-white/[0.07] ${i >= 4 ? "hidden min-[769px]:block" : ""} ${i === 5 ? "border-r" : ""}`} />
        ))}
      </div>
      {arcs && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <path d="M-100 820 C 300 640, 820 300, 1540 -40" fill="none" stroke="rgba(255,255,255,0.07)" />
          <path d="M-100 980 C 380 760, 900 460, 1540 140" fill="none" stroke="rgba(255,255,255,0.05)" />
        </svg>
      )}
    </div>
  );
}

const HERO_WORDS = ["Sea View", "Skydiving"];

export function Hero() {
  return (
    <section id="top" data-cursor-zone="freefall" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink-deep text-white">
      <HeroFilm />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,23,31,0.6)_0%,rgba(6,23,31,0.15)_28%,rgba(6,23,31,0.45)_55%,rgba(6,23,31,0.94)_100%)]" />

      <div className="wrap mt-auto pt-44 pb-14 min-[769px]:pb-20">
        <p className="animate-enter text-[12px] font-bold tracking-[2.4px] text-accent-on-dark uppercase" style={{ "--stagger": 0 } as React.CSSProperties}>
          Pattaya Dropzone · Thailand
        </p>
        <h1 className="mt-6 font-display text-[clamp(4.5rem,16vw,15rem)] leading-[0.82] tracking-[2px] uppercase">
          {HERO_WORDS.map((w, i) => (
            <span key={w} className="animate-enter block" style={{ "--stagger": i + 1, "--delay": "110ms" } as React.CSSProperties}>
              {w}
            </span>
          ))}
        </h1>
        <div
          className="animate-enter mt-10 grid gap-10 min-[769px]:mt-12 min-[1025px]:grid-cols-[minmax(0,520px)_1fr] min-[1025px]:items-end min-[1025px]:gap-16"
          style={{ "--stagger": 3 } as React.CSSProperties}
        >
          <p className="m-0 text-[18px] leading-relaxed text-white/85 min-[769px]:text-[20px]">
            A tandem jump from 13,000 ft over the Gulf of Thailand. Same jump in every package; you choose how much of it you take home on camera.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row min-[1025px]:justify-end">
            <a href="#packages" className="btn-xl bg-white text-heading hover:bg-cream">
              Choose your package
            </a>
            <AskButton question="Can I see a video of the experience?" className="btn-xl border border-white/70 text-white hover:bg-white/10" cursorLabel="Play film">
              Watch the full film
            </AskButton>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 bg-ink-deep/40 backdrop-blur-sm">
        <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-7 py-8 min-[769px]:grid-cols-4 min-[769px]:py-10">
          {[
            ["13,000 ft", "Exit altitude"],
            ["~60 s", "Freefall"],
            ["5–7 min", "Under canopy"],
            ["from ฿9,500", "Per person"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse">
              <dt className="text-[11px] font-bold tracking-[1.8px] text-white/55 uppercase">{l}</dt>
              <dd className="m-0 mb-2 font-display text-[30px] leading-none tracking-[1.5px] uppercase min-[769px]:text-[38px]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Packages() {
  return (
    <section id="packages" data-cursor-zone="canopy" className="section scroll-mt-16 bg-chalk p-4" aria-labelledby="packages-title">
      <div className="wrap">
        <p className="bt-eyebrow text-center">Three packages · one jump</p>
        <h2 id="packages-title" className="mx-auto mt-6 max-w-[1100px] text-center font-display text-[clamp(3.6rem,10vw,9rem)] leading-[0.86] tracking-[2px] text-heading uppercase">
          Same jump.
          <br />
          Pick your footage.
        </h2>
        <p className="mx-auto mt-10 max-w-[520px] text-center text-[17px] leading-relaxed text-body-strong">
          Same aircraft, altitude and USPA-certified instructors in every package. The difference is how much of your jump you take home.
        </p>

        <ul className="m-0 mx-auto mt-16 grid max-w-[560px] list-none gap-10 p-0 min-[769px]:mt-24 min-[1025px]:max-w-none min-[1025px]:grid-cols-3 min-[1025px]:gap-10 min-[1025px]:pb-14">
          {PACKAGES.map((p, i) => (
            <li key={p.id} className={i === 1 ? "min-[1025px]:translate-y-14" : ""}>
              <Reveal index={i} className="h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-[6px] bg-ink-deep text-white shadow-[0_40px_80px_-50px_rgba(16,42,53,0.8)]">
                  <div className="relative aspect-[4/5] overflow-hidden min-[640px]:max-[1024px]:aspect-[4/3]">
                    <PackageMedia image={p.image} video={p.video} alt={p.alt} />
                    <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,23,31,0)_45%,rgba(6,23,31,0.9)_100%)]" />
                    <span className="absolute top-6 left-6 rounded-[2px] bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-[1.4px] text-heading uppercase">
                      0{i + 1}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-7 min-[1025px]:p-8">
                      <h3 className="m-0 font-display text-[64px] leading-[0.85] tracking-[2px] uppercase min-[1025px]:text-[80px]">{p.name}</h3>
                      <p className="m-0 mt-2 text-[12px] font-bold tracking-[1.4px] text-accent-on-dark uppercase">{p.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-7 p-7 min-[1025px]:p-8">
                    <p className="m-0 flex items-baseline gap-2">
                      <span className="font-display text-[44px] leading-none tracking-[1.5px]">{thb(p.price)}</span>
                      <span className="text-[11px] font-bold tracking-[1.4px] whitespace-nowrap text-white/55 uppercase">per person</span>
                    </p>
                    <AskButton
                      question={`Is the ${p.name} package available, and what does it include?`}
                      className="btn-xl mt-auto w-full min-w-0 bg-white text-heading hover:bg-cream"
                      cursorLabel="Ask the assistant"
                    >
                      Check availability
                    </AskButton>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-24 min-[769px]:mt-32">
          <h3 className="m-0 text-[12px] font-bold tracking-[2px] text-primary uppercase">Included in every package</h3>
          <ul className="m-0 mt-8 grid list-none gap-x-10 p-0 min-[769px]:grid-cols-2 min-[1025px]:grid-cols-4 min-[1025px]:gap-x-12">
            {INCLUDED.map((item, i) => (
              <li key={item} className="border-t-2 border-heading/15 pt-6 pb-10 min-[1025px]:pb-0">
                <span className="block font-display text-[34px] leading-none text-primary/30">0{i + 1}</span>
                <span className="mt-4 block text-[16px] leading-snug text-heading">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[13px] text-muted-fg">This prototype can’t take bookings. “Check availability” asks our assistant.</p>
        </div>
      </div>
    </section>
  );
}

export function Plan() {
  return (
    <section id="plan" data-cursor-zone="canopy" className="scroll-mt-16 bg-white py-28 min-[769px]:py-40 min-[1025px]:py-48" aria-labelledby="plan-title">
      <div className="wrap">
        <div className="grid gap-10 min-[1025px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[1025px]:items-end min-[1025px]:gap-16">
          <div>
            <p className="bt-eyebrow">The plan</p>
            <h2 id="plan-title" className="m-0 mt-6 font-display text-[clamp(3.4rem,7vw,7rem)] leading-[0.86] tracking-[2px] text-heading uppercase">
              From check-in to touchdown.
            </h2>
          </div>
          <dl className="m-0 grid grid-cols-3 gap-6 border-t border-line pt-8 min-[1025px]:border-t-0 min-[1025px]:pt-0">
            {[
              ["3h", "At the dropzone"],
              ["13k ft", "Exit altitude"],
              ["60 s", "Of freefall"],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse">
                <dt className="mt-2 text-[11px] font-bold tracking-[1.4px] text-muted-fg uppercase">{l}</dt>
                <dd className="m-0 font-display text-[40px] leading-none tracking-[1px] text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <PlanSteps />
      </div>
    </section>
  );
}

export function Details() {
  return (
    <section id="details" data-cursor-zone="freefall" className="section relative isolate scroll-mt-16 p-4 overflow-hidden bg-ink-deep text-white" aria-labelledby="details-title">
      <GridLines />
      <div className="wrap">
        <p className="bt-eyebrow !text-accent-on-dark">The details</p>
        <h2 id="details-title" className="sr-only">
          The details
        </h2>
        <p className="mt-10 max-w-[1080px] text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[1.25] font-normal tracking-[0.3px] text-white/95">
          Exit at 13,000 ft with the Gulf of Thailand on the horizon. Around sixty seconds of freefall, then five to seven minutes under canopy along the coast.{" "}
          <span className="text-accent-on-dark">No experience needed: your USPA-certified instructor flies the jump.</span>
        </p>

        <dl className="mt-20 grid gap-12 border-t border-white/15 pt-12 min-[769px]:mt-28 min-[769px]:grid-cols-3 min-[769px]:gap-10 min-[769px]:pt-14">
          {[
            ["Where you jump", "Pattaya Sea View, 95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand"],
            ["Operated by", "Dropzone Thailand"],
            ["Bangkok pickup", "Available as a fixed-price add-on"],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="text-[11px] font-bold tracking-[1.8px] text-white/55 uppercase">{t}</dt>
              <dd className="m-0 mt-4 max-w-[340px] text-[17px] leading-relaxed text-white/90">{d}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-20 flex flex-col gap-4 sm:flex-row min-[769px]:mt-24">
          <a href="#packages" className="btn-xl bg-white text-heading hover:bg-cream">
            Choose your package
          </a>
          <AskButton className="btn-xl border border-white/70 text-white hover:bg-white/10">Ask a question</AskButton>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" data-cursor-zone="canopy" className="section scroll-mt-16 p-4 bg-chalk" aria-labelledby="faq-title">
      <div className="wrap grid gap-14 min-[1025px]:grid-cols-[4fr_8fr] min-[1025px]:gap-24">
        <div>
          <h2 id="faq-title" className="m-0 font-display text-[clamp(6rem,16vw,13rem)] leading-[0.8] tracking-[3px] text-heading uppercase">
            FAQ
          </h2>
          <p className="mt-8 max-w-[300px] text-[15px] leading-relaxed text-body-strong">
            Can’t find your answer?{" "}
            <AskButton className="font-bold text-primary underline underline-offset-4">Ask our assistant</AskButton>.
          </p>
        </div>
        <div className="border-t border-heading/15">
          {FAQ.map((f, i) => (
            <details key={f.q} className="group border-b border-heading/15" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-[19px] leading-snug text-heading min-[769px]:py-8 min-[769px]:text-[22px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="relative block size-4 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-heading" />
                  <span className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-heading transition-transform duration-200 ease-[var(--ease-enter)] group-open:scale-y-0" />
                </span>
              </summary>
              <p className="m-0 max-w-[680px] pr-10 pb-9 text-[16px] leading-relaxed text-body-strong">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReadyToJump() {
  const landing = PLAN[PLAN.length - 1];
  return (
    <section data-cursor-zone="canopy" className="grid min-h-[80vh] bg-cream min-[1025px]:grid-cols-2" aria-labelledby="ready-title">
      <div className="relative min-h-[380px] min-[769px]:min-h-[520px]">
        <Image src={landing.image} alt={landing.alt} fill sizes="(min-width: 1025px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center px-6 py-24 min-[769px]:px-10 min-[769px]:py-28 min-[1025px]:px-20 min-[1025px]:py-32">
        <h2 id="ready-title" className="m-0 font-display text-[clamp(4rem,9vw,9rem)] leading-[0.84] tracking-[2px] text-heading uppercase">
          Ready
          <br />
          to jump?
        </h2>
        <p className="mt-10 max-w-[440px] text-[17px] leading-relaxed text-body-strong">
          Pick a package, or ask our assistant anything about the day: prices, the plan, pickup or the weather policy.
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <a href="#packages" className="btn-xl bg-primary text-white hover:bg-primary-hover">
            Choose your package
          </a>
          <a href={`${SITE}/contact`} className="btn-xl border border-heading text-heading hover:bg-heading hover:text-white">
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer data-cursor-zone="canopy" className="relative isolate overflow-hidden bg-footer text-footer-text">
      <GridLines arcs={false} />
      <div className="wrap pt-24 pb-28 min-[769px]:pt-28">
        <ul className="m-0 flex list-none flex-wrap justify-center gap-x-14 gap-y-6 p-0">
          {FOOTER_ADVENTURES.map((a) => (
            <li key={a.label} className="text-center">
              <span className="block font-display text-[26px] leading-none tracking-[1.3px] text-white uppercase">{a.label}</span>
              <span className="mt-1.5 block text-[10px] font-bold tracking-[1.6px] uppercase">{a.soon ? "Coming soon" : "Available now"}</span>
            </li>
          ))}
        </ul>
        <div className="my-20 flex justify-center min-[769px]:my-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.logoLight} alt="Greedy Adventures" className="h-auto w-[260px] opacity-95 min-[769px]:w-[360px]" />
        </div>
        <div className="flex flex-col gap-5 border-t border-white/10 pt-10 text-[12px] leading-relaxed tracking-[0.8px] uppercase min-[769px]:flex-row min-[769px]:justify-between">
          <p className="m-0">© Greedy Adventures 2026 · Assignment prototype</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link href="/knowledge" className="hover:text-white">
              Knowledge view
            </Link>
            <a href={`${SITE}/privacy`} className="hover:text-white">
              Privacy
            </a>
            <a href={`${SITE}/terms`} className="hover:text-white">
              Terms
            </a>
            <a href={`${SITE}/cancellations`} className="hover:text-white">
              Cancellations
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
