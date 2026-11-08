import type { SVGProps } from "react";

const p = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconBag = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} {...props}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);
export const IconSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);
export const IconHeart = ({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg {...p} {...props} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </svg>
);
export const IconMenu = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} {...props}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const IconClose = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const IconHome = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} {...props}>
    <path d="M4 11 12 4l8 7v9H4v-9Z" />
  </svg>
);
export const IconGrid = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} {...props}>
    <rect x="4" y="4" width="6.5" height="6.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" />
  </svg>
);
export const IconArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} width={18} height={18} {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconFilter = (props: SVGProps<SVGSVGElement>) => (
  <svg {...p} {...props}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
);
