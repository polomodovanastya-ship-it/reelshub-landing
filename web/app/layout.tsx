import type { Metadata } from "next";
import "./globals.css";
import { UI } from "@/lib/i18n";

export const metadata: Metadata = {
  title: UI.ru.metaTitle,
  description: UI.ru.metaDescription,
  alternates: { languages: { ru: "/", en: "/en" } },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        <link rel="stylesheet" href="/fonts.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
