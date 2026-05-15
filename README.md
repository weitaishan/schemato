# Schemato

> Convert any schema to any code. Free, browser-only, open source.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000?logo=nextdotjs)](https://nextjs.org/)

**Live**: <https://www.schemato.top>

Schemato turns a JSON / JSON Schema / GraphQL SDL sample into typed code for **15 target languages** — TypeScript, Zod, Pydantic, Go, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby, Yup, Joi, Python dataclass.

Conversion runs **100% in your browser**. No data is uploaded. No signup. No API costs.

---

## Why?

I work across TypeScript, Go, and Python and got tired of:

- Writing types by hand for every new API response
- Tools that only support one or two output languages
- Tools that require installing something or paying a subscription
- Existing options that don't cover Zod, Pydantic, or modern serde-friendly Rust

Schemato fills the gap. One page per conversion, ~150 statically generated pages, zero backend.

---

## Features

- **3 input formats** with full coverage (JSON, JSON Schema, GraphQL SDL)
- **15 output languages**, each with sensible defaults (json tags for Go, serde derives for Rust, Codable for Swift, etc.)
- **45 Live converters** today, ~150 pages total (the rest show preview output)
- Static export — every conversion has its own URL, indexed by Google
- No tracking, no ads in the conversion UI, no signup

---

## Tech stack

```
Next.js 16 (App Router) + TypeScript + TailwindCSS
output: "export" → fully static, deploys anywhere
Custom JSON-shape inferrer (~150 LOC, no quicktype dependency)
Per-language renderer (~30-80 LOC each)
```

---

## Project layout

```
app/
  layout.tsx              # global header/footer
  page.tsx                # homepage with the matrix
  [slug]/page.tsx         # dynamic route /<from-slug>-to-<to-slug>
  sitemap.ts              # sitemap.xml generator
  robots.ts
components/
  ConverterShell.tsx      # left input / right output UI (client)
lib/
  formats.ts              # 24 format registry (slug, sample, blurb)
  url.ts
  site.ts
  seo-copy.ts             # per-pair SEO copy generator
  converters/
    index.ts              # registry + bridge (parser → renderer)
    json-shape.ts         # internal Shape type + JSON inferrer
    jsonschema-shape.ts   # JSON Schema → Shape
    graphql-shape.ts      # GraphQL SDL → Shape
    renderers.ts          # all 15 language renderers (Shape → code)
    json-to-*.ts          # custom JSON adapters (one per language)
```

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # generates ~150 static HTML pages in out/
```

---

## How to add a new input format

1. Create `lib/converters/<name>-shape.ts` exporting:

   ```ts
   export function nameToShape(input: string, rootName?: string):
     | { ok: true; shape: Shape }
     | { ok: false; error: string }
   ```

2. In `lib/converters/index.ts`:

   ```ts
   import { nameToShape } from "./name-shape";
   for (const t of ALL_TARGETS) {
     register("name", t, bridge(nameToShape, t));
   }
   ```

3. Make sure `lib/formats.ts` has the format registered with a slug + sample.

That's it — 15 new pages light up automatically.

---

## How to add a new output language

1. Open `lib/converters/renderers.ts`
2. Add `function fooType(shape: Shape): string` and `export const renderFoo: Renderer = (root, rootName) => { ... }`
3. Register it in `RENDERERS`:

   ```ts
   export const RENDERERS = {
     ...,
     foo: renderFoo,
   };
   ```

4. Add `foo` to `OUTPUT_FORMATS` in `lib/formats.ts` with a slug + sample.

All input formats now produce the new output for free.

---

## Roadmap

- [x] JSON input → 15 outputs
- [x] JSON Schema input → 15 outputs
- [x] GraphQL SDL input → 15 outputs
- [ ] SQL DDL input (Postgres / MySQL / SQLite)
- [ ] Protobuf input
- [ ] Prisma schema input
- [ ] OpenAPI 3.x input
- [ ] Mongoose schema input
- [ ] Avro input
- [ ] Discriminated union output for `oneOf` JSON Schema
- [ ] CLI version (`npx schemato json-to-zod < schema.json`)
- [ ] VS Code extension

---

## Contributing

PRs welcome. The project is small and the architecture rewards adding one renderer / parser at a time:

- Want Elixir / Scala / Haskell as an output language? Add a renderer.
- Want OpenAPI / Avro / Prisma as input? Add a parser.

Each adapter is independent; nothing else needs to change.

---

## License

MIT
