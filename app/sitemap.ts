import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { allConversions, INPUT_FORMATS, FORMATS } from "@/lib/formats";
import { hasConverter } from "@/lib/converters";
import { pathFor } from "@/lib/url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/compare/quicktype`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/compare/json2ts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/compare/transform-tools`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/guides/json-to-typescript`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/guides/json-to-zod`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/guides/json-to-go-struct`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/guides/json-schema-to-pydantic`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/guides/openapi-to-typescript`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/guides/sql-to-go-struct`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const formatPages: MetadataRoute.Sitemap = INPUT_FORMATS.map((fid) => ({
    url: `${SITE.url}/format/${FORMATS[fid].slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const converterPages: MetadataRoute.Sitemap = allConversions().map((c) => ({
    url: `${SITE.url}${pathFor(c.from, c.to)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: hasConverter(c.from, c.to) ? 0.8 : 0.4,
  }));

  return [...corePages, ...formatPages, ...converterPages];
}
