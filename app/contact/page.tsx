import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Schemato for bug reports, conversion issues, feature requests, and documentation feedback.",
  alternates: { canonical: `${SITE.url}/contact` },
  openGraph: {
    title: `Contact · ${SITE.name}`,
    description: "How to report bugs, request conversions, and contact Schemato.",
    url: `${SITE.url}/contact`,
    type: "website",
  },
};

const CONTACT_OPTIONS = [
  {
    title: "Report a converter bug",
    body: "Wrong output, crash, parser failure, or a case the converter should handle better.",
    href: "https://github.com/weitaishan/schemato/issues/new?labels=bug&title=%5BBug%5D%20",
  },
  {
    title: "Request a conversion",
    body: "Ask for a missing input format, output language, guide, or edge case.",
    href: "https://github.com/weitaishan/schemato/issues/new?labels=new-converter&title=%5BNew%20conversion%5D%20",
  },
  {
    title: "Suggest documentation",
    body: "Point out unclear docs, missing examples, or a workflow that deserves a guide.",
    href: "https://github.com/weitaishan/schemato/issues/new?labels=documentation&title=%5BDocs%5D%20",
  },
];

export default function ContactPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <p className="text-dim text-sm uppercase tracking-widest">Contact</p>
      <h1 className="text-4xl font-bold tracking-tight mt-1">Contact Schemato</h1>
      <p className="text-dim mt-3 text-lg leading-relaxed">
        The fastest way to reach the project is through GitHub issues. Please
        include a small input/output example when reporting converter quality
        problems, but do not paste secrets or private production data.
      </p>

      <div className="mt-10 space-y-4">
        {CONTACT_OPTIONS.map((option) => (
          <a
            key={option.title}
            href={option.href}
            target="_blank"
            rel="noreferrer"
            className="card p-5 block hover:border-accent transition"
          >
            <h2 className="text-lg font-semibold">{option.title}</h2>
            <p className="text-dim mt-2 leading-relaxed">{option.body}</p>
            <span className="text-accent text-sm mt-3 inline-block">Open GitHub issue -&gt;</span>
          </a>
        ))}
      </div>

      <section className="mt-12 card p-5">
        <h2 className="text-lg font-semibold">For sensitive reports</h2>
        <p className="text-dim mt-2 leading-relaxed">
          Do not post secrets, credentials, or private payloads in a public issue.
          Open a minimal public issue first and describe the category of concern
          without including sensitive material.
        </p>
      </section>
    </div>
  );
}
