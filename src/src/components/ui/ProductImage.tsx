import Image from "next/image";
import clsx from "clsx";

/**
 * Изображение товара. Если фото нет — премиальный хромовый плейсхолдер (не пустая серая коробка).
 * Локальные пути (/…) идут через next/image; внешние URL — обычный <img> с lazy-загрузкой,
 * чтобы не требовать настройки доменов. Для продакшена положите фото в /public/products.
 */
export function ProductImage({
  src,
  alt,
  sizes = "(max-width: 768px) 50vw, 25vw",
  className,
  priority,
}: {
  src?: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (src?.startsWith("/api/")) {
    // Фото, загруженные через админку: уже сжаты в браузере и отдаются нашим API с долгим кэшем.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" className={clsx("absolute inset-0 h-full w-full object-cover", className)} />;
  }
  if (src?.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={clsx("object-cover", className)}
      />
    );
  }
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" decoding="async" className={clsx("absolute inset-0 h-full w-full object-cover", className)} />;
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx("absolute inset-0 overflow-hidden bg-bw-graphite", className)}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 25%, rgba(230,232,235,.35), transparent 60%), radial-gradient(70% 60% at 75% 80%, rgba(143,184,255,.12), transparent 65%), linear-gradient(160deg,#1b1c1f,#0b0b0d)",
        }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-1/2 w-1/2 opacity-70" aria-hidden>
        <defs>
          <linearGradient id="pc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".5" stopColor="#6b7078" />
            <stop offset="1" stopColor="#d8dbe0" />
          </linearGradient>
        </defs>
        <path d="M30 20h28a14 14 0 0 1 0 28H30v-28Zm0 28h32a16 16 0 0 1 0 32H30V48Z" fill="none" stroke="url(#pc)" strokeWidth="3.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
