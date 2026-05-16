import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "How to convert JSON to a Zod schema (with TypeScript types) — step-by-step",
  description:
    "Practical guide: turn a JSON sample into a Zod schema you can validate at runtime, derive TypeScript types from, and reuse in forms and tRPC. Free tool included.",
  keywords: [
    "json to zod",
    "convert json to zod schema",
    "zod from json",
    "json to zod typescript",
    "zod schema generator",
    "react hook form zod",
    "trpc zod input",
  ],
  alternates: { canonical: `${SITE.url}/guides/json-to-zod` },
  openGraph: {
    title: "How to convert JSON to a Zod schema — step by step",
    description:
      "Turn a JSON sample into a runtime-validated Zod schema and inferred TypeScript types in 5 minutes.",
    url: `${SITE.url}/guides/json-to-zod`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

const sampleJson = `{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "isAdmin": false,
  "tags": ["math", "engine"]
}`;

const generatedZod = `import { z } from "zod";

export const User = z.object({
  "id": z.number().int(),
  "name": z.string(),
  "email": z.string().optional(),
  "isAdmin": z.boolean(),
  "tags": z.array(z.string()),
});

export type User = z.infer<typeof User>;`;

const refinedZod = `import { z } from "zod";

export const User = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  isAdmin: z.boolean(),
  tags: z.array(z.string()).default([]),
});

export type User = z.infer<typeof User>;`;

const fetchExample = `import { User } from "./schemas";

export async function fetchUser(): Promise<User> {
  const res = await fetch("/api/me");
  const data = await res.json();
  return User.parse(data); // throws ZodError on shape mismatch
}`;

const formExample = `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "./schemas";

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(User),
  });
  return (
    <form onSubmit={handleSubmit((v) => console.log(v))}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}`;

const trpcExample = `import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const userRouter = router({
  create: publicProcedure
    .input(User.omit({ id: true })) // reuse the schema, drop the server-generated id
    .mutation(async ({ input }) => {
      // input is fully typed and runtime-validated
      return db.user.create({ data: input });
    }),
});`;

export default function GuideJsonToZod() {
  // HowTo + FAQ JSON-LD
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to convert JSON to a Zod schema",
    description: metadata.description,
    inLanguage: "en",
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: "Schemato JSON → Zod converter" }],
    step: [
      { "@type": "HowToStep", position: 1, name: "Get a representative JSON sample", text: "Copy a real response from your API, fixture, or webhook." },
      { "@type": "HowToStep", position: 2, name: "Generate the schema", text: "Paste it into the JSON → Zod converter and copy the output." },
      { "@type": "HowToStep", position: 3, name: "Refine field constraints", text: "Tighten types: positive integers, email format, required min length, default values." },
      { "@type": "HowToStep", position: 4, name: "Validate API responses", text: "Use schema.parse() at the boundary so bad data fails fast." },
      { "@type": "HowToStep", position: 5, name: "Reuse for forms and RPC", text: "Plug the same schema into React Hook Form, tRPC inputs, or your test fixtures." },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Do I need to learn Zod's API to use this?", acceptedAnswer: { "@type": "Answer", text: "No. The generator produces a working schema you can drop in. Reading the Zod docs only matters when you want to add custom rules like email format or min length." } },
      { "@type": "Question", name: "Will the schema include all my optional fields correctly?", acceptedAnswer: { "@type": "Answer", text: "Optional flags are inferred from the sample: a field is optional if its value is null. Real APIs often have more optional fields than a single sample reveals — review and add .optional() where appropriate." } },
      { "@type": "Question", name: "Should I use Zod or just TypeScript types?", acceptedAnswer: { "@type": "Answer", text: "Use Zod when you need runtime validation (parsing API responses, form inputs, env vars). Use plain TypeScript when the value already comes from a trusted, statically-typed source." } },
      { "@type": "Question", name: "Can I generate Zod from JSON Schema or OpenAPI instead?", acceptedAnswer: { "@type": "Answer", text: "Yes. Schemato has converters for JSON Schema → Zod and OpenAPI → Zod that handle $ref, oneOf, and required arrays." } },
    ],
  };

  return (
    <article className="container-x py-16 max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <span>Guides</span>
        <span className="mx-2">/</span>
        <span>JSON to Zod</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          How to convert JSON to a Zod schema
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">
          A 5-minute, copy-paste-friendly walkthrough: from a raw JSON sample to a
          schema you can validate, type, and reuse in forms and tRPC.
        </p>
        <p className="text-mute mt-2 text-sm">
          Need it now? Skip ahead to the{" "}
          <a className="text-accent hover:underline" href="/json-to-zod">
            JSON → Zod converter
          </a>
          .
        </p>
      </header>

      <hr className="border-border my-10" />

      <h2 className="text-2xl font-bold">Step 1 — Get a representative JSON sample</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Copy a real response from the network tab, a webhook fixture, or your test
        data. The schema is only as accurate as the sample you start from, so prefer
        a payload that includes optional fields and arrays you care about.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sampleJson}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 2 — Generate the schema</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Paste the sample into the{" "}
        <a className="text-accent hover:underline" href="/json-to-zod">
          JSON → Zod converter
        </a>
        . You&apos;ll get something like this:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{generatedZod}</pre>
      <p className="text-dim mt-3 leading-relaxed">
        Note the last line: <code className="text-accent2">z.infer&lt;typeof User&gt;</code> gives
        you a TypeScript type derived from the schema, so the type and the runtime
        validator can never drift apart.
      </p>

      <h2 className="text-2xl font-bold mt-12">Step 3 — Refine field constraints</h2>
      <p className="text-dim mt-2 leading-relaxed">
        The generator infers types but not business rules. Tighten the schema with
        Zod&apos;s built-in refinements:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{refinedZod}</pre>
      <ul className="mt-4 space-y-2 text-dim">
        <li>• <code className="text-accent2">.email()</code> — validate email format</li>
        <li>• <code className="text-accent2">.min(1)</code> / <code className="text-accent2">.max(100)</code> — enforce string length bounds</li>
        <li>• <code className="text-accent2">.positive()</code> / <code className="text-accent2">.int()</code> — number constraints</li>
        <li>• <code className="text-accent2">.default([])</code> — provide a value when the field is missing</li>
        <li>• <code className="text-accent2">.refine(v =&gt; ..., &quot;message&quot;)</code> — custom rules</li>
      </ul>

      <h2 className="text-2xl font-bold mt-12">Step 4 — Validate API responses</h2>
      <p className="text-dim mt-2 leading-relaxed">
        The biggest win from a Zod schema is catching shape changes the moment they
        happen. Use <code className="text-accent2">.parse()</code> when you expect
        valid data and want to fail loudly, or <code className="text-accent2">.safeParse()</code> when
        you want to handle the failure inline.
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{fetchExample}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 5 — Reuse the schema in forms</h2>
      <p className="text-dim mt-2 leading-relaxed">
        The same schema can drive client-side form validation. With{" "}
        <code className="text-accent2">@hookform/resolvers/zod</code> the integration is two lines:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{formExample}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 6 — Reuse in tRPC / API contracts</h2>
      <p className="text-dim mt-2 leading-relaxed">
        If you ship tRPC, pass the schema (or a transformed copy) directly as the
        procedure input. Same shape, same validator, same TypeScript types — end-to-end:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{trpcExample}</pre>

      <hr className="border-border my-12" />

      <h2 className="text-2xl font-bold">Common pitfalls</h2>
      <ul className="mt-4 space-y-3 text-dim">
        <li>
          • <strong className="text-text">Optionality is sample-dependent.</strong>{" "}
          A field is marked <code className="text-accent2">.optional()</code> only
          if its value was null in the sample. Real APIs often have more optional
          fields than one sample reveals.
        </li>
        <li>
          • <strong className="text-text">Integer vs number.</strong> Zod&apos;s{" "}
          <code className="text-accent2">.int()</code> is added when every numeric
          value in the sample was an integer. APIs that occasionally return floats
          will fail validation — drop <code className="text-accent2">.int()</code> if unsure.
        </li>
        <li>
          • <strong className="text-text">Empty arrays lose element type.</strong>{" "}
          An empty array becomes <code className="text-accent2">z.array(z.unknown())</code>.
          Provide a non-empty sample to get a useful element type.
        </li>
        <li>
          • <strong className="text-text">Don&apos;t over-validate.</strong>{" "}
          Validating an internal value that&apos;s already typed is a code smell.
          Use Zod at trust boundaries: HTTP responses, form inputs, env vars,
          message queue payloads.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-12">FAQ</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <div className="font-semibold">Do I need to learn Zod&apos;s API to use this?</div>
          <p className="text-dim mt-1">
            No. The generator produces a working schema you can drop in. Reading
            the Zod docs only matters when you want to add custom rules.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Will the schema include all my optional fields correctly?</div>
          <p className="text-dim mt-1">
            Optionality is inferred from the sample. Review the output and add{" "}
            <code className="text-accent2">.optional()</code> where appropriate.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Should I use Zod or just TypeScript types?</div>
          <p className="text-dim mt-1">
            Use Zod when you need runtime validation; use plain TypeScript when the
            value comes from a statically-typed source you already trust.
          </p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Can I generate Zod from JSON Schema or OpenAPI instead?</div>
          <p className="text-dim mt-1">
            Yes — use{" "}
            <a className="text-accent hover:underline" href="/json-schema-to-zod">JSON Schema → Zod</a>{" "}
            or{" "}
            <a className="text-accent hover:underline" href="/openapi-to-zod">OpenAPI → Zod</a>.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href="/json-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → Zod converter</div>
            <div className="text-xs text-mute">Paste a sample, get a schema</div>
          </a>
          <a href="/json-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON → TypeScript</div>
            <div className="text-xs text-mute">Just types, no runtime check</div>
          </a>
          <a href="/json-schema-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">JSON Schema → Zod</div>
            <div className="text-xs text-mute">When you have a contract</div>
          </a>
          <a href="/openapi-to-zod" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">OpenAPI → Zod</div>
            <div className="text-xs text-mute">From spec to validator</div>
          </a>
        </div>
      </section>
    </article>
  );
}
