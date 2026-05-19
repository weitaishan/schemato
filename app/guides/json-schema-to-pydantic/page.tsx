import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "How to turn JSON Schema into Pydantic v2 models — step-by-step (FastAPI-friendly)",
  description:
    "Walk a JSON Schema (with $ref, required, oneOf) into Pydantic v2 models you can drop straight into FastAPI handlers. Free converter included.",
  keywords: [
    "json schema to pydantic",
    "convert json schema to pydantic",
    "pydantic from json schema",
    "fastapi pydantic",
    "openapi to pydantic",
    "pydantic v2",
  ],
  alternates: {
    canonical: `${SITE.url}/guides/json-schema-to-pydantic`,
  },
  openGraph: {
    title: "How to turn JSON Schema into Pydantic v2 models",
    description:
      "$ref, oneOf, required arrays — handled. Drop the result into FastAPI in 5 minutes.",
    url: `${SITE.url}/guides/json-schema-to-pydantic`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

const sampleSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Customer",
  "type": "object",
  "required": ["id", "name", "address"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "address": { "$ref": "#/$defs/Address" }
  },
  "$defs": {
    "Address": {
      "type": "object",
      "required": ["line1", "country"],
      "properties": {
        "line1": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" }
      }
    }
  }
}`;

const generated = `from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class Address(BaseModel):
    line1: str
    city: Optional[str] = None
    country: str


