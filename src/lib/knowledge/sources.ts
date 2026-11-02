/**
 * Website knowledge loaded into the chatbot.
 *
 * Text below was captured by hand from public Greedy Adventures pages on the
 * capture date shown. It is the ONLY factual material the assistant may use.
 * No crawler: this is a prototype, so the snapshot is versioned with the code.
 */

export type KnowledgeSection = {
  /** Stable id, unique across all sources: `${sourceId}#${slug}` */
  id: string;
  heading: string;
  text: string;
};

export type KnowledgeSource = {
  id: string;
  title: string;
  url: string;
  /** ISO date (YYYY-MM-DD) the text was captured from the live site. */
  capturedAt: string;
  sections: KnowledgeSection[];
};

const SEA_VIEW_URL = "https://greedyadventures.com/experiences/sea-view-skydiving";
const CANCELLATIONS_URL = "https://greedyadventures.com/cancellations";

function section(sourceId: string, slug: string, heading: string, text: string): KnowledgeSection {
  return { id: `${sourceId}#${slug}`, heading, text: text.replace(/\s+/g, " ").trim() };
}

export const KNOWLEDGE_SOURCES: readonly KnowledgeSource[] = [
  {
    id: "sea-view",
    title: "Sea View Skydiving — Tandem Jump over Pattaya | Greedy Adventures",
    url: SEA_VIEW_URL,
    capturedAt: "2026-10-31",
    sections: [
      section(
        "sea-view",
        "overview",
        "Overview",
        `Sea View Tandem Skydive - Pattaya. A tandem skydiving experience over Pattaya with ocean views.
        Tandem skydive from 13,000 ft over the Gulf of Thailand. Guests receive a safety briefing, fly to
        jump altitude, complete the tandem jump with a certified instructor, and choose from ECO, Deluxe,
        or VIP package options depending on the media coverage they want. The same jump in every package:
        choose no cameras, instructor video and photos, or a personal cameraman.`,
      ),
      section(
        "sea-view",
        "packages",
        "Packages and prices",
        `ECO package: "The jump, nothing else." Standard tandem jump package. ฿9,500 per person.
        DELUXE package: "Video and photos included." Tandem jump with handy cam video (instructor video and photos). ฿12,500 per person.
        VIP package: "Personal cameraman and edited film." Premium tandem jump with full media coverage. ฿14,000 per person.
        Prices start from ฿9,500 per person. Same aircraft, altitude and instructors in every package.
        Not included / exclusions: package-specific media is based on the selected option.`,
      ),
      section(
        "sea-view",
        "included",
        "What's included",
        `Included in every package (ECO, Deluxe and VIP): Tandem skydive experience in Pattaya, Thailand.
        Safety briefing and tandem instructor support. Aircraft ascent and ocean-view jump experience.
        Certificate of completion. Deluxe adds handy cam video and photos; VIP adds a personal cameraman and an edited film.`,
      ),
      section(
        "sea-view",
        "plan",
        "The plan (step by step)",
        `Step 1, Arrival and check-in: sign in at the dropzone and bring your photo ID.
        Step 2, Safety briefing and gear fitting: meet your instructor for the safety briefing and harness fitting.
        Step 3, Boarding and the climb: board the aircraft and climb to jump altitude.
        Step 4, Exit and freefall: exit with your instructor for freefall over the Gulf of Thailand.
        Step 5, Canopy flight and landing: fly under the parachute with your instructor and land back at the dropzone.
        At the dropzone: about 3 hours (the booking details also say 3–4 hours at the dropzone).
        Exit altitude: 13,000 ft. About 60 seconds of freefall.`,
      ),
      section(
        "sea-view",
        "highlights",
        "Highlights",
        `Exit at 13,000 ft with the Gulf of Thailand on the horizon. Around sixty seconds of freefall, then
        five to seven minutes under canopy along the coast. No experience needed: your USPA-certified
        instructor flies the jump. Same aircraft, altitude and instructors in every package.`,
      ),
      section(
        "sea-view",
        "location",
        "Where you jump and operator",
        `Where you jump: Pattaya Sea View, Pattaya, Thailand. Address: 95 M.4, Chakphong, Klaeng District,
        Rayong 21190, Thailand. Operated by Dropzone Thailand.`,
      ),
      section(
        "sea-view",
        "faq",
        "Good to know (FAQ)",
        `Where does the activity take place? The tandem skydive is listed for Pattaya, Thailand.
        Which package should I choose? Choose ECO for the standard jump, Deluxe if you want handy cam video,
        and VIP if you want full media coverage.
        Is Bangkok pickup available? Yes. Bangkok pickup is available as a fixed-price add-on (the price is not listed on the page).
        Cancellation note on the booking card: free cancellation up to 24 hours before your slot.`,
      ),
    ],
  },
  {
    id: "cancellations",
    title: "Cancellations | Greedy Adventures",
    url: CANCELLATIONS_URL,
    capturedAt: "2026-10-31",
    sections: [
      section(
        "cancellations",
        "weather",
        "If the weather stops the activity",
        `If the weather stops you jumping, you do not lose your money: you move to the next window or
        another date, at no cost. Skydiving runs only in safe conditions, and the person on the ground decides
        what is safe. If your load is held for weather you can wait for the next window the same day at no cost,
        move to any other date at no cost, or take a full refund of anything you have paid. There is no charge
        and no admin fee for a weather move. If an aircraft turns back after you have started, the operator will
        either re-run the activity when conditions allow or refund the portion you did not receive.`,
      ),
      section(
        "cancellations",
        "cancel",
        "If you cancel",
        `Single-day activities such as a tandem jump: cancel with more than 48 hours' notice and there is nothing
        to pay. Inside 48 hours the operator may have committed an instructor and a seat to you, so a charge may
        apply; Greedy Adventures will tell you what it is before you confirm anything. To cancel, message
        Greedy Adventures on WhatsApp. A cancellation is effective when it is acknowledged, not when it is sent.
        A no-show is treated as a same-day cancellation and the slot is not refunded.`,
      ),
      section(
        "cancellations",
        "refunds",
        "Refunds and insurance",
        `Payment is taken by the operator on the day, so most cancellations involve nothing to refund. Where a
        deposit has been paid, it is returned by the same method it was sent, normally within 7 working days.
        If Greedy Adventures or the operator cancels for a reason other than weather or safety, you choose
        between a full refund and an alternative date. Travel insurance that explicitly covers skydiving is
        strongly recommended; many standard travel policies exclude skydiving and freefall.`,
      ),
    ],
  },
];

export function allSections(): { source: KnowledgeSource; section: KnowledgeSection }[] {
  return KNOWLEDGE_SOURCES.flatMap((source) => source.sections.map((s) => ({ source, section: s })));
}
