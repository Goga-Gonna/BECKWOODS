"use client";

import { useRef, useState } from "react";
import clsx from "clsx";

const MAX_SIDE = 1400;

function canvasBlob(c: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => c.toBlob(resolve, type, quality));
}

async function decode(file: File): Promise<{ src: CanvasImageSource; w: number; h: number; close: () => void }> {
  try {
    const bmp = await createImageBitmap(file);
    return { src: bmp, w: bmp.width, h: bmp.height, close: () => bmp.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { src: img, w: img.naturalWidth, h: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }
}

/** Уменьшает фото до 1400 px по большей стороне и сжимает (WebP, либо JPEG в Safari). */
async function prepare(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("это не изображение");
  const d = await decode(file).catch(() => {
    throw new Error("не удалось прочитать файл (формат не поддерживается)");
  });
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(d.w, d.h));
    const w = Math.max(1, Math.round(d.w * scale));
    const h = Math.max(1, Math.round(d.h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("браузер не поддерживает обработку изображений");
    ctx.drawImage(d.src, 0, 0, w, h);

    let blob = await canvasBlob(canvas, "image/webp", 0.86);
    if (!blob || blob.type !== "image/webp") {
      // JPEG без прозрачности: подкладываем тёмный фон под прозрачные места
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#141416";
      ctx.fillRect(0, 0, w, h);
      blob = await canvasBlob(canvas, "image/jpeg", 0.86);
    }
    if (!blob) throw new Error("не удалось обработать изображение");
    return blob;
  } finally {
    d.close();
  }
}

export function ImageUploader({
  value,
  onChange,
  max = 10,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setError("");
    setBusy(true);
    let next = [...value];
    const errors: string[] = [];

    for (const f of list) {
      if (next.length >= max) {
        errors.push(`Максимум ${max} изображений`);
        break;
      }
      try {
        const blob = await prepare(f);
        const r = await fetch("/api/admin/images", {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.error?.message ?? "ошибка загрузки");
        next = [...next, j.url as string];
        onChange(next);
      } catch (e) {
        errors.push(`${f.name}: ${e instanceof Error ? e.message : "ошибка"}`);
      }
    }

    setBusy(false);
    if (errors.length) setError(errors.join("\n"));
    if (input.current) input.current.value = "";
  }

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const n = [...value];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  }

  function addUrl() {
    const u = url.trim();
    if (!u) return;
    if (!/^https?:\/\//.test(u) && !u.startsWith("/")) {
      setError("Ссылка должна начинаться с https:// или /");
      return;
    }
    if (value.length >= max) {
      setError(`Максимум ${max} изображений`);
      return;
    }
    setError("");
    onChange([...value, u]);
    setUrl("");
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {value.map((src, i) => (
            <li key={`${src}-${i}`} className="hairline relative overflow-hidden bg-bw-graphite">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Фото ${i + 1}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                {i === 0 && (
                  <span className="meta absolute left-1 top-1 bg-bw-black/80 px-1.5 py-0.5 text-bw-chrome">Главное</span>
                )}
              </div>
              <div className="flex items-stretch border-t border-bw-steel">
                <button type="button" aria-label="Сдвинуть влево" disabled={i === 0 || busy} onClick={() => move(i, -1)} className="touch flex-1 hover:bg-bw-steel disabled:opacity-30">←</button>
                <button type="button" aria-label="Сдвинуть вправо" disabled={i === value.length - 1 || busy} onClick={() => move(i, 1)} className="touch flex-1 hover:bg-bw-steel disabled:opacity-30">→</button>
                <button type="button" aria-label="Удалить фото" disabled={busy} onClick={() => onChange(value.filter((_, k) => k !== i))} className="touch flex-1 hover:bg-bw-steel hover:text-bw-ice disabled:opacity-30">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) addFiles(e.dataTransfer.files); }}
        className={clsx(
          "flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1 border border-dashed px-4 py-6 text-center transition-colors",
          drag ? "border-bw-chrome bg-bw-chrome/10" : "border-bw-steel hover:border-bw-chrome/60",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <span className="font-mono text-xs uppercase tracking-[0.16em]">
          {busy ? "Загрузка…" : "Нажмите или перетащите фото"}
        </span>
        <span className="text-xs text-bw-mute">JPEG, PNG, WebP · до {max} штук · первое фото — главное</span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          className="sr-only"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </label>

      <div className="mt-3 flex gap-2">
        <input
          className="field"
          placeholder="Или вставьте ссылку на фото (https://…)"
          aria-label="Ссылка на изображение"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
        />
        <button type="button" onClick={addUrl} className="touch hairline shrink-0 px-4 font-mono text-xs uppercase hover:border-bw-chrome">
          Добавить
        </button>
      </div>

      {error && <p role="alert" className="mt-3 whitespace-pre-line text-xs text-bw-ice">{error}</p>}
      <p className="mt-2 text-xs text-bw-mute">Не забудьте нажать «Сохранить» внизу формы: до этого фото к товару не привязаны.</p>
    </div>
  );
}
