// Generates public/media/sea-view-skydiving-brochure-demo.pdf
// Run: npm run brochure
// DEMO MATERIAL: a sample brochure built from the captured website text.
import { writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const NAVY = rgb(0.03, 0.1, 0.17);
const YELLOW = rgb(0.96, 0.77, 0.09);
const INK = rgb(0.1, 0.13, 0.17);
const MUTED = rgb(0.38, 0.42, 0.47);

const doc = await PDFDocument.create();
doc.setTitle("Sea View Skydiving — Demo brochure");
doc.setAuthor("Prototype for Greedy Adventures (demo material)");
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const regular = await doc.embedFont(StandardFonts.Helvetica);

const W = 595;
const H = 842;

function wrap(text, font, size, width) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > width) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(page, text, { x = 56, y, size = 11, font = regular, color = INK, width = W - 112, gap = 4 }) {
  for (const l of wrap(text, font, size, width)) {
    page.drawText(l, { x, y, size, font, color });
    y -= size + gap;
  }
  return y;
}

function demoBand(page) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: 28, color: YELLOW });
  page.drawText("DEMO MATERIAL - sample brochure generated for a prototype, not an official Greedy Adventures document.", {
    x: 24,
    y: 10,
    size: 8.5,
    font: bold,
    color: NAVY,
  });
}

// Page 1 — cover + packages
{
  const p = doc.addPage([W, H]);
  p.drawRectangle({ x: 0, y: H - 300, width: W, height: 300, color: NAVY });
  p.drawText("GREEDY ADVENTURES  ·  PATTAYA DROPZONE", { x: 56, y: H - 70, size: 9, font: bold, color: YELLOW });
  p.drawText("Sea View", { x: 56, y: H - 150, size: 54, font: bold, color: rgb(1, 1, 1) });
  p.drawText("Skydiving", { x: 56, y: H - 205, size: 54, font: bold, color: rgb(1, 1, 1) });
  p.drawText("Tandem jump from 13,000 ft over the Gulf of Thailand", {
    x: 56,
    y: H - 245,
    size: 13,
    font: regular,
    color: rgb(0.85, 0.9, 0.95),
  });

  const facts = [
    ["13,000 ft", "exit altitude"],
    ["~60 s", "of freefall"],
    ["5-7 min", "under canopy"],
    ["~3 h", "at the dropzone"],
  ];
  facts.forEach(([v, l], i) => {
    const x = 56 + i * 124;
    p.drawText(v, { x, y: H - 350, size: 20, font: bold, color: NAVY });
    p.drawText(l, { x, y: H - 368, size: 9, font: regular, color: MUTED });
  });

  p.drawText("Packages", { x: 56, y: H - 420, size: 18, font: bold, color: NAVY });
  let y = paragraph(p, "Same aircraft, altitude and instructors in every package. The difference is the media you take home.", {
    y: H - 442,
    size: 10.5,
    color: MUTED,
  });

  const pk = [
    ["ECO", "THB 9,500", "The jump, nothing else."],
    ["DELUXE", "THB 12,500", "Handy cam video and photos included."],
    ["VIP", "THB 14,000", "Personal cameraman and edited film."],
  ];
  y -= 12;
  for (const [name, price, line] of pk) {
    p.drawRectangle({ x: 56, y: y - 46, width: W - 112, height: 54, borderColor: rgb(0.85, 0.87, 0.9), borderWidth: 1 });
    p.drawText(name, { x: 72, y: y - 14, size: 13, font: bold, color: NAVY });
    p.drawText(line, { x: 72, y: y - 32, size: 10, font: regular, color: INK });
    p.drawText(price, { x: W - 72 - bold.widthOfTextAtSize(price, 14), y: y - 22, size: 14, font: bold, color: NAVY });
    p.drawText("per person", { x: W - 72 - regular.widthOfTextAtSize("per person", 8), y: y - 36, size: 8, font: regular, color: MUTED });
    y -= 66;
  }

  p.drawText("Included in every package", { x: 56, y: y - 10, size: 12, font: bold, color: NAVY });
  y -= 30;
  for (const item of [
    "Tandem skydive experience in Pattaya, Thailand",
    "Safety briefing and tandem instructor support",
    "Aircraft ascent and ocean-view jump experience",
    "Certificate of completion",
  ]) {
    p.drawText("+  " + item, { x: 56, y, size: 10.5, font: regular, color: INK });
    y -= 16;
  }
  demoBand(p);
}

// Page 2 — plan + good to know
{
  const p = doc.addPage([W, H]);
  p.drawText("The plan", { x: 56, y: H - 80, size: 22, font: bold, color: NAVY });
  const steps = [
    ["Arrival and check-in", "Sign in at the dropzone and bring your photo ID."],
    ["Safety briefing and gear fitting", "Meet your instructor for the safety briefing and harness fitting."],
    ["Boarding and the climb", "Board the aircraft and climb to jump altitude."],
    ["Exit and freefall", "Exit with your instructor for freefall over the Gulf of Thailand."],
    ["Canopy flight and landing", "Fly under the parachute with your instructor and land back at the dropzone."],
  ];
  let y = H - 120;
  steps.forEach(([t, d], i) => {
    p.drawCircle({ x: 68, y: y + 4, size: 11, color: YELLOW });
    p.drawText(String(i + 1), { x: 65, y: y, size: 10, font: bold, color: NAVY });
    p.drawText(t, { x: 90, y: y + 2, size: 12, font: bold, color: INK });
    y = paragraph(p, d, { x: 90, y: y - 15, size: 10, color: MUTED, width: W - 150 });
    y -= 14;
  });

  p.drawText("Good to know", { x: 56, y: y - 16, size: 18, font: bold, color: NAVY });
  y -= 44;
  const faq = [
    ["Experience needed?", "None. Your USPA-certified instructor flies the jump."],
    ["Where is it?", "Pattaya Sea View, 95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand. Operated by Dropzone Thailand."],
    ["Bangkok pickup?", "Available as a fixed-price add-on."],
    ["Weather?", "If weather stops the jump you can wait for the next window, move date, or take a refund, at no cost."],
    ["Cancelling?", "See greedyadventures.com/cancellations for the current policy."],
  ];
  for (const [q, a] of faq) {
    p.drawText(q, { x: 56, y, size: 11, font: bold, color: INK });
    y = paragraph(p, a, { y: y - 15, size: 10, color: MUTED });
    y -= 10;
  }

  p.drawText("greedyadventures.com/experiences/sea-view-skydiving", { x: 56, y: 60, size: 10, font: bold, color: NAVY });
  demoBand(p);
}

const bytes = await doc.save();
await writeFile(new URL("../public/media/sea-view-skydiving-brochure-demo.pdf", import.meta.url), bytes);
console.log(`Wrote brochure (${bytes.length} bytes)`);
