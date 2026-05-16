// 生成 RSS 2.0 feed，包含 changelog 和 guides。
// 静态路由处理器（output: export 兼容）

import { ENTRIES } from "@/lib/changelog";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

interface FeedItem {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
  guid: string;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const GUIDES_FEED: FeedItem[] = [
  {
    title: "How to convert JSON to a Zod schema",
    link: `${SITE.url}/guides/json-to-zod`,
    pubDate: new Date("2026-05-16T10:00:00Z"),
    description:
      "From a raw JSON sample to a validated, typed schema you can reuse in fetch, forms, and tRPC.",
    guid: `${SITE.url}/guides/json-to-zod`,
  },
  {
    title: "How to turn JSON Schema into Pydantic v2 models",
    link: `${SITE.url}/guides/json-schema-to-pydantic`,
    pubDate: new Date("2026-05-16T11:00:00Z"),
    description:
      "Walk a JSON Schema (with $ref, required, oneOf) into Pydantic v2 models you can drop straight into FastAPI handlers.",
    guid: `${SITE.url}/guides/json-schema-to-pydantic`,
  },
];

export function GET() {
  const changelogItems: FeedItem[] = ENTRIES.map((e) => ({
    title: e.title,
    link: `${SITE.url}/changelog#${e.date}`,
    pubDate: new Date(`${e.date}T09:00:00Z`),
    description: e.bullets.join(" · "),
    guid: `${SITE.url}/changelog#${e.date}-${e.title.replace(/\W+/g, "-").toLowerCase()}`,
  }));

  const items: FeedItem[] = [...GUIDES_FEED, ...changelogItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );

  const lastBuildDate = items[0]?.pubDate ?? new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escape(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (it) => `    <item>
      <title>${escape(it.title)}</title>
      <link>${it.link}</link>
      <guid isPermaLink="false">${escape(it.guid)}</guid>
      <pubDate>${it.pubDate.toUTCString()}</pubDate>
      <description>${escape(it.description)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
