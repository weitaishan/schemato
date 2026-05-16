import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schemato vs quicktype — feature comparison",
  description:
    "How Schemato compares to quicktype for converting JSON, JSON Schema, OpenAPI, GraphQL and SQL into TypeScript, Zod, Pydantic, Go, Rust and 10 more languages.",
  keywords: [
    "schemato vs quicktype",
    "quicktype alternative",
    "free quicktype alternative",
    "json to zod alternative",
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
    quicktype: "Mainly JSON, JSON Schema, GraphQL, TypeScript",
    highlight: "schemato",
  },
  {
    feature: "Output languages",
    schemato:
      "15 (TS, Zod, Yup, Joi, Pydantic, Python dataclass, Go, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby)",
    quicktype:
      "20+ (TS, Go, Swift, Kotlin, etc) — but no Zod / Yup / Joi / Pydantic out of the box",
    highlight: "tie",
  },
  {
    feature: "Zod / Yup / Joi / Pydantic outputs",
    schemato: "Yes, first-class — these are the most-used outputs",
    quicktype: "No (no Zod, no Pydantic; you need a separate tool)",
    highlight: "schemato",
  },
  {
    feature: "Runs in browser without install",
    schemato: "Yes — paste-and-go on a per-conversion URL",
    quicktype: "Web app exists, but most usage is via CLI / VS Code extension",
    highlight: "schemato",
  },
  {
    feature: "Per-conversion URL (shareable)",
    schemato: "Yes — every X→Y has its own page (good for pinning in docs)",
    quicktype: "Single tool URL with format pickers",
    highlight: "schemato",
  },
  {
    feature: "Real-world sample switcher",
    schemato:
      "Yes — 3-5 hand-picked samples per input format (User profile, e-commerce order, GitHub issue, etc.)",
    quicktype: "Single default sample",
    highlight: "schemato",
  },
  {
    feature: "Multi-sample inference (union of N JSONs)",
    schemato: "Not yet — single sample today",
    quicktype: "Yes — paste several, get a unified type",
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
    schemato: "MIT, GitHub-hosted — small enough to read in an afternoon",
    quicktype: "Apache-2.0, large mature codebase",
    highlight: "tie",
  },
  {
    feature: "Build-time / browser-only",
    schemato: "100% browser; static export — no servers, no analytics on inputs",
    quicktype:
      "Web app sends JSON to backend service for some conversions; CLI is local",
    highlight: "schemato",
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
          quicktype is the best-known tool for turning JSON into typed code. Schemato
          is younger, smaller, and focused on a different shape of problem. Here&apos;s
          where each one wins.
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
            inference, a CLI, a VS Code extension, or one of its more exotic
            output languages (Elm, Flow, Crystal, etc.).
          </li>
          <li>• They&apos;re complementary tools, not strict alternatives.</li>
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
            <strong className="text-text">You write Zod or Pydantic.</strong>{" "}
            quicktype famously does not target Zod or Pydantic. If you live in
            those ecosystems, Schemato saves you a second tool.
          </p>
          <p>
            <strong className="text-text">You start from OpenAPI, SQL, Protobuf
            or Prisma.</strong>{" "}
            quicktype focuses on JSON-shaped inputs. If your source of truth is a
            database schema or a service contract, Schemato handles it directly.
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
            quicktype shines here; Schemato today only takes one sample.
          </p>
          <p>
            <strong className="text-text">You live in your terminal.</strong>{" "}
            quicktype&apos;s CLI is mature; Schemato&apos;s CLI is on the
            roadmap, not shipped.
          </p>
          <p>
            <strong className="text-text">You need an exotic output language.</strong>{" "}
            quicktype targets 20+ languages including Elm, Crystal, Haskell.
            Schemato sticks to the 15 most-used ones for now.
          </p>
        </div>
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
    </div>
  );
}
