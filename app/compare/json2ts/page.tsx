import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schemato vs json2ts — JSON-to-TypeScript converter comparison",
  description:
    "Comparing Schemato and json2ts: input formats, output language coverage, structure, and when each one is the right fit.",
  keywords: [
    "schemato vs json2ts",
    "json2ts alternative",
    "free json2ts alternative",
    "json to typescript online",
    "json to ts converter",
    "json2ts comparison",
  ],
  alternates: { canonical: `${SITE.url}/compare/json2ts` },
  openGraph: {
    title: "Schemato vs json2ts",
    description: "Side-by-side comparison: input formats, output coverage, and when to use each.",
    url: `${SITE.url}/compare/json2ts`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

interface Row {
  feature: string;
  schemato: string;
  json2ts: string;
  highlight?: "schemato" | "json2ts" | "tie";
}

const ROWS: Row[] = [
  {
    feature: "Input formats",
    schemato:
      "10 (JSON, JSON Schema, OpenAPI 3.x, GraphQL, SQL DDL, Protobuf, Prisma, TypeScript, Mongoose, Avro)",
    json2ts: "Mainly JSON",
    highlight: "schemato",
  },
  {
    feature: "Output languages",
    schemato:
      "15 (TS, Zod, Yup, Joi, Pydantic, Python dataclass, Go, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby)",
    json2ts: "TypeScript only (per the name)",
    highlight: "schemato",
  },
  {
    feature: "Zod / Yup / Joi outputs",
    schemato: "Yes — first-class",
    json2ts: "No (TypeScript types only)",
    highlight: "schemato",
  },
  {
    feature: "Per-conversion permanent URL",
    schemato: "Yes — every X→Y has its own page",
    json2ts: "Single tool URL",
    highlight: "schemato",
  },
  {
    feature: "Multiple sample tabs",
    schemato:
      "3-5 real-world samples per input (User profile, e-commerce order, GitHub issue, Stripe charge, etc.)",
    json2ts: "Single default field",
    highlight: "schemato",
  },
  {
    feature: "Step-by-step usage guide",
    schemato: "/guides/json-to-zod and 3 more",
    json2ts: "Minimal docs",
    highlight: "schemato",
  },
  {
    feature: "Browser-only, no server",
    schemato: "Yes — all conversion is client-side",
    json2ts: "Some implementations submit input to a backend",
    highlight: "schemato",
  },
  {
    feature: "Open source",
    schemato: "MIT, GitHub-hosted",
    json2ts: "Multiple tools share this name; some are open source, some aren't",
    highlight: "tie",
  },
  {
    feature: "Familiarity / search rank",
    schemato: "Newer (less name recognition)",
    json2ts: "Common search term — many tools rank for it",
    highlight: "json2ts",
  },
  {
    feature: "Single-purpose simplicity",
    schemato: "Multi-format menu",
    json2ts: "If you only ever do JSON → TS, the focused UX is fine",
    highlight: "json2ts",
  },
];

const cellCls = (row: Row, side: "schemato" | "json2ts") => {
  if (row.highlight === side) return "text-text font-medium";
  if (row.highlight === "tie") return "text-dim";
  return "text-mute";
};

export default function CompareJson2tsPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Schemato vs json2ts",
    description:
      "Practical comparison of Schemato and json2ts as JSON-to-TypeScript converters.",
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
        <span>json2ts</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Comparison</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          Schemato vs json2ts
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed max-w-3xl">
          &quot;json2ts&quot; refers to a family of small online tools that turn a JSON
          payload into a TypeScript interface. Schemato does the same — and a
          dozen other things. Here&apos;s how they line up.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">TL;DR</h2>
        <ul className="mt-3 space-y-2 text-dim">
          <li>
            • <strong>Use Schemato</strong> when you also need Zod / Pydantic /
            Go / Rust output, or when your input is JSON Schema / OpenAPI / SQL
            instead of raw JSON.
          </li>
          <li>
            • <strong>Use json2ts</strong> if all you ever convert is JSON to
            TypeScript and you don&apos;t want extra options on the page.
          </li>
          <li>• Both run free in the browser; pick the one whose URL you remember.</li>
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
                <th className="px-4 py-3 font-medium">json2ts (typical)</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-bg" : ""}>
                  <td className="px-4 py-3 align-top text-dim">{r.feature}</td>
                  <td className={`px-4 py-3 align-top ${cellCls(r, "schemato")}`}>
                    {r.schemato}
                  </td>
                  <td className={`px-4 py-3 align-top ${cellCls(r, "json2ts")}`}>
                    {r.json2ts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">Pick Schemato if you ever need…</h2>
        <ul className="mt-4 space-y-3 text-dim">
          <li>
            • <strong className="text-text">Zod / Pydantic / Yup / Joi.</strong>{" "}
            json2ts produces TypeScript types only. Schemato adds the four most
            popular validation libraries.
          </li>
          <li>
            • <strong className="text-text">Inputs other than raw JSON.</strong>{" "}
            JSON Schema, OpenAPI, GraphQL, SQL, Protobuf, Prisma, Mongoose, Avro.
          </li>
          <li>
            • <strong className="text-text">A URL you can pin in a runbook.</strong>{" "}
            Each conversion has its own page so you can drop a permalink into
            your team docs.
          </li>
          <li>
            • <strong className="text-text">Step-by-step guides.</strong>{" "}
            Schemato&apos;s <a className="text-accent hover:underline" href="/guides">/guides</a>{" "}
            section walks through real workflows like fetch validation and
            React Hook Form integration.
          </li>
        </ul>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">Try it now</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <a href="/json-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → TypeScript</div>
            <div className="text-xs text-mute">The exact same job, with extras</div>
          </a>
          <a href="/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Zod</div>
            <div className="text-xs text-mute">Same shape + runtime validation</div>
          </a>
          <a href="/guides/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">Guide: JSON → Zod</div>
            <div className="text-xs text-mute">Step-by-step</div>
          </a>
          <a href="/format/json" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">All JSON converters</div>
            <div className="text-xs text-mute">15 target languages</div>
          </a>
          <a href="/compare/quicktype" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">Schemato vs quicktype</div>
            <div className="text-xs text-mute">Other comparison</div>
          </a>
        </div>
      </section>
    </div>
  );
}
