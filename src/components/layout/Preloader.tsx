"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@config/site";

const KEY = "bw-preloaded";

export function Preloader() {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* private mode */
    }
    if (seen) {
      setShow(false);
      return;
    }
    const start = performance.now();
    const total = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
        setTimeout(() => setShow(false), 150);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bw-black"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-label="Загрузка"
          role="status"
        >
          <div className="overflow-hidden px-4">
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="chrome-text text-center font-display text-[clamp(2rem,11vw,5rem)] font-bold uppercase leading-none tracking-[-0.04em]"
            >
              {siteConfig.shortName}
            </motion.div>
          </div>
          <div className="meta mt-4">{siteConfig.name} — {Math.round(progress * 100).toString().padStart(3, "0")}</div>
          <div className="mt-8 h-px w-[min(60vw,260px)] bg-bw-steel">
            <div className="h-full bg-bw-chrome" style={{ width: `${progress * 100}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
