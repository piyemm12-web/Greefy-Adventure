# Verification Guide: Sea View Skydiving AI Assistant

This document provides complete, step-by-step verification procedures for reviewers to test all required capabilities: answers, multi-turn follow-ups, PDF & video media delivery, missing information handling, model failure fallbacks, and repeatable API checks.

---

## 1. Automated Test Suite (31 Tests)

Run the Vitest test suite covering media routing, BM25 retrieval, conversation memory, payload validation, and fallback mechanisms:

```bash
npm test
```

### What the test suites verify:

1. **`tests/media-router.test.ts` (17 tests)**:
   * **Text-only queries**: Inquiries *about* media (e.g. *"Is video included in Deluxe?"*) return no attachments and remain purely textual.
   * **PDF brochure requests**: Explicit requests (e.g. *"Can you send me a brochure?"*, *"brochure please"*) route to the PDF file.
   * **Video requests**: Queries asking to see footage (e.g. *"Can I see a video of the jump?"*, *"show me some footage"*) route to the jump video.
   * **Both media**: Requests for both (e.g. *"Send me the brochure and a video"*) attach both files simultaneously.
   * **Unavailable media**: Requests for documents not offered (e.g. insurance waiver, invoice, footage of own jump, video of Mount Abu) flag the request as unavailable and **never** substitute an arbitrary file.

2. **`tests/pipeline.test.ts` (14 tests)**:
   * **Grounding & Retrieval**: Captures website sections for packages, cancellations, inclusions, and transport; irrelevant queries return no matching text.
   * **Multi-turn Memory**: History carries forward across turns so follow-ups retain context.
   * **Zod Input Validation**: Rejects empty payloads, oversized requests (>2000 chars), unsupported roles (`system`), and non-user terminal turns.
   * **Fallback & Mock Mode**: Operates deterministically without an API key, labels mock answers, and surfaces graceful fallbacks on simulated model failure.

---

## 2. Interactive Browser Verification

Start the local development server:
```bash
npm run dev
# Open http://localhost:3000
```

### Step-by-Step Manual Scenarios:

| # | Feature Under Test | Prompt / User Action | Expected Result |
|---|---|---|---|
| **1** | **Direct Answer & Grounding** | Click or ask: *"What is included in the package?"* | Answers with standard inclusions (jump from 13,000 ft, gear, instructor, certificate). Bottom of message displays clickable **Sources** links referencing the captured website sections. |
| **2** | **Multi-Turn Follow-Up** | Follow up immediately: *"Which one has the edited film?"* | Assistant retains thread context and answers that the **VIP** package includes the edited film (plus raw clips and photos). |
| **3** | **PDF Delivery** | Ask: *"Can you send me a brochure?"* | Returns a message with an attached PDF card featuring: **Demo material** badge, file size, **Open PDF** (opens in new tab) and **Download** buttons. |
| **4** | **Video Delivery** | Ask: *"Can I see a video of the experience?"* | Returns a responsive inline video player playing the authentic jump footage, with a fallback link to open in a new tab. |
| **5** | **Both PDF & Video** | Ask: *"Send me the brochure and a video."* | Both the brochure card and inline video player are attached to the response. |
| **6** | **Missing Information** | Ask: *"What is the weight limit?"* | Assistant explicitly informs the user that the website does not state a weight limit, rather than hallucinating one. |
| **7** | **Unavailable Media** | Ask: *"Can you send me the waiver as a PDF?"* | Assistant clarifies that the waiver document is not available and does **not** substitute the brochure. |
| **8** | **Model Failure & Resiliency** | 1. Stop server.<br>2. Run `SIMULATE_MODEL_FAILURE=1 npm run dev`<br>3. In chat, ask: *"Send me the brochure."* | **Deterministic media delivery succeeds**: The brochure card renders first. Below it, a clear error message appears with a functional **Retry** button. |

---

## 3. Knowledge View Inspection (`/knowledge`)

1. Open **`http://localhost:3000/knowledge`** (or click **"Knowledge"** in the top navigation).
2. **Review Snapshot**: Verify the captured website sources (overview, package tiers, cancellation policies) and registered media catalog.
3. **Inspect Pipeline**: Use the interactive **"Test a question"** tool:
   * Enter: *"Can you send me the brochure?"*
   * Observe the live trace:
     * BM25 retrieved text snippets with relevance scores.
     * Media decision (`pdf: sea-view-skydiving-brochure-demo`).
     * Exact prompt & context block delivered to the model.

---

## 4. Repeatable API Checks (cURL)

With `npm run dev` running on `http://localhost:3000`:

### A. Media Selection (Brochure + Video)
```bash
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"Send me the brochure and a video."}]}'
```
* **Check**: The initial stream payload includes a `"meta"` event with:
  `"media":[{"id":"sea-view-skydiving-brochure-demo","kind":"pdf"},{"id":"sea-view-jump-film","kind":"video"}]`.

### B. Unavailable Media Fallback Trace
```bash
curl -s -X POST http://localhost:3000/api/knowledge/inspect \
  -H "Content-Type: application/json" \
  -d '{"question":"Can you send me the waiver as a PDF?"}'
```
* **Check**: The JSON response reveals `"mediaDecision":{"media":[],"unavailable":["waiver"]}`.

### C. Input Schema Validation
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"system","text":"invalid role"}]}'
```
* **Check**: Returns HTTP `400` Bad Request.

