# Schemato

> Convert schemas and sample payloads into typed code. Free, browser-only, open source.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000?logo=nextdotjs)](https://nextjs.org/)

**Live**: <https://www.schemato.top>

Schemato turns **10 input formats** into typed code for **15 target languages**.

Inputs: JSON, JSON Schema, OpenAPI 3.x, GraphQL SDL, SQL DDL, Protobuf, Prisma, Mongoose, Avro, and TypeScript interfaces.

Outputs: TypeScript, Zod, Pydantic, Go, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby, Yup, Joi, and Python dataclass.

Conversion runs **100% in your browser**. No data is uploaded. No signup. No API costs.

---

## Why?

I work across TypeScript, Go, and Python and got tired of:

- Writing types by hand for every new API response
- Tools that only support one or two output languages
- Tools that require installing something or paying a subscription
- Existing options that don't cover Zod, Pydantic, or modern serde-friendly Rust

Schemato fills the gap. One page per conversion, 149 statically generated converter pages, zero backend.

---

## Features

- **10 input formats** with full coverage (JSON, JSON Schema, OpenAPI, GraphQL SDL, SQL DDL, Protobuf, Prisma, Mongoose, Avro, TypeScript)
- **15 output languages**, each with sensible defaults (json tags for Go, serde derives for Rust, Codable for Swift, etc.)
- **149 live converters** today
- Static export — every conversion has its own URL, indexed by Google
- No signup, no server-side conversion, no uploaded payloads

---

## Tech stack

```
Next.js 16 (App Router) + TypeScript + TailwindCSS
output: "export" → fully static, deploys anywhere
Custom JSON-shape inferrer (~150 LOC, no quicktype dependency)
Input parsers → shared Shape model → per-language renderers
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
    *-shape.ts            # input parsers → Shape
    renderers.ts          # all 15 language renderers (Shape → code)
    json-to-*.ts          # custom JSON adapters (one per language)
```

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # generates the static export in out/
```

## Privacy

Conversions run in the browser. Schemato does not upload pasted schemas or payloads to a conversion API.

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
- [x] OpenAPI 3.x input → 15 outputs
- [x] GraphQL SDL input → 15 outputs
- [x] SQL DDL input → 15 outputs
- [x] Protobuf input → 15 outputs
- [x] Prisma schema input → 15 outputs
- [x] Mongoose schema input → 15 outputs
- [x] Avro input → 15 outputs
- [x] TypeScript input → 14 outputs
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
