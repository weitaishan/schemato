import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Schemato, a browser-only schema converter for JSON, JSON Schema, OpenAPI, GraphQL, SQL, Protobuf, Prisma, Mongoose, Avro, and TypeScript.",
  alternates: { canonical: `${SITE.url}/about` },
  openGraph: {
    title: `About · ${SITE.name}`,
    description: "Why Schemato exists and how the browser-only converter works.",
    url: `${SITE.url}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <p className="text-dim text-sm uppercase tracking-widest">About</p>
      <h1 className="text-4xl font-bold tracking-tight mt-1">About Schemato</h1>
      <p className="text-dim mt-3 text-lg leading-relaxed">
        Schemato is a free, open source converter for turning schemas and sample
        payloads into typed code. It is built for developers who need a fast
        starting point for TypeScript, Zod, Pydantic, Go structs, Rust structs,
        Swift, Kotlin, Java records, C# records, Dart, PHP, Ruby, Yup, and Joi.
      </p>

      <section className="mt-12 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Why it exists</h2>
        <p>
          Many teams copy API responses, OpenAPI schemas, SQL table definitions,
          or GraphQL types into application code by hand. That works once, but it
          becomes slow and error-prone when projects span multiple languages.
        </p>
        <p>
          Schemato focuses on the small workflow between a heavy code generator
          and manual typing: paste one representative input, review the generated
          output, then copy it into your project and adjust the details that only
          your codebase knows.
        </p>
      </section>

      <section className="mt-12 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">How it works</h2>
        <p>
          Conversion runs in your browser. The site uses a small parser to turn
          inputs into an intermediate Shape model, then renders that shape into
          the selected output language. This keeps the project small enough to
          inspect and extend without a backend conversion service.
        </p>
        <p>
          The source code is public on{" "}
          <a
            href="https://github.com/weitaishan/schemato"
            className="text-accent hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          . Feature requests, bug reports, and converter quality issues are best
          opened there so examples can be tracked.
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold">Browser-only conversion</h2>
          <p className="text-dim mt-2 leading-relaxed">
            Pasted schemas and payloads are processed locally in the browser and
            are not sent to a conversion API.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Open source</h2>
          <p className="text-dim mt-2 leading-relaxed">
            The parser and renderer code lives in the public repository so the
            generated output can be inspected and improved.
          </p>
        </div>
      </section>
    </div>
  );
}
