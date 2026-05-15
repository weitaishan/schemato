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
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    url: SITE.url,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
                href="https://github.com"
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
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
