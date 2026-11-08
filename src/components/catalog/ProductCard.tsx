import Link from "next/link";
import clsx from "clsx";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";
import { AddToCartButton } from "./AddToCartButton";
import { FavoriteButton } from "./FavoriteButton";
import type { ProductDTO } from "./types";

export function ProductCard({ product, index = 0, priority = false }: { product: ProductDTO; index?: number; priority?: boolean }) {
  const out = product.stock <= 0;
  const low = !out && product.stock <= 5;

  return (
    <article className="group relative flex min-w-0 flex-col">
      <Link href={`/product/${product.slug}`} className="block" aria-label={product.name}>
        <div className="hairline relative aspect-[4/5] overflow-hidden bg-bw-graphite">
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-bw group-hover:scale-[1.06]">
            <ProductImage src={product.images[0]} alt={product.name} priority={priority} />
          </div>

          {/* хромовый блик по hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1100ms] ease-bw group-hover:translate-x-full"
          />

          <span className="meta absolute left-3 top-3 bg-bw-black/70 px-2 py-1 text-bw-chrome backdrop-blur">
            № {String(index + 1).padStart(3, "0")}
          </span>

          <span
            className={clsx(
              "absolute bottom-3 left-3 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
              out ? "bg-bw-steel text-bw-mute" : low ? "bg-bw-ice/15 text-bw-ice" : "bg-bw-black/70 text-bw-chrome",
            )}
          >
            {out ? "Нет в наличии" : low ? `Осталось ${product.stock}` : "В наличии"}
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-display text-base font-bold uppercase leading-tight tracking-tight sm:text-lg">
            {product.name}
          </h3>
          <span className="shrink-0 font-mono text-sm">{formatPrice(product.priceCents, product.currency)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-bw-mute sm:text-sm">{product.description}</p>
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <AddToCartButton product={product} compact className="min-w-0 flex-1 px-3" />
        <FavoriteButton product={product} className="hairline shrink-0" />
      </div>
    </article>
  );
}
