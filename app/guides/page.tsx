import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Guides — practical walkthroughs for typed schemas",
  description:
    "Step-by-step guides on converting JSON, JSON Schema, and OpenAPI into Zod, Pydantic, Go, Rust and other typed languages.",
  alternates: { canonical: `${SITE.url}/guides` },
  openGraph: {
    title: `Guides · ${SITE.name}`,
    description: "Step-by-step walkthroughs for schema conversion workflows.",
    url: `${SITE.url}/guides`,
    type: "website",
  },
};

interface Guide {
  href: string;
  title: string;
  blurb: string;
  status: "published" | "soon";
}

const GUIDES: Guide[] = [
  {
    href: "/guides/multiple-json-samples-to-typescript",
    title: "Infer optional fields from multiple JSON samples",
    blurb:
      "Paste NDJSON API responses and generate safer TypeScript, Zod, Go, or Pydantic output.",
    status: "published",
  },
  {
    href: "/guides/json-to-typescript",
    title: "How to convert JSON to TypeScript types",
    blurb:
      "Turn a real API response into TypeScript interfaces, then decide when runtime validation should come next.",
    status: "published",
  },
  {
    href: "/guides/json-to-zod",
    title: "How to convert JSON to a Zod schema",
    blurb:
      "From a raw JSON sample to a validated, typed schema you can reuse in fetch, forms, and tRPC.",
    status: "published",
  },
  {
    href: "/guides/zod-validation",
    title: "Zod validation for API responses, forms, and env vars",
    blurb:
      "A broader validation workflow for parse, safeParse, generated schemas, and runtime boundaries.",
    status: "published",
  },
  {
    href: "/guides/json-to-go-struct",
    title: "How to convert JSON to a Go struct",
    blurb:
      "Generate Go structs from JSON, then polish pointers, slices, time fields, and json tags.",
    status: "published",
  },
  {
    href: "/guides/json-schema-to-pydantic",
    title: "How to turn JSON Schema into Pydantic models",
    blurb: "Walking $ref, required, oneOf, and getting clean FastAPI models.",
    status: "published",
  },
  {
    href: "/guides/openapi-to-typescript",
    title: "Convert an OpenAPI spec into TypeScript types (without a generator)",
    blurb: "Why you might not need openapi-typescript or orval for small projects.",
    status: "published",
  },
  {
    href: "/guides/sql-to-go-struct",
    title: "From CREATE TABLE to a Go struct that scans rows",
    blurb: "Pair with database/sql and sqlx for type-safe row scanning.",
    status: "published",
  },
];

const SHORTCUTS = [
  {
    href: "/json-to-zod",
    title: "JSON -> Zod",
    blurb: "Generate a first validation schema from a real payload.",
  },
  {
    href: "/json-schema-to-zod",
    title: "JSON Schema -> Zod",
    blurb: "Move an existing schema contract into Zod validation.",
  },
  {
    href: "/json-schema-to-typescript",
    title: "JSON Schema -> TypeScript",
    blurb: "Turn a schema into TypeScript types for app code.",
  },
  {
    href: "/typescript-to-zod",
    title: "TypeScript -> Zod",
    blurb: "Start from interfaces when your app already has types.",
  },
  {
    href: "/openapi-to-pydantic",
    title: "OpenAPI -> Pydantic",
    blurb: "Extract Python models from API specs for FastAPI workflows.",
  },
  {
    href: "/openapi-to-typescript",
    title: "OpenAPI -> TypeScript",
    blurb: "Get types from a spec without setting up a full client generator.",
  },
];

export default function GuidesIndex() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <p className="text-dim text-sm uppercase tracking-widest">Guides</p>
      <h1 className="text-4xl font-bold tracking-tight mt-1">Practical walkthroughs</h1>
      <p className="text-dim mt-3 text-lg leading-relaxed">
        Long-form, copy-paste-friendly guides on converting between schemas. Each
        guide pairs a real-world workflow with the matching tool on this site.
      </p>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-dim text-sm uppercase tracking-widest">Popular paths</p>
            <h2 className="text-2xl font-bold mt-1">Jump straight to a converter</h2>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHORTCUTS.map((s) => (
            <a key={s.href} href={s.href} className="card p-4 block hover:border-accent transition">
              <div className="font-semibold">{s.title}</div>
              <p className="text-dim text-sm mt-1 leading-relaxed">{s.blurb}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-10 space-y-4">
        {GUIDES.map((g, i) => {
          const isPublished = g.status === "published";
          const Wrapper = isPublished ? "a" : "div";
          return (
            <Wrapper
              key={i}
              {...(isPublished ? { href: g.href } : {})}
              className={`card p-5 block ${
                isPublished ? "hover:border-accent transition" : "opacity-60"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold">{g.title}</h2>
                {!isPublished && <span className="pill">Soon</span>}
              </div>
              <p className="text-dim mt-2 leading-relaxed">{g.blurb}</p>
              {isPublished && (
                <span className="text-accent text-sm mt-3 inline-block">Read →</span>
              )}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
