import type { Metadata } from "next";
import { SocialOrbit } from "@/components/social/SocialOrbit";
import { siteConfig } from "@config/site";

export const metadata: Metadata = { title: "Community", description: "BECKWOODS COMMUNITY — Telegram и Instagram бренда." };

export default function CommunityPage() {
  const { telegram, instagram } = siteConfig.social;
  return (
    <div className="container-bw pb-8 pt-8 lg:pt-14">
      <p className="meta">/ Community</p>
      <h1 className="chrome-text mt-3 font-display text-[clamp(2.4rem,11vw,9rem)] font-bold uppercase leading-[0.85] tracking-[-0.05em]">
        Beckwoods<br />Community
      </h1>
      <p className="mt-6 max-w-xl text-bw-mute">
        Анонсы дропов, закулисье и поддержка. Контент предназначен для аудитории 18+.
      </p>
      <div className="mt-10"><SocialOrbit /></div>
      <ul className="meta mt-8 space-y-1">
        {telegram.url && <li>Telegram: {telegram.handle}</li>}
        {instagram.url && <li>Instagram: {instagram.handle}</li>}
      </ul>
    </div>
  );
}
