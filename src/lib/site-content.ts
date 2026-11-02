/**
 * Display copy and media for the page, mirrored from
 * https://greedyadventures.com/experiences/sea-view-skydiving (captured 2026-10-31).
 * All photos and films load from the Greedy Adventures CDNs.
 */

export const SITE = "https://www.greedyadventures.com";
const R2 = "https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev";

export const BRAND = {
  logoDark: `${SITE}/greedy/img/brand/greedy-adventures-wordmark-dark.png`,
  logoLight: `${SITE}/greedy/img/brand/greedy-adventures-wordmark-light.png`,
};

export const HERO_FILM = {
  src: `${SITE}/greedy/films/sea-view-studio-hero.mp4`,
  poster: `${SITE}/greedy/films/sea-view-studio-hero-poster.jpg`,
  label: "Main Video of the Jump",
};

export const CUSTOMER_CLIPS = [
  { src: `${R2}/Customer%20clips/fcf84d39-b680-4a5b-93a6-944b8ec50411--clip-3.mp4`, poster: `${SITE}/greedy/customer-clips/clip-3.jpg` },
  { src: `${R2}/Customer%20clips/d8ddde17-db02-4a51-a073-92b469570a74--clip-4.mp4`, poster: `${SITE}/greedy/customer-clips/clip-4.jpg` },
  { src: `${R2}/Customer%20clips/13a51dba-1319-40c6-bedf-a147769c713a--clip-22.mp4`, poster: `${SITE}/greedy/customer-clips/clip-22.jpg` },
  { src: `${R2}/Customer%20clips/f7921fc5-4afb-4479-9abe-b2fab5988e7c--clip-29.mp4`, poster: `${SITE}/greedy/customer-clips/clip-29.jpg` },
  { src: `${R2}/Customer%20clips/b2f23f33-377b-4889-9c6d-1e0c1653a632--clip-33.mp4`, poster: `${SITE}/greedy/customer-clips/clip-33.jpg` },
  { src: `${R2}/Customer%20clips/63f64128-8370-4fcc-b2d4-bd0e9ca40c9f--clip-42.mp4`, poster: `${SITE}/greedy/customer-clips/clip-42.jpg` },
];

export const INCLUDED = [
  "Tandem skydive experience in Pattaya, Thailand",
  "Safety briefing and tandem instructor support",
  "Aircraft ascent and ocean-view jump experience",
  "Certificate of completion",
];

export const PACKAGES = [
  {
    id: "eco",
    name: "ECO",
    tagline: "The jump, nothing else",
    price: 9500,
    image: `${SITE}/greedy/package-previews/eco-landscape.jpg`,
    video: null,
    alt: "ECO package preview: tandem pair in freefall over the coast",
  },
  {
    id: "deluxe",
    name: "Deluxe",
    tagline: "Video and photos included",
    price: 12500,
    image: `${SITE}/greedy/package-previews/deluxe-landscape-poster.png`,
    video: `${SITE}/greedy/package-previews/deluxe-landscape.mp4`,
    alt: "DELUXE package preview: handy cam footage from the instructor",
  },
  {
    id: "vip",
    name: "VIP",
    tagline: "Personal cameraman and edited film",
    price: 14000,
    image: `${SITE}/greedy/package-previews/vip-landscape-poster.png`,
    video: `${SITE}/greedy/package-previews/vip-landscape.mp4`,
    alt: "VIP package preview: footage from a personal cameraman at the aircraft door",
  },
] as const;

export const PLAN = [
  {
    title: "Arrival and check-in",
    text: "Sign in at the dropzone and bring your photo ID.",
    detail: "Check in at the Dropzone Thailand reception in Pattaya Sea View. Plan for about three hours at the dropzone from arrival to landing.",
    facts: ["Bring photo ID", "~3h at the dropzone"],
    image: `${SITE}/greedy/trips/dropzone-thailand-check-in.jpg`,
    alt: "Guests completing check-in paperwork at the Dropzone Thailand reception desk",
    portrait: true,
  },
  {
    title: "Safety briefing and gear fitting",
    text: "Meet your instructor for the safety briefing and harness fitting.",
    detail: "No experience needed. Your USPA-certified tandem instructor walks you through the jump and fits your harness, then flies the jump for you.",
    facts: ["USPA-certified instructor", "No experience needed"],
    image: `${R2}/offerings/sea-view-tandem-skydive-pattaya/108d38.jpg`,
    alt: "Instructor fitting a tandem customer harness at the Pattaya dropzone",
    portrait: true,
  },
  {
    title: "Boarding and the climb",
    text: "Board the aircraft and climb to jump altitude.",
    detail: "Climb to 13,000 ft with the Gulf of Thailand below. It’s the same aircraft, altitude and instructors in every package.",
    facts: ["Exit altitude 13,000 ft", "Same aircraft in every package"],
    image: `${R2}/offerings/apex-gallery/plane.webp`,
    alt: "Jump aircraft at the Pattaya dropzone",
    portrait: false,
  },
  {
    title: "Exit and freefall",
    text: "Exit with your instructor for freefall over the Gulf of Thailand.",
    detail: "Around sixty seconds of freefall over the sea. With Deluxe your instructor films it on a handy cam; with VIP a personal cameraman jumps alongside you.",
    facts: ["~60 s of freefall", "Filmed with Deluxe or VIP"],
    image: `${R2}/offerings/apex-gallery/tandem-with-sea-view.webp`,
    alt: "Tandem skydive over the Gulf of Thailand",
    portrait: false,
  },
  {
    title: "Canopy flight and landing",
    text: "Fly under the parachute with your instructor and land back at the dropzone.",
    detail: "Five to seven minutes under canopy along the coast, then a landing back at the dropzone. Every package includes a certificate of completion.",
    facts: ["5–7 min under canopy", "Certificate of completion"],
    image: `${SITE}/greedy/trips/tandem-canopy-landing-g0250281.jpg`,
    alt: "Tandem passenger and instructor coming in to land under a black and yellow canopy at Dropzone Thailand",
    portrait: false,
  },
] as const;

