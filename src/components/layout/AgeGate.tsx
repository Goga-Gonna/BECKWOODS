"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@config/site";
import { Button } from "@/components/ui/Button";

const KEY = "bw-age-ok";
type State = "checking" | "ask" | "ok" | "denied";

/**
 * Возрастное подтверждение. Это ЗАЯВИТЕЛЬНАЯ проверка (клик пользователя).
 * Она не заменяет юридически требуемую верификацию возраста — уточните требования
 * вашей юрисдикции до запуска продаж (в т.ч. проверку при доставке/оплате).
 */
export function AgeGate() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    try {
      setState(localStorage.getItem(KEY) === "1" ? "ok" : "ask");
    } catch {
      setState("ask");
    }
  }, []);

  useEffect(() => {
    if (state === "ok") {
      document.documentElement.style.overflow = "";
      return;
    }
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [state]);

  if (state === "ok") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-bw-black px-4 pb-safe-bottom pt-safe-top"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 45% at 50% 20%, rgba(201,205,210,.14), transparent 70%)" }}
      />
      {state === "checking" ? null : state === "denied" ? (
        <div className="relative max-w-md text-center">
          <h1 id="age-title" className="chrome-text font-display text-4xl font-bold uppercase tracking-tight">
            Доступ закрыт
          </h1>
          <p className="mt-4 text-bw-mute">
            Сайт предназначен только для совершеннолетних посетителей.
          </p>
        </div>
      ) : (
        <div className="hairline glass relative w-full max-w-md p-6 text-center sm:p-10">
          <div className="meta">{siteConfig.shortName} / ACCESS</div>
          <h1 id="age-title" className="chrome-text mt-4 font-display text-5xl font-bold uppercase leading-none tracking-[-0.04em] sm:text-6xl">
            {siteConfig.legal.minAge}+
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-bw-mute">
            Магазин предназначен только для лиц, достигших {siteConfig.legal.minAge} лет (или возраста,
            установленного законодательством вашей страны). Подтвердите, что вам исполнилось нужное количество лет.
          </p>
          <div className="mt-8 grid gap-3">
            <Button
              onClick={() => {
                try {
                  localStorage.setItem(KEY, "1");
                } catch {
                  /* ignore */
                }
                setState("ok");
              }}
            >
              Мне есть {siteConfig.legal.minAge} лет
            </Button>
            <Button variant="ghost" onClick={() => setState("denied")}>
              Мне нет {siteConfig.legal.minAge}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
