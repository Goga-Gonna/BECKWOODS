import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let stats: { products: number; low: number; orders: number; pending: number; revenue: number } | null = null;
  try {
    const [products, low, orders, pending, agg] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 5 }, active: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { not: "CANCELLED" } } }),
    ]);
    stats = { products, low, orders, pending, revenue: agg._sum.totalCents ?? 0 };
  } catch (e) {
    console.error(e);
  }

  if (!stats) return <p role="alert">База данных недоступна. Проверьте DATABASE_URL и выполните <code className="font-mono">npm run db:push</code>.</p>;

  const tiles: [string, string | number, string][] = [
    ["Товаров", stats.products, "/admin/products"],
    ["Мало на складе (≤5)", stats.low, "/admin/products"],
    ["Заказов", stats.orders, "/admin/orders"],
    ["Ожидают", stats.pending, "/admin/orders?status=PENDING"],
    ["Сумма заказов (демо)", formatPrice(stats.revenue), "/admin/orders"],
  ];

  return (
    <>
      <h1 className="chrome-text font-display text-5xl font-bold uppercase tracking-tight">Дашборд</h1>
      <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {tiles.map(([label, value, href]) => (
          <li key={label}>
            <Link href={href} className="hairline block bg-bw-ink p-5 transition-colors hover:border-bw-chrome">
              <div className="meta">{label}</div>
              <div className="mt-2 font-display text-3xl font-bold">{value}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
