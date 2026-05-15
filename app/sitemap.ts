import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { allConversions } from "@/lib/formats";
import { hasConverter } from "@/lib/converters";
import { pathFor } from "@/lib/url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    ...allConversions().map((c) => {
      const live = hasConverter(c.from, c.to);
      return {
        url: `${SITE.url}${pathFor(c.from, c.to)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        // Live 页面权重更高（Google 看到工具真实可用），Preview 页面降低权重避免占资源
        priority: live ? 0.8 : 0.4,
      };
    }),
  ];
}
