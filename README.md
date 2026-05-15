# Schemato

A free, browser-only schema → code converter — designed as a programmatic SEO site (10 inputs × 15 outputs = ~150 pages, zero API cost).

## Stack

- Next.js 15 (App Router) with `output: "export"` for fully static deploy
- TypeScript + TailwindCSS 3
- Zero backend, all conversion happens client-side

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Build static site for hosting

```bash
npm run build
```

This generates the `out/` directory containing every conversion page (~150). Deploy to Vercel / Cloudflare Pages / Netlify / GitHub Pages.

## Project layout

```
app/
  layout.tsx          # global header/footer
  page.tsx            # homepage with the full converter matrix
  [slug]/page.tsx     # dynamic route /<from-slug>-to-<to-slug>, statically generated
  sitemap.ts          # sitemap.xml (auto-generated)
  robots.ts           # robots.txt
components/
  ConverterShell.tsx  # left input / right output UI (client component)
lib/
  formats.ts          # format registry (slugs, samples, blurbs)
  url.ts              # url helpers
  site.ts             # site name / canonical url
  seo-copy.ts         # per-pair SEO copy generator (intro / why / steps / pitfalls / FAQ)
  converters/
    index.ts          # registry: register(from, to, fn)
    json-shape.ts     # JSON → internal Shape inferrer
    json-to-typescript.ts
    json-to-zod.ts
    json-to-pydantic.ts
```

## How to add a new converter

1. Create `lib/converters/<from>-to-<to>.ts` exporting a `ConvertFn`.
2. `register("<from>", "<to>", yourFn)` inside `lib/converters/index.ts`.
3. Done — page already exists at `/<from-slug>-to-<to-slug>` and the home matrix flips it from “Preview” to “Live”.

## Deploy

### Vercel (one click)

- Push this folder to GitHub and import into Vercel. No env vars required.

### Cloudflare Pages

- Build command: `npm run build`
- Output directory: `out`

### GitHub Pages

- Run `npm run build`
- Push `out/` to a `gh-pages` branch (or use an action).

## Roadmap

- [x] Homepage matrix
- [x] 150 statically-generated pages with SEO copy
- [x] sitemap.xml + robots.txt
- [x] JSON → TypeScript / Zod / Pydantic (live)
- [ ] OpenAPI / GraphQL / SQL DDL inputs
- [ ] Carbon Ads slot
- [ ] Affiliate slots (Sentry / Vercel / Supabase)
- [ ] Search Console verification meta tag
