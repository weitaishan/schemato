import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import TrackedLink from "@/components/TrackedLink";
import { AD_SLOTS } from "@/lib/ads";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Zod validation guide for API responses, forms, and env vars",
  description:
    "A practical Zod validation workflow: decide when runtime validation is needed, generate a schema from JSON, parse API responses, validate forms, and avoid common mistakes.",
  alternates: { canonical: `${SITE.url}/guides/zod-validation` },
  keywords: [
    "zod validation",
    "zod schema",
    "json to zod",
    "validate api response zod",
    "zod safeparse",
    "zod form validation",
  ],
  openGraph: {
    title: "Zod validation guide",
    description:
      "Use Zod where TypeScript stops: API responses, forms, env vars, webhooks, and other runtime boundaries.",
    url: `${SITE.url}/guides/zod-validation`,
    type: "article",
  },
};

const apiSchema = `import { z } from "zod";

const UserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email().optional(),
  roles: z.array(z.string()),
});

type User = z.infer<typeof UserSchema>;`;

const safeParseExample = `const result = UserSchema.safeParse(await response.json());

if (!result.success) {
  console.error(result.error.flatten());
  throw new Error("API returned an unexpected user shape");
}

const user = result.data;`;

const envExample = `const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  ENABLE_BILLING: z.enum(["true", "false"]).default("false"),
});

export const env = EnvSchema.parse(process.env);`;

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to use Zod validation in a TypeScript app",
  description: metadata.description,
  totalTime: "PT8M",
  inLanguage: "en",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Find the runtime boundary",
      text: "Use Zod when data crosses from an untrusted source into your app.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Generate or write a schema",
      text: "Start from real JSON if you have a sample, then tighten fields by hand.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Use parse or safeParse",
      text: "Use parse for fail-fast flows and safeParse when the user can recover.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Infer the TypeScript type",
      text: "Use z.infer so the runtime schema and static type stay in sync.",
    },
  ],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "When should I use Zod validation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use Zod when data arrives at runtime from an API, form, webhook, env var, local storage, or message queue. You usually do not need Zod for values already produced by trusted typed functions.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use parse or safeParse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use parse when invalid data should stop the flow immediately. Use safeParse when you need to show errors or recover without throwing.",
      },
    },
    {
      "@type": "Question",
      name: "Can I generate a Zod schema from JSON?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Generate the first draft from a representative JSON sample, then review optional fields, nullable fields, arrays, and custom rules.",
      },
    },
  ],
};

