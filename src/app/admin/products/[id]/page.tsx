"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Cat = { id: string; name: string };
type Form = {
  slug: string; name: string; description: string; details: string;
  price: string; stock: string; images: string[]; tags: string;
  featured: boolean; active: boolean; categoryId: string;
};
const blank: Form = { slug: "", name: "", description: "", details: "", price: "", stock: "0", images: [], tags: "", featured: false, active: true, categoryId: "" };

export default function AdminProductForm({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const router = useRouter();
  const [f, setF] = useState<Form>(blank);
  const [cats, setCats] = useState<Cat[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/products");
      const j = await r.json();
      setCats(j.categories ?? []);
      if (isNew) {
        setF((x) => ({ ...x, categoryId: j.categories?.[0]?.id ?? "" }));
      } else {
        const p = (j.items as any[]).find((i) => i.id === params.id);
        if (!p) return setError("Товар не найден");
        setF({
          slug: p.slug, name: p.name, description: p.description, details: p.details,
          price: (p.priceCents / 100).toString(), stock: String(p.stock),
          images: p.images as string[], tags: p.tags.join(", "),
          featured: p.featured, active: p.active, categoryId: p.categoryId,
        });
      }
    })().catch(() => setError("Ошибка загрузки"));
  }, [isNew, params.id]);

  const up = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setErrors({});
    const body = {
      slug: f.slug.trim(), name: f.name, description: f.description, details: f.details,
      priceCents: Math.round(parseFloat(f.price) * 100), stock: parseInt(f.stock, 10),
      images: f.images,
      tags: f.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
      featured: f.featured, active: f.active, categoryId: f.categoryId,
    };
    try {
      const r = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${params.id}`, {
        method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        if (j?.error?.details) setErrors(j.error.details);
        setError(j?.error?.message ?? "Не удалось сохранить");
        return;
      }
      router.push("/admin/products");
    } finally { setBusy(false); }
  }

  const err = (k: string) => errors[k]?.[0] && <span role="alert" className="mt-1 block text-xs text-bw-ice">{errors[k][0]}</span>;

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5">
      <h1 className="chrome-text font-display text-5xl font-bold uppercase tracking-tight">{isNew ? "Новый товар" : "Редактирование"}</h1>
      <div className="grid gap-5 sm:grid-cols-2">
        <label><span className="meta mb-1 block">Название</span><input className="field" required value={f.name} onChange={up("name")} />{err("name")}</label>
        <label><span className="meta mb-1 block">Slug (латиница-через-дефис)</span><input className="field" required value={f.slug} onChange={up("slug")} />{err("slug")}</label>
        <label><span className="meta mb-1 block">Цена, $</span><input className="field" required type="number" min="0" step="0.01" inputMode="decimal" value={f.price} onChange={up("price")} />{err("priceCents")}</label>
        <label><span className="meta mb-1 block">Остаток</span><input className="field" required type="number" min="0" step="1" value={f.stock} onChange={up("stock")} />{err("stock")}</label>
        <label><span className="meta mb-1 block">Категория</span>
          <select className="field" required value={f.categoryId} onChange={up("categoryId")}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </label>
        <label><span className="meta mb-1 block">Теги (через запятую)</span><input className="field" value={f.tags} onChange={up("tags")} />{err("tags")}</label>
      </div>
      <label className="block"><span className="meta mb-1 block">Краткое описание</span><textarea className="field min-h-[72px] py-3" required value={f.description} onChange={up("description")} />{err("description")}</label>
      <label className="block"><span className="meta mb-1 block">Подробности</span><textarea className="field min-h-[110px] py-3" value={f.details} onChange={up("details")} /></label>
      <div>
        <span className="meta mb-2 block">Изображения</span>
        <ImageUploader value={f.images} onChange={(images) => setF((x) => ({ ...x, images }))} />
        {err("images")}
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="touch flex items-center gap-3"><input type="checkbox" checked={f.featured} onChange={up("featured")} className="h-5 w-5 accent-[#c9cdd2]" /> На главной (Featured)</label>
        <label className="touch flex items-center gap-3"><input type="checkbox" checked={f.active} onChange={up("active")} className="h-5 w-5 accent-[#c9cdd2]" /> Активен</label>
      </div>
      <p className="text-xs text-bw-mute">Копирайт без медицинских и оздоровительных обещаний. Только для 18+.</p>
      {error && <p role="alert" className="hairline p-3 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>{busy ? "Сохранение…" : "Сохранить"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>Отмена</Button>
      </div>
    </form>
  );
}
