import {
  FORMATS,
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  allConversions,
} from "@/lib/formats";
import { hasConverter } from "@/lib/converters";
import { pathFor } from "@/lib/url";
import { SITE } from "@/lib/site";

export default function HomePage() {
  const all = allConversions();
  const live = all.filter((c) => hasConverter(c.from, c.to));

  return (
    <div className="container-x py-16">
      <section className="max-w-3xl">
        <span className="pill mb-4">Free · Browser-only · {all.length} converters</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Convert any schema to <span className="text-accent">any</span> code.
        </h1>
        <p className="text-dim mt-4 text-lg leading-relaxed">
          Paste a JSON, OpenAPI, GraphQL, SQL DDL, or Protobuf sample. Get
          TypeScript, Zod, Pydantic, Go, Rust, Swift, Kotlin, and more —
          generated in your browser.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/json-to-zod" className="btn-primary">
            Try JSON → Zod
          </a>
          <a href="#converters" className="btn-ghost">
            Browse all
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
          <p className="text-mute text-sm hidden md:block">
            Live: {live.length} / {all.length} pairs · more coming
          </p>
        </div>

        <div className="space-y-10">
          {INPUT_FORMATS.map((fromId) => {
            const from = FORMATS[fromId];
            return (
              <div key={fromId}>
                <h3 className="text-sm uppercase tracking-widest text-dim mb-3">
                  From {from.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {OUTPUT_FORMATS.filter((t) => t !== fromId).map((toId) => {
                    const to = FORMATS[toId];
                    const live = hasConverter(fromId, toId);
                    return (
                      <a
                        key={toId}
                        href={pathFor(fromId, toId)}
                        className="card px-3 py-3 hover:border-accent transition flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {from.name} → {to.name}
                          </div>
                          <div className="text-xs text-mute truncate">
                            {live ? "Live" : "Preview"}
                          </div>
                        </div>
                        {live && (
                          <span className="h-2 w-2 rounded-full bg-accent2 shrink-0" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold">Why {SITE.name}</h2>
        <ul className="mt-4 space-y-2 text-dim">
          <li>• 100% client-side. Your schema never leaves your browser.</li>
          <li>• Zero signup, zero ads in the conversion area.</li>
          <li>• One source of truth — copy generated types straight into your repo.</li>
          <li>• Open structure: missing a converter? Open an issue and it&apos;ll likely ship next week.</li>
        </ul>
      </section>
    </div>
  );
}
