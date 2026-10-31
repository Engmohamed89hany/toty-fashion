import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl.toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/about", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
