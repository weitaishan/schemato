---
title: How I built a 150-page programmatic SEO site with Next.js static export and zero AI content
published: false
description: A practical write-up on building a developer tool site that ships ~150 pages, each with a real working tool, using Next.js static export. No backend, no API costs, no AI-generated filler.
tags: nextjs, typescript, seo, opensource
canonical_url:
cover_image:
---

> Disclosure: I built this site myself — it's open source. I'll link it once, at the end. The write-up is the focus, not the link.

## The problem

I work across TypeScript, Go, and Python, and at least once a week I do this dance:

1. Copy a JSON response from the network tab.
2. Stare at it.
3. Hand-write a TypeScript interface, a Zod schema, and a Pydantic model that all describe the same thing.
4. Get the optionality slightly wrong somewhere.
5. Find out at runtime.

Tools like quicktype solve part of this, but only for a few output languages, and they often want you to install something. I wanted a single web page per conversion — JSON to Zod, JSON Schema to Pydantic, GraphQL to TypeScript — and I wanted Google to send me users who are searching for exactly that.

That's a programmatic SEO site, the kind people built by the thousand in 2022. The 2026 version of the playbook is interesting because:

- AI content is now actively penalized in Google's ranking, not just ignored.
- Static export + edge CDNs make hosting effectively free at this size.
- LLMs make writing the per-page conversion logic far cheaper than it used to be.

Below is the architecture I landed on. The whole thing is ~3,000 LOC, deploys in 30 seconds on Vercel free tier, and ships ~150 distinct, statically generated pages.

## The matrix

The site is built around a 10×15 matrix:

```
INPUT FORMATS (rows)        OUTPUT LANGUAGES (cols)
JSON                        TypeScript
JSON Schema                 Zod
OpenAPI 3.x                 Yup
GraphQL SDL                 Joi
SQL DDL                     Pydantic
Protobuf                    Python dataclass
Prisma schema               Go struct
TypeScript (reverse)        Rust struct
Mongoose schema             Swift Codable
Avro                        Kotlin data class
                            Java record
                            C# record
                            Dart class
                            PHP class
                            Ruby class
```

Every cell becomes one URL: `/<input>-to-<output>`. That's 149 unique pages (we skip `typescript→typescript`).

The interesting design constraint is: **don't write 149 adapters by hand**. Otherwise the project never finishes.

## The architecture

The core idea is a two-step pipeline:

```
input string ──► parser ──► internal Shape ──► renderer ──► output code
                  ↑                              ↑
            one per format               one per language
```

So instead of writing 149 functions, we write 10 parsers and 15 renderers. That's 25 small modules instead of 149.

The internal `Shape` type is the contract:

```ts
export type ShapeKind =
  | "string" | "integer" | "number" | "boolean" | "null" | "any"
  | "object" | "array" | "union";

export interface Shape {
  kind: ShapeKind;
  fields?: Record<string, { shape: Shape; optional: boolean }>;
  items?: Shape;
  variants?: Shape[];
  typeName?: string; // for nominal object types
}
```

Every parser produces a `Shape`. Every renderer consumes a `Shape`. The parser doesn't know about TypeScript; the renderer doesn't know about JSON.

### A minimal parser

Here's roughly what `jsonToShape` looks like:

```ts
export function inferShape(value: unknown, name = "Root"): Shape {
  if (value === null) return { kind: "null" };
  if (typeof value === "string") return { kind: "string" };
  if (typeof value === "boolean") return { kind: "boolean" };
  if (typeof value === "number") {
    return { kind: Number.isInteger(value) ? "integer" : "number" };
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: "array", items: { kind: "any" } };
    let item = inferShape(value[0]);
    for (let i = 1; i < value.length; i++) {
      item = mergeShape(item, inferShape(value[i]));
    }
    return { kind: "array", items: item };
  }
  // object
  const fields: Record<string, { shape: Shape; optional: boolean }> = {};
  for (const [k, v] of Object.entries(value as object)) {
    fields[k] = { shape: inferShape(v), optional: v === null };
  }
  return { kind: "object", fields, typeName: pascalCase(name) };
}
```

That's it for JSON. Other formats (JSON Schema, OpenAPI, GraphQL, SQL DDL, Protobuf, Prisma, Mongoose, Avro) all produce the same `Shape`, so the cost of supporting a new format is roughly one file.

### A minimal renderer

A renderer is even smaller. Here's the Zod renderer in 30 lines:

```ts
function zodExpr(shape: Shape, refMap: Map<string, string>): string {
  switch (shape.kind) {
    case "string":  return "z.string()";
    case "integer": return "z.number().int()";
    case "number":  return "z.number()";
    case "boolean": return "z.boolean()";
    case "null":    return "z.null()";
    case "any":     return "z.unknown()";
    case "array":
      return `z.array(${zodExpr(shape.items ?? { kind: "any" }, refMap)})`;
    case "union": {
      const parts = (shape.variants ?? []).map((v) => zodExpr(v, refMap));
      return parts.length >= 2 ? `z.union([${parts.join(", ")}])` : parts[0];
    }
    case "object":
      return refMap.get(shape.typeName ?? "") ?? "z.record(z.unknown())";
  }
}
```

