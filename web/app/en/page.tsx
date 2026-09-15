import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { UI } from "@/lib/i18n";

export const metadata: Metadata = {
  title: UI.en.metaTitle,
  description: UI.en.metaDescription,
  alternates: { languages: { ru: "/", en: "/en" } },
};

export default function EnglishHomePage() {
  return <LandingPage locale="en" />;
}
