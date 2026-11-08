import { Reveal } from "@/components/ui/Reveal";

const stats = [
  ["0 мг", "никотина во всех жидкостях"],
  ["18+", "только для совершеннолетних"],
  ["Limited", "небольшие партии и дропы"],
];

export function Manifesto() {
  return (
    <section className="container-bw py-24 lg:py-40" aria-labelledby="manifesto">
      <Reveal>
        <p className="meta">/ Manifesto</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          id="manifesto"
          className="chrome-text mt-6 max-w-5xl font-display text-[clamp(1.9rem,6.4vw,5.2rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em]"
        >
          Жидкости без никотина, аксессуары и одежда. Небольшие партии для тех, кому 18+.
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-px bg-bw-steel sm:grid-cols-3">
        {stats.map(([big, small], i) => (
          <Reveal key={big} delay={0.15 + i * 0.1} className="bg-bw-black py-8 sm:px-6">
            <div className="font-display text-5xl font-bold tracking-tight">{big}</div>
            <div className="meta mt-2">{small}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}