The wrapper that produces a full file from a `Shape` is another ~30 lines. Total: 60 lines per output language. Multiply by 15 = ~900 lines for all renderers combined.

## How Next.js generates ~150 pages from this

This is where Next.js App Router shines. One dynamic route file:

```ts
// app/[slug]/page.tsx
export async function generateStaticParams() {
  return allConversions().map((c) => ({
    slug: `${FORMATS[c.from].slug}-to-${FORMATS[c.to].slug}`,
  }));
}

export const dynamicParams = false;
```

With `output: "export"` in `next.config.ts`, every cell becomes a real `.html` file in `out/`. Build takes ~10 seconds for 155 pages on my laptop. Deploy is just `vercel deploy` (or `wrangler pages publish`, or `git push`).

No serverless functions. No API routes. No database. No edge runtime. Just static HTML and a small client bundle that runs the converter on demand.

## What about SEO?

The hardest part is not writing the code. It's making 150 pages that are each genuinely useful, not boilerplate.

A few rules I followed:

**1. Each page must do something real.** No "coming soon" placeholders. If the conversion isn't implemented yet, show the static expected output as a preview, not a stub.

**2. Each page gets its own intro paragraph that talks about a specific use case.**

A generic intro reads:

> "This tool converts JSON to TypeScript types. Paste your JSON and get types..."

A specific intro reads:

> "Most front-end engineers reach for this conversion when integrating a third-party API and the docs don't ship type definitions. Paste a real response and you get an interface that exactly matches the data on the wire — no Postman copy-paste, no manual typing, no drift."

The second one mentions a real workflow, a real pain, and gives Google something to match against long-tail searches. I wrote 30 such intros for the most-searched pairs by hand. The rest fall back to a sensible template, which is fine — Google ranks pages, not sites, so the manually-written ones will pull weight.

**3. Each page has a small `HowTo` JSON-LD.**

`SoftwareApplication` and `WebApplication` schema types both require `aggregateRating` for full rich results, and faking ratings is a fast way to get a manual penalty. `HowTo` doesn't, and it's a more accurate description anyway:

```ts
const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: `How to convert ${from.name} to ${to.name}`,
  step: seoCopy.howSteps.map((text, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    text,
  })),
};
```

The `FAQPage` schema is also worth adding — Google's rich results sometimes show FAQ questions inline.

**4. Sitemap with priority that reflects reality.**

Live (working) pages get `priority: 0.8`. Preview-only pages get `priority: 0.4`. Google has limited crawl budget; this tells it where to spend it.

```ts
return [
  { url: `${SITE.url}/`, priority: 1.0 },
  ...allConversions().map((c) => ({
    url: `${SITE.url}${pathFor(c.from, c.to)}`,
    priority: hasConverter(c.from, c.to) ? 0.8 : 0.4,
    changeFrequency: "weekly",
  })),
];
```

**5. Multiple per-page samples.**

Each input format has 3–5 real-world samples (User profile, e-commerce order, Stripe-like charge, etc.) that the user can switch between with a single click. This serves three purposes: it makes the tool actually useful, it adds unique structured content to each page, and it increases time-on-page (a real-world signal Google uses).

## What I'd skip if I were doing it again

A few things turned out to not matter:

- **Pretty 404s.** Nobody hits them.
- **Custom OG image generator.** A static SVG works fine and is one fewer thing that can break in static export mode. (`next/og` can't run in static export anyway — found that out the slow way.)
- **A blog at first.** Get 50 useful pages live before you write your first blog post about the tool.

A few things I underestimated:

- **The matter of formal content uniqueness.** "Same template, different variables" is exactly what Google's spam filter is tuned to catch. Manual intro writing for the head pages was unavoidable.
- **The cost of getting `output: export` to work cleanly.** A few APIs don't work in fully static mode (`opengraph-image.tsx`, ISR, middleware). Find out early.
- **Picking input formats that share infrastructure.** JSON Schema, OpenAPI, and Avro all share enough structure that a single Shape inferrer covers all three. Picking them together was lucky; in retrospect I'd plan that explicitly.

## Numbers

- 149 unique pages, all statically generated
- 10 input parsers, 15 output renderers, ~3000 LOC total
- Build: ~10s on a laptop
- Deploy: Vercel free tier, no functions
- Bundle size: 100kB JS shared, ~1kB per page
- Cost: $0/month (excluding domain)

## The site

It's live at <https://www.schemato.top>. The code is at <https://github.com/weitaishan/schemato> if you want to grab the parser/renderer split for your own thing.

Most useful for me personally: paste a JSON response from a third-party API → get a Zod schema I can drop into a tRPC handler. Saves me about 5 minutes per integration. That's basically the whole product.

If you've shipped something similar — particularly the SEO side — I'd love to hear what worked and what didn't. The 30 / 60 / 90 day inflection points seem to vary a lot by niche.
