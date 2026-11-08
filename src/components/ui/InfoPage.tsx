import type { ReactNode } from "react";

export function InfoPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="container-bw pb-8 pt-8 lg:pt-14">
      <p className="meta">/ {eyebrow}</p>
      <h1 className="chrome-text mt-3 font-display text-[clamp(2.2rem,9vw,6.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.045em]">{title}</h1>
      <div className="mt-10 max-w-3xl space-y-5 leading-relaxed text-bw-chrome [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-bw-silver [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
