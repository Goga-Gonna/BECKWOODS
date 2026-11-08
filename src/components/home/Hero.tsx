"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { siteConfig } from "@config/site";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrow } from "@/components/ui/Icons";
import { useIsMobile, useLite } from "@/lib/device";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/** Статичный постер: используется в облегчённом режиме и пока грузится WebGL. */
function Poster() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 35% at 50% 45%, rgba(230,232,235,.28), transparent 70%), radial-gradient(60% 50% at 20% 80%, rgba(143,184,255,.12), transparent 70%)",
        }}
      />
      <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto w-[min(70vw,420px)] opacity-80">
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".5" stopColor="#5d6168" />
            <stop offset="1" stopColor="#e6e8eb" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="62" fill="none" stroke="url(#pg)" strokeWidth="9" />
        <circle cx="100" cy="100" r="38" fill="none" stroke="url(#pg)" strokeWidth="4" opacity=".6" />
      </svg>
    </div>
  );
}

export function Hero() {
  const lite = useLite();
  const mobile = useIsMobile();
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(true);

  // Появление заголовка
  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-letter", {
        yPercent: 110,
        rotateX: -70,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.04,
        delay: 1.6, // после прелоадера
      });
      gsap.from(".hero-fade", { opacity: 0, y: 24, duration: 1, ease: "power3.out", stagger: 0.12, delay: 2.1 });
    }, root);
    return () => ctx.revert();
  }, []);

  // 3D-наклон заголовка за курсором + параллакс (только десктоп с мышью)
  useEffect(() => {
    if (lite || mobile || !title.current) return;
    const el = title.current;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      gsap.to(el, { rotateY: x * 10, rotateX: -y * 7, x: x * 14, duration: 0.8, ease: "power3.out" });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [lite, mobile]);

  // Пауза WebGL, когда Hero вне экрана
  useEffect(() => {
    if (!root.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  const word = siteConfig.shortName.split("");

  return (
    <section
      ref={root}
      aria-label="BECKWOODS.STORE"
      className="relative isolate flex min-h-[calc(100dvh-var(--header-h)-60px)] flex-col justify-end overflow-hidden lg:min-h-[calc(100dvh-72px)]"
    >
      <div className="absolute inset-0 -z-10">
        <Poster />
        {!lite && inView && <HeroScene mobile={mobile} />}
        {/* виньетка + световой луч */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 40%, #050506 100%)" }} />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[70%] w-[60%] -translate-x-1/2 opacity-40 blur-3xl"
          style={{ background: "linear-gradient(180deg, rgba(207,224,255,.5), transparent)" }}
        />
      </div>

      <div className="container-bw pb-10 pt-24 lg:pb-16">
        <p className="meta hero-fade mb-4">{siteConfig.tagline} / 2026</p>
        <div style={{ perspective: 1000 }}>
          <h1
            ref={title}
            className="chrome-text flex select-none font-display text-[clamp(2.6rem,15.5vw,13rem)] font-bold uppercase leading-[0.82] tracking-[-0.05em] [transform-style:preserve-3d]"
            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,.6))" }}
            aria-label={siteConfig.name}
          >
            <span className="flex overflow-hidden pb-[0.08em]" aria-hidden>
              {word.map((ch, i) => (
                <span key={i} className="hero-letter inline-block [transform-origin:50%_100%]">
                  {ch}
                </span>
              ))}
            </span>
          </h1>
          <div className="hero-fade meta mt-2 text-bw-chrome">.STORE</div>
        </div>

        <div className="hero-fade mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-bw-mute sm:text-base">
            Подпольный люкс-стритвир. Безникотиновые жидкости, аксессуары и мерч. Только 18+.
          </p>
          <ButtonLink href="/catalog" magnetic className="w-full sm:w-auto sm:min-w-[220px]">
            В каталог <IconArrow />
          </ButtonLink>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex" aria-hidden>
        <span className="meta">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-bw-chrome to-transparent" />
      </div>
    </section>
  );
}
