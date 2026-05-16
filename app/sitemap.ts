import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { allConversions, INPUT_FORMATS, FORMATS } from "@/lib/formats";
import { hasConverter } from "@/lib/converters";
import { pathFor } from "@/lib/url";

export const dynamic = "force-static";

/**
 * 把 sitemap 拆成多个：
 *   id = -1：首页 + changelog 等"meta"页面
 *   id = 0..(INPUT_FORMATS.length - 1)：每个输入格式一个 sitemap
 *
 * Next.js 会自动为每个 id 生成 sitemap-{id}.xml，
 * 并自动在 /sitemap.xml 处生成 sitemap index。
 */
export async function generateSitemaps() {
  return [{ id: "core" as const }, ...INPUT_FORMATS.map((_, i) => ({ id: i }))];
}

interface Params {
  id: number | "core";
}

export default function sitemap({ id }: Params): MetadataRoute.Sitemap {
  const now = new Date();

  if (id === "core") {
    return [
      { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
      { url: `${SITE.url}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
      { url: `${SITE.url}/compare/quicktype`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      ...INPUT_FORMATS.map((fid) => ({
        url: `${SITE.url}/format/${FORMATS[fid].slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  }

  const inputId = INPUT_FORMATS[id];
  if (!inputId) return [];

  return allConversions()
    .filter((c) => c.from === inputId)
    .map((c) => ({
      url: `${SITE.url}${pathFor(c.from, c.to)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: hasConverter(c.from, c.to) ? 0.8 : 0.4,
    }));
}
