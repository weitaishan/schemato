import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schemato vs transform.tools — schema converter comparison",
  description:
    "Compare Schemato and transform.tools for JSON, JSON Schema, OpenAPI, TypeScript, Zod, and multi-language schema conversion workflows.",
  keywords: [
    "schemato vs transform tools",
    "transform.tools alternative",
    "json to zod transform.tools alternative",
    "schema converter alternative",
    "json schema to zod online",
    "openapi to typescript converter",
  ],
  alternates: { canonical: `${SITE.url}/compare/transform-tools` },
  openGraph: {
    title: "Schemato vs transform.tools",
    description:
      "Side-by-side comparison for browser-based schema and typed-code conversion workflows.",
    url: `${SITE.url}/compare/transform-tools`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

interface Row {
  feature: string;
  schemato: string;
  transformTools: string;
  highlight?: "schemato" | "transformTools" | "tie";
}

const ROWS: Row[] = [
  {
    feature: "Main idea",
    schemato: "Focused schema-to-code matrix with permanent pages for each conversion pair",
    transformTools: "Large collection of browser transform utilities across many formats",
    highlight: "tie",
  },
  {
    feature: "Input formats for typed code",
    schemato:
      "JSON, JSON Schema, OpenAPI, GraphQL SDL, SQL DDL, Protobuf, Prisma, TypeScript, Mongoose, Avro",
    transformTools:
      "Strong JSON / TypeScript / GraphQL / schema-related transforms, plus many non-schema utilities",
    highlight: "schemato",
  },
  {
    feature: "Output targets",
    schemato:
      "15 typed-code targets including TypeScript, Zod, Pydantic, Go, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby, Yup, Joi, dataclass",
    transformTools: "Broad transform catalog; some targets vary by input utility",
    highlight: "schemato",
  },
  {
    feature: "Per-conversion URL",
    schemato: "Yes, every input -> output pair has a stable route",
    transformTools: "Yes, tools have their own routes",
    highlight: "tie",
  },
  {
    feature: "Workflow guides",
    schemato:
      "Dedicated guides for JSON → Zod, JSON -> TypeScript, JSON -> Go struct, JSON Schema -> Pydantic, OpenAPI → TypeScript, SQL -> Go",
    transformTools: "Tool-first pages with minimal workflow explanation",
    highlight: "schemato",
  },
  {
    feature: "Open source repository",
    schemato: "MIT, GitHub-hosted, small parser -> Shape -> renderer architecture",
    transformTools: "Open source project with a broad tool collection",
    highlight: "tie",
  },
  {
    feature: "Best fit",
    schemato: "Teams that need schema conversion, validation libraries, DTOs, and language-specific output",
    transformTools: "Developers who want one bookmark for many unrelated transform utilities",
    highlight: "tie",
  },
];

const SOURCES = [
  {
    label: "transform.tools",
    href: "https://transform.tools/",
  },
  {
    label: "transform.tools GitHub",
    href: "https://github.com/ritz078/transform",
  },
  {
    label: "Schemato GitHub",
    href: "https://github.com/weitaishan/schemato",
  },
];

const cellCls = (row: Row, side: "schemato" | "transformTools") => {
  if (row.highlight === side) return "text-text font-medium";
  if (row.highlight === "tie") return "text-dim";
  return "text-mute";
};

export default function CompareTransformToolsPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Schemato vs transform.tools",
    description:
      "Practical comparison of Schemato and transform.tools for browser-based schema and code conversion.",
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    inLanguage: "en",
  };

  return (
    <div className="container-x py-16 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <span>Compare</span>
        <span className="mx-2">/</span>
        <span>transform.tools</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Comparison</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          Schemato vs transform.tools
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed max-w-3xl">
          transform.tools is a well-known toolbox for converting many kinds of
          developer data. Schemato is narrower: it focuses on schema-to-code
          workflows, validation libraries, DTOs, and permanent converter pages.
        </p>
        <p className="text-mute mt-3 text-sm">
          Last reviewed: June 8, 2026. Sources are linked at the bottom.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">TL;DR</h2>
        <ul className="mt-3 space-y-2 text-dim">
          <li>
            • <strong>Use Schemato</strong> when your job is schema-to-code:
            JSON / JSON Schema / OpenAPI / SQL / GraphQL into Zod, Pydantic,
            TypeScript, Go, Rust, and other typed targets.
          </li>
          <li>
            • <strong>Use transform.tools</strong> when you want a broad
            collection of unrelated developer transforms in one place.
          </li>
          <li>
            • Schemato&apos;s bet is depth inside schema conversion: examples,
            guides, privacy boundaries, and one URL per converter pair.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Feature-by-feature</h2>
        <div className="mt-4 overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-panel2 text-dim">
                <th className="px-4 py-3 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium">Schemato</th>
                <th className="px-4 py-3 font-medium">transform.tools</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-bg" : ""}>
                  <td className="px-4 py-3 align-top text-dim">{r.feature}</td>
                  <td className={`px-4 py-3 align-top ${cellCls(r, "schemato")}`}>
                    {r.schemato}
                  </td>
                  <td className={`px-4 py-3 align-top ${cellCls(r, "transformTools")}`}>
                    {r.transformTools}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">When Schemato is the better fit</h2>
        <div className="mt-4 space-y-4 text-dim">
          <p>
            <strong className="text-text">You need validation-library output.</strong>{" "}
            Schemato treats Zod, Yup, Joi, and Pydantic as first-class targets
            instead of only producing TypeScript model types.
          </p>
          <p>
            <strong className="text-text">Your source of truth is not raw JSON.</strong>{" "}
            Schemato accepts JSON Schema, OpenAPI, SQL DDL, GraphQL SDL,
            Protobuf, Prisma, Mongoose, Avro, and TypeScript shapes.
          </p>
          <p>
            <strong className="text-text">You want a converter URL for docs.</strong>{" "}
            Every Schemato converter has a stable URL, so a team can pin
            `/json-to-zod` or `/openapi-to-typescript` in an internal runbook.
          </p>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">Try Schemato</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <a href="/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Zod</div>
            <div className="text-xs text-mute">Runtime validation</div>
          </a>
          <a href="/json-schema-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON Schema → Zod</div>
            <div className="text-xs text-mute">Schema to validator</div>
          </a>
          <a href="/openapi-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">OpenAPI → TypeScript</div>
            <div className="text-xs text-mute">Spec to types</div>
          </a>
          <a href="/sql-to-go-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">SQL → Go struct</div>
            <div className="text-xs text-mute">DDL to DTO</div>
          </a>
          <a href="/compare/quicktype" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">vs quicktype</div>
            <div className="text-xs text-mute">Another comparison</div>
          </a>
          <a href="/compare/json2ts" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">vs json2ts</div>
            <div className="text-xs text-mute">JSON to TS focus</div>
          </a>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">Source notes</h2>
        <p className="text-dim mt-3 leading-relaxed">
          This comparison uses public transform.tools materials and
          Schemato&apos;s current public feature set. If either project changes
          its format list or privacy language, this page should be updated.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SOURCES.map((source) => (
            <a
              key={source.href}
              href={source.href}
              className="btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
