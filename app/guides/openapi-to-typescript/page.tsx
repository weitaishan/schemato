import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "Convert an OpenAPI spec into TypeScript types — without a heavy generator",
  description:
    "When you don't need a full client, just types: a 5-minute guide to picking the OpenAPI schema you actually need and turning it into clean TypeScript interfaces.",
  keywords: [
    "openapi to typescript",
    "openapi types",
    "convert openapi to typescript",
    "openapi typescript generator",
    "openapi typescript without codegen",
    "components.schemas typescript",
  ],
  alternates: { canonical: `${SITE.url}/guides/openapi-to-typescript` },
  openGraph: {
    title: "Convert an OpenAPI spec into TypeScript types",
    description:
      "Skip openapi-typescript / orval when all you need is a typed shape. Browser-only, free.",
    url: `${SITE.url}/guides/openapi-to-typescript`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

const sampleYaml = `openapi: 3.0.3
info:
  title: Demo
  version: 1.0.0
paths: {}
components:
  schemas:
    User:
      type: object
      required: [id, name]
      properties:
        id: { type: integer }
        name: { type: string }
        email: { type: string, format: email }
        addresses:
          type: array
          items: { $ref: "#/components/schemas/Address" }
    Address:
      type: object
      required: [line1, country]
      properties:
        line1: { type: string }
        city: { type: string }
        country: { type: string }`;

const generated = `export interface Address {
  "line1": string;
  "city"?: string;
  "country": string;
}

export interface User {
  "id": number;
  "name": string;
  "email"?: string;
  "addresses"?: Address[];
}`;

const fetchExample = `import type { User } from "./types";

export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<User>;
}`;

const reactQueryExample = `import { useQuery } from "@tanstack/react-query";
import type { User } from "./types";

export function useUser(id: number) {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => fetch(\`/api/users/\${id}\`).then((r) => r.json()),
  });
}`;

const zodExample = `// Want runtime validation as well? Convert the same schema to Zod
// instead — see /guides/json-to-zod and /openapi-to-zod.
import { User } from "./schemas";
const u = User.parse(await fetch("/api/me").then(r => r.json()));`;

export default function GuideOpenApiToTypeScript() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Convert an OpenAPI spec into TypeScript types without a generator",
    description: metadata.description,
    inLanguage: "en",
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: "Schemato OpenAPI → TypeScript converter" }],
    step: [
      { "@type": "HowToStep", position: 1, name: "Find the schema you actually need", text: "Pick a single schema from components.schemas — you usually don't need the full spec." },
      { "@type": "HowToStep", position: 2, name: "Generate TypeScript interfaces", text: "Paste the spec into the OpenAPI → TypeScript converter (JSON or YAML)." },
      { "@type": "HowToStep", position: 3, name: "Use the types in fetch", text: "Annotate fetch return types so the IDE catches drift the moment a backend changes shape." },
      { "@type": "HowToStep", position: 4, name: "Wire into React Query / SWR", text: "Pass the generated type as the query result type." },
      { "@type": "HowToStep", position: 5, name: "Decide if you also want runtime validation", text: "If yes, convert to Zod instead, or pair the types with a separate Zod schema." },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Why not just use openapi-typescript or orval?", acceptedAnswer: { "@type": "Answer", text: "Both are great for full client codegen, but they're overkill if you only need a few types from a partial spec. This approach is one paste, no install, no codegen step." } },
      { "@type": "Question", name: "Does the converter understand $ref?", acceptedAnswer: { "@type": "Answer", text: "Yes — same-document $ref into components.schemas is resolved into named interfaces." },
      },
      { "@type": "Question", name: "JSON or YAML?", acceptedAnswer: { "@type": "Answer", text: "Both — Schemato includes a lightweight YAML parser so you can paste either form." },
      },
      { "@type": "Question", name: "Does this generate API client code (fetch wrappers)?", acceptedAnswer: { "@type": "Answer", text: "No — only types. If you want client wrappers, use openapi-fetch or orval. Often you don't need them; raw fetch with typed return values is enough." },
      },
    ],
  };

  return (
    <article className="container-x py-16 max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <a href="/guides" className="hover:text-text">Guides</a>
        <span className="mx-2">/</span>
        <span>OpenAPI to TypeScript</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          Convert an OpenAPI spec into TypeScript types — without a generator
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">
          Most front-end projects don&apos;t need a full OpenAPI client. They need
          three or four types. Here&apos;s the lighter path.
        </p>
        <p className="text-mute mt-2 text-sm">
          Need it now?{" "}
          <a className="text-accent hover:underline" href="/openapi-to-typescript">
            OpenAPI → TypeScript converter
          </a>
          .
        </p>
      </header>

      <hr className="border-border my-10" />

      <h2 className="text-2xl font-bold">Step 1 — Find the schema you actually need</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Most teams discover later they only really cared about a handful of types.
        Open the spec and copy just the relevant chunk:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sampleYaml}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 2 — Generate TypeScript interfaces</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Paste the spec (JSON or YAML) into the{" "}
        <a className="text-accent hover:underline" href="/openapi-to-typescript">
          OpenAPI → TypeScript converter
        </a>
        . You&apos;ll get one named interface per <code className="text-accent2">components.schemas</code> entry,
        with <code className="text-accent2">$ref</code> turned into proper type references:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{generated}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 3 — Use the types in fetch</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Annotate the return type so your IDE flags any field-level drift the
        moment the backend changes:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{fetchExample}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 4 — Wire into React Query / SWR</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Pass the generated type as the query result type. <code className="text-accent2">data</code>{" "}
        is now fully typed throughout your component tree:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{reactQueryExample}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 5 — Decide if you want runtime validation</h2>
      <p className="text-dim mt-2 leading-relaxed">
        TypeScript types disappear at runtime. If you want to fail fast when the
        backend ships an unexpected shape (especially in B2B integrations), pair
        the types with a Zod schema:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{zodExample}</pre>
      <p className="text-dim mt-3 leading-relaxed">
        Schemato has{" "}
        <a className="text-accent hover:underline" href="/openapi-to-zod">OpenAPI → Zod</a>{" "}
        for that. Use whichever fits your trust model.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl font-bold">Common pitfalls</h2>
      <ul className="mt-4 space-y-3 text-dim">
        <li>
          • <strong className="text-text">YAML indentation gotchas.</strong> Tabs
          break parsing — use 2-space indentation. Schemato&apos;s built-in YAML
          parser handles the OpenAPI subset, not arbitrary YAML 1.2.
        </li>
        <li>
          • <strong className="text-text">External $ref isn&apos;t resolved.</strong>{" "}
          Only same-document references work. Inline external schemas first or use
          a bundler like <code className="text-accent2">@redocly/cli bundle</code>.
        </li>
        <li>
          • <strong className="text-text">Discriminated unions need manual cleanup.</strong>{" "}
          <code className="text-accent2">oneOf</code> with discriminator becomes a generic union — tighten with
          <code className="text-accent2"> &quot;kind&quot;: &quot;card&quot;</code> string literal types.
        </li>
        <li>
          • <strong className="text-text">Don&apos;t over-generate.</strong>{" "}
          If you only need 3 types, paste only those 3 schemas. Generating the
          whole spec encourages dependency drift.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-12">FAQ</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <div className="font-semibold">Why not just use openapi-typescript or orval?</div>
          <p className="text-dim mt-1">
            Both are great for full clients. This is a lighter path: one paste,
            no install, no codegen step in CI.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Does the converter understand $ref?</div>
          <p className="text-dim mt-1">
            Yes — same-document <code className="text-accent2">$ref</code> into{" "}
            <code className="text-accent2">components.schemas</code> becomes named interfaces.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">JSON or YAML?</div>
          <p className="text-dim mt-1">Both. Schemato includes a lightweight YAML parser sufficient for the OpenAPI subset.</p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Does this generate API client wrappers?</div>
          <p className="text-dim mt-1">No — only types. Use <code className="text-accent2">openapi-fetch</code> if you need wrappers; often raw fetch is enough.</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href="/openapi-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">OpenAPI → TypeScript converter</div>
            <div className="text-xs text-mute">The tool used in this guide</div>
          </a>
          <a href="/openapi-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">OpenAPI → Zod</div>
            <div className="text-xs text-mute">Same shape, runtime check</div>
          </a>
          <a href="/format/openapi" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">All OpenAPI converters</div>
            <div className="text-xs text-mute">15 target languages</div>
          </a>
          <a href="/guides/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON to Zod</div>
            <div className="text-xs text-mute">When you only have a sample, not a spec</div>
          </a>
        </div>
      </section>
    </article>
  );
}
