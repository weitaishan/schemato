// 为每个 (from, to) 对生成"看起来像人写的"SEO 文案。
// 不接 LLM API（节省成本 + 构建期可重复），用结构化模板 + 任务相关的真实信息组合。
// 后期可以替换为 Claude API 批量生成更"独特"的文案。

import { format, type FormatId } from "./formats";

interface SeoCopy {
  title: string;
  description: string;
  h1: string;
  subhead: string;
  intro: string;
  whyBullets: string[];
  howSteps: string[];
  pitfalls: string[];
  faq: Array<{ q: string; a: string }>;
}

// 一些"为什么要转换"的语境片段。按 to 类型分桶，让文案有差异
const WHY_BY_TARGET: Partial<Record<FormatId, string[]>> = {
  zod: [
    "Validate API responses at the boundary so bad data never reaches your business logic.",
    "Get TypeScript types and runtime checks from a single source of truth.",
    "Catch shape regressions in CI by running schemas against fixtures.",
  ],
  typescript: [
    "Stop writing types by hand — derive them from real payloads to avoid drift.",
    "Document API shapes in a way the IDE can actually use.",
    "Ship safer client code that breaks at compile time when contracts change.",
  ],
  pydantic: [
    "Get parsing, validation, and serialization in one Python class.",
    "Power FastAPI request/response models with zero extra boilerplate.",
    "Replace ad-hoc dict access with typed attributes that IDEs understand.",
  ],
  yup: [
    "Wire form validation directly to a typed schema.",
    "Reuse the same schema in React Hook Form, Formik, or plain handlers.",
    "Surface helpful field errors without hand-rolling logic.",
  ],
  joi: [
    "Validate Express / Hapi / Koa request bodies before they hit handlers.",
    "Centralize validation rules so endpoints stay consistent.",
    "Reject malformed payloads with structured error messages.",
  ],
  "python-dataclass": [
    "Use stdlib dataclasses to model structured data without extra deps.",
    "Get __init__ / __repr__ / __eq__ for free, in a few lines.",
    "Migrate from dicts to typed objects without buying into a framework.",
  ],
  "go-struct": [
    "Decode JSON straight into typed Go structs with json tags.",
    "Avoid map[string]interface{} chaos in handlers and pipelines.",
    "Make data shapes part of your codebase and your code review.",
  ],
  "rust-struct": [
    "Use serde to deserialize JSON into strongly-typed Rust structs.",
    "Catch field mismatches at compile time, not at production load.",
    "Generate the boilerplate so you can focus on business logic.",
  ],
  kotlin: [
    "Map JSON payloads to Kotlin data classes for Android or backend code.",
    "Pair with Moshi or kotlinx.serialization without writing models by hand.",
    "Lean on Kotlin null-safety from the very first parse.",
  ],
  swift: [
    "Generate Codable structs that decode JSON in one line.",
    "Skip the manual init(from:) ceremony for routine API shapes.",
    "Keep iOS networking code small and fully typed.",
  ],
  dart: [
    "Skip hand-written Flutter model classes for every payload.",
    "Use the generated constructor with named arguments and null safety.",
    "Plug into json_serializable or write toJson manually with confidence.",
  ],
  java: [
    "Use Java 16+ records to express immutable data shapes concisely.",
    "Bind JSON straight into records via Jackson or Gson.",
    "Drop hand-written getters/equals/hashCode boilerplate.",
  ],
  csharp: [
    "Generate C# records that play nicely with System.Text.Json.",
    "Express immutable DTOs without the Get/Set ritual.",
    "Use init-only properties to keep instances safe to share.",
  ],
  php: [
    "Use PHP 8 promoted properties to model payloads in a few lines.",
    "Move from associative arrays to typed objects without a heavy ORM.",
    "Plays well with Symfony Serializer and Laravel resources.",
  ],
  ruby: [
    "Get a starting Ruby class for API payloads instead of raw hashes.",
    "Pair with dry-struct or sorbet later if you want stricter checks.",
    "Useful for quickly modeling third-party JSON in Rails or scripts.",
  ],
};

