// 为每个 (from, to) 对生成"看起来像人写的"SEO 文案。
// 不接 LLM API（节省成本 + 构建期可重复），用结构化模板 + 任务相关的真实信息组合。
// 后期可以替换为 Claude API 批量生成更"独特"的文案。

import { format, type FormatId } from "./formats";

interface SeoCopy {
  /** <title> */
  title: string;
  /** <meta description> */
  description: string;
  /** H1 */
  h1: string;
  /** 一句话副标题 */
  subhead: string;
  /** "What is this tool" 段落 */
  intro: string;
  /** "Why convert X to Y" 三条要点 */
  whyBullets: string[];
  /** "How to use" 步骤 */
  howSteps: string[];
  /** "Common pitfalls" 三条 */
  pitfalls: string[];
  /** FAQ */
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

const PITFALLS_BY_PAIR: Record<string, string[]> = {
  // 默认池
  default: [
    "Inferred types only see the payload you pasted. Add nullable / optional flags for fields that can be missing.",
    "Numeric types are inferred as integer or float based on the sample. Real APIs sometimes return both — widen to a number/float type when in doubt.",
    "Empty arrays default to an `unknown` element type. Paste a non-empty sample to get a meaningful element type.",
  ],
};

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

  const why = WHY_BY_TARGET[to] ?? [
    `Save time by deriving ${t.name} from a real ${f.name} sample instead of writing types by hand.`,
    `Keep client and server in sync by sharing the same source of truth.`,
    `Make schema drift visible during code review.`,
  ];

  const pitfalls = PITFALLS_BY_PAIR[pairKey(from, to)] ?? PITFALLS_BY_PAIR.default;

  return {
    title: `${pair} Converter — Free, Browser-only`,
    description: `Convert ${f.name} to ${t.name} in your browser. Paste a ${f.name} sample, get clean ${t.name} code with field types preserved. Free, no signup.`,
    h1: `${pair} Converter`,
    subhead: `Paste a ${f.name} sample, get production-ready ${t.name} code. Runs entirely in your browser.`,
    intro: `This free tool converts ${f.name} into ${t.name}. ${f.blurb} ${t.blurb} The conversion runs entirely client-side: nothing is uploaded, nothing is logged. Useful when you want to skip writing types by hand for an API response, a database row, or a config payload.`,
    whyBullets: why,
    howSteps: [
      `Paste your ${f.name} on the left panel (a sample is preloaded).`,
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
        a: `Fields whose value is null in the sample are marked optional/nullable. For real APIs, you may want to widen optionality manually after generation.`,
      },
      {
        q: `Can I generate ${titleCase(t.name)} from multiple ${f.name} samples?`,
        a: `Today the tool processes a single sample. For more aggressive inference across multiple shapes, run the converter on the union/merge of your samples or open an issue.`,
      },
    ],
  };
}
