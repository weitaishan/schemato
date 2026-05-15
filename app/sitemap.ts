import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { allConversions } from "@/lib/formats";
import { pathFor } from "@/lib/url";

// Required by Next.js when using `output: "export"` for special files.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...allConversions().map((c) => ({
      url: `${SITE.url}${pathFor(c.from, c.to)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
