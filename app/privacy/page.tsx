import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Schemato, including browser-only conversion, analytics, GitHub issue links, and future advertising disclosures.",
  alternates: { canonical: `${SITE.url}/privacy` },
  openGraph: {
    title: `Privacy Policy · ${SITE.name}`,
    description: "How Schemato handles pasted inputs, analytics, and external services.",
    url: `${SITE.url}/privacy`,
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <p className="text-dim text-sm uppercase tracking-widest">Privacy</p>
      <h1 className="text-4xl font-bold tracking-tight mt-1">Privacy Policy</h1>
      <p className="text-dim mt-3">Last updated: May 28, 2026</p>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Browser-only conversion</h2>
        <p>
          Schemato runs conversions in your browser. The schemas, payloads, or
          snippets you paste into the converter are not uploaded to a Schemato
          conversion API.
        </p>
        <p>
          You should still avoid pasting secrets, passwords, private keys, access
          tokens, production customer data, or other sensitive information into
          any online tool unless you are comfortable handling that data in your
          browser session.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Analytics</h2>
        <p>
          Schemato uses Google Analytics 4 to understand aggregate product usage:
          page views, converter pairs, successful conversions, copy actions,
          guide clicks, outbound GitHub clicks, searches, and similar product
          events.
        </p>
        <p>
          These analytics events are intended to measure how the public site is
          used. Schemato does not intentionally send the pasted input or generated
          output as analytics event data.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">External services</h2>
        <p>
          Links to GitHub, Dev.to, X, or other external sites are governed by the
          policies of those services. If you open a GitHub issue from Schemato,
          the information you submit in that issue may become public.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Advertising</h2>
        <p>
          Schemato does not currently show ads inside the conversion workspace.
          If advertising is added in the future, the converter input and output
          areas will remain focused on the tool experience, and this policy will
          be updated with the relevant advertising and cookie disclosures.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-dim leading-relaxed">
        <h2 className="text-2xl font-bold text-text">Contact</h2>
        <p>
          For privacy questions or data concerns, open an issue on{" "}
          <a
            href="https://github.com/weitaishan/schemato/issues"
            className="text-accent hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          . Do not include private credentials or sensitive payloads in public
          issues.
        </p>
      </section>
    </div>
  );
}
