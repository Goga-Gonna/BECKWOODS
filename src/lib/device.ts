"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/store/ui";

type NavigatorExt = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/** Автоопределение слабого устройства / медленной сети. */
export function detectLowPower(): boolean {
  if (typeof window === "undefined") return false;
  const n = navigator as NavigatorExt;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (n.connection?.saveData) return true;
  if (n.connection?.effectiveType && /(^|-)(2g|3g)$/.test(n.connection.effectiveType)) return true;
  if (n.deviceMemory && n.deviceMemory <= 2) return true;
  if (n.hardwareConcurrency && n.hardwareConcurrency <= 2) return true;
  return false;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useIsMobile(breakpoint = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [breakpoint]);
  return m;
}

/** true → облегчённый режим (без WebGL и тяжёлых эффектов). */
export function useLite() {
  const override = useUI((s) => s.liteOverride);
  const [auto, setAuto] = useState(false);
  useEffect(() => setAuto(detectLowPower()), []);
  return override ?? auto;
}

export function haptic(ms = 12) {
  try {
    if ("vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    /* не поддерживается */
  }
}
