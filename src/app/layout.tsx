import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { siteConfig } from "@config/site";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { TabBar } from "@/components/layout/TabBar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { AgeGate } from "@/components/layout/AgeGate";
import { PageTransition } from "@/components/layout/PageTransition";
import { CartDrawer } from "@/components/cart/CartDrawer";

const display = Space_Grotesk({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "ru_RU",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[200] focus:bg-bw-silver focus:p-3 focus:text-bw-black">
          К содержимому
        </a>
        <Preloader />
        <AgeGate />
        <Header />
        <MobileMenu />
        <SearchOverlay />
        <CartDrawer />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <TabBar />
      </body>
    </html>
  );
}
