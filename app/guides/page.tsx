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
    href: "/guides/json-to-zod",
    title: "How to convert JSON to a Zod schema",
    blurb:
      "From a raw JSON sample to a validated, typed schema you can reuse in fetch, forms, and tRPC.",
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
    status: "soon",
  },
  {
    href: "/guides/sql-to-go-struct",
    title: "From CREATE TABLE to a Go struct that scans rows",
    blurb: "Pair with database/sql and sqlx for type-safe row scanning.",
    status: "soon",
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
