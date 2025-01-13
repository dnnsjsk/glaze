import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://glaze.dev/sitemap.xml",
    host: "https://glaze.dev",
  };
}
