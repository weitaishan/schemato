import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to convert JSON to TypeScript types — practical guide",
  description:
    "Turn a JSON sample into TypeScript interfaces, tighten optional fields, handle arrays and nested objects, and know when to add Zod runtime validation.",
  keywords: [
    "json to typescript",
    "json to typescript interface",
    "convert json to typescript",
    "json to ts",
    "typescript interface generator",
    "json optional fields typescript",
    "typescript runtime validation",
    "json array type inference",
    "json to zod",
  ],
  alternates: { canonical: `${SITE.url}/guides/json-to-typescript` },
  openGraph: {
    title: "How to convert JSON to TypeScript types",
    description:
      "A practical guide to turning JSON samples into TypeScript interfaces, with notes on optional fields and runtime validation.",
    url: `${SITE.url}/guides/json-to-typescript`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

const sampleJson = `{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "isAdmin": false,
  "profile": {
    "company": "Analytical Engine Labs",
    "timezone": "Europe/London"
  },
  "tags": ["math", "engine"]
}`;

const generatedTypes = `export interface Root {
  id: number;
  name: string;
  email?: string;
  isAdmin: boolean;
  profile: Profile;
  tags: string[];
}

export interface Profile {
  company: string;
  timezone: string;
}`;

const polishedTypes = `export interface User {
  id: number;
  name: string;
  email?: string;
  isAdmin: boolean;
  profile: UserProfile;
  tags: string[];
}

export interface UserProfile {
  company: string;
  timezone: string;
}`;

const fetchExample = `export async function fetchUser(): Promise<User> {
  const res = await fetch("/api/me");
  return (await res.json()) as User;
}`;

const zodUpgrade = `import { z } from "zod";

export const User = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
  isAdmin: z.boolean(),
  profile: z.object({
    company: z.string(),
    timezone: z.string(),
  }),
  tags: z.array(z.string()),
});

export type User = z.infer<typeof User>;`;

const optionalFieldsExample = `// If this field may be omitted:
email?: string;

// If the API sends null explicitly:
email: string | null;

// If both can happen:
email?: string | null;`;

const emptyArrayExample = `// Empty sample arrays cannot reveal the element type
const sample = { tags: [] };

// Weak first pass
interface User {
  tags: unknown[];
}

// Tighten it after checking real data
interface User {
  tags: string[];
}`;

const dateExample = `interface Invoice {
  id: string;

  // JSON sends this as a string, even when it represents a date
  issuedAt: string;
}

const issuedAt = new Date(invoice.issuedAt);`;

const assertionExample = `// This only tells TypeScript to trust you.
// It does not validate the response at runtime.
const user = (await res.json()) as User;`;

export default function GuideJsonToTypeScript() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to convert JSON to TypeScript types",
    description: metadata.description,
    inLanguage: "en",
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: "Schemato JSON → TypeScript converter" }],
    step: [
      { "@type": "HowToStep", position: 1, name: "Choose a representative JSON sample", text: "Use a real API response or fixture that includes nested objects, arrays, and optional fields." },
      { "@type": "HowToStep", position: 2, name: "Generate TypeScript interfaces", text: "Paste the sample into the JSON → TypeScript converter and copy the generated interfaces." },
      { "@type": "HowToStep", position: 3, name: "Rename and tighten the types", text: "Rename Root, review optional fields, and decide whether arrays need specific element types." },
      { "@type": "HowToStep", position: 4, name: "Use the type in your API boundary", text: "Annotate fetch helpers, fixtures, or component props with the generated type." },
      { "@type": "HowToStep", position: 5, name: "Upgrade to Zod when runtime validation matters", text: "Use Zod if the JSON comes from an untrusted API, form, env var, webhook, or user input." },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Should I use TypeScript interfaces or Zod?", acceptedAnswer: { "@type": "Answer", text: "Use TypeScript interfaces when the data is already trusted and you only need editor/autocomplete support. Use Zod when the value crosses a runtime boundary and may be malformed." } },
      { "@type": "Question", name: "Can one JSON sample identify every optional field?", acceptedAnswer: { "@type": "Answer", text: "No. A sample only proves what appears in that payload. Review API docs or additional samples and mark fields optional where the API can omit them." } },
      { "@type": "Question", name: "What happens with empty arrays?", acceptedAnswer: { "@type": "Answer", text: "Empty arrays cannot reveal their element type. Provide at least one representative item when you want a useful array type." } },
      { "@type": "Question", name: "Can I convert JSON Schema or OpenAPI to TypeScript instead?", acceptedAnswer: { "@type": "Answer", text: "Yes. If you have a formal contract, JSON Schema → TypeScript or OpenAPI → TypeScript is usually better than inferring from one sample." } },
      { "@type": "Question", name: "Does as User validate JSON at runtime?", acceptedAnswer: { "@type": "Answer", text: "No. A TypeScript assertion only affects the compiler. If the JSON can be malformed, validate it with Zod or another runtime schema library." } },
      { "@type": "Question", name: "Should JSON dates become Date or string in TypeScript?", acceptedAnswer: { "@type": "Answer", text: "Keep JSON timestamps as string in the generated type unless your code explicitly parses them into Date objects." } },
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
        <span>JSON to TypeScript</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          How to convert JSON to TypeScript types
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">
          A practical walkthrough for turning a real JSON response into TypeScript
          interfaces, then deciding whether plain types are enough or runtime
          validation should come next.
        </p>
        <p className="text-mute mt-2 text-sm">
          Need it now?{" "}
          <a className="text-accent hover:underline" href="/json-to-typescript">
            JSON → TypeScript converter
          </a>
          .
        </p>
      </header>

      <hr className="border-border my-10" />

      <h2 className="text-2xl font-bold">Step 1 — Start with a representative JSON sample</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Use a real API response, webhook payload, or fixture. Include nested
        objects and at least one item in each array so the generated type has
        enough information to work with.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sampleJson}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 2 — Generate TypeScript interfaces</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Paste the sample into the{" "}
        <a className="text-accent hover:underline" href="/json-to-typescript">
          JSON → TypeScript converter
        </a>
        . The first pass gives you clean structural types:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{generatedTypes}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 3 — Rename and tighten the output</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Generated names are a starting point. Rename the root type, review nested
        types, and check optional fields against your real API contract.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{polishedTypes}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 4 — Use the type at your API boundary</h2>
      <p className="text-dim mt-2 leading-relaxed">
        TypeScript helps your editor and compiler, but it does not validate JSON
        at runtime. This pattern is fine when you trust the upstream response:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{fetchExample}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 5 — Upgrade to Zod when runtime validation matters</h2>
      <p className="text-dim mt-2 leading-relaxed">
        If the JSON comes from a third-party API, user form, webhook, env var, or
        localStorage, TypeScript alone cannot protect you. Generate a Zod schema
        instead and derive the type from that schema:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{zodUpgrade}</pre>

      <div className="card p-4 mt-4">
        <h3 className="font-semibold">Plain TypeScript or Zod?</h3>
        <ul className="mt-2 space-y-2 text-dim text-sm">
          <li>• Use TypeScript when the data is internal, already typed, or only used for editor support.</li>
          <li>• Use Zod when data crosses a trust boundary and can be malformed at runtime.</li>
          <li>• Use JSON Schema or OpenAPI input when you have a formal contract instead of just one sample.</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-12">Common pitfalls</h2>
      <ul className="mt-4 space-y-3 text-dim">
        <li>
          • <strong className="text-text">One sample is not the whole API.</strong>{" "}
          A field missing from this sample might still exist later; a field present
          here might be optional in production.
        </li>
        <li>
          • <strong className="text-text">Empty arrays become weak types.</strong>{" "}
          Use a sample with at least one array item to infer the element shape.
        </li>
        <li>
          • <strong className="text-text">Dates are strings over the wire.</strong>{" "}
          JSON has no Date type. Keep timestamps as string unless your code
          explicitly parses them.
        </li>
        <li>
          • <strong className="text-text">Types are not validators.</strong>{" "}
          If bad JSON can crash a flow, use the{" "}
          <a className="text-accent hover:underline" href="/guides/json-to-zod">
            JSON to Zod guide
          </a>{" "}
          after generating the first type.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-12">Troubleshooting generated TypeScript types</h2>
      <p className="text-dim mt-2 leading-relaxed">
        TypeScript types generated from JSON are only as complete as the sample.
        Before using them as an API contract, check the cases that a single
        payload cannot prove.
      </p>

      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold">Optional, nullable, or both?</h3>
          <p className="text-dim mt-2 leading-relaxed">
            A missing field and a field set to{" "}
            <code className="text-accent2">null</code> mean different things in
            TypeScript. Compare the generated type against API docs, production
            fixtures, or more than one response sample.
          </p>
          <pre className="mt-3 bg-panel2 border border-border rounded-lg p-3 code-pre overflow-x-auto">{optionalFieldsExample}</pre>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold">Empty arrays need real examples</h3>
          <p className="text-dim mt-2 leading-relaxed">
            If an array is empty in the sample, the converter cannot infer the
            element shape. Paste a payload with at least one item, or tighten the
            generated type by hand.
          </p>
          <pre className="mt-3 bg-panel2 border border-border rounded-lg p-3 code-pre overflow-x-auto">{emptyArrayExample}</pre>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold">Dates are strings over the wire</h3>
          <p className="text-dim mt-2 leading-relaxed">
            JSON has no native date type. Keep timestamps as strings in boundary
            types, then parse them where your app needs date operations.
          </p>
          <pre className="mt-3 bg-panel2 border border-border rounded-lg p-3 code-pre overflow-x-auto">{dateExample}</pre>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold">Type assertions are not validation</h3>
          <p className="text-dim mt-2 leading-relaxed">
            <code className="text-accent2">as User</code> can make the compiler
            quiet, but it cannot catch a broken API response. Use it only when
            you trust the source; otherwise upgrade the boundary to Zod.
          </p>
          <pre className="mt-3 bg-panel2 border border-border rounded-lg p-3 code-pre overflow-x-auto">{assertionExample}</pre>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-12">FAQ</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <div className="font-semibold">Should I use TypeScript interfaces or Zod?</div>
          <p className="text-dim mt-1">
            Use TypeScript for trusted internal data. Use Zod when you need runtime
            validation for external input.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Can one JSON sample identify every optional field?</div>
          <p className="text-dim mt-1">
            No. Review API docs or paste multiple representative samples into your
            own checklist before finalizing optional fields.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">What about JSON Schema or OpenAPI?</div>
          <p className="text-dim mt-1">
            If you have a formal contract, use{" "}
            <a className="text-accent hover:underline" href="/json-schema-to-typescript">
              JSON Schema → TypeScript
            </a>{" "}
            or{" "}
            <a className="text-accent hover:underline" href="/openapi-to-typescript">
              OpenAPI → TypeScript
            </a>{" "}
            instead of inferring from a single sample.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Does as User validate JSON at runtime?</div>
          <p className="text-dim mt-1">
            No. It only tells TypeScript to trust the value. If the JSON comes
            from an API, form, webhook, localStorage, or env var, validate it
            with Zod or another runtime schema.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Should JSON dates become Date or string?</div>
          <p className="text-dim mt-1">
            Use <code className="text-accent2">string</code> for the boundary
            type. Parse into <code className="text-accent2">Date</code> only
            after the JSON has entered your application code.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href="/json-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → TypeScript converter</div>
            <div className="text-xs text-mute">The tool used in this guide</div>
          </a>
          <a href="/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Zod converter</div>
            <div className="text-xs text-mute">Add runtime validation</div>
          </a>
          <a href="/json-to-go-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Go struct</div>
            <div className="text-xs text-mute">For Go API DTOs</div>
          </a>
          <a href="/openapi-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">OpenAPI → TypeScript</div>
            <div className="text-xs text-mute">When you have a spec</div>
          </a>
        </div>
      </section>
    </article>
  );
}
