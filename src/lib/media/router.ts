import { mediaOfKind, type MediaAsset, type MediaKind } from "./catalog";

/**
 * Deterministic media router.
 *
 * Decides, before the model runs, whether the customer asked to RECEIVE a
 * PDF and/or a video, and which catalog asset (if any) satisfies it. Keeping
 * this out of the model makes media delivery repeatable and unit-testable;
 * the model is told what was attached and only writes the words around it.
 */

export type UnavailableRequest = { kind: MediaKind; requested: string; reason: string };

export type MediaDecision = {
  intents: MediaKind[];
  selected: MediaAsset[];
  unavailable: UnavailableRequest[];
  /** Human-readable trace for the knowledge view. */
  reasons: string[];
};

const PDF_NOUN = /\b(brochures?|pdfs?|leaflets?|flyers?|catalogu?es?|info(?:rmation)? ?pack|booklet|handout|document)\b/i;
const BROCHURE_NOUN = /\b(brochures?|leaflets?|flyers?|info(?:rmation)? ?pack|booklet)\b/i;
const VIDEO_NOUN = /\b(videos?|clips?|footage|films?|movies?|reel|youtube)\b/i;

/** Verbs/phrases that ask to receive or view something. */
const REQUEST_CUE =
  /\b(send|share|show|see|watch|view|play|give|get me|email|attach|download|link|have a look|look at|preview)\b|\bcan i (?:have|get)\b|\bdo you have\b|\bis there an?\b|\bany\b/i;

/** Questions about what a package contains, not a request to receive media. */
const INCLUSION_QUESTION =
  /\b(includ\w*|comes? with|do i get|will i get|does (?:the )?\w+ (?:package )?(?:have|come)|is (?:a |the )?(?:video|film) (?:part|included))\b/i;

/** Specific documents we do not have. Asking for them must produce "unavailable". */
const UNAVAILABLE_DOCS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(waiver|liability form|consent form|medical form)\b/i, label: "waiver / medical form" },
  { pattern: /\b(invoice|receipt|ticket|voucher|booking confirmation)\b/i, label: "booking document" },
  { pattern: /\b(menu|timetable|schedule)\b/i, label: "schedule or timetable" },
  { pattern: /\b(price list|rate card)\b/i, label: "price list" },
];

/** Video subjects outside the Sea View experience. */
const UNAVAILABLE_VIDEO_SUBJECTS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(my|our) (?:own )?(?:jump|video|footage|film|skydive)\b/i, label: "your personal jump footage" },
  { pattern: /\bmount abu|india\b/i, label: "Mount Abu / India" },
  { pattern: /\b(paragliding|scuba|diving|snowboard\w*)\b/i, label: "other adventures" },
  { pattern: /\b(landing area|drone|aerial map|safety video|briefing video)\b/i, label: "that specific video" },
];

function asksToReceive(text: string, noun: RegExp): boolean {
  if (!noun.test(text)) return false;
  // "Is video included in Deluxe?" is a package question, answered in text.
  if (INCLUSION_QUESTION.test(text) && !/\b(send|show|share|watch|see)\b/i.test(text)) return false;
  // Bare one-word requests like "video?" or "the brochure please".
  if (text.trim().split(/\s+/).length <= 4) return true;
  return REQUEST_CUE.test(text);
}

export function routeMedia(message: string): MediaDecision {
  const text = message.normalize("NFKC");
  const decision: MediaDecision = { intents: [], selected: [], unavailable: [], reasons: [] };

  const wantsPdf = asksToReceive(text, PDF_NOUN);
  const wantsVideo = asksToReceive(text, VIDEO_NOUN);
  const docMiss = UNAVAILABLE_DOCS.find((d) => d.pattern.test(text));
  const askedForDocument = docMiss && /\b(send|share|show|have|get|pdf|copy|download|email)\b/i.test(text);

  if (askedForDocument && docMiss) {
    decision.intents.push("pdf");
    decision.unavailable.push({
      kind: "pdf",
      requested: docMiss.label,
      reason: `No ${docMiss.label} is in the media catalog. Only the Sea View brochure is available.`,
    });
    decision.reasons.push(`Document request matched unavailable item "${docMiss.label}".`);
  }
  // "Send the waiver PDF" must not silently swap in the brochure; "send the
  // waiver and the brochure" should still deliver the brochure.
  if (wantsPdf && (!askedForDocument || BROCHURE_NOUN.test(text))) {
    if (!decision.intents.includes("pdf")) decision.intents.push("pdf");
    const pdf = mediaOfKind("pdf");
    if (pdf) {
      decision.selected.push(pdf);
      decision.reasons.push(`PDF requested → selected "${pdf.id}".`);
    } else {
      decision.unavailable.push({ kind: "pdf", requested: "brochure", reason: "No brochure in the catalog." });
    }
  }

  if (wantsVideo) {
    decision.intents.push("video");
    const miss = UNAVAILABLE_VIDEO_SUBJECTS.find((v) => v.pattern.test(text));
    if (miss) {
      decision.unavailable.push({
        kind: "video",
        requested: miss.label,
        reason: `There is no video of ${miss.label} in the media catalog. Only the Sea View jump film is available.`,
      });
      decision.reasons.push(`Video request matched unavailable subject "${miss.label}".`);
    } else {
      const video = mediaOfKind("video");
      if (video) {
        decision.selected.push(video);
        decision.reasons.push(`Video requested → selected "${video.id}".`);
      } else {
        decision.unavailable.push({ kind: "video", requested: "video", reason: "No video in the catalog." });
      }
    }
  }

  if (decision.intents.length === 0) decision.reasons.push("No media requested → text answer only.");
  return decision;
}