export const PLAN_FACTS = ["At the dropzone: 3h", "Exit altitude: 13,000 ft", "60 seconds of freefall"];

export const HIGHLIGHTS = [
  "Exit at 13,000 ft with the Gulf of Thailand on the horizon",
  "Around sixty seconds of freefall, then five to seven minutes under canopy along the coast",
  "No experience needed: your USPA-certified instructor flies the jump",
  "Same aircraft, altitude and instructors in every package",
];

export const GALLERY = [
  { src: `${R2}/offerings/sea-view-tandem-skydive-pattaya/108d38.jpg`, alt: "Instructor fitting a tandem customer harness at the Pattaya dropzone" },
  { src: `${R2}/offerings/apex-gallery/jump-after-exit.webp`, alt: "Tandem pair exiting the aircraft over Pattaya" },
  { src: `${R2}/offerings/apex-gallery/jump-post-exit.webp`, alt: "Tandem pair just after aircraft exit over Pattaya" },
  { src: `${R2}/offerings/apex-gallery/instrcutor-with-customer.webp`, alt: "Tandem customer with instructor at the Pattaya dropzone" },
  { src: `${R2}/offerings/apex-gallery/gearing-up.webp`, alt: "Instructor helping a tandem customer with her harness at the Pattaya dropzone" },
  { src: `${R2}/offerings/apex-gallery/plane.webp`, alt: "Jump aircraft at the Pattaya dropzone" },
  {
    src: `${R2}/offerings/sea-view-tandem-skydive-pattaya/verified-2026/a22f4aa4-5fab-41b9-8e07-19843e031f14-5-canopy-landing.webp`,
    alt: "Tandem instructor gathering the parachute after landing at the Pattaya dropzone",
  },
];

export const FAQ = [
  { q: "Where does the activity take place?", a: "The tandem skydive is listed for Pattaya, Thailand." },
  {
    q: "Which package should I choose?",
    a: "Choose ECO for the standard jump, Deluxe if you want handy cam video, and VIP if you want full media coverage.",
  },
  { q: "Is Bangkok pickup available?", a: "Yes. Bangkok pickup is available as a fixed-price add-on." },
  {
    q: "What if the weather is bad?",
    a: "Skydiving only runs in safe conditions. If weather holds your jump, you can wait for the next window the same day, move to another date, or take a full refund, all at no cost.",
  },
  {
    q: "Do I need any experience?",
    a: "No. Your USPA-certified instructor flies the jump, and you get a safety briefing and harness fitting on the day.",
  },
];

export const FOOTER_ADVENTURES = [
  { label: "Skydiving", soon: false, href: `${SITE}/adventures/skydiving` },
  { label: "Paragliding", soon: true, href: null },
  { label: "Scuba Diving", soon: true, href: null },
  { label: "Snowboarding", soon: true, href: null },
];

export const FOOTER_COLUMNS = [
  {
    title: "Adventures",
    links: ["Skydiving", "Paragliding (Coming Soon)", "Scuba Diving (Coming Soon)", "Snowboarding (Coming Soon)", "All Adventures"],
  },
  { title: "Book a tandem", links: ["Book A Tandem", "Tandem In Thailand", "Tandem In India", "Where We Jump"] },
  { title: "Company", links: ["About Us", "Guides And Stories", "Contact"] },
  { title: "Escapes", links: ["Pattaya Dropzone", "Mount Abu", "Thailand", "India"] },
  { title: "Get in touch", links: ["Contact", "Instagram"] },
];

export const thb = (n: number) => `฿${n.toLocaleString("en-US")}`;