export default function ZodValidationGuide() {
  return (
    <div className="container-x py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <a href="/guides" className="hover:text-text">Guides</a>
        <span className="mx-2">/</span>
        <span>Zod validation</span>
      </nav>

      <article className="max-w-3xl">
        <header>
          <p className="text-dim text-sm uppercase tracking-widest">Zod validation</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
            Validate runtime data with Zod, then keep the TypeScript type in sync
          </h1>
          <p className="text-dim mt-3 text-lg leading-relaxed">
            TypeScript catches mistakes before code runs. Zod catches bad values
            after data crosses a runtime boundary: API responses, forms, env
            vars, webhooks, local storage, and message queues.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href="/json-to-zod"
              event="click_guide_tool_cta"
              params={{ guide: "zod_validation", cta: "json_to_zod" }}
              className="btn-primary"
            >
              Generate Zod from JSON
            </TrackedLink>
            <TrackedLink
              href="/guides/json-to-zod"
              event="click_guide_tool_cta"
              params={{ guide: "zod_validation", cta: "json_to_zod_guide" }}
              className="btn-ghost"
            >
              Read JSON to Zod workflow
            </TrackedLink>
          </div>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Start with the boundary, not the library</h2>
          <p className="text-dim mt-2 leading-relaxed">
            Zod is most valuable where your app stops controlling the shape of
            data. A fetch response, a form submission, a webhook payload, and an
            env var all look typed in your editor only after you prove they are
            valid at runtime.
          </p>
          <ul className="mt-4 space-y-2 text-dim">
            <li>• Use Zod for untrusted runtime input.</li>
            <li>• Skip Zod for values already created by your own typed code.</li>
            <li>• Generate a first draft when you have JSON, then tighten rules by hand.</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Generate the first schema from real JSON</h2>
          <p className="text-dim mt-2 leading-relaxed">
            A generated schema is a starting point, not a contract. Use a real
            payload with nested objects, arrays, nulls, and optional-looking
            fields. If the API returns multiple variants, paste multiple samples
            into the JSON to Zod converter and review optional fields carefully.
          </p>
          <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{apiSchema}</pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Use safeParse for recoverable errors</h2>
          <p className="text-dim mt-2 leading-relaxed">
            `parse()` throws. That is useful when invalid data should stop the
            flow. `safeParse()` returns a result object, which is better for UI
            validation, logging, and graceful fallback.
          </p>
          <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{safeParseExample}</pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Validate env vars before the app boots</h2>
          <p className="text-dim mt-2 leading-relaxed">
            Env vars are strings at runtime, and missing values often fail late.
            A small Zod schema makes configuration errors loud during startup.
          </p>
          <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{envExample}</pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Common mistakes</h2>
          <div className="mt-4 space-y-3">
            <div className="card p-4">
              <div className="font-semibold">Trusting one sample too much</div>
              <p className="text-dim mt-1">
                One JSON sample proves what appeared once. It does not prove
                which fields can be omitted, null, or variant-shaped in production.
              </p>
            </div>
            <div className="card p-4">
              <div className="font-semibold">Validating too deep inside the app</div>
              <p className="text-dim mt-1">
                Validate at the boundary, then pass typed data inward. Revalidating
                every internal function call adds noise without much safety.
              </p>
            </div>
            <div className="card p-4">
              <div className="font-semibold">Forgetting custom rules</div>
              <p className="text-dim mt-1">
                Generation can infer strings and numbers. You still need to add
                rules like `.email()`, `.url()`, `.min()`, `.int()`, and domain
                constraints.
              </p>
            </div>
          </div>
        </section>

        <AdSlot slot={AD_SLOTS.guideBottomBeforeRelated} className="mt-12" />

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Related tools and guides</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TrackedLink
              href="/json-to-zod"
              event="click_related"
              params={{ from: "guide", to: "json_to_zod" }}
              className="card p-4 hover:border-accent transition block"
            >
              <div className="font-semibold">JSON to Zod converter</div>
              <p className="text-dim text-sm mt-1">Paste JSON and generate a Zod schema.</p>
            </TrackedLink>
            <TrackedLink
              href="/json-schema-to-zod"
              event="click_related"
              params={{ from: "guide", to: "json_schema_to_zod" }}
              className="card p-4 hover:border-accent transition block"
            >
              <div className="font-semibold">JSON Schema to Zod converter</div>
              <p className="text-dim text-sm mt-1">Use a formal schema when you have one.</p>
            </TrackedLink>
            <TrackedLink
              href="/openapi-to-zod"
              event="click_related"
              params={{ from: "guide", to: "openapi_to_zod" }}
              className="card p-4 hover:border-accent transition block"
            >
              <div className="font-semibold">OpenAPI to Zod converter</div>
              <p className="text-dim text-sm mt-1">Generate validation from API contracts.</p>
            </TrackedLink>
            <TrackedLink
              href="/guides/json-to-zod"
              event="click_related"
              params={{ from: "guide", to: "json_to_zod_guide" }}
              className="card p-4 hover:border-accent transition block"
            >
              <div className="font-semibold">JSON to Zod workflow</div>
              <p className="text-dim text-sm mt-1">A step-by-step schema generation guide.</p>
            </TrackedLink>
          </div>
        </section>
      </article>
    </div>
  );
}
