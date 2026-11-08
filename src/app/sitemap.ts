import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@config/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticPages = ["", "/catalog", "/community", "/faq", "/contacts", "/privacy", "/terms"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));
  try {
    const products = await prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
    return [...staticPages, ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt }))];
  } catch {
    return staticPages;
  }
}
