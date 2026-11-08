"use client";

import { useRef } from "react";
import clsx from "clsx";
import { siteConfig } from "@config/site";

type Variant = "tiles" | "dock";

/**
 * Интерактивная социальная панель.
 *  - Telegram: «самолётик» вычерчивается по контуру, орбитальное кольцо ускоряется при наведении.
 *  - Instagram: хромированный конический свет «проходит» по плитке и проявляет контур камеры.
 * Ссылки берутся из config/site.ts; пустой url — элемент не показывается.
 */
export function SocialOrbit({ variant = "tiles" }: { variant?: Variant }) {
  const { telegram, instagram } = siteConfig.social;
  const items = [
    telegram.url && { key: "tg", ...telegram },
    instagram.url && { key: "ig", ...instagram },
  ].filter(Boolean) as { key: "tg" | "ig"; label: string; handle: string; url: string }[];

  if (!items.length) return null;

  return (
    <div className={clsx(variant === "tiles" ? "grid gap-4 sm:grid-cols-2" : "flex gap-3")}>
      {items.map((it) => (
        <Tile key={it.key} label={it.label} handle={it.handle} url={it.url} compact={variant === "dock"} />
      ))}
    </div>
  );
}

function Tile({
  label,
  handle,
  url,
  compact,
}: {
  label: string;
  handle: string;
  url: string;
  compact: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const isTg = label.toLowerCase().includes("telegram");

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={onMove}
      aria-label={`${label} ${handle}`}
      className={clsx(
        "group hairline relative isolate flex touch overflow-hidden bg-bw-ink transition-colors duration-500 ease-bw hover:border-bw-chrome/50",
        compact ? "items-center gap-3 px-4 py-2" : "min-h-[180px] flex-col justify-between p-6 sm:min-h-[220px] sm:p-8",
      )}
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "50%" }}
    >
      {/* курсорный свет */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: isTg
            ? "radial-gradient(260px circle at var(--mx) var(--my), rgba(143,184,255,.18), transparent 60%)"
            : "conic-gradient(from 0deg at var(--mx) var(--my), rgba(255,255,255,.0), rgba(201,205,210,.28), rgba(255,255,255,.0) 40%, rgba(201,205,210,.2) 70%, rgba(255,255,255,0))",
        }}
      />
      <span className="relative flex items-start justify-between">
        <Glyph tg={isTg} size={compact ? 28 : 56} />
        {!compact && (
          <span className="meta transition-transform duration-500 ease-bw group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        )}
      </span>
      <span className="relative">
        <span className="block font-display text-xl font-bold uppercase tracking-tight sm:text-3xl">
          {isTg ? "Join the channel" : "Follow the feed"}
        </span>
        <span className="meta mt-1 block">
          {label} · {handle}
        </span>
      </span>
    </a>
  );
}

function Glyph({ tg, size }: { tg: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className="overflow-visible">
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke="rgba(201,205,210,.35)"
        strokeWidth="1"
        strokeDasharray="3 6"
        className="origin-center [animation:spin_18s_linear_infinite] group-hover:[animation-duration:3s]"
      />
      {tg ? (
        <path
          d="M10 30 52 13l-8 38-13-10-7 7-1-11L45 22 22 36 10 30Z"
          stroke="#E6E8EB"
          strokeWidth="2"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="0"
          className="transition-[stroke-dashoffset] duration-[900ms] ease-bw group-hover:[stroke-dashoffset:-1]"
        />
      ) : (
        <g stroke="#E6E8EB" strokeWidth="2" strokeLinecap="round">
          <rect x="16" y="16" width="32" height="32" rx="9" pathLength={1} strokeDasharray="1" className="transition-[stroke-dashoffset] duration-[900ms] ease-bw group-hover:[stroke-dashoffset:-1]" />
          <circle cx="32" cy="32" r="7.5" pathLength={1} strokeDasharray="1" className="transition-[stroke-dashoffset] duration-[900ms] delay-100 ease-bw group-hover:[stroke-dashoffset:-1]" />
          <circle cx="41.5" cy="22.5" r=".5" />
        </g>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}
