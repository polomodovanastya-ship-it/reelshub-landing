import { Header } from "@/components/Header";
import { Sections } from "@/components/Sections";
import { fetchSections, fetchSiteSettings } from "@/lib/directus";

export default async function HomePage() {
  const [settings, sections] = await Promise.all([
    fetchSiteSettings(),
    fetchSections(),
  ]);

  const nav =
    settings?.nav_links?.length
      ? settings.nav_links
      : [
          { label: "СТОИМОСТЬ", href: "#pricing" },
          { label: "Q&A", href: "#faq" },
          { label: "КОНТАКТЫ", href: "#contact" },
        ];

  const footerLinks = settings?.footer_links || nav;
  const tagline =
    settings?.footer_tagline || "Контент-хаб для авторов\n© 2026 reelshub";

  return (
    <div className="page">
      <Header links={nav} />
      {sections.length === 0 ? (
        <div className="container" style={{ paddingTop: 120 }}>
          <h1 className="h1">Directus ещё не готов</h1>
          <p className="lead" style={{ marginTop: 16 }}>
            Запустите <code>docker compose up -d</code>, затем{" "}
            <code>node scripts/bootstrap.mjs</code> и обновите страницу.
          </p>
        </div>
      ) : (
        <Sections sections={sections} />
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
