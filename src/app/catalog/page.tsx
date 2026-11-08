import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/CatalogClient";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Безникотиновые жидкости, аксессуары и мерч BECKWOODS. Только для совершеннолетних.",
};

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container-bw py-20 text-bw-mute">Загрузка…</div>}>
      <CatalogClient />
    </Suspense>
  );
}
