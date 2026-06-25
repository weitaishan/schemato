import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE } from "@/lib/site";
import BugReporter from "@/components/BugReporter";
import TrackedLink from "@/components/TrackedLink";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  generator: "Next.js",
  keywords: [
    "json to typescript",
    "json to zod",
    "zod validation",
    "zod schema",
    "json schema to zod",
    "json to pydantic",
    "json to go struct",
    "json to rust struct",
    "json schema to typescript",
    "typescript to zod",
    "openapi typescript",
    "openapi pydantic",
    "graphql to typescript",
    "schema converter",
    "type generator",
    "code generator",
    "developer tool",
  ],
  verification: {
    google: "E5Y2XW51q7GwmHWk7XP_P9Z3pTFrZ7sNmG_N1kL000M",
  },
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/og.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE.name} — changelog & guides`}
          href="/rss.xml"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text">
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
          `}
        </Script>

        <header className="border-b border-border">
          <div className="container-x flex flex-wrap items-center justify-between gap-3 py-4">
            <a href="/" className="font-bold text-lg tracking-tight">
              <span className="text-accent">{"{ }"}</span>{" "}
              <span>{SITE.name}</span>
            </a>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-dim">
              <a href="/#converters" className="hover:text-text">All converters</a>
              <a href="/guides" className="hover:text-text">Guides</a>
              <a href="/changelog" className="hover:text-text">Changelog</a>
              <TrackedLink
                href="https://github.com/weitaishan/schemato"
                target="_blank"
                rel="noreferrer"
                event="click_github"
                params={{ location: "header" }}
                className="hover:text-text"
              >
                GitHub
              </TrackedLink>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <BugReporter repoIssuesUrl="https://github.com/weitaishan/schemato/issues" />
        <footer className="border-t border-border mt-24">
          <div className="container-x py-10 text-sm text-mute flex flex-wrap items-center justify-between gap-3">
            <div>
              © {new Date().getFullYear()} {SITE.name} · Browser-only conversion. Inputs stay in your browser.
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a href="/" className="hover:text-text">Home</a>
              <a href="/about" className="hover:text-text">About</a>
              <a href="/guides" className="hover:text-text">Guides</a>
              <a href="/changelog" className="hover:text-text">Changelog</a>
              <a href="/privacy" className="hover:text-text">Privacy</a>
              <a href="/terms" className="hover:text-text">Terms</a>
              <a href="/contact" className="hover:text-text">Contact</a>
              <a href="/compare/quicktype" className="hover:text-text">vs quicktype</a>
              <a href="/compare/json2ts" className="hover:text-text">vs json2ts</a>
              <a href="/sitemap.xml" className="hover:text-text">Sitemap</a>
              <TrackedLink
                href="https://github.com/weitaishan/schemato"
                target="_blank"
                rel="noreferrer"
                event="click_github"
                params={{ location: "footer" }}
                className="hover:text-text"
              >
                GitHub
              </TrackedLink>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
