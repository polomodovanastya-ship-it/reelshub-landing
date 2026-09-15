import { Header } from "@/components/Header";
import { Sections } from "@/components/Sections";
import { fetchSections, fetchSiteSettings } from "@/lib/directus";
import {
  UI,
  localizeSections,
  localizeSettings,
  type Locale,
} from "@/lib/i18n";

export async function LandingPage({ locale }: { locale: Locale }) {
  const ui = UI[locale];
  const [settings, sectionsRaw] = await Promise.all([
    fetchSiteSettings(),
    fetchSections(),
  ]);

  const { nav, footerLinks, tagline } = localizeSettings(settings, locale);
  const sections = localizeSections(sectionsRaw, locale);

  return (
    <div className="page" lang={locale}>
      <Header
        links={nav}
        langSwitch={{ label: ui.langSwitchLabel, href: ui.langSwitchHref }}
      />
      {sections.length === 0 ? (
        <div className="container" style={{ paddingTop: 120 }}>
          <h1 className="h1">{ui.emptyCmsTitle}</h1>
          <p className="lead" style={{ marginTop: 16 }}>
            {ui.emptyCmsBodyBefore} <code>docker compose up -d</code>
            {locale === "ru" ? ", затем " : ", then "}
            <code>node scripts/bootstrap.mjs</code> {ui.emptyCmsBodyAfter}
          </p>
        </div>
      ) : (
        <Sections sections={sections} locale={locale} />
      )}
      <footer className="site-footer container">
        <div>
          <span className="footer-logo">
            <img src="/media/reelshub-logo-3.png" alt="reelshub" height={22} />
          </span>
          <p className="footer-tagline">{tagline}</p>
        </div>
        <div className="footer-links">
          {footerLinks.map((l) => (
            <a key={l.href + l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
