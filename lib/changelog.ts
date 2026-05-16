// 项目 Changelog 数据。手动维护（构建期使用），让 /changelog 页可以静态生成。
// 加新条目时，按最新日期插到 ENTRIES 顶部即可。

export interface ChangelogEntry {
  /** ISO 日期 yyyy-mm-dd */
  date: string;
  /** 一行标题 */
  title: string;
  /** 多条 bullet（支持简单 markdown 内联：`code` 和链接） */
  bullets: string[];
  /** 可选 tag */
  tags?: Array<"feat" | "fix" | "docs" | "perf" | "release" | "ux">;
}

export const ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-05-16",
    title: "Build in public — open changelog page",
    tags: ["docs"],
    bullets: [
      "Published this changelog page so anyone can see what shipped, when, and what's next.",
      "Drafted two technical articles (EN + ZH) about the parser × renderer architecture.",
    ],
  },
  {
    date: "2026-05-15",
    title: "100% live coverage — 149/149 converters",
    tags: ["release", "feat"],
    bullets: [
      "Added Mongoose schema input with 15 outputs.",
      "Added Avro (.avsc) input with 15 outputs (records, enums, unions, nested records).",
      "Every cell of the 10×15 matrix now has a real working converter.",
    ],
  },
  {
    date: "2026-05-15",
    title: "Per-input sample tabs and scenario-specific copy",
    tags: ["ux", "feat"],
    bullets: [
      "3-5 real-world samples per input format (User profile, e-commerce order, GitHub issue, Stripe charge, multi-table SQL, etc).",
      "Hand-wrote 30+ scenario-specific intros for the most-searched conversion pairs (e.g. `json→pydantic` for FastAPI, `sql→rust-struct` for sqlx).",
      "Pitfalls section now varies by target language (zod nullable handling, Go zero values, Pydantic strict mode).",
    ],
  },
  {
    date: "2026-05-15",
    title: "OpenAPI input + homepage search",
    tags: ["feat", "ux"],
    bullets: [
      "Added OpenAPI 3.x input — supports both JSON and YAML formats (with a custom lightweight YAML parser, no external deps).",
      "Homepage now has a live search box and All / Live filter tabs.",
    ],
  },
  {
    date: "2026-05-15",
    title: "TypeScript / Protobuf / Prisma inputs",
    tags: ["feat"],
    bullets: [
      "Added reverse TypeScript input (interface and type alias).",
      "Added Protobuf input (proto3 messages, `repeated`, `optional` keyword).",
      "Added Prisma schema input (model blocks, relations, optional `?` and list `[]` modifiers).",
    ],
  },
  {
    date: "2026-05-15",
    title: "SQL DDL input and aggregateRating fix",
    tags: ["feat", "fix"],
    bullets: [
      "Added SQL DDL input — supports CREATE TABLE for Postgres / MySQL / SQLite shared subset.",
      "Switched JSON-LD from `SoftwareApplication` to `HowTo` to avoid Google's `aggregateRating` warning without faking ratings.",
    ],
  },
  {
    date: "2026-05-15",
    title: "GraphQL input and parser × renderer architecture",
    tags: ["feat", "perf"],
    bullets: [
      "Refactored conversion pipeline into 10 parsers and 15 renderers, bridged by a single internal `Shape` type.",
      "Added GraphQL SDL input — type / input / interface declarations, non-null and list modifiers.",
      "Live converters jumped from 14 to 45 with this change alone.",
    ],
  },
  {
    date: "2026-05-15",
    title: "JSON Schema input — 15 outputs",
    tags: ["feat"],
    bullets: [
      "Walks $ref, oneOf, anyOf, allOf into the internal Shape.",
      "Required fields, $defs, and nullable types preserved across outputs.",
    ],
  },
  {
    date: "2026-05-15",
    title: "SEO foundations",
    tags: ["feat"],
    bullets: [
      "Favicon (SVG) and Apple touch icon set up via `app/icon.svg`.",
      "Static OG image at `/og.svg` (1200×630, brand gradient).",
      "Per-page JSON-LD: `HowTo`, `FAQPage`, `BreadcrumbList`.",
      "Sitemap.xml priority differentiated by Live vs Preview pages.",
    ],
  },
  {
    date: "2026-05-15",
    title: "All 14 JSON adapters live",
    tags: ["feat"],
    bullets: [
      "JSON → TypeScript / Zod / Yup / Joi / Pydantic / Python dataclass / Go / Rust / Swift / Kotlin / Java / C# / Dart / PHP / Ruby.",
    ],
  },
  {
    date: "2026-05-15",
    title: "Schemato is live",
    tags: ["release"],
    bullets: [
      "Domain `schemato.top` registered and pointed to Vercel.",
      "First 3 conversions shipped live (JSON to TypeScript / Zod / Pydantic).",
      "Google Search Console verified, sitemap submitted.",
      "Repository public on GitHub: <https://github.com/weitaishan/schemato>.",
    ],
  },
];

/** 当前正在做的事 / 路线图 */
export const ROADMAP: Array<{ status: "shipped" | "doing" | "next" | "later"; text: string }> = [
  { status: "shipped", text: "All 10 input formats live (JSON, JSON Schema, OpenAPI, GraphQL, SQL, Protobuf, Prisma, TypeScript, Mongoose, Avro)" },
  { status: "shipped", text: "All 15 output languages live (TS, Zod, Yup, Joi, Pydantic, dataclass, Go, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby)" },
  { status: "shipped", text: "Per-input multi-sample tabs" },
  { status: "shipped", text: "Scenario-specific SEO copy for the most-searched 30+ pairs" },
  { status: "doing", text: "Awesome-list submissions for high-quality backlinks" },
  { status: "doing", text: "Watching Google Search Console for the first impressions to roll in" },
  { status: "next", text: "Discriminated unions for `oneOf` JSON Schema" },
  { status: "next", text: "Multi-sample inference: paste several JSON shapes, get a unified type" },
  { status: "next", text: "Copy-as-curl button for API testing flows" },
  { status: "later", text: "CLI: `npx schemato json-to-zod < schema.json`" },
  { status: "later", text: "VS Code extension: select JSON, run `Convert to Zod`" },
];
