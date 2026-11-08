import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-bw py-24 text-center">
      <p className="meta">/ 404</p>
      <h1 className="chrome-text mt-4 font-display text-[clamp(4rem,22vw,14rem)] font-bold leading-none tracking-[-0.05em]">404</h1>
      <p className="mt-4 text-bw-mute">Этой страницы нет в темноте.</p>
      <ButtonLink href="/" className="mx-auto mt-8 max-w-xs">На главную</ButtonLink>
    </div>
  );
}
