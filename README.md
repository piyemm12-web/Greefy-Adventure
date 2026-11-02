# Sea View Skydiving: Greedy Adventures prototype

A one-page redesign of the [Sea View Skydiving](https://greedyadventures.com/experiences/sea-view-skydiving) experience, built with Next.js and TypeScript. It includes an AI chat assistant that answers questions from the website text, links to its sources, remembers the conversation, and sends a **brochure (PDF)** and/or a **video of the jump** when the visitor asks for them. A read-only **knowledge view** shows what the assistant knows and exactly what the backend sends to the model.

The page also has a **context-aware animated cursor** that follows the jump as you scroll: plane → freefall → parachute → landing target.

> Prototype only: no bookings, payments, login or database.

---

## Quick start

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local      # optional: add ANTHROPIC_API_KEY for live answers
npm run dev                     # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build and server |
| `npm test` | Unit tests (media selection, retrieval, memory, validation, fallbacks) |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint checks |
| `npm run brochure` | Regenerate the demo PDF in `public/media/` |

### Environment variables

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables **live mode** (Claude). Server-side only, never sent to the browser. If unset, the app runs in **mock mode**. |
| `ANTHROPIC_MODEL` | Optional model override. Default: `claude-opus-5-5`. |
| `CHAT_MODE=mock` | Forces mock mode even when a key is set. |
| `SIMULATE_MODEL_FAILURE=1` | For verification only: every model call fails, so you can see the error handling. |

**Mock mode is clearly labelled.** The knowledge view shows a "Mock mode" badge, and every mock answer ends with *"(Mock mode: no AI model is connected…)"*. Mock answers are built from the same retrieved text and the same media decisions, so you can check everything except the model's wording without an API key.

### Deploying to Vercel

Import the repository into Vercel. If you want live answers, add `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) under the project's environment variables, then deploy. No other setup is needed.

---

## What's on the page

The page uses the Greedy Adventures brand (fonts, colours and media) with its own layout, and takes cues from [gallery-play.be](https://gallery-play.be/): oversized type, a dark editorial band and generous spacing between sections.

- **Fonts:** Brandon Grotesque (body), Alternate Gothic No.1 (uppercase headings) and Chronicle Display. They load from the Greedy Adventures CDN, which serves them with `access-control-allow-origin: *`. No font files are copied into this repo.
- **Colours:** the site's own `:root` tokens: primary `#12313f`, heading `#20292f`, body `#52575c`, cream `#f7f4eb`, muted `#f9f9f9`, ink `#102a35`, footer `#1d1d1d`, 2px corners. See `src/app/globals.css`.
- **Photos and films:** all loaded from their CDNs (`www.greedyadventures.com` and their R2 media bucket). No images are stored in this repo.

| Section | Notes |
| --- | --- |
| **Header** | Transparent over the hero film with the light wordmark; turns solid white once you scroll past it. Links: Packages, The plan, Details, FAQ, **Knowledge** (the knowledge view), plus **Book a jump**. |
| **Hero** | Full-screen hero film (autoplays muted, pause/play control, canopy loader) with a giant stacked "Sea View Skydiving" headline, a short intro, two large buttons, and a facts bar (13,000 ft · ~60 s · 5–7 min · from ฿9,500). |
| **Packages** | Light band with a huge centred "Same jump. Pick your footage." headline. Three tall media-led cards (the middle one offset) show the package film or photo, a big name, price and **Check availability**, which opens the chat with that question. Below is an "Included in every package" row with numbered columns. |
| **See it. Feel it.** (inspired by gallery-play's "Work that speaks louder than words") | Dark band with altitude contour lines, a giant stacked headline, and a 3D ring of real customer clips and dropzone photos that turns as you scroll. Hover or tap a clip to play it. |
| **The plan** | Extra top/bottom padding. "From check-in to touchdown." with key numbers, then the five topics on the left and the selected topic's explanation on the right (photo, details, facts, previous/next). Topics slide in from left to right when the section appears; choosing one slides its explanation in. It auto-advances every 6 s while on screen until you pick a topic (with a progress bar on the active topic) and never under reduced motion. Keyboard: arrow keys, Home and End. On mobile the topics become a sideways-scrolling row that follows the active step. |
| **Details** | Dark band with thin column guides and arcs. A large lead paragraph, then location, operator and Bangkok pickup in three columns. |
| **FAQ** | Giant "FAQ" heading on the left, accordion on the right, plus a link to ask the assistant. |
| **Ready to jump?** | Split closing section: canopy-landing photo on one half, a huge headline and buttons on the other. |
| **Footer** | Dark band with column guides, the adventures row, a large centred wordmark, and a minimal bottom bar. |
| **Chat** | assistant-ui, in the same brand system. Floating launcher (icon-only on phones); full screen on mobile. |

Responsive from 360px up. Keyboard support: a skip link, visible focus rings, Escape closes the chat (focus returns to the launcher), Enter sends a message, and the FAQ uses native disclosure widgets.

---

## Animation and the context cursor

Motion follows the two skills in `.agents/skills/` ([`ui-animation`](.agents/skills/ui-animation/SKILL.md) and [`no-ai-design-slop`](.agents/skills/no-ai-design-slop/SKILL.md)): every animation explains something, stays on `transform`/`opacity`, and respects reduced motion.

### Context cursor (`src/components/cursor/`)

On desktop the pointer tells the story of the jump, drawn in the brand navy with the dropzone's yellow canopy:

| Where the pointer is | Cursor |
| --- | --- |
| Header (`data-cursor-zone="plane"`) | The jump aircraft |
| Hero film, See it. Feel it., Details (`data-cursor-zone="freefall"`) | A skydiver in freefall that leans with your mouse speed and bobs gently |
| Packages, plan, FAQ, closing section, footer (`data-cursor-zone="canopy"`) | The parachute opens and swings like a pendulum as you move |
| Links and buttons | A landing target spins in under the pointer |
| Videos | A "Play film" label; package buttons show "Ask the assistant" |
| Chat panel, inputs | The normal system cursor comes back so typing works |
| Click | A small yellow ring where you "landed" |

A small dot stays locked exactly to the pointer, so clicking stays precise; only the figure trails it on a spring. The cursor only turns on for a fine pointer that can hover, and not when reduced motion is requested.

### Other motion
- **Altimeter**: a slim vertical gauge in the right-hand gutter on wide screens (≥1500px) that counts down from 13,000 ft to 0 as you scroll, with the phase (Exit → Freefall → Under canopy → Landed). It's linear and tied to scroll position.
- **Hero film loader:** a canopy sways while the film buffers, then fades away.
- **See it. Feel it. ring:** a CSS 3D ring of 12 cards (`preserve-3d`, `rotateY` + `translateZ`). Its rotation combines scroll position with a slow drift that pauses on hover and while off screen. The headline lines blur-rise in once. With reduced motion it becomes a flat, scrollable strip.
- **Package previews:** the Deluxe and VIP preview films play only while on screen.
- **Package cards:** one scroll reveal, run once; the media zooms slightly on hover. The hero headline rises in once on load.
- **Header:** fades from transparent to solid as you leave the hero.
- **Chat:** the panel grows out of the launcher's corner and closes faster than it opens; messages slide in; brochure and video cards blur in; a typing indicator shows while loading.
- `MotionConfig reducedMotion="user"` covers Motion's JS animations; CSS loops pause under `prefers-reduced-motion`.

---

## How the assistant works (agent flow)

```
browser (assistant-ui LocalRuntime + adapter.ts)
   │  POST /api/chat  { messages: [{role, text, mediaIds?}, …] }   ← whole conversation = memory
   ▼
route.ts ── zod validation (roles, ≤24 messages, ≤2000 chars, last turn = user)
   ▼
pipeline.ts  prepareTurn()
   ├─ 1. retrieve()      lib/knowledge/retrieve.ts   BM25-style search over captured website sections
   │                      (+ earlier user turns at lower weight, so follow-ups keep their topic)
   ├─ 2. routeMedia()     lib/media/router.ts         decides: no media / PDF / video / both / unavailable
   └─ 3. build prompt     rules + WEBSITE CONTEXT + ATTACHED MEDIA + UNAVAILABLE
   ▼
model.ts  streamAnswer()  live: Claude via @anthropic-ai/sdk (streamed)  |  mock: extractive answer
   ▼
NDJSON stream →  meta {sources, media, unavailable}  →  text deltas…  →  done | error
```

Design decisions:

- **Media selection is deterministic, not left to the model.** The router uses explicit rules, so "Is video included in Deluxe?" is answered in text, while "Can I see a video?" sends the video. This makes PDF/video delivery repeatable and testable (`tests/media-router.test.ts`). The model is told what was attached and only writes the words around it, so it can't claim to have sent a file that wasn't sent.
- **Unavailable requests are explicit.** A waiver, an invoice, footage of your own jump, or a video of another destination produces an "unavailable" note, and the model is instructed to say so. The router never swaps in a different file.
- **Grounding:** the system prompt only lets the model use the retrieved website text. If nothing relevant is found, it gets `(no matching website text)` and has to say the website doesn't cover it (for example, the weight limit).
- **Sources:** every answer lists the website sections it drew on, with links.
- **Memory:** the client sends the whole conversation (up to 24 turns) with each message. Assistant turns are tagged with the media they shared, so a follow-up like "which package has the edited film?" keeps its context.
- **Fallback behaviour:** media and sources are sent **before** the model starts. If the model then fails, the visitor still gets the brochure or video, plus a clear error with a **Retry** button.
- **Model settings:** `claude-opus-5-5`, `output_config.effort: "low"` (short chat answers), `max_tokens: 2048`, streaming. It also enables the server-side refusal fallback (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`). Errors are mapped to friendly, typed messages (rate limit, auth, connection, refusal).
- **Safety:** model output is rendered as React text nodes only (`SafeText`: paragraphs, bullets and bold, no `innerHTML`). The API key is only read on the server (`server-only`). Inputs are validated with zod. API responses send `nosniff` and `no-store`.

### Code layout

```
src/
  app/
    page.tsx                  the Sea View page
    knowledge/                read-only knowledge view (client page)
    api/chat/route.ts         streaming chat endpoint
    api/knowledge/route.ts    GET sources + media + mode
    api/knowledge/inspect/    POST test question → real pipeline trace
  lib/
    knowledge/                sources.ts (captured text), retrieve.ts (search)
    media/                    catalog.ts (allowed files), router.ts (selection rules)
    chat/                     protocol.ts (wire types + zod), pipeline.ts (prompt), model.ts (Claude / mock)
  components/
    chat/                     assistant-ui provider, adapter, panel, media/source cards
    cursor/                   context cursor + SVG figures
    site/                     page sections, altimeter, reveal
scripts/generate-brochure.mjs demo PDF generator (pdf-lib)
tests/                        vitest suites
```

UI, knowledge, chat/model logic and media handling live in separate modules, as the brief asked.

---

## Sources

The knowledge base was captured by hand from the public website on **2026-10-31**. There's no crawler, and the snapshot is versioned in `src/lib/knowledge/sources.ts`.

| Source | URL | Used for |
| --- | --- | --- |
| Sea View Skydiving page | https://greedyadventures.com/experiences/sea-view-skydiving | Overview, packages and prices, inclusions, plan, highlights, location, FAQ |
| Cancellations page | https://greedyadventures.com/cancellations | Weather, cancellation, refunds, insurance |

Media:

| File | Origin | Label |
| --- | --- | --- |
| `public/media/sea-view-skydiving-brochure-demo.pdf` | Generated by `scripts/generate-brochure.mjs` from the captured text | **Demo material** (badge in the chat, banner on every PDF page) |
| Sea View jump film (MP4) | Published on greedyadventures.com (Greedy Adventures' public media server) | "Published on greedyadventures.com" |
| Page photos, hero film, clips, package previews, logo, fonts | Loaded live from the Greedy Adventures CDNs | Not stored in this repo |

**Note:** the website contradicts itself on cancellation. The booking card says "free cancellation up to 24 hours", while the cancellations page says "more than 48 hours' notice". The knowledge base keeps both, and the FAQ shows both.

---

## Knowledge view

Open **`/knowledge`** (the "Knowledge" link in the header, "See what the assistant knows" in the chat, the "Knowledge view" link in the footer, or the URL directly). It is read-only and loaded from the backend:

- the mode badge (live model name or mock mode)
- every website source: title, URL, capture date, and each section's exact text
- the available PDFs and videos, with demo labels
- **Test a question**: runs the *same* `prepareTurn()` and `streamAnswer()` the chat uses, and shows the retrieved sections with scores, the media decision with its reasoning, the **exact context block sent to the model**, and the model's answer and timing

Nothing is stored. No customer conversations are logged, so none can appear here, and the API key never leaves the server.

---

## Verification

### Automated (`npm test`, 31 tests)

| Area | What's checked |
| --- | --- |
| Media selection | The four required requests → text / PDF / video / both. Phrasing variants ("brochure please", "show me some footage", "video?"). Questions *about* media ("Is video included in Deluxe?") stay text-only. |
| Unavailable media | A waiver PDF is flagged and **not** replaced by the brochure. "Waiver + brochure" sends the brochure and flags the waiver. Mount Abu video and personal footage → unavailable. |
| Retrieval | Inclusions, prices, cancellations and pickup are found; off-topic questions return nothing; follow-ups keep the earlier topic. |
| Memory | Full history is passed; assistant turns are annotated with the media they shared. |
| Validation | Empty, oversize, `system`-role and assistant-last payloads are rejected. |
| Fallbacks | Mock mode answers and labels itself, says when information is missing, and says when a file is unavailable. A simulated model failure raises a retryable error. |

### Manual checks (in the browser)

1. **Answer:** open the chat and click *"What is included in the package?"* → a text answer plus **Sources** links.
2. **Follow-up:** then ask *"Which one has the edited film?"* → the answer should be VIP, in the same thread.
3. **PDF:** *"Can you send me a brochure?"* → a PDF card with a **Demo material** badge, **Open PDF** and **Download**.
4. **Video:** *"Can I see a video of the experience?"* → an inline player plus a "Watch the video in a new tab" link. If the video can't load, the card switches to a labelled link.
5. **Both:** *"Send me the brochure and a video."* → both cards.
6. **Missing information:** *"What is the weight limit?"* → the assistant says the website doesn't say. *"Send me the waiver as a PDF"* → a "Not available" note and no brochure.
7. **Model failure:** run with `SIMULATE_MODEL_FAILURE=1 npm run dev`. Ask for the brochure → the PDF card still appears, followed by a red error message with **Retry**.
8. **Loading:** the typing indicator ("Checking the dropzone notes…") shows until the first words arrive, and the send button becomes **Stop**.
9. **Knowledge view:** open `/knowledge`, click the example questions, and compare the context block and media decision with what the chat shows.
10. **Cursor:** on desktop, move from the header (plane) to the hero film (skydiver) to the packages (parachute), then hover a button (landing target). Turn on *Reduce motion* in your OS → the normal cursor comes back.

Repeatable API checks (with the server running):

```bash
# media selection: expect a meta event with media kinds ["pdf","video"]
curl -s -X POST localhost:3000/api/chat -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","text":"Send me the brochure and a video."}]}' | head -1

# fallback trace for an unavailable file
curl -s -X POST localhost:3000/api/knowledge/inspect -H 'content-type: application/json' \
  -d '{"question":"Can you send me the waiver as a PDF?"}'

# validation: expect HTTP 400
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/chat \
  -H 'content-type: application/json' -d '{"messages":[{"role":"system","text":"hi"}]}'
```

---

## Limitations

- The knowledge base is a hand-captured snapshot, so it won't pick up changes to the website automatically.
- Retrieval is lexical (BM25 with a small synonym list). That's fine for about ten sections, but it would need embeddings for a larger site.
- Media routing uses English keyword rules. Unusual phrasing can miss; the model then answers in text and doesn't invent a file.
- The conversation lives in the browser tab. Refreshing clears it, and there are no saved threads.
- There's no rate limiting or abuse protection on `/api/chat`, which a public deployment would need.
- All photos, films and fonts are hot-linked from the Greedy Adventures CDNs. If those URLs change, the page loses them. The chat's jump film is about 47 MB (`preload="none"` until the visitor presses play).
- The fonts are commercial typefaces licensed to Greedy Adventures. They're loaded from their CDN for this prototype only, and any other use would need a licence check.
- No bookings, live availability or payments. The assistant says so when asked.

## Credits and AI assistance

- **Content, design system and media:** © Greedy Adventures. Copy, colours, fonts, photos and films come from their public website and are used for this assignment only. The PDF brochure is generated demo material.
- **Open source:** [Next.js](https://nextjs.org), [assistant-ui](https://www.assistant-ui.com) (chat primitives and runtime), [Motion](https://motion.dev) (animation), [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript), [zod](https://zod.dev), [pdf-lib](https://pdf-lib.js.org), [Tailwind CSS](https://tailwindcss.com), [Vitest](https://vitest.dev). Fonts: Brandon Grotesque, Alternate Gothic and Chronicle Display, loaded from the Greedy Adventures CDN.
- **Design and animation guidance:** the agent skills in `.agents/skills/`: `ui-animation` (mblode/agent-skills) and `no-ai-design-slop` (mengto/skills).
- **AI assistance:** built with Claude Code (Anthropic). All code was reviewed, type-checked, linted and covered by the tests above. The design was checked in real browser screenshots on desktop and mobile.
