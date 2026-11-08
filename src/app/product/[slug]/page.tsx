import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelated } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { FavoriteButton } from "@/components/catalog/FavoriteButton";
import { ProductCard } from "@/components/catalog/ProductCard";
import { siteConfig } from "@config/site";

export const dynamic = "force-dynamic";
type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: "Товар не найден" };
  return { title: p.name, description: p.description, openGraph: { title: p.name, description: p.description, images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();
  const related = product.category ? await getRelated(product.category.slug, product.id) : [];
  const out = product.stock <= 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
  };

  return (
    <div className="container-bw pb-8 pt-6 lg:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Навигация" className="meta mb-6">
        <Link href="/catalog" className="hover:text-bw-silver">Каталог</Link>
        {product.category && <> / <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-bw-silver">{product.category.name}</Link></>}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-3">
          <div className="hairline relative aspect-[4/5] overflow-hidden bg-bw-graphite">
            <ProductImage src={product.images[0]} alt={product.name} sizes="(max-width:1024px) 100vw, 50vw" priority />
          </div>
          {product.images.length > 1 && (
            <ul className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((src) => (
                <li key={src} className="hairline relative aspect-square overflow-hidden bg-bw-graphite">
                  <ProductImage src={src} alt={product.name} sizes="120px" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="chrome-text font-display text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em]">{product.name}</h1>
          <div className="mt-5 flex items-center gap-4">
            <span className="font-display text-3xl font-bold">{formatPrice(product.priceCents, product.currency)}</span>
            <span className={`meta px-2 py-1 ${out ? "bg-bw-steel" : "bg-bw-graphite text-bw-chrome"}`}>
              {out ? "Нет в наличии" : product.stock <= 5 ? `Осталось ${product.stock}` : "В наличии"}
            </span>
          </div>
          <p className="mt-6 leading-relaxed text-bw-chrome">{product.description}</p>
          {product.details && <p className="mt-4 text-sm leading-relaxed text-bw-mute">{product.details}</p>}

          <div className="mt-8 flex items-center gap-3">
            <AddToCartButton product={product} openCart className="flex-1" />
            <FavoriteButton product={product} className="hairline" />
          </div>

          <ul className="meta mt-8 space-y-2 border-t border-bw-steel pt-6">
            <li>Только для лиц {siteConfig.legal.minAge}+</li>
            <li>Не содержит никотина</li>
            <li>Демо-режим: оплата не принимается</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="rel">
          <h2 id="rel" className="chrome-text mb-8 font-display text-3xl font-bold uppercase tracking-tight">Ещё из коллекции</h2>
          <ul className="grid grid-cols-1 gap-x-3 gap-y-8 xs:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => <li key={p.id}><ProductCard product={p} index={i} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
