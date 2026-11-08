"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** «Шторка-затвор»: при смене маршрута тёмный занавес уходит вверх, контент всплывает. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <motion.div
        key={`curtain-${pathname}`}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] origin-top bg-bw-black"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-bw-chrome/60" />
      </motion.div>
      <motion.main
        key={pathname}
        id="main"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </>
  );
}
