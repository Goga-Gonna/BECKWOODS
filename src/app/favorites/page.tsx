"use client";

import Link from "next/link";
import { useFavorites } from "@/store/favorites";
import { useHydrated } from "@/lib/device";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { FavoriteButton } from "@/components/catalog/FavoriteButton";
import { ButtonLink } from "@/components/ui/Button";
import type { ProductDTO } from "@/components/catalog/types";

export default function FavoritesPage() {
  const hydrated = useHydrated();
  const items = useFavorites((s) => s.items);

  return (
    <div className="container-bw pb-8 pt-8 lg:pt-14">
      <p className="meta">/ Favorites</p>
      <h1 className="chrome-text mt-3 font-display text-[clamp(2.4rem,10vw,7rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">Избранное</h1>

      {hydrated && items.length === 0 ? (
        <div className="mt-10">
          <p className="text-bw-mute">Здесь пока пусто. Нажмите на сердечко у товара.</p>
          <ButtonLink href="/catalog" className="mt-6 max-w-xs">В каталог</ButtonLink>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-x-3 gap-y-8 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {hydrated &&
            items.map((i) => {
              // Снимок из избранного: актуальные цена и остаток подтягиваются при добавлении в корзину на странице товара.
              const dto: ProductDTO = { id: i.productId, slug: i.slug, name: i.name, description: "", priceCents: i.priceCents, currency: "USD", stock: i.stock, images: i.image ? [i.image] : [], tags: [] };
              return (
                <li key={i.productId} className="min-w-0">
                  <Link href={`/product/${i.slug}`} className="block">
                    <div className="hairline relative aspect-[4/5] overflow-hidden bg-bw-graphite"><ProductImage src={i.image} alt={i.name} /></div>
                    <div className="mt-3 flex justify-between gap-3">
                      <h3 className="font-display font-bold uppercase leading-tight tracking-tight">{i.name}</h3>
                      <span className="font-mono text-sm">{formatPrice(i.priceCents)}</span>
                    </div>
                  </Link>
                  <div className="mt-3 flex gap-2">
                    <AddToCartButton product={dto} compact className="min-w-0 flex-1 px-3" />
                    <FavoriteButton product={dto} className="hairline" />
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
