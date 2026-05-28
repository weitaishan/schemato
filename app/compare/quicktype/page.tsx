import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schemato vs quicktype — feature comparison",
  description:
    "A practical comparison of Schemato and quicktype: input formats, output targets, CLI support, validation-library output, privacy, and when each tool is the better fit.",
  keywords: [
    "schemato vs quicktype",
    "quicktype alternative",
    "free quicktype alternative",
    "json to zod alternative",
    "quicktype vs json to zod",
    "browser-only schema converter",
  ],
  alternates: { canonical: `${SITE.url}/compare/quicktype` },
  openGraph: {
    title: `Schemato vs quicktype`,
    description: `Side-by-side comparison: input formats, output languages, deployment, source.`,
    url: `${SITE.url}/compare/quicktype`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

interface Row {
  feature: string;
  schemato: string;
  quicktype: string;
  /** 给"我们更好"的格子上色 */
  highlight?: "schemato" | "quicktype" | "tie";
}

const ROWS: Row[] = [
  {
    feature: "Input formats",
    schemato:
      "10 (JSON, JSON Schema, OpenAPI 3.x, GraphQL SDL, SQL DDL, Protobuf, Prisma, TypeScript, Mongoose, Avro)",
    quicktype: "JSON, JSON API URLs, JSON Schema, TypeScript, GraphQL queries",
    highlight: "schemato",
  },
  {
    feature: "Output languages",
    schemato:
      "15 (TS, Zod, Yup, Joi, Pydantic, Python dataclass, Go, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby)",
    quicktype:
      "20+ (TypeScript, Go, Swift, Kotlin, C#, C++, Elm, Haskell, PHP, and more)",
    highlight: "quicktype",
  },
  {
    feature: "Zod / Yup / Joi / Pydantic outputs",
    schemato: "Yes, first-class — these are the most-used outputs",
    quicktype: "Not listed as built-in target languages in the official README",
    highlight: "schemato",
  },
  {
    feature: "Runs in browser without install",
    schemato: "Yes — paste-and-go on a per-conversion URL",
    quicktype: "Yes — the official README calls the web app the most complete UI",
    highlight: "tie",
  },
  {
    feature: "Per-conversion URL (shareable)",
    schemato: "Yes — every X→Y has its own page (good for pinning in docs)",
    quicktype: "Single tool URL with format pickers",
    highlight: "schemato",
  },
  {
    feature: "Workflow-specific guides",
    schemato:
      "Yes — guide pages for JSON → Zod, JSON → TypeScript, Go structs, Pydantic, OpenAPI, and SQL",
    quicktype: "Strong README and CLI examples; less focused on per-conversion walkthrough pages",
    highlight: "schemato",
  },
  {
    feature: "Multi-sample inference (union of N JSONs)",
    schemato: "Not yet — single sample today",
    quicktype: "Yes — the API accepts multiple JSON samples for a desired type",
    highlight: "quicktype",
  },
  {
    feature: "CLI",
    schemato: "Not yet (planned)",
    quicktype: "Yes — `quicktype` is heavily CLI-driven",
    highlight: "quicktype",
  },
  {
    feature: "VS Code extension",
    schemato: "Not yet (planned)",
    quicktype: "Yes",
    highlight: "quicktype",
  },
  {
    feature: "Open source",
    schemato: "MIT, GitHub-hosted, intentionally small",
    quicktype: "Apache-2.0, mature GitHub project with a large codebase",
    highlight: "tie",
  },
  {
    feature: "Sample data privacy",
    schemato: "Conversions run in the browser; pasted input is not uploaded to a Schemato conversion API",
    quicktype:
      "Official README says the web app works offline and does not send sample data over the Internet; CLI is local",
    highlight: "tie",
  },
];

const QUICKTYPE_SOURCES = [
  {
    label: "quicktype GitHub README",
    href: "https://github.com/glideapps/quicktype",
  },
  {
    label: "quicktype web app",
    href: "https://app.quicktype.io/",
  },
  {
    label: "quicktype npm package",
    href: "https://www.npmjs.com/package/quicktype",
  },
];

const cellCls = (row: Row, side: "schemato" | "quicktype") => {
  if (row.highlight === side) return "text-text font-medium";
  if (row.highlight === "tie") return "text-dim";
  return "text-mute";
};

export default function ComparePage() {
  // Article + ItemList JSON-LD
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Schemato vs quicktype",
    description:
      "Practical, side-by-side comparison of two browser-friendly schema-to-code tools.",
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    inLanguage: "en",
  };

  return (
    <div className="container-x py-16 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <span>Compare</span>
        <span className="mx-2">/</span>
        <span>quicktype</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Comparison</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          Schemato vs quicktype
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed max-w-3xl">
          quicktype is one of the best-known tools for generating typed models
          from JSON-shaped data. Schemato is younger, smaller, and optimized for
          browser-first validation-library output and per-conversion URLs. Here&apos;s
          where each one wins.
        </p>
        <p className="text-mute mt-3 text-sm">
          Last reviewed: May 28, 2026. Sources are linked at the bottom of the page.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">TL;DR</h2>
        <ul className="mt-3 space-y-2 text-dim">
          <li>
            • <strong>Use Schemato</strong> when you want Zod / Yup / Joi / Pydantic
            output, when you need OpenAPI / SQL / Protobuf / Prisma / Mongoose /
            Avro as input, or when you want a permalink for a specific X→Y pair.
          </li>
          <li>
            • <strong>Use quicktype</strong> when you need merge-multiple-samples
            inference, a mature CLI, VS Code workflow, runtime serializers, or
            one of its broader target languages.
          </li>
          <li>
            • They&apos;re complementary tools. Schemato is better for validation
            schemas and browser-first workflows; quicktype is better for mature
            CLI/library workflows and broad model generation.
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
                <th className="px-4 py-3 font-medium">quicktype</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? "bg-bg" : ""}
                  style={{ borderTop: "1px solid var(--tw-border)" }}
                >
                  <td className="px-4 py-3 align-top text-dim">{r.feature}</td>
                  <td className={`px-4 py-3 align-top ${cellCls(r, "schemato")}`}>
                    {r.schemato}
                  </td>
                  <td className={`px-4 py-3 align-top ${cellCls(r, "quicktype")}`}>
                    {r.quicktype}
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
            <strong className="text-text">You write Zod, Yup, Joi, or Pydantic.</strong>{" "}
            quicktype&apos;s official target-language list focuses on model and
            serializer output. Schemato treats validation libraries as first-class
            targets, which is useful for forms, API responses, env vars, and tRPC
            inputs.
          </p>
          <p>
            <strong className="text-text">You start from OpenAPI, SQL, Protobuf
            or Prisma.</strong>{" "}
            quicktype covers JSON, JSON Schema, TypeScript, and GraphQL queries.
            Schemato adds more source formats for teams whose source of truth is
            a database schema, ORM model, or service contract.
          </p>
          <p>
            <strong className="text-text">You want to paste a URL into your team
            wiki.</strong>{" "}
            Every X→Y in Schemato has a permanent URL — easy to drop into a runbook
            or onboarding doc.
          </p>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">When quicktype is the better fit</h2>
        <div className="mt-4 space-y-4 text-dim">
          <p>
            <strong className="text-text">You have N samples and want a unified
            type.</strong>{" "}
            quicktype shines here. Schemato today is intentionally simple and
            only converts one pasted sample at a time.
          </p>
          <p>
            <strong className="text-text">You live in your terminal.</strong>{" "}
            quicktype&apos;s CLI is mature; Schemato&apos;s CLI is on the
            roadmap, not shipped.
          </p>
          <p>
            <strong className="text-text">You need broad model generation or
            serializers.</strong>{" "}
            quicktype targets more languages and can generate richer model /
            serializer code. Schemato focuses on the common typed-code and
            validation-schema outputs developers paste into apps.
          </p>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">Privacy and data handling</h2>
        <p className="text-dim mt-3 leading-relaxed">
          Both tools can be privacy-friendly. Schemato runs conversions in the
          browser and does not upload pasted input to a Schemato conversion API.
          The quicktype README says its web app works offline and does not send
          sample data over the Internet, and its CLI runs locally. If your payload
          contains secrets, customer data, private keys, or access tokens, the
          safest option is still to remove or redact that data before using any
          generator.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Try Schemato</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <a href="/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Zod</div>
            <div className="text-xs text-mute">Most popular</div>
          </a>
          <a href="/json-to-pydantic" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Pydantic</div>
            <div className="text-xs text-mute">FastAPI users</div>
          </a>
          <a href="/openapi-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">OpenAPI → TypeScript</div>
            <div className="text-xs text-mute">From spec to types</div>
          </a>
          <a href="/sql-to-go-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">SQL → Go struct</div>
            <div className="text-xs text-mute">DDL to typed model</div>
          </a>
          <a href="/graphql-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">GraphQL → TypeScript</div>
            <div className="text-xs text-mute">Skip Apollo codegen</div>
          </a>
          <a href="/protobuf-to-rust-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">Protobuf → Rust</div>
            <div className="text-xs text-mute">Quick prototyping</div>
          </a>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">Source notes</h2>
        <p className="text-dim mt-3 leading-relaxed">
          This comparison uses public quicktype materials and Schemato&apos;s
          current public feature set. If quicktype changes its target list or
          privacy language, this page should be updated.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICKTYPE_SOURCES.map((source) => (
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
