import type { Metadata } from "next";
import { ENTRIES, ROADMAP } from "@/lib/changelog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Changelog & roadmap",
  description: `${SITE.name} is built in public. See what shipped, when, and what's next.`,
  alternates: { canonical: `${SITE.url}/changelog` },
  openGraph: {
    title: `${SITE.name} · Changelog & roadmap`,
    description: `Built in public. Every shipped feature, every upcoming one.`,
    url: `${SITE.url}/changelog`,
    type: "article",
  },
};

const TAG_STYLES: Record<string, string> = {
  feat: "border-accent text-accent",
  fix: "border-[#fbbf24] text-[#fbbf24]",
  docs: "border-accent2 text-accent2",
  perf: "border-[#a78bfa] text-[#a78bfa]",
  release: "border-[#4ade80] text-[#4ade80]",
  ux: "border-[#f472b6] text-[#f472b6]",
};

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  shipped: { label: "Shipped", cls: "border-[#1f4a2a] bg-[#142b1c] text-[#4ade80]" },
  doing: { label: "In progress", cls: "border-[#5a4a1a] bg-[#2a221a] text-[#fbbf24]" },
  next: { label: "Up next", cls: "border-[#2a3656] bg-[#1a2238] text-accent" },
  later: { label: "Later", cls: "border-border bg-panel2 text-mute" },
};

export default function ChangelogPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <p className="text-dim text-sm uppercase tracking-widest">Build in public</p>
      <h1 className="text-4xl font-bold tracking-tight mt-1">Changelog &amp; roadmap</h1>
      <p className="text-dim mt-3">
        {SITE.name} is built in public. This page is updated whenever something
        ships. If you want to follow along, the GitHub repo also has every commit.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Roadmap</h2>
        <ul className="mt-4 space-y-2">
          {ROADMAP.map((r, i) => {
            const s = STATUS_STYLES[r.status];
            return (
              <li key={i} className="flex items-start gap-3">
                <span className={`pill shrink-0 mt-0.5 ${s.cls}`}>{s.label}</span>
                <span className="text-dim">{r.text}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Changelog</h2>
        <div className="mt-6 space-y-6">
          {ENTRIES.map((e, i) => (
            <article key={i} className="card p-5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 className="text-lg font-semibold">{e.title}</h3>
                <time className="text-xs text-mute font-mono shrink-0">{e.date}</time>
              </div>
              {e.tags && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {e.tags.map((t) => (
                    <span key={t} className={`pill ${TAG_STYLES[t] ?? ""}`}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <ul className="mt-3 space-y-1.5 text-dim">
                {e.bullets.map((b, j) => (
                  <li key={j} className="leading-relaxed">
                    • <span dangerouslySetInnerHTML={{ __html: renderInline(b) }} />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 text-dim">
        <p>
          Want to suggest a feature? Open an issue on{" "}
          <a
            className="text-accent hover:underline"
            href="https://github.com/weitaishan/schemato/issues"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}

/** 极简的内联 markdown：`code` 和 <link> */
function renderInline(s: string): string {
  // 转义基础
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // <https://...>
  const linkified = escaped.replace(
    /&lt;(https?:\/\/[^\s&]+)&gt;/g,
    '<a class="text-accent hover:underline" href="$1" target="_blank" rel="noreferrer">$1</a>',
  );
  // `code`
  return linkified.replace(
    /`([^`]+)`/g,
    '<code class="bg-panel2 text-accent2 px-1.5 py-0.5 rounded text-[12px] font-mono">$1</code>',
  );
}
