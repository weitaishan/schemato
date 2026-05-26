import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to convert JSON to a Go struct — practical guide",
  description:
    "Turn a JSON sample into a Go struct, choose pointer fields for optional values, handle nested objects and arrays, and polish json tags for production APIs.",
  keywords: [
    "json to go",
    "json to go struct",
    "convert json to go struct",
    "json to golang struct",
    "go struct generator",
    "golang json struct tags",
  ],
  alternates: { canonical: `${SITE.url}/guides/json-to-go-struct` },
  openGraph: {
    title: "How to convert JSON to a Go struct",
    description:
      "A practical guide to turning JSON samples into Go structs, with notes on optional fields, arrays, nested objects, and json tags.",
    url: `${SITE.url}/guides/json-to-go-struct`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

const sampleJson = `{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "is_admin": false,
  "profile": {
    "company": "Analytical Engine Labs",
    "timezone": "Europe/London"
  },
  "tags": ["math", "engine"],
  "last_login_at": null
}`;

const generatedStruct = `type Root struct {
\tID          int      \`json:"id"\`
\tName        string   \`json:"name"\`
\tEmail       string   \`json:"email"\`
\tIsAdmin     bool     \`json:"is_admin"\`
\tProfile     Profile  \`json:"profile"\`
\tTags        []string \`json:"tags"\`
\tLastLoginAt any      \`json:"last_login_at"\`
}

type Profile struct {
\tCompany  string \`json:"company"\`
\tTimezone string \`json:"timezone"\`
}`;

const polishedStruct = `package model

import "time"

type User struct {
\tID          int64      \`json:"id"\`
\tName        string     \`json:"name"\`
\tEmail       *string    \`json:"email,omitempty"\`
\tIsAdmin     bool       \`json:"is_admin"\`
\tProfile     Profile    \`json:"profile"\`
\tTags        []string   \`json:"tags"\`
\tLastLoginAt *time.Time \`json:"last_login_at,omitempty"\`
}

type Profile struct {
\tCompany  string \`json:"company"\`
\tTimezone string \`json:"timezone"\`
}`;

const decodeExample = `func DecodeUser(r io.Reader) (*model.User, error) {
\tvar user model.User
\tif err := json.NewDecoder(r).Decode(&user); err != nil {
\t\treturn nil, err
\t}
\treturn &user, nil
}`;

const encodeExample = `b, err := json.Marshal(user)
if err != nil {
\treturn err
}
fmt.Println(string(b))`;

export default function GuideJsonToGoStruct() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to convert JSON to a Go struct",
    description: metadata.description,
    inLanguage: "en",
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: "Schemato JSON → Go struct converter" }],
    step: [
      { "@type": "HowToStep", position: 1, name: "Choose a representative JSON sample", text: "Use a real payload that includes nested objects, arrays, null values, and realistic field names." },
      { "@type": "HowToStep", position: 2, name: "Generate the Go struct", text: "Paste the sample into the JSON → Go struct converter and copy the generated struct." },
      { "@type": "HowToStep", position: 3, name: "Polish field types", text: "Rename Root, switch IDs to int64 when needed, and use pointer fields for optional JSON values." },
      { "@type": "HowToStep", position: 4, name: "Decode JSON with encoding/json", text: "Use json.NewDecoder or json.Unmarshal at the API boundary." },
      { "@type": "HowToStep", position: 5, name: "Review tags before shipping", text: "Keep json tags aligned with the wire format and add omitempty only when omission is acceptable." },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Should optional JSON fields be pointers in Go?", acceptedAnswer: { "@type": "Answer", text: "Usually yes. A pointer lets you distinguish a missing value from a zero value such as false, 0, or an empty string." } },
      { "@type": "Question", name: "How should null values be represented?", acceptedAnswer: { "@type": "Answer", text: "For a nullable scalar, use a pointer such as *string or *time.Time. For custom database or API behavior, use a dedicated nullable type." } },
      { "@type": "Question", name: "Does one JSON sample prove every array element shape?", acceptedAnswer: { "@type": "Answer", text: "No. Include at least one representative item, and review additional samples if the API returns different object variants." } },
      { "@type": "Question", name: "Can I convert SQL to Go structs too?", acceptedAnswer: { "@type": "Answer", text: "Yes. Use SQL → Go struct when the source of truth is a CREATE TABLE statement instead of a JSON response." } },
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
        <span>JSON to Go struct</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          How to convert JSON to a Go struct
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">
          A practical walkthrough for turning a real JSON payload into Go structs
          that are ready for <code className="text-accent2">encoding/json</code>.
        </p>
        <p className="text-mute mt-2 text-sm">
          Need it now?{" "}
          <a className="text-accent hover:underline" href="/json-to-go-struct">
            JSON → Go struct converter
          </a>
          .
        </p>
      </header>

      <hr className="border-border my-10" />

      <h2 className="text-2xl font-bold">Step 1 — Start with a representative JSON sample</h2>
      <p className="text-dim mt-2 leading-relaxed">
        A single sample can only infer what it can see. Use a payload that includes
        nested objects, arrays, null values, and real field names from your API:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sampleJson}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 2 — Generate the Go struct</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Paste the sample into the{" "}
        <a className="text-accent hover:underline" href="/json-to-go-struct">
          JSON → Go struct converter
        </a>
        . The first pass gives you the shape and json tags:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{generatedStruct}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 3 — Polish names, IDs, and optional fields</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Generated structs are a starting point. For production code, rename the
        root type, use <code className="text-accent2">int64</code> for large IDs,
        and make truly optional fields pointers:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{polishedStruct}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 4 — Decode JSON at the API boundary</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Once the struct is polished, use the standard library to decode request
        bodies, fixtures, webhook payloads, or API responses:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{decodeExample}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 5 — Review json tags before shipping</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Keep tags aligned with the wire format. Add{" "}
        <code className="text-accent2">omitempty</code> only when your API should
        omit zero values during encoding:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{encodeExample}</pre>

      <div className="card p-4 mt-4">
        <h3 className="font-semibold">Pointers or values?</h3>
        <ul className="mt-2 space-y-2 text-dim text-sm">
          <li>• Use values for required fields where the zero value is meaningful.</li>
          <li>• Use pointers when you need to know whether a field was missing or null.</li>
          <li>• Use custom nullable types when database scanning and JSON encoding both matter.</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-12">Common pitfalls</h2>
      <ul className="mt-4 space-y-3 text-dim">
        <li>
          • <strong className="text-text">Null is not the same as zero.</strong>{" "}
          A missing boolean and <code className="text-accent2">false</code> both
          become false unless you use a pointer.
        </li>
        <li>
          • <strong className="text-text">Empty arrays hide element types.</strong>{" "}
          Include at least one representative item when you want useful slice types.
        </li>
        <li>
          • <strong className="text-text">Dates are strings in JSON.</strong>{" "}
          Switch timestamp fields to <code className="text-accent2">time.Time</code>
          {" "}only if your decoder can parse that format.
        </li>
        <li>
          • <strong className="text-text">One payload is not a contract.</strong>{" "}
          Compare multiple responses or API docs before finalizing optional fields.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-12">FAQ</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <div className="font-semibold">Should optional fields be pointers?</div>
          <p className="text-dim mt-1">
            Usually yes. Pointers distinguish missing or null values from normal
            zero values like <code className="text-accent2">false</code> or 0.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">What should I do with null values?</div>
          <p className="text-dim mt-1">
            Use pointer fields for nullable scalars, or custom nullable types when
            database scanning and JSON encoding share the same model.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Can I generate structs from SQL instead?</div>
          <p className="text-dim mt-1">
            Yes. Use the{" "}
            <a className="text-accent hover:underline" href="/guides/sql-to-go-struct">
              SQL to Go struct guide
            </a>{" "}
            when the source of truth is a CREATE TABLE statement.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href="/json-to-go-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Go struct converter</div>
            <div className="text-xs text-mute">The tool used in this guide</div>
          </a>
          <a href="/guides/sql-to-go-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">SQL → Go struct guide</div>
            <div className="text-xs text-mute">When your source is a table schema</div>
          </a>
          <a href="/json-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → TypeScript</div>
            <div className="text-xs text-mute">For frontend DTOs</div>
          </a>
          <a href="/format/json" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">All JSON converters</div>
            <div className="text-xs text-mute">15 target languages</div>
          </a>
        </div>
      </section>
    </article>
  );
}