// 基于具体 (from, to) 的"行业场景化"intro，覆盖最常见的对
const SCENARIO_INTROS: Record<string, string> = {
  "json->typescript":
    "Most front-end engineers reach for this conversion when integrating a third-party API and the docs don't ship type definitions. Paste a real response and you get an interface that exactly matches the data on the wire — no Postman copy-paste, no manual typing, no drift.",
  "json->zod":
    "Use this when you want runtime validation on top of your TypeScript types. Zod gives you both — one schema, one source of truth, used in your React Query select, your form parser, your tRPC handler, all at once.",
  "json->pydantic":
    "FastAPI users hit this every day: receive a JSON sample (from a webhook, a fixture, a partner API) and need a typed model. The result drops straight into a request_model parameter and you get OpenAPI docs for free.",
  "json->go-struct":
    "Go developers consuming HTTP APIs almost always start by sketching out a struct that matches the response. This converter does that step for you, including correct json tags, omitempty for optional fields, and pointer types where the field can be missing.",
  "json->rust-struct":
    "Rust + serde is gorgeous when the struct lines up with the JSON, miserable when it doesn't. Paste a sample to get serde-friendly structs with Option<T> for nullables and #[serde(rename)] when JSON keys aren't snake_case.",
  "json->swift":
    "iOS networking layers love Codable. Paste a JSON response from your backend or a third-party API and get a struct that decodes in one JSONDecoder call.",
  "json->kotlin":
    "Build the data classes for your Retrofit / Ktor / kotlinx.serialization layer in seconds. Generated classes use proper null-safety based on what's null in the sample.",
  "json->java":
    "Modern Java records make payload modeling almost as concise as Kotlin. Paste your JSON and get a record (Java 16+) that's immutable, thread-safe, and Jackson-friendly.",
  "json->csharp":
    "Generate immutable C# 9+ records that round-trip through System.Text.Json. Particularly useful for ASP.NET Core endpoints and integration code.",
  "json->dart":
    "Build Flutter model classes with named-argument constructors and `fromJson` factories. Saves a surprising amount of boilerplate over the lifetime of a real app.",

  "json-schema->typescript":
    "OpenAPI / JSON Schema documents already describe the shape — no need to retype it in TypeScript. This converter walks $ref, oneOf, allOf, and produces named interfaces that mirror your schema's structure.",
  "json-schema->zod":
    "When you have a JSON Schema for validation and a TypeScript codebase, Zod sits in the middle: same shape, runtime check, inferred type. This conversion gives you both with names and required fields preserved.",
  "json-schema->pydantic":
    "Translate JSON Schema documents (from a partner API spec, an event bus contract, or a config schema) directly into Pydantic v2 models. Required fields, optionals, and nested $defs are all respected.",

  "openapi->typescript":
    "Front-end teams consuming an OpenAPI-described backend get a head start without running an OpenAPI generator. Paste your `components.schemas` block (JSON or YAML) and get clean TypeScript interfaces.",
  "openapi->zod":
    "Pair runtime validation with your OpenAPI contract. Useful for catching backend changes before they crash the front-end.",
  "openapi->pydantic":
    "Mirror an upstream OpenAPI service in your Python client without depending on the original codebase. Particularly handy for B2B integrations.",
  "openapi->go-struct":
    "Generate Go DTOs for an OpenAPI service when you don't want to pull in heavy code generators. Fast, focused, and produces idiomatic structs.",

  "graphql->typescript":
    "Convert your GraphQL SDL types directly into TypeScript interfaces — useful for code that operates on shapes from your schema without going through a GraphQL client like Apollo or urql.",
  "graphql->zod":
    "Validate GraphQL response payloads at runtime, especially for federated services where breaking changes can sneak in.",
  "graphql->pydantic":
    "Use a Python service to consume a GraphQL API while keeping types aligned with the SDL.",

  "sql->typescript":
    "Drop a Postgres / MySQL / SQLite CREATE TABLE and get a TypeScript interface that mirrors each column. Particularly useful for raw query layers like postgres.js or libsql/Turso.",
  "sql->go-struct":
    "Convert table DDL into Go structs with json tags so you can scan rows and serialize results without writing the model twice.",
  "sql->pydantic":
    "Useful when working with raw SQL in FastAPI / SQLAlchemy core code where you want a typed return shape per query.",
  "sql->rust-struct":
    "Generate sqlx-friendly Rust structs from your DDL. Combine with sqlx::query_as!() for end-to-end type safety.",

  "protobuf->typescript":
    "Many teams use Protobuf for backend RPC and TypeScript for the front-end. This converter helps when you need a quick TS shape for a proto without pulling in protoc / ts-proto.",
  "protobuf->go-struct":
    "Lightweight alternative to protoc-gen-go for the cases where you just need a struct, not gRPC scaffolding.",
  "protobuf->rust-struct":
    "Quick prototyping path before you wire up prost or tonic.",

  "prisma->typescript":
    "Prisma already generates types — this is for cases where you want a public TypeScript interface separate from PrismaClient (e.g., a shared SDK package).",
  "prisma->zod":
    "Pair runtime validation with your Prisma model. Especially useful when accepting external input that should round-trip through your DB layer.",
  "prisma->pydantic":
    "Useful in mixed stacks where the Node service writes via Prisma and a Python service reads — keeps shapes in sync.",

  "typescript->go-struct":
    "Have an existing TypeScript interface and need a Go service to consume the same shape? This conversion preserves field names with json tags so the wire format matches.",
  "typescript->rust-struct":
    "Migrate parts of a TypeScript codebase to Rust without redesigning your data model.",
  "typescript->pydantic":
    "Polyglot teams: keep front-end interfaces and back-end Python models aligned without hand-translating fields.",

  "mongoose->typescript":
    "Skip the dance of declaring a TypeScript interface that mirrors your Mongoose schema. Paste the schema literal and get a clean type back.",
  "mongoose->zod":
    "Validate API request bodies that target the same shape as a stored document, without coupling to mongoose at the validation layer.",

  "avro->typescript":
    "Common in Kafka pipelines: an Avro schema describes the topic, and downstream services in TypeScript need a typed representation.",
  "avro->pydantic":
    "Useful for Python data engineers who consume Avro topics and want typed models inside their pipeline.",
};

