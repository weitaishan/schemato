import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FORMATS,
  allConversions,
  type FormatId,
} from "@/lib/formats";
import { hasConverter } from "@/lib/converters";
import { buildSeoCopy } from "@/lib/seo-copy";
import ConverterShell from "@/components/ConverterShell";
import { pathFor } from "@/lib/url";
import { SITE } from "@/lib/site";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

function parseSlug(slug: string): { from: FormatId; to: FormatId } | null {
  for (const c of allConversions()) {
    const expected = `${FORMATS[c.from].slug}-to-${FORMATS[c.to].slug}`;
    if (expected === slug) return c;
  }
  return null;
}

export async function generateStaticParams() {
  return allConversions().map((c) => ({
    slug: `${FORMATS[c.from].slug}-to-${FORMATS[c.to].slug}`,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const pair = parseSlug(slug);
  if (!pair) return { title: "Not found" };
  const seo = buildSeoCopy(pair.from, pair.to);
  const url = `${SITE.url}${pathFor(pair.from, pair.to)}`;
  const f = FORMATS[pair.from];
  const t = FORMATS[pair.to];
  return {
    title: seo.title,
    description: seo.description,
    keywords: [
      `${f.name.toLowerCase()} to ${t.name.toLowerCase()}`,
      `${f.name.toLowerCase()} ${t.name.toLowerCase()} converter`,
      `convert ${f.name.toLowerCase()} to ${t.name.toLowerCase()}`,
      `${f.name.toLowerCase()} ${t.name.toLowerCase()} generator`,
      `free ${t.name.toLowerCase()} generator`,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      type: "website",
      images: [{ url: "/og.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/og.svg"],
    },
  };
}

export default async function ConverterPage({ params }: RouteParams) {
  const { slug } = await params;
  const pair = parseSlug(slug);
  if (!pair) notFound();

  const from = FORMATS[pair.from];
  const to = FORMATS[pair.to];
  const available = hasConverter(pair.from, pair.to);
  const seo = buildSeoCopy(pair.from, pair.to);
  const url = `${SITE.url}${pathFor(pair.from, pair.to)}`;

  // 推荐 8 个相关转换
  const related = [
    ...allConversions()
      .filter((c) => c.from === pair.from && c.to !== pair.to)
      .slice(0, 4),
    ...allConversions()
      .filter((c) => c.to === pair.to && c.from !== pair.from)
      .slice(0, 4),
  ].slice(0, 8);

  // ---- JSON-LD ----
  // 用 HowTo 取代 SoftwareApplication：HowTo 不要求 aggregateRating，
  // 且每个转换页本身就是"如何把 X 转成 Y"，语义匹配更自然。
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to convert ${from.name} to ${to.name}`,
    description: seo.description,
    totalTime: "PT1M",
    inLanguage: "en",
    tool: [{ "@type": "HowToTool", name: `${SITE.name} ${from.name} to ${to.name} converter` }],
    step: seo.howSteps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Step ${i + 1}`,
      text: s,
    })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: `${from.name} converters`, item: SITE.url },
      { "@type": "ListItem", position: 3, name: seo.h1, item: url },
    ],
  };

  return (
    <div className="container-x py-12">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <span>{seo.h1}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{seo.h1}</h1>
        <p className="text-dim mt-2 text-lg">{seo.subhead}</p>
      </header>

      <ConverterShell from={from} to={to} initialSample={from.sample} available={available} />

      <article className="mt-12 prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold">About this converter</h2>
        <p className="text-dim mt-2 leading-relaxed">{seo.intro}</p>

        <h2 className="text-2xl font-bold mt-10">
          Why convert {from.name} to {to.name}
        </h2>
        <ul className="mt-2 space-y-2 text-dim">
          {seo.whyBullets.map((b, i) => (
            <li key={i}>• {b}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold mt-10">How to use</h2>
        <ol className="mt-2 space-y-2 text-dim list-decimal pl-6">
          {seo.howSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        <h2 className="text-2xl font-bold mt-10">Common pitfalls</h2>
        <ul className="mt-2 space-y-2 text-dim">
          {seo.pitfalls.map((p, i) => (
            <li key={i}>• {p}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold mt-10">FAQ</h2>
        <div className="mt-2 space-y-4">
          {seo.faq.map((f, i) => (
            <div key={i} className="card p-4">
              <div className="font-semibold">{f.q}</div>
              <div className="text-dim mt-1">{f.a}</div>
            </div>
          ))}
        </div>
      </article>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Related converters</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {related.map((r) => {
            const f = FORMATS[r.from];
            const t = FORMATS[r.to];
            return (
              <a
                key={`${r.from}-${r.to}`}
                href={pathFor(r.from, r.to)}
                className="card px-3 py-3 hover:border-accent transition"
              >
                <div className="text-sm font-medium">{f.name} → {t.name}</div>
                <div className="text-xs text-mute">{hasConverter(r.from, r.to) ? "Live" : "Preview"}</div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
