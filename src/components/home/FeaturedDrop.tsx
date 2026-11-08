import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductDTO } from "@/components/catalog/types";
import { Reveal } from "@/components/ui/Reveal";

export function FeaturedDrop({ products }: { products: ProductDTO[] }) {
  return (
    <section className="py-16 lg:py-24" aria-labelledby="drop">
      <div className="container-bw">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="meta">/ Drop 01</p>
            <h2 id="drop" className="chrome-text mt-3 font-display text-[clamp(2rem,7vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em]">
              Featured
            </h2>
          </div>
          <Link href="/catalog" className="meta touch hidden items-center border-b border-bw-chrome/40 hover:text-bw-silver sm:flex">
            Весь каталог →
          </Link>
        </Reveal>
      </div>

      {products.length === 0 ? (
        <div className="container-bw mt-10 text-bw-mute">
          Товары появятся здесь после запуска базы данных и выполнения <code className="font-mono">npm run db:seed</code>.
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto scrollbar-none max-lg:snap-x max-lg:snap-mandatory lg:overflow-visible">
          <ul className="container-bw flex gap-4 lg:grid lg:grid-cols-4">
            {products.map((p, i) => (
              <li key={p.id} className="w-[72vw] max-w-[320px] shrink-0 snap-start lg:w-auto lg:max-w-none">
                <Reveal delay={i * 0.08}>
                  <ProductCard product={p} index={i} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