const PITFALLS_BY_TARGET: Partial<Record<FormatId, string[]>> = {
  zod: [
    "Inferred types reflect only the sample you paste. Real APIs may return null in fields that look non-null in your sample — widen with `.nullable()` if in doubt.",
    "If your input has fields that are sometimes integers, sometimes floats, the inferred type will widen to `z.number()`. Add `.int()` back where you know the contract.",
    "Empty arrays default to `z.array(z.unknown())`. Provide a non-empty sample to get a meaningful element type.",
  ],
  pydantic: [
    "Pydantic is strict about types by default. If your real data sometimes contains unexpected fields, you may want to set `model_config = ConfigDict(extra='ignore')`.",
    "Optional fields get `Optional[X] = None` only when the sample shows null. Real-world APIs often have more optional fields than a single sample reveals.",
    "Datetime strings stay as `str` — switch to `datetime` if you want Pydantic to parse them.",
  ],
  "go-struct": [
    "Go's zero values mean the difference between 'absent' and 'present-but-zero' is invisible. Use pointer types (already done for optional fields here) only where you actually need to distinguish.",
    "If a JSON number can be very large, you may need `int64` instead of `int` — adjust manually based on your domain.",
    "JSON keys with dashes or special characters are exposed via the json tag, but the Go field name is PascalCase — review case sensitivity if you re-marshal.",
  ],
};

const PITFALLS_DEFAULT = [
  "Inferred types only see the payload you pasted. Add nullable / optional flags for fields that can be missing.",
  "Numeric types are inferred as integer or float based on the sample. Real APIs sometimes return both — widen to a number/float type when in doubt.",
  "Empty arrays default to an `unknown` element type. Paste a non-empty sample to get a meaningful element type.",
];

function pairKey(from: FormatId, to: FormatId) {
  return `${from}->${to}`;
}

function titleCase(s: string) {
  return s
    .split(/[\s-]+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function buildSeoCopy(from: FormatId, to: FormatId): SeoCopy {
  const f = format(from);
  const t = format(to);
  const pair = `${f.name} to ${t.name}`;
  const key = pairKey(from, to);

  const why = WHY_BY_TARGET[to] ?? [
    `Save time by deriving ${t.name} from a real ${f.name} sample instead of writing types by hand.`,
    `Keep client and server in sync by sharing the same source of truth.`,
    `Make schema drift visible during code review.`,
  ];

  const pitfalls = PITFALLS_BY_TARGET[to] ?? PITFALLS_DEFAULT;

  // 默认 intro
  const defaultIntro = `This free tool converts ${f.name} into ${t.name}. ${f.blurb} ${t.blurb} The conversion runs entirely client-side: nothing is uploaded, nothing is logged. Useful when you want to skip writing types by hand for an API response, a database row, or a config payload.`;
  const intro = SCENARIO_INTROS[key] ?? defaultIntro;

  return {
    title: `${pair} Converter — Free, Browser-only`,
    description: `Convert ${f.name} to ${t.name} in your browser. Paste a ${f.name} sample, get clean ${t.name} code with field types preserved. Free, no signup, open source.`,
    h1: `${pair} Converter`,
    subhead: `Paste a ${f.name} sample, get production-ready ${t.name} code. Runs entirely in your browser.`,
    intro,
    whyBullets: why,
    howSteps: [
      `Paste your ${f.name} on the left panel, or pick one of the sample tabs above.`,
      `The converter infers field names, optionality, and types automatically.`,
      `Copy the generated ${t.name} on the right and drop it straight into your codebase.`,
    ],
    pitfalls,
    faq: [
      {
        q: `Is this ${pair.toLowerCase()} converter free?`,
        a: `Yes. It is fully free, no signup, and runs entirely in your browser. We do not store your input.`,
      },
      {
        q: `Does it work with nested objects and arrays?`,
        a: `Yes. Nested objects produce separate named types, and arrays infer the element type from the first non-null sample.`,
      },
      {
        q: `What about optional / nullable fields?`,
        a: `Fields whose value is null in the sample (or marked optional in JSON Schema / Prisma / GraphQL) are marked optional/nullable in the output. For real APIs, you may want to widen optionality manually after generation.`,
      },
      {
        q: `Can I generate ${titleCase(t.name)} from multiple ${f.name} samples?`,
        a: `Today the tool processes a single sample. For more aggressive inference across multiple shapes, run the converter on the union/merge of your samples or open an issue.`,
      },
      {
        q: `Is the source code available?`,
        a: `Yes — the entire project is open source. See the GitHub link in the footer.`,
      },
    ],
  };
}
