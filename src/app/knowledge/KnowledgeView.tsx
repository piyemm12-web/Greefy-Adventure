"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { KnowledgeSource } from "@/lib/knowledge/sources";
import type { RetrievedSection } from "@/lib/knowledge/retrieve";
import type { MediaAsset } from "@/lib/media/catalog";
import { SafeText } from "@/components/chat/ChatParts";

type KnowledgeResponse = { mode: "live" | "mock"; model: string; sources: KnowledgeSource[]; media: MediaAsset[] };

type InspectResponse = {
  question: string;
  mode: "live" | "mock";
  model: string;
  retrieved: RetrievedSection[];
  media: {
    reasons: string[];
    selected: { id: string; kind: string; title: string; isDemo: boolean }[];
    unavailable: { kind: string; requested: string; reason: string }[];
  };
  contextBlock: string;
  answer: string;
  error: string | null;
  durationMs: number;
};

const EXAMPLES = [
  "What is included in the package?",
  "Send me the brochure and a video.",
  "Can you send me the waiver as a PDF?",
  "What is the weight limit?",
];

export function KnowledgeView() {
  const [data, setData] = useState<KnowledgeResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/knowledge")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch(() => setLoadError("Couldn't load the knowledge base from the backend."));
  }, []);

  return (
    <div className="min-h-dvh bg-white" data-cursor-zone="canopy">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="text-[14px] text-primary underline-offset-2 hover:underline">
            ← Back to Sea View Skydiving
          </Link>
          <span className="ml-auto text-[13px] text-muted-fg">Read-only · public website content only</span>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl space-y-14 px-5 py-10 sm:px-8">
        <section>
          <h1 className="font-display text-[clamp(2.2rem,4.5vw,3rem)] leading-none tracking-[2.25px] text-heading uppercase">
            Knowledge view
          </h1>
          <p className="mt-3 max-w-2xl text-[15.5px] text-body-strong">
            Everything the chat assistant is allowed to use, loaded live from the backend. Run a test question to see exactly
            which website text and media the backend passes to the model.
          </p>
          {data && (
            <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-[2px] border border-line bg-white px-3 py-1.5 text-[13px] text-body-strong">
              <span className={`size-2 rounded-[2px] ${data.mode === "live" ? "bg-emerald-500" : "bg-[#f5b81a]"}`} aria-hidden />
              {data.mode === "live" ? `Live model: ${data.model}` : "Mock mode: no API key configured, answers are extracted from the text"}
            </p>
          )}
        </section>

        <Inspector />

        <section aria-labelledby="sources-title">
          <h2 id="sources-title" className="font-display text-[28px] tracking-[2px] uppercase text-heading">
            Website sources
          </h2>
          {loadError && <p role="alert" className="mt-3 text-red-700">{loadError}</p>}
          {!data && !loadError && <p className="mt-3 text-muted-fg">Loading sources…</p>}
          <div className="mt-5 space-y-5">
            {data?.sources.map((s) => (
              <article key={s.id} className="rounded-[2px] border border-line bg-white p-5 sm:p-6">
                <h3 className="text-[17px] font-semibold text-heading">{s.title}</h3>
                <p className="mt-1 text-[13.5px] text-muted-fg">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                    {s.url}
                  </a>{" "}
                  · captured {s.capturedAt} · {s.sections.length} sections
                </p>
                <div className="mt-4 divide-y divide-line">
                  {s.sections.map((sec) => (
                    <details key={sec.id} className="py-2">
                      <summary className="cursor-pointer py-1 text-[14.5px] font-medium text-heading">
                        {sec.heading} <span className="font-mono text-[12px] text-muted-fg">{sec.id}</span>
                      </summary>
                      <p className="mt-1 mb-2 text-[14px] leading-relaxed text-body-strong">{sec.text}</p>
                    </details>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="media-title">
          <h2 id="media-title" className="font-display text-[28px] tracking-[2px] uppercase text-heading">
            Available PDFs and videos
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {data?.media.map((m) => (
              <li key={m.id} className="rounded-[2px] border border-line bg-white p-5">
                <p className="text-[12px] font-semibold tracking-wide text-muted-fg uppercase">
                  {m.kind} {m.isDemo && <span className="ml-1 rounded-[2px] bg-chalk px-2 py-0.5 text-heading">Demo material</span>}
                </p>
                <p className="mt-1.5 font-semibold text-heading">{m.title}</p>
                <p className="mt-1 text-[14px] text-body-strong">{m.description}</p>
                <p className="mt-2 text-[13px] text-muted-fg">
                  {m.origin} · <span className="font-mono">{m.id}</span>
                </p>
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-primary underline underline-offset-2">
                  Open file
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Inspector() {
  const [question, setQuestion] = useState(EXAMPLES[0]);
  const [result, setResult] = useState<InspectResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function run(e?: FormEvent, q = question) {
    e?.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const r = await fetch("/api/knowledge/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? `HTTP ${r.status}`);
      setResult(body);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="inspect-title" className="rounded-[2px] bg-primary p-5 text-white sm:p-7" data-cursor="native">
      <h2 id="inspect-title" className="font-display text-[28px] tracking-[2px] uppercase">
        Test a question
      </h2>
      <p className="mt-1 text-[14.5px] text-white/65">
        Runs the real chat pipeline (retrieval → media router → model). Nothing is stored, and no customer conversations are shown here.
      </p>
      <form onSubmit={run} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="test-q" className="sr-only">
          Test question
        </label>
        <input
          id="test-q"
          value={question}
          maxLength={2000}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-w-0 flex-1 rounded-[2px] border border-white/20 bg-white/10 px-4 py-2.5 text-[15px] text-white placeholder:text-white/40 focus:border-cream focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading" || !question.trim()}
          className="press rounded-[2px] bg-cream px-5 py-2.5 text-[15px] font-semibold text-heading disabled:opacity-50"
        >
          {status === "loading" ? "Running…" : "Run"}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQuestion(ex);
              run(undefined, ex);
            }}
            className="press rounded-[2px] border border-white/20 px-3 py-1 text-[13px] text-white/80 hover:border-white/50"
          >
            {ex}
          </button>
        ))}
      </div>

      {status === "error" && (
        <p role="alert" className="mt-5 rounded-[2px] bg-red-500/15 p-3 text-[14px] text-red-200">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-7 grid gap-5 lg:grid-cols-2" aria-live="polite">
          <div className="space-y-5">
            <Panel title={`Retrieved website text (${result.retrieved.length})`}>
              {result.retrieved.length === 0 ? (
                <p className="text-[13.5px] text-white/60">No section scored above the relevance threshold, so the model is told the website has no answer.</p>
              ) : (
                <ol className="space-y-3">
                  {result.retrieved.map((r) => (
                    <li key={r.sectionId}>
                      <p className="text-[13px] text-accent-on-dark">
                        {r.heading} · score {r.score} · <span className="font-mono">{r.sectionId}</span>
                      </p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-white/75">{r.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
            <Panel title="Media decision">
              <ul className="space-y-1 text-[13.5px] text-white/75">
                {result.media.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {result.media.selected.map((m) => (
                <p key={m.id} className="mt-2 text-[13.5px]">
                  Selected: <span className="font-semibold">{m.title}</span> ({m.kind}
                  {m.isDemo ? ", demo" : ""})
                </p>
              ))}
              {result.media.unavailable.map((u) => (
                <p key={u.requested} className="mt-2 text-[13.5px] text-red-200">
                  Unavailable: {u.requested} ({u.kind})
                </p>
              ))}
            </Panel>
          </div>
          <div className="space-y-5">
            <Panel title={`Model answer · ${result.mode === "live" ? result.model : "mock mode"} · ${result.durationMs} ms`}>
              {result.error ? (
                <p role="alert" className="text-red-200">{result.error}</p>
              ) : (
                <div className="text-[14px] text-white/85">
                  <SafeText text={result.answer} />
                </div>
              )}
            </Panel>
            <Panel title="Exact context block sent with the system prompt">
              <pre className="max-h-80 overflow-auto font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-white/70">
                {result.contextBlock}
              </pre>
            </Panel>
          </div>
        </div>
      )}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2px] border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-white/50 uppercase">{title}</h3>
      {children}
    </div>
  );
}
