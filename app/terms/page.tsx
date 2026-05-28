import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for Schemato, a free browser-only schema conversion tool.",
  alternates: { canonical: `${SITE.url}/terms` },
  openGraph: {
    title: `Terms of Use · ${SITE.name}`,
    description: "Terms for using Schemato's browser-only conversion tools.",
    url: `${SITE.url}/terms`,
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <p className="text-dim text-sm uppercase tracking-widest">Terms</p>
      <h1 className="text-4xl font-bold tracking-tight mt-1">Terms of Use</h1>
      <p className="text-dim mt-3">Last updated: May 28, 2026</p>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Use of the tool</h2>
        <p>
          Schemato is provided as a developer utility for generating starting
          points from schemas and sample payloads. You are responsible for
          reviewing generated code before using it in production.
        </p>
        <p>
          Generated output may need manual adjustment for your framework,
          validation rules, naming conventions, optional fields, numeric ranges,
          security requirements, or API edge cases.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">No warranty</h2>
        <p>
          The site is provided as is, without warranties of accuracy, availability,
          merchantability, fitness for a particular purpose, or non-infringement.
          Use it at your own discretion.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Input responsibility</h2>
        <p>
          Do not paste secrets, private keys, passwords, access tokens, or
          sensitive production data into the tool or public issue templates.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Open source</h2>
        <p>
          The Schemato codebase is published on GitHub. Contributions, bug
          reports, and feature requests are welcome, but project maintainers may
          choose whether and when to accept changes.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Changes</h2>
        <p>
          These terms may be updated as the site changes. Continued use of the
          site after an update means you accept the revised terms.
        </p>
      </section>
    </div>
  );
}
