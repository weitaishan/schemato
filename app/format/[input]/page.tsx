import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FORMATS,
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  type FormatId,
} from "@/lib/formats";
import { hasConverter } from "@/lib/converters";
import { pathFor } from "@/lib/url";
import { SITE } from "@/lib/site";

interface RouteParams {
  params: Promise<{ input: string }>;
}

function findInputBySlug(slug: string): FormatId | null {
  for (const id of INPUT_FORMATS) {
    if (FORMATS[id].slug === slug) return id;
  }
  return null;
}

export async function generateStaticParams() {
  return INPUT_FORMATS.map((id) => ({ input: FORMATS[id].slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { input } = await params;
  const id = findInputBySlug(input);
  if (!id) return { title: "Not found" };
  const f = FORMATS[id];
  return {
    title: `${f.name} converters — Convert ${f.name} to TypeScript, Zod, Pydantic, Go, and more`,
    description: `Free browser-only ${f.name} converters. Turn a ${f.name} sample into typed code for 15 languages including TypeScript, Zod, Pydantic, Go, Rust, Swift, Kotlin and Java.`,
    keywords: [
      `${f.name.toLowerCase()} converter`,
      `${f.name.toLowerCase()} to typescript`,
      `${f.name.toLowerCase()} to zod`,
      `${f.name.toLowerCase()} to pydantic`,
      `convert ${f.name.toLowerCase()}`,
      `${f.name.toLowerCase()} type generator`,
    ],
    alternates: { canonical: `${SITE.url}/format/${f.slug}` },
    openGraph: {
      title: `${f.name} converters · ${SITE.name}`,
      description: `Convert ${f.name} into 15 typed languages. Free, browser-only.`,
      url: `${SITE.url}/format/${f.slug}`,
      type: "website",
      images: [{ url: "/og.svg", width: 1200, height: 630 }],
    },
  };
}

// 用一组手写的 short blurb 让每个 hub 页有不同风格的 intro
const HUB_INTROS: Partial<Record<FormatId, string>> = {
  json:
    "JSON is the lingua franca of web APIs. These tools turn a real JSON payload into typed code for whichever language you happen to ship in. The most popular pair is JSON → Zod for TypeScript projects.",
  "json-schema":
    "JSON Schema describes a contract: required fields, types, $ref, oneOf. These converters walk that schema and produce code in a target language so you can stop transcribing the contract by hand.",
  openapi:
    "OpenAPI documents already model your API surface. Instead of running a heavy code generator, paste the relevant components.schemas block (JSON or YAML) into one of these tools and get just the types you need.",
  graphql:
    "GraphQL SDL types translate naturally into typed structures across 15 languages. Useful when you operate on shapes from a federated schema without going through a heavy GraphQL client.",
  sql:
    "Have a CREATE TABLE statement and need a typed model in your service? Pick a target language. Works with Postgres, MySQL and SQLite shared subsets.",
  protobuf:
    "Protobuf describes RPC contracts; sometimes you want a struct without all the codegen ceremony. These tools give you that struct in a few seconds.",
  prisma:
    "Prisma already generates types for your service — these tools help when you need a public surface (TS interface, Zod schema, Pydantic model) separated from PrismaClient.",
  typescript:
    "Have an existing TypeScript interface or type and need to mirror it in another language (Go, Rust, Pydantic, etc.)? Drop it in the reverse-input tools below.",
  mongoose:
    "Skip the dance of writing a TypeScript interface that mirrors your Mongoose schema. Or generate a Pydantic model for a Python service that reads the same documents.",
  avro:
    "Common in Kafka pipelines: an Avro schema describes the topic; downstream consumers in Python or TypeScript need a typed representation. These tools take you there.",
};

export default async function InputHubPage({ params }: RouteParams) {
  const { input } = await params;
  const id = findInputBySlug(input);
  if (!id) notFound();

  const f = FORMATS[id];
  const intro = HUB_INTROS[id] ??
    `Convert ${f.name} into typed code for 15 languages. Browser-only, free, no signup.`;

  // 列出该输入格式的全部转换
  const targets = OUTPUT_FORMATS.filter((t) => t !== id);

  // CollectionPage + ItemList JSON-LD（让 Google 知道这是个聚合页）
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${f.name} converters`,
    description: `Convert ${f.name} into 15 typed languages.`,
    url: `${SITE.url}/format/${f.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: targets.map((to, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE.url}${pathFor(id, to)}`,
        name: `${f.name} to ${FORMATS[to].name}`,
      })),
    },
  };

  return (
    <div className="container-x py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <span>{f.name}</span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-dim text-sm uppercase tracking-widest">Input format</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          {f.name} converters
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">{intro}</p>
        <div className="mt-6 flex gap-3">
          <a href={pathFor(id, "typescript" as FormatId)} className="btn-primary">
            Try {f.name} → TypeScript
          </a>
          <a href="/#converters" className="btn-ghost">
            Browse all
          </a>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">All {f.name} converters</h2>
        <p className="text-mute text-sm mt-1">{targets.length} conversions, all live.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {targets.map((to) => {
            const t = FORMATS[to];
            const live = hasConverter(id, to);
            return (
              <a
                key={to}
                href={pathFor(id, to)}
                className="card px-3 py-3 hover:border-accent transition flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {f.name} → {t.name}
                  </div>
                  <div className="text-xs text-mute truncate">{live ? "Live" : "Preview"}</div>
                </div>
                {live && <span className="h-2 w-2 rounded-full bg-accent2 shrink-0" />}
              </a>
            );
          })}
        </div>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold">Sample {f.name}</h2>
        <p className="text-dim mt-2">
          Here&apos;s the default sample used across the converter pages. Each tool
          page has additional real-world samples (User profile, e-commerce order, etc.) you can switch to.
        </p>
        <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">
          {f.sample}
        </pre>
      </section>
    </div>
  );
}