class Customer(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    address: Address`;

const fastApiExample = `from fastapi import FastAPI
from .models import Customer

app = FastAPI()

@app.post("/customers")
async def create_customer(customer: Customer) -> Customer:
    # 'customer' is fully validated. Bad payloads return HTTP 422.
    return customer`;

const oneOfRefined = `from typing import Literal, Union
from pydantic import BaseModel, Field


class CardPayment(BaseModel):
    kind: Literal["card"]
    last4: str


class WalletPayment(BaseModel):
    kind: Literal["wallet"]
    provider: str


Payment = Union[CardPayment, WalletPayment]


class Order(BaseModel):
    id: str
    payment: Payment = Field(discriminator="kind")`;

export default function GuideJsonSchemaToPydantic() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to turn JSON Schema into Pydantic v2 models",
    description: metadata.description,
    inLanguage: "en",
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: "Schemato JSON Schema → Pydantic converter" }],
    step: [
      { "@type": "HowToStep", position: 1, name: "Have a JSON Schema document", text: "Use the schema you already publish, or grab one from your OpenAPI components.schemas." },
      { "@type": "HowToStep", position: 2, name: "Generate Pydantic models", text: "Paste the schema into the JSON Schema → Pydantic converter and copy the output." },
      { "@type": "HowToStep", position: 3, name: "Plug into FastAPI", text: "Use the model as a request body or response_model — FastAPI parses, validates, and documents automatically." },
      { "@type": "HowToStep", position: 4, name: "Refine with Field and validators", text: "Add Field(...) constraints, validators, and discriminators where the schema is loose." },
      { "@type": "HowToStep", position: 5, name: "Decide on strictness", text: "Pick whether to coerce strings into numbers (default) or run in strict mode." },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does the converter understand $ref?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. References inside the same document ($defs / definitions / components.schemas) are resolved into named Pydantic classes." },
      },
      {
        "@type": "Question",
        name: "How do oneOf and anyOf get translated?",
        acceptedAnswer: { "@type": "Answer", text: "They become Python Union types. For tagged variants, use a Literal field and a discriminator — the converter generates a generic Union and you tighten it manually." },
      },
      {
        "@type": "Question",
        name: "Do I need Pydantic v2?",
        acceptedAnswer: { "@type": "Answer", text: "The output uses Pydantic v2 idioms (model_config, list[X] type hints). It runs on Python 3.10+. Migration from v1 is mostly mechanical if you're starting fresh." },
      },
      {
        "@type": "Question",
        name: "What about formats like email or date-time?",
        acceptedAnswer: { "@type": "Answer", text: "Strings stay as str by default. Switch to EmailStr (pip install pydantic[email]) or datetime where you want stricter parsing." },
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
        <span>JSON Schema to Pydantic</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          How to turn JSON Schema into Pydantic v2 models
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">
          A practical walkthrough for FastAPI teams: take a JSON Schema document
          (with $ref, required, oneOf), produce Pydantic v2 models, plug them
          straight into your routes.
        </p>
        <p className="text-mute mt-2 text-sm">
          Need it now? Skip ahead to the{" "}
          <a className="text-accent hover:underline" href="/json-schema-to-pydantic">
            JSON Schema → Pydantic converter
          </a>
          .
        </p>
      </header>

      <hr className="border-border my-10" />

      <h2 className="text-2xl font-bold">Step 1 — Have a JSON Schema document</h2>
      <p className="text-dim mt-2 leading-relaxed">
        You can use a standalone JSON Schema, or pull one out of your OpenAPI spec
        — anything under <code className="text-accent2">components.schemas.X</code> is
        already a JSON Schema. Here&apos;s a typical customer document with a $ref:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sampleSchema}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 2 — Generate Pydantic models</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Paste the schema into the{" "}
        <a className="text-accent hover:underline" href="/json-schema-to-pydantic">
          JSON Schema → Pydantic converter
        </a>
        . The result resolves <code className="text-accent2">$defs</code> into named
        classes, marks non-required fields as <code className="text-accent2">Optional[X] = None</code>:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{generated}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 3 — Plug into FastAPI</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Drop the generated class into a route parameter. FastAPI uses Pydantic
        for parsing, validation, and OpenAPI documentation — all three for free:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{fastApiExample}</pre>
      <p className="text-dim mt-3 leading-relaxed">
        A bad request body (missing fields, wrong types) returns HTTP 422 with a
        structured list of errors that points at exactly which field failed.
      </p>

      <h2 className="text-2xl font-bold mt-12">Step 4 — Refine with discriminators (oneOf)</h2>
      <p className="text-dim mt-2 leading-relaxed">
        JSON Schema&apos;s <code className="text-accent2">oneOf</code> with a discriminator
        becomes a Pydantic discriminated union. The generator produces a generic{" "}
        <code className="text-accent2">Union</code> — tighten it by hand:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{oneOfRefined}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 5 — Decide on strictness</h2>
      <ul className="mt-3 space-y-2 text-dim">
        <li>
          • <strong className="text-text">Default (lax)</strong>: Pydantic coerces
          types — <code className="text-accent2">{`"42"`}</code> becomes{" "}
          <code className="text-accent2">42</code>. Convenient for HTML forms, risky for typed APIs.
        </li>
        <li>
          • <strong className="text-text">Strict mode</strong>: set{" "}
          <code className="text-accent2">model_config = ConfigDict(strict=True)</code>{" "}
          on the class to reject coercion. Recommended for service-to-service contracts.
        </li>
        <li>
          • <strong className="text-text">Per-field strictness</strong>:{" "}
          <code className="text-accent2">id: int = Field(..., strict=True)</code>{" "}
          if you only want strict for some fields.
        </li>
      </ul>

      <hr className="border-border my-12" />

      <h2 className="text-2xl font-bold">Common pitfalls</h2>
      <ul className="mt-4 space-y-3 text-dim">
        <li>
          • <strong className="text-text">External $ref isn&apos;t resolved.</strong>{" "}
          Only same-document references are walked. Inline external schemas first or
          use a JSON Schema bundler.
        </li>
        <li>
          • <strong className="text-text">String formats stay as plain str.</strong>{" "}
          <code className="text-accent2">format: email</code> doesn&apos;t auto-become
          <code className="text-accent2"> EmailStr</code>. Swap manually if you want runtime checks.
        </li>
        <li>
          • <strong className="text-text">Empty enum / arrays.</strong>{" "}
          Empty <code className="text-accent2">enum: []</code> or arrays without{" "}
          <code className="text-accent2">items</code> degrade to <code className="text-accent2">Any</code>.
        </li>
        <li>
          • <strong className="text-text">allOf is shallow-merged.</strong>{" "}
          Properties and required arrays are merged; deeper composition (e.g. nested allOf
          inside a property) may need manual cleanup.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-12">FAQ</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <div className="font-semibold">Does the converter understand $ref?</div>
          <p className="text-dim mt-1">
            Yes — same-document references in <code className="text-accent2">$defs</code> /{" "}
            <code className="text-accent2">definitions</code> /{" "}
            <code className="text-accent2">components.schemas</code> become named classes.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">How are oneOf and anyOf translated?</div>
          <p className="text-dim mt-1">
            They become <code className="text-accent2">Union</code> types. Add a
            <code className="text-accent2"> Field(discriminator=...)</code> manually for tagged variants.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Do I need Pydantic v2?</div>
          <p className="text-dim mt-1">
            The generated code uses v2 idioms ({`list[X]`} type hints, model_config). Targets Python 3.10+.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">What about email or date-time formats?</div>
          <p className="text-dim mt-1">
            Strings stay as <code className="text-accent2">str</code>. Swap to{" "}
            <code className="text-accent2">EmailStr</code> or{" "}
            <code className="text-accent2">datetime</code> when you want stricter parsing.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href="/json-schema-to-pydantic" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON Schema → Pydantic converter</div>
            <div className="text-xs text-mute">The tool used in this guide</div>
          </a>
          <a href="/openapi-to-pydantic" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">OpenAPI → Pydantic</div>
            <div className="text-xs text-mute">From spec to FastAPI models</div>
          </a>
          <a href="/json-to-pydantic" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Pydantic</div>
            <div className="text-xs text-mute">When you only have a sample, not a schema</div>
          </a>
          <a href="/guides/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON to Zod (TypeScript)</div>
            <div className="text-xs text-mute">The TypeScript counterpart of this guide</div>
          </a>
        </div>
      </section>
    </article>
  );
}
