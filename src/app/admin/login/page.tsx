"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        setError(j?.error?.message ?? "Ошибка входа");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="hairline mx-auto mt-10 max-w-sm space-y-4 bg-bw-ink p-6">
      <h1 className="chrome-text font-display text-4xl font-bold uppercase tracking-tight">Вход</h1>
      <input className="field" type="email" required placeholder="Email" aria-label="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="field" type="password" required placeholder="Пароль" aria-label="Пароль" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p role="alert" className="text-sm text-bw-ice">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Вход…" : "Войти"}</Button>
    </form>
  );
}
