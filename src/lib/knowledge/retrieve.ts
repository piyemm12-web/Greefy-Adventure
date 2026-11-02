import { allSections, type KnowledgeSection, type KnowledgeSource } from "./sources";

/**
 * Small lexical retriever (BM25-style) over the captured website sections.
 * The knowledge base is ~10 sections, so an embedding store would add cost
 * and opacity without improving recall. Every score is inspectable in the
 * knowledge view.
 */

export type RetrievedSection = {
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  capturedAt: string;
  sectionId: string;
  heading: string;
  text: string;
  score: number;
};

const STOPWORDS = new Set(
  "a an and are as at be by can could do does for from get got have how i if in is it its me my of on or our please send show so tell that the there this to us was we what when where which who will with would you your about any".split(
    " ",
  ),
);

/** Query-side synonyms so customer phrasing reaches website phrasing. */
const SYNONYMS: Record<string, string[]> = {
  price: ["฿", "per", "person", "packages", "prices"],
  cost: ["price", "฿", "prices"],
  costs: ["price", "฿", "prices"],
  much: ["price", "prices"],
  cheap: ["eco", "price"],
  cheapest: ["eco", "price"],
  include: ["included", "includes"],
  includes: ["included"],
  inclusion: ["included"],
  height: ["altitude", "ft"],
  high: ["altitude", "ft"],
  altitude: ["ft", "exit"],
  long: ["hours", "seconds", "minutes", "duration"],
  duration: ["hours", "dropzone"],
  time: ["hours", "minutes", "seconds"],
  refund: ["refunds", "cancel", "refunded"],
  cancel: ["cancellation", "cancellations", "notice"],
  cancellation: ["cancel", "notice", "hours"],
  weather: ["window", "conditions"],
  rain: ["weather"],
  wind: ["weather"],
  location: ["where", "address", "pattaya"],
  where: ["location", "address", "pattaya"],
  address: ["location"],
  pickup: ["bangkok", "add-on"],
  transfer: ["pickup", "bangkok"],
  transport: ["pickup", "bangkok"],
  video: ["media", "cam", "cameraman", "film", "photos"],
  photos: ["media", "cam", "video"],
  camera: ["cameraman", "cam", "media"],
  instructor: ["tandem", "uspa-certified", "certified"],
  safe: ["safety", "uspa-certified", "conditions"],
  safety: ["briefing", "safe"],
  experience: ["no", "needed"],
  beginner: ["no", "experience", "needed"],
  steps: ["step", "plan"],
  process: ["step", "plan"],
  bring: ["photo", "id"],
  insurance: ["insurance", "policies"],
  operator: ["operated", "dropzone"],
  freefall: ["freefall", "seconds"],
  parachute: ["canopy"],
  deluxe: ["deluxe", "handy"],
  vip: ["vip", "cameraman", "edited"],
  eco: ["eco", "standard"],
  package: ["packages"],
  difference: ["eco", "deluxe", "vip", "packages"],
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z0-9฿,-]+/)
    .map((t) => t.replace(/^[,-]+|[,-]+$/g, ""))
    .filter((t) => t.length > 0 && !STOPWORDS.has(t))
    .map(stem);
}

function stem(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

type Indexed = { source: KnowledgeSource; section: KnowledgeSection; tf: Map<string, number>; length: number };

let cachedIndex: { docs: Indexed[]; df: Map<string, number>; avgLength: number } | null = null;

function index() {
  if (cachedIndex) return cachedIndex;
  const docs: Indexed[] = allSections().map(({ source, section }) => {
    const tokens = tokenize(`${section.heading} ${section.heading} ${section.text}`);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { source, section, tf, length: tokens.length };
  });
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLength = docs.reduce((n, d) => n + d.length, 0) / docs.length;
  cachedIndex = { docs, df, avgLength };
  return cachedIndex;
}

function expandQuery(tokens: string[]): Map<string, number> {
  const weights = new Map<string, number>();
  const add = (t: string, w: number) => weights.set(t, Math.max(weights.get(t) ?? 0, w));
  for (const t of tokens) {
    add(t, 1);
    for (const syn of SYNONYMS[t] ?? []) for (const s of tokenize(syn)) add(s, 0.5);
  }
  return weights;
}

/** Query terms after synonym expansion (used by the mock answerer to pick sentences). */
export function queryTerms(query: string): Set<string> {
  return new Set(expandQuery(tokenize(query)).keys());
}

/** Minimum score for a section to count as relevant evidence. */
export const MIN_SCORE = 1.2;

export type RetrieveOptions = {
  /** Earlier user turns, used at a lower weight so follow-ups keep their topic. */
  context?: string[];
  limit?: number;
};

export function retrieve(query: string, options: RetrieveOptions = {}): RetrievedSection[] {
  const { docs, df, avgLength } = index();
  const n = docs.length;
  const k1 = 1.2;
  const b = 0.75;

  const weights = expandQuery(tokenize(query));
  // Follow-up support: fold in the previous user turn at 35% weight.
  for (const prior of options.context ?? []) {
    for (const [t, w] of expandQuery(tokenize(prior))) {
      weights.set(t, Math.max(weights.get(t) ?? 0, w * 0.35));
    }
  }

  const scored = docs.map((d) => {
    let score = 0;
    for (const [term, qWeight] of weights) {
      const f = d.tf.get(term);
      if (!f) continue;
      const idf = Math.log(1 + (n - (df.get(term) ?? 0) + 0.5) / ((df.get(term) ?? 0) + 0.5));
      score += qWeight * idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.length) / avgLength)));
    }
    return { d, score };
  });

  return scored
    .filter((s) => s.score >= MIN_SCORE)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, options.limit ?? 4)
    .map(({ d, score }) => ({
      sourceId: d.source.id,
      sourceTitle: d.source.title,
      sourceUrl: d.source.url,
      capturedAt: d.source.capturedAt,
      sectionId: d.section.id,
      heading: d.section.heading,
      text: d.section.text,
      score: Math.round(score * 100) / 100,
    }));
}
