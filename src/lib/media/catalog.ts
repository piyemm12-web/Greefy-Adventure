/**
 * Media the assistant is allowed to share. Anything not listed here is
 * "unavailable" and the assistant must say so rather than invent a link.
 */

export type MediaKind = "pdf" | "video";

export type MediaAsset = {
  id: string;
  kind: MediaKind;
  title: string;
  description: string;
  /** Public URL the chat card opens / plays. */
  url: string;
  /** Optional poster frame for videos. */
  posterUrl?: string;
  /** True for sample material we generated (not published by Greedy Adventures). */
  isDemo: boolean;
  /** Where the asset comes from, shown as attribution. */
  origin: string;
  /** Page the asset belongs to, if any. */
  pageUrl?: string;
  sizeLabel?: string;
};

export const MEDIA_CATALOG: readonly MediaAsset[] = [
  {
    id: "sea-view-brochure",
    kind: "pdf",
    title: "Sea View Skydiving brochure",
    description:
      "Two-page summary of packages, the jump plan and what to bring. Generated for this prototype from the captured website text.",
    url: "/media/sea-view-skydiving-brochure-demo.pdf",
    isDemo: true,
    origin: "Demo material generated for this prototype",
    pageUrl: "https://greedyadventures.com/experiences/sea-view-skydiving",
    sizeLabel: "PDF · 2 pages",
  },
  {
    id: "sea-view-jump-film",
    kind: "video",
    title: "Sea View jump: main film",
    description: "Exit from the aircraft and freefall over the Gulf of Thailand, from the Sea View experience page.",
    url: "https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/sea-view-tandem-skydive-pattaya/25a24e5b-c0f8-45a2-bba0-56e5b3ff5500.mp4",
    posterUrl: "https://www.greedyadventures.com/greedy/films/sea-view-studio-hero-poster.jpg",
    isDemo: false,
    origin: "Published on greedyadventures.com",
    pageUrl: "https://greedyadventures.com/experiences/sea-view-skydiving",
    sizeLabel: "MP4 · ~47 MB",
  },
];

export function getMedia(id: string): MediaAsset | undefined {
  return MEDIA_CATALOG.find((m) => m.id === id);
}

export function mediaOfKind(kind: MediaKind): MediaAsset | undefined {
  return MEDIA_CATALOG.find((m) => m.kind === kind);
}
