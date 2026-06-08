import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Infer optional fields from multiple JSON samples",
  description:
    "Paste multiple API response samples as NDJSON and generate safer TypeScript, Zod, Go, and Pydantic outputs with optional fields inferred.",
  keywords: [
    "multiple json samples to typescript",
    "json optional fields typescript",
    "infer optional fields from json",
    "ndjson to typescript",
    "json samples to zod",
    "json to typescript optional",
    "api response optional fields",
  ],
  alternates: { canonical: `${SITE.url}/guides/multiple-json-samples-to-typescript` },
  openGraph: {
    title: "Infer optional fields from multiple JSON samples",
    description:
      "Use NDJSON samples to catch fields that appear in one API response but not another.",
    url: `${SITE.url}/guides/multiple-json-samples-to-typescript`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

const ndjsonSample = `{"id":1,"name":"Ada","email":"ada@example.com","role":"admin"}
{"id":2,"name":"Linus","lastLoginAt":"2026-06-08T09:30:00Z"}
{"id":3,"name":"Grace","email":"grace@example.com","team":{"id":"core","name":"Platform"}}`;

const weakSingleSample = `export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}`;

const inferredTypes = `export interface User {
  "id": number;
  "name": string;
  "email"?: string;
  "role"?: string;
  "lastLoginAt"?: string;
  "team"?: Team;
}

export interface Team {
  "id": string;
  "name": string;
}`;

const zodOutput = `import { z } from "zod";

export const Team = z.object({
  id: z.string(),
  name: z.string(),
});

export const User = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
  lastLoginAt: z.string().optional(),
  team: Team.optional(),
});`;

const goOutput = `type User struct {
  ID          int    \`json:"id"\`
  Name        string \`json:"name"\`
  Email       *string \`json:"email,omitempty"\`
  Role        *string \`json:"role,omitempty"\`
  LastLoginAt *string \`json:"lastLoginAt,omitempty"\`
  Team        *Team   \`json:"team,omitempty"\`
}`;

const checklist = `1. Collect 2-5 real API responses for the same endpoint.
2. Put each response on one line as NDJSON.
3. Paste the samples into the JSON converter.
4. Review optional fields before copying into production.
5. Switch to JSON Schema or OpenAPI when you have a formal contract.`;

export default function MultipleJsonSamplesGuide() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to infer optional fields from multiple JSON samples",
    description: metadata.description,
    inLanguage: "en",
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: "Schemato JSON converters" }],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Collect real samples",
        text: "Use multiple API responses from the same endpoint so missing fields become visible.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Paste as NDJSON",
        text: "Place each JSON object on its own line and paste the block into a JSON converter.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Generate code",
        text: "Choose TypeScript, Zod, Go struct, Pydantic, or another output language.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Review optional fields",
        text: "Fields that appear in only some samples are generated as optional.",
      },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why use multiple JSON samples?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "One API response only shows the fields that happened to appear in that payload. Multiple samples reveal fields that may be omitted in production.",
        },
      },
      {
        "@type": "Question",
        name: "What format should I paste?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Paste one valid JSON value, a JSON array, or newline-delimited JSON where each non-empty line is a complete JSON sample.",
        },
      },
      {
        "@type": "Question",
        name: "Does this replace JSON Schema or OpenAPI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Multiple samples are useful when you only have responses. A formal JSON Schema or OpenAPI document is still better when available.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this for Zod and Go too?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Schemato uses the merged JSON shape across TypeScript, Zod, Go struct, Pydantic, Rust, Swift, Kotlin, Java, C#, Dart, PHP, Ruby, Yup, Joi, and dataclass outputs.",
        },
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
        <span>Multiple JSON samples</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          Infer optional fields from multiple JSON samples
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">
          Real API responses are uneven. One user has an email, another has a
          team object, and a third response omits both. Paste several samples as
          NDJSON so Schemato can generate one safer shared type.
        </p>
        <p className="text-mute mt-2 text-sm">
          Try it now in{" "}
          <a className="text-accent hover:underline" href="/json-to-typescript">
            JSON → TypeScript
          </a>
          ,{" "}
          <a className="text-accent hover:underline" href="/json-to-zod">
            JSON → Zod
          </a>
          , or{" "}
          <a className="text-accent hover:underline" href="/json-to-go-struct">
            JSON → Go struct
          </a>
          .
        </p>
      </header>

      <hr className="border-border my-10" />

      <h2 className="text-2xl font-bold">The single-sample problem</h2>
      <p className="text-dim mt-2 leading-relaxed">
        A JSON converter can only infer what the pasted sample proves. If the
        first response has <code className="text-accent2">email</code> and{" "}
        <code className="text-accent2">role</code>, a single-sample output may
        make both fields look required even if the API often omits them.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{weakSingleSample}</pre>

      <h2 className="text-2xl font-bold mt-12">Paste several responses as NDJSON</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Put each complete JSON object on its own line. The lines do not need to
        share the same fields; that difference is exactly what helps infer
        optional properties.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{ndjsonSample}</pre>

      <h2 className="text-2xl font-bold mt-12">Generated TypeScript output</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Fields present in every sample stay required. Fields that appear in only
        some samples become optional.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{inferredTypes}</pre>

      <div className="card p-4 mt-4">
        <h3 className="font-semibold">Why this matters</h3>
        <p className="text-dim mt-2 leading-relaxed">
          Optional fields are where generated code most often drifts from real
          APIs. Multi-sample inference gives you a better first draft before you
          commit the type, validator, or DTO to your app.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-12">The same merged shape works for validators</h2>
      <p className="text-dim mt-2 leading-relaxed">
        If the API response crosses a runtime boundary, generate Zod instead of
        plain TypeScript. The optional fields carry through to the schema.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{zodOutput}</pre>

      <h2 className="text-2xl font-bold mt-12">And DTOs for backend languages</h2>
      <p className="text-dim mt-2 leading-relaxed">
        The same JSON input can produce Go structs, Pydantic models, Rust structs,
        Swift Codable types, Kotlin data classes, and more.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{goOutput}</pre>

      <h2 className="text-2xl font-bold mt-12">A quick workflow</h2>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{checklist}</pre>

      <h2 className="text-2xl font-bold mt-12">When to use samples, schema, or OpenAPI</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold">Use multiple samples when you only have responses</h3>
          <p className="text-dim mt-2">
            This is common when exploring a third-party API, debugging production
            payloads, or turning fixtures into local types.
          </p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold">Use JSON Schema when you have a formal contract</h3>
          <p className="text-dim mt-2">
            A schema can express required fields, enums, nullable values, refs,
            and unions more explicitly than examples can.
          </p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold">Use OpenAPI when the endpoint already has a spec</h3>
          <p className="text-dim mt-2">
            OpenAPI is the better source of truth for client and server API
            boundaries. Samples are the fallback when no spec exists.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-12">FAQ</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <div className="font-semibold">Can I paste normal formatted JSON?</div>
          <p className="text-dim mt-1">
            Yes. A single JSON value still works as before. NDJSON is only needed
            when you want to merge multiple separate samples.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Can I paste a JSON array instead?</div>
          <p className="text-dim mt-1">
            Yes. Arrays also merge item shapes. NDJSON is useful when your samples
            are separate responses rather than one array payload.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Does this prove every field is correct?</div>
          <p className="text-dim mt-1">
            No. Samples improve the first draft, but they are still examples. Use
            API docs, JSON Schema, or OpenAPI when the contract matters.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related tools</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href="/json-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → TypeScript</div>
            <div className="text-xs text-mute">Generate interfaces from samples</div>
          </a>
          <a href="/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Zod</div>
            <div className="text-xs text-mute">Generate runtime validators</div>
          </a>
          <a href="/json-to-pydantic" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Pydantic</div>
            <div className="text-xs text-mute">Generate FastAPI models</div>
          </a>
          <a href="/json-to-go-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Go struct</div>
            <div className="text-xs text-mute">Generate API DTOs</div>
          </a>
        </div>
      </section>
    </article>
  );
}
