"use client";

import Link from "next/link";
import clsx from "clsx";
import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { haptic } from "@/lib/device";

type Variant = "chrome" | "ghost" | "dark";

type Common = {
  variant?: Variant;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
};

const base =
  "touch relative inline-flex select-none items-center justify-center gap-2 overflow-hidden px-6 font-mono text-xs uppercase tracking-[0.16em] transition-[transform,background,color,border-color] duration-300 ease-bw active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  chrome:
    "bg-bw-silver text-bw-black hover:bg-white [background-image:linear-gradient(110deg,transparent_35%,rgba(255,255,255,.7)_50%,transparent_65%)] [background-size:250%_100%] hover:animate-shimmer",
  ghost: "border border-bw-chrome/30 text-bw-silver hover:border-bw-chrome hover:bg-bw-chrome/10",
  dark: "bg-bw-graphite text-bw-silver border border-bw-steel hover:border-bw-chrome/60",
};

function useMagnet<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const handlers = enabled
    ? {
        onPointerMove: (e: React.PointerEvent<T>) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
          const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
          ref.current.style.transform = `translate(${x}px, ${y}px)`;
        },
        onPointerLeave: () => {
          if (ref.current) ref.current.style.transform = "";
        },
      }
    : {};
  return { ref, handlers };
}

export function Button({
  variant = "chrome",
  magnetic = false,
  className,
  children,
  onClick,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { ref, handlers } = useMagnet<HTMLButtonElement>(magnetic);
  return (
    <button
      ref={ref}
      className={clsx(base, variants[variant], className)}
      onClick={(e) => {
        haptic(8);
        onClick?.(e);
      }}
      {...handlers}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "chrome",
  magnetic = false,
  className,
  children,
  external,
}: Common & { href: string; external?: boolean }) {
  const { ref, handlers } = useMagnet<HTMLAnchorElement>(magnetic);
  const cls = clsx(base, variants[variant], className);
  if (external) {
    return (
      <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" className={cls} {...handlers}>
        {children}
      </a>
    );
  }
  return (
    <Link ref={ref} href={href} className={cls} {...handlers}>
      {children}
    </Link>
  );
}
