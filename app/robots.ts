import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Required by Next.js when using `output: "export"` for special files.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
