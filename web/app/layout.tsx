import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "reelshub — контент-хаб для авторов",
  description:
    "Создай контент-хаб или встрой полки reels в свой сайт. SaaS CMS без X.",
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
