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
import TrackedLink from "@/components/TrackedLink";
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
  const starterConverters = [
    {
      href: "/json-to-typescript",
      title: "JSON -> TypeScript",
      label: "Most searched starting point",
      detail: "Turn API responses and fixtures into interfaces before choosing validation.",
      event: "json_to_typescript",
    },
    {
      href: "/json-to-zod",
      title: "JSON -> Zod",
      label: "Runtime validation",
      detail: "Use Zod validation for API responses, forms, env vars, and tRPC inputs.",
      event: "json_to_zod",
    },
    {
      href: "/json-to-go-struct",
      title: "JSON -> Go struct",
      label: "Go API DTOs",
      detail: "A direct path for the JSON to Go / JSON to Go struct search intent.",
      event: "json_to_go_struct",
    },
    {
      href: "/openapi-to-typescript",
      title: "OpenAPI -> TypeScript",
      label: "Spec to types",
      detail: "Extract clean types from a spec without setting up a full client generator.",
      event: "openapi_to_typescript",
    },
  ];

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
        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedLink
            href="/json-to-typescript"
            event="click_hero_cta"
            params={{ cta: "json_to_typescript" }}
            className="btn-primary"
          >
            Try JSON → TypeScript
          </TrackedLink>
          <TrackedLink
            href="/json-to-zod"
            event="click_hero_cta"
            params={{ cta: "json_to_zod" }}
            className="btn-ghost"
          >
            JSON → Zod
          </TrackedLink>
          <TrackedLink
            href="#converters"
            event="click_hero_cta"
            params={{ cta: "browse_all" }}
            className="btn-ghost"
          >
            Browse all
          </TrackedLink>
          <TrackedLink
            href="/changelog"
            event="click_hero_cta"
            params={{ cta: "changelog" }}
            className="btn-ghost"
          >
            Changelog
          </TrackedLink>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-dim text-sm uppercase tracking-widest">Start here</p>
            <h2 className="text-2xl font-bold mt-1">Search-backed starting points</h2>
          </div>
          <p className="text-sm text-dim max-w-xl">
            Google Trends points to these broader developer tasks before the narrower long-tail converters.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {starterConverters.map((c) => (
            <TrackedLink
              key={c.href}
              href={c.href}
              event="click_starter_converter"
              params={{ converter: c.event }}
              className="card p-4 hover:border-accent transition block"
            >
              <div className="text-sm text-accent font-medium">{c.label}</div>
              <div className="font-semibold mt-1">{c.title}</div>
              <p className="text-dim text-sm mt-2 leading-relaxed">{c.detail}</p>
            </TrackedLink>
          ))}
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
            <TrackedLink
              key={id}
              href={`/format/${FORMATS[id].slug}`}
              event="click_hub_from_home"
              params={{ input: id }}
              className="text-xs px-2.5 py-1 rounded-full border border-border text-dim hover:border-accent hover:text-text transition"
            >
              {FORMATS[id].name}
            </TrackedLink>
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
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="https://github.com/weitaishan/schemato"
            target="_blank"
            rel="noreferrer"
            className="inline-block"
            aria-label="GitHub stars"
          >
            {/* shields.io 静态徽章 */}
            <img
              src="https://img.shields.io/github/stars/weitaishan/schemato?style=flat-square&logo=github&label=stars&color=7c9cff&labelColor=12151c"
              alt="GitHub stars"
              height={20}
            />
          </a>
          <a
            href="https://github.com/weitaishan/schemato/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.shields.io/github/license/weitaishan/schemato?style=flat-square&color=5eead4&labelColor=12151c"
              alt="License"
              height={20}
            />
          </a>
          <a
            href="https://github.com/weitaishan/schemato/commits/main"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.shields.io/github/last-commit/weitaishan/schemato?style=flat-square&color=fbbf24&labelColor=12151c"
              alt="Last commit"
              height={20}
            />
          </a>
          <a
            href="https://github.com/weitaishan/schemato/issues"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.shields.io/github/issues/weitaishan/schemato?style=flat-square&color=f472b6&labelColor=12151c"
              alt="Open issues"
              height={20}
            />
          </a>
          <img
            src="https://img.shields.io/badge/converters-149%2F149%20live-4ade80?style=flat-square&labelColor=12151c"
            alt="149/149 live converters"
            height={20}
          />
        </div>
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
          <TrackedLink
            href="/guides/multiple-json-samples-to-typescript"
            event="click_guide_from_home"
            params={{ slug: "multiple-json-samples-to-typescript" }}
            className="card p-4 hover:border-accent transition block"
          >
            <div className="font-semibold">Infer optional fields from multiple JSON samples</div>
            <p className="text-dim text-sm mt-1">
              Paste NDJSON API responses and generate a safer shared type.
            </p>
          </TrackedLink>
          <TrackedLink
            href="/guides/json-to-typescript"
            event="click_guide_from_home"
            params={{ slug: "json-to-typescript" }}
            className="card p-4 hover:border-accent transition block"
          >
            <div className="font-semibold">How to convert JSON to TypeScript types</div>
            <p className="text-dim text-sm mt-1">
              Turn a real API response into interfaces, then decide when runtime validation should come next.
            </p>
          </TrackedLink>
          <TrackedLink
            href="/guides/json-to-zod"
            event="click_guide_from_home"
            params={{ slug: "json-to-zod" }}
            className="card p-4 hover:border-accent transition block"
          >
            <div className="font-semibold">How to convert JSON to a Zod schema</div>
            <p className="text-dim text-sm mt-1">
              From a raw JSON sample to a validated, typed schema you can reuse in fetch, forms, and tRPC.
            </p>
          </TrackedLink>
          <TrackedLink
            href="/guides/json-to-go-struct"
            event="click_guide_from_home"
            params={{ slug: "json-to-go-struct" }}
            className="card p-4 hover:border-accent transition block"
          >
            <div className="font-semibold">How to convert JSON to a Go struct</div>
            <p className="text-dim text-sm mt-1">
              Generate Go structs from JSON, then polish pointers, slices, time fields, and json tags.
            </p>
          </TrackedLink>
        </div>
        <a href="/guides" className="text-sm text-accent hover:underline mt-4 inline-block">
          All guides →
        </a>
      </section>

      <section className="mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold">Compare alternatives</h2>
        <p className="text-dim mt-2 text-sm">
          Practical comparisons for teams choosing a browser-based schema converter.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TrackedLink
            href="/compare/quicktype"
            event="click_compare_from_home"
            params={{ slug: "quicktype" }}
            className="card p-4 hover:border-accent transition block"
          >
            <div className="font-semibold">Schemato vs quicktype</div>
            <p className="text-dim text-sm mt-1">
              Mature CLI and model generation vs browser-first validation output.
            </p>
          </TrackedLink>
          <TrackedLink
            href="/compare/json2ts"
            event="click_compare_from_home"
            params={{ slug: "json2ts" }}
            className="card p-4 hover:border-accent transition block"
          >
            <div className="font-semibold">Schemato vs json2ts</div>
            <p className="text-dim text-sm mt-1">
              Focused JSON-to-TypeScript tools vs a multi-format converter matrix.
            </p>
          </TrackedLink>
          <TrackedLink
            href="/compare/transform-tools"
            event="click_compare_from_home"
            params={{ slug: "transform_tools" }}
            className="card p-4 hover:border-accent transition block"
          >
            <div className="font-semibold">Schemato vs transform.tools</div>
            <p className="text-dim text-sm mt-1">
              Broad transform toolbox vs dedicated schema-to-code workflows.
            </p>
          </TrackedLink>
        </div>
      </section>
    </div>
  );
}
