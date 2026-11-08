import type { Metadata } from "next";
import { InfoPage } from "@/components/ui/InfoPage";
import { siteConfig } from "@config/site";

export const metadata: Metadata = { title: "Контакты" };

export default function ContactsPage() {
  const c = siteConfig.contacts;
  return (
    <InfoPage eyebrow="Contacts" title="Контакты">
      <p>Мы отвечаем в рабочее время: {c.hours}.</p>
      <ul className="!list-none !pl-0 space-y-2">
        {c.email && <li>Email: <a href={`mailto:${c.email}`}>{c.email}</a></li>}
        {c.telegramSupport && <li>Telegram: <a href={c.telegramSupport} target="_blank" rel="noopener noreferrer">{c.telegramSupport}</a></li>}
      </ul>
      <p className="text-sm text-bw-mute">Контакты редактируются в файле config/site.ts.</p>
    </InfoPage>
  );
}
