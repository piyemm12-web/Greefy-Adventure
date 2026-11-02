import { describe, expect, it } from "vitest";
import { routeMedia } from "@/lib/media/router";

const ids = (q: string) => routeMedia(q).selected.map((m) => m.id);
const unavailable = (q: string) => routeMedia(q).unavailable.map((u) => u.kind);

describe("media router: the four required requests", () => {
  it("text only for a package question", () => {
    expect(ids("What is included in the package?")).toEqual([]);
    expect(routeMedia("What is included in the package?").intents).toEqual([]);
  });
  it("PDF for a brochure request", () => {
    expect(ids("Can you send me a brochure?")).toEqual(["sea-view-brochure"]);
  });
  it("video for a video request", () => {
    expect(ids("Can I see a video of the experience?")).toEqual(["sea-view-jump-film"]);
  });
  it("both for brochure + video", () => {
    expect(ids("Send me the brochure and a video.")).toEqual(["sea-view-brochure", "sea-view-jump-film"]);
  });
});

describe("media router: phrasing variants", () => {
  it.each([
    ["brochure please", ["sea-view-brochure"]],
    ["Do you have a PDF I can download?", ["sea-view-brochure"]],
    ["show me some footage of the jump", ["sea-view-jump-film"]],
    ["video?", ["sea-view-jump-film"]],
    ["Could you share the leaflet and a clip", ["sea-view-brochure", "sea-view-jump-film"]],
  ])("%s", (q, expected) => expect(ids(q)).toEqual(expected));

  it.each([
    "Is video included in the Deluxe package?",
    "Does VIP come with an edited film?",
    "Do I get photos and video with Deluxe?",
    "How high is the jump?",
  ])("package questions about media stay text-only: %s", (q) => {
    expect(ids(q)).toEqual([]);
  });
});

describe("media router: unavailable requests are flagged, not substituted", () => {
  it("waiver PDF is unavailable and does not fall back to the brochure", () => {
    const d = routeMedia("Can you send me the waiver form as a PDF?");
    expect(d.selected).toEqual([]);
    expect(d.unavailable[0]).toMatchObject({ kind: "pdf", requested: "waiver / medical form" });
  });
  it("waiver + brochure delivers the brochure and flags the waiver", () => {
    const d = routeMedia("Send me the waiver and the brochure");
    expect(d.selected.map((m) => m.id)).toEqual(["sea-view-brochure"]);
    expect(d.unavailable.map((u) => u.kind)).toEqual(["pdf"]);
  });
  it("video of another destination is unavailable", () => {
    expect(ids("Can I see a video of Mount Abu?")).toEqual([]);
    expect(unavailable("Can I see a video of Mount Abu?")).toEqual(["video"]);
  });
  it("personal footage is unavailable", () => {
    expect(unavailable("Can you send me my jump video from last week?")).toEqual(["video"]);
  });
});
