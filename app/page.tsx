import {
  FORMATS,
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  allConversions,
} from "@/lib/formats";
import { hasConverter } from "@/lib/converters";
import { pathFor } from "@/lib/url";
import { SITE } from "@/lib/site";
import MatrixSearch from "@/components/MatrixSearch";
import { ENTRIES } from "@/lib/changelog";

export default function HomePage() {
  const all = allConversions();
  const liveCount = all.filter((c) => hasConverter(c.from, c.to)).length;

  const entries = all.map((c) => ({
    from: c.from,
    to: c.to,
    fromName: FORMATS[c.from].name,
    toName: FORMATS[c.to].name,
    href: pathFor(c.from, c.to),
    live: hasConverter(c.from, c.to),
  }));

  return (
    <div className="container-x py-16">
      <section className="max-w-3xl">
        <span className="pill mb-4">
          Free · Browser-only · {liveCount} of {all.length} converters live
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Convert any schema to <span className="text-accent">any</span> code.
        </h1>
        <p className="text-dim mt-4 text-lg leading-relaxed">
          Paste a JSON, JSON Schema, OpenAPI, GraphQL SDL, SQL DDL, Protobuf,
          Prisma or TypeScript sample. Get TypeScript, Zod, Pydantic, Go, Rust,
          Swift, Kotlin, and more — generated entirely in your browser.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/json-to-zod" className="btn-primary">
            Try JSON → Zod
          </a>
          <a href="#converters" className="btn-ghost">
            Browse all
          </a>
          <a href="/changelog" className="btn-ghost">
            Changelog
          </a>
        </div>
      </section>

      <section id="converters" className="mt-16">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-dim text-sm uppercase tracking-widest">All converters</p>
            <h2 className="text-2xl font-bold mt-1">
              {INPUT_FORMATS.length} inputs × {OUTPUT_FORMATS.length} outputs
            </h2>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-xs uppercase tracking-widest text-mute mr-1 self-center">
            Browse by input:
          </span>
          {INPUT_FORMATS.map((id) => (
            <a
              key={id}
              href={`/format/${FORMATS[id].slug}`}
              className="text-xs px-2.5 py-1 rounded-full border border-border text-dim hover:border-accent hover:text-text transition"
            >
              {FORMATS[id].name}
            </a>
          ))}
        </div>

        <MatrixSearch entries={entries} />
      </section>

      <section className="mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold">Why {SITE.name}</h2>
        <ul className="mt-4 space-y-2 text-dim">
          <li>• 100% client-side. Your schema never leaves your browser.</li>
          <li>• Zero signup, zero ads in the conversion area.</li>
          <li>• One source of truth — copy generated types straight into your repo.</li>
          <li>
            • Open structure: missing a converter? Open an issue and it&apos;ll
            likely ship next week.
          </li>
        </ul>
      </section>

      <section className="mt-20 max-w-3xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Latest from the changelog</h2>
          <a href="/changelog" className="text-sm text-accent hover:underline">
            See all →
          </a>
        </div>
        <p className="text-dim mt-2 text-sm">
          {SITE.name} is built in public. New features ship every few days.
        </p>
        <div className="mt-6 space-y-4">
          {ENTRIES.slice(0, 3).map((e, i) => (
            <article key={i} className="card p-4">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 className="text-base font-semibold">{e.title}</h3>
                <time className="text-xs text-mute font-mono shrink-0">{e.date}</time>
              </div>
              <ul className="mt-2 text-dim text-sm space-y-1">
                {e.bullets.slice(0, 2).map((b, j) => (
                  <li key={j}>• {b.replace(/`([^`]+)`/g, "$1").replace(/&lt;|&gt;|<[^>]+>/g, "")}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold">Guides</h2>
        <p className="text-dim mt-2 text-sm">
          Long-form, copy-paste-friendly walkthroughs.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/guides/json-to-zod" className="card p-4 hover:border-accent transition">
            <div className="font-semibold">How to convert JSON to a Zod schema</div>
            <p className="text-dim text-sm mt-1">
              From a raw JSON sample to a validated, typed schema you can reuse in fetch, forms, and tRPC.
            </p>
          </a>
          <a href="/guides/json-schema-to-pydantic" className="card p-4 hover:border-accent transition">
            <div className="font-semibold">JSON Schema → Pydantic v2 (FastAPI)</div>
            <p className="text-dim text-sm mt-1">
              Walk $ref, required, oneOf into Pydantic models you can drop straight into FastAPI handlers.
            </p>
          </a>
        </div>
        <a href="/guides" className="text-sm text-accent hover:underline mt-4 inline-block">
          All guides →
        </a>
      </section>
    </div>
  );
}
