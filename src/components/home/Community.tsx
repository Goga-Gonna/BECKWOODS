import { SocialOrbit } from "@/components/social/SocialOrbit";
import { Reveal } from "@/components/ui/Reveal";

export function Community() {
  return (
    <section className="container-bw py-16 lg:py-24" aria-labelledby="community">
      <Reveal>
        <p className="meta">/ Community</p>
        <h2 id="community" className="chrome-text mt-3 font-display text-[clamp(2rem,8.5vw,6.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.045em]">
          Beckwoods
          <br />
          Community
        </h2>
        <p className="mt-6 max-w-lg text-bw-mute">
          Дропы, анонсы и закулисье — первыми в Telegram. Визуальный архив бренда — в Instagram.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-10">
        <SocialOrbit />
      </Reveal>
    </section>
  );
}
