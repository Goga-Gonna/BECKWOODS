"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-bw py-24 text-center" role="alert">
      <p className="meta">/ Error</p>
      <h1 className="chrome-text mt-4 font-display text-5xl font-bold uppercase tracking-tight">Что-то пошло не так</h1>
      <p className="mt-4 text-bw-mute">Попробуйте обновить страницу.</p>
      <Button onClick={reset} className="mx-auto mt-8">Повторить</Button>
    </div>
  );
}
