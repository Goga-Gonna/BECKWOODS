import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const defaults = [
  { slug: "liquids", name: "Жидкости", note: "0 мг никотина" },
  { slug: "accessories", name: "Аксессуары", note: "Металл / хром" },
  { slug: "merch", name: "Merch", note: "Streetwear" },
];

export function Categories() {
  return (
    <section className="container-bw py-16 lg:py-24" aria-labelledby="cats">
      <Reveal>
        <p className="meta">/ Collections</p>
        <h2 id="cats" className="sr-only">Категории</h2>
      </Reveal>
      <ul className="mt-6 border-t border-bw-steel">
        {defaults.map((c, i) => (
          <li key={c.slug} className="border-b border-bw-steel">
            <Reveal delay={i * 0.08}>
              <Link
                href={`/catalog?category=${c.slug}`}
                className="group touch flex items-center justify-between gap-4 py-6 lg:py-10"
              >
                <span className="meta w-8 shrink-0">0{i + 1}</span>
                <span className="chrome-text min-w-0 flex-1 font-display text-[clamp(2rem,9vw,6.5rem)] font-bold uppercase leading-none tracking-[-0.04em] transition-transform duration-500 ease-bw group-hover:translate-x-3">
                  {c.name}
                </span>
                <span className="meta hidden sm:block">{c.note}</span>
                <span className="text-2xl transition-transform duration-500 ease-bw group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden>
                  ↗
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
