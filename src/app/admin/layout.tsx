import Link from "next/link";
import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = { title: "Админ-панель", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  return (
    <div className="container-bw pb-8 pt-6 lg:pt-10">
      {admin && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-bw-steel pb-4">
          <nav aria-label="Админ" className="flex flex-wrap gap-1">
            {[["/admin", "Дашборд"], ["/admin/products", "Товары"], ["/admin/orders", "Заказы"]].map(([href, label]) => (
              <Link key={href} href={href} className="meta touch flex items-center px-3 hover:text-bw-silver">{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="meta hidden sm:inline">{admin.email}</span>
            <LogoutButton />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
