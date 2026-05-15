import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

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
    "json to pydantic",
    "json to go struct",
    "json to rust struct",
    "json schema to typescript",
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
  "@type": "WebApplication",
  name: SITE.name,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  url: SITE.url,
  description: SITE.description,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isAccessibleForFree: true,
  inLanguage: "en",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text">
        <header className="border-b border-border">
          <div className="container-x flex items-center justify-between py-4">
            <a href="/" className="font-bold text-lg tracking-tight">
              <span className="text-accent">{"{ }"}</span>{" "}
              <span>{SITE.name}</span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-dim">
              <a href="/#converters" className="hover:text-text">All converters</a>
              <a
                href="https://github.com/weitaishan/schemato"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-border mt-24">
          <div className="container-x py-10 text-sm text-mute flex flex-wrap items-center justify-between gap-3">
            <div>
              © {new Date().getFullYear()} {SITE.name} · Browser-only, no data leaves your machine.
            </div>
            <div className="flex gap-4">
              <a href="/" className="hover:text-text">Home</a>
              <a href="/sitemap.xml" className="hover:text-text">Sitemap</a>
              <a
                href="https://github.com/weitaishan/schemato"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
