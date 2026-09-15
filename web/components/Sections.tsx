import type { Section } from "@/lib/directus";
import {
  DEFAULT_SHELVES_SLIDES,
  type CarouselSlide,
} from "@/lib/shelves-carousel";
import { PricingSection } from "./PricingSection";
import { ContactSection } from "./ContactSection";
import { ShelfCarousel } from "./ShelfCarousel";

function Hero({ section }: { section: Section }) {
  const steps =
    (section.items?.steps as { badge: string; text: string }[]) || [];
  return (
    <section id={section.anchor || "top"} className="hero">
      <div className="hero-tags">
        {(section.tags || []).map((tag, i) => (
          <span
            key={tag}
            className="pill"
            style={
              i === 0
                ? { background: "linear-gradient(180deg,#EBEBEB,#F6E8DA)", border: 0 }
                : i === 1
                  ? { background: "linear-gradient(75deg,#0FFBC0,#2ECE8A)", border: 0 }
                  : { border: "1px solid #000" }
            }
          >
            {tag}
          </span>
        ))}
      </div>
      <h1 className="h1">{section.title}</h1>
      <p className="hero-sub">
        {steps.length
          ? steps.map((s) => (
              <span key={s.badge} style={{ display: "inline" }}>
                <span className="badge" style={{ display: "inline-flex", margin: "0 8px 0 4px", verticalAlign: "0.1em" }}>
                  {s.badge}
                </span>
                {s.text}{" "}
              </span>
            ))
          : section.subtitle}
      </p>
      <div className="hero-media">
        <div className="hero-glow" aria-hidden />
        {section.media_url ? (
          <img src={section.media_url} alt="" className="hero-mobile" />
        ) : null}
        {section.media_url_secondary ? (
          <img src={section.media_url_secondary} alt="" className="hero-desktop" />
        ) : null}
      </div>
      {section.cta_label ? (
        <a href={section.cta_href || "#contact"} className="btn">
          {section.cta_label}
        </a>
      ) : null}
    </section>
  );
}

function IntroPair({ section }: { section: Section }) {
  const columns =
    (section.items?.columns as {
      id: string;
      title: string;
      body: string;
      icons: string[];
    }[]) || [];
  return (
    <div className="intro-pair container">
      {columns.map((col) => (
        <div key={col.id} id={col.id} className="intro-col">
          <div className="intro-icons">
            {col.icons?.map((src) => (
              <img key={src} src={src} alt="" width={56} height={56} />
            ))}
          </div>
          <h2 className="h2" style={{ fontSize: "clamp(26px,3vw,40px)" }}>
            {col.title}
          </h2>
          <p className="lead" style={{ maxWidth: 420, textAlign: "center" }}>
            {col.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function Feature({ section }: { section: Section }) {
  const layout = section.layout || "text_left";
  const reverse = layout === "text_right";
  const centered = layout === "centered";
  const items = section.items as {
    mock?: string;
    carousel?: CarouselSlide[];
  } | null;
  const mock = items?.mock;
  const carouselSlides =
    items?.carousel?.length
      ? items.carousel
      : section.anchor === "shelves"
        ? DEFAULT_SHELVES_SLIDES
        : null;
  const hasMedia = Boolean(section.media_url || mock || carouselSlides);

  return (
    <section id={section.anchor || undefined} className="section container">
      <div
        className={`feature-row ${reverse ? "reverse" : ""}`}
        style={centered ? { justifyContent: "center" } : undefined}
      >
        <div className={`feature-col ${centered ? "center" : ""}`}>
          {section.badge ? <span className="badge">{section.badge}</span> : null}
          <h2 className="h2">{section.title}</h2>
          {section.body ? <p className="lead">{section.body}</p> : null}
          {section.cta_label ? (
            <a href={section.cta_href || "#contact"} className="btn" style={{ marginTop: 10 }}>
              {section.cta_label}
            </a>
          ) : null}
        </div>
        {!centered && hasMedia ? (
          <div
            className="feature-col"
            style={{ position: "relative", alignItems: "center", width: "100%" }}
          >
            {carouselSlides ? (
              <ShelfCarousel slides={carouselSlides} />
            ) : section.media_url ? (
              <img
                src={section.media_url}
                alt=""
                style={{ width: 280, maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
              />
            ) : mock === "domain" ? (
              <DomainMock />
            ) : mock === "brand" ? (
              <BrandMock />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DomainMock() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 369,
        display: "flex",
        flexWrap: "wrap",
        gap: "14px 20px",
        padding: "18px 20px",
        border: "1px solid #E7E7E7",
        borderRadius: 10,
        background: "#FBFBFB",
      }}
    >
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ flex: 1, fontSize: 19, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          loverocknroll.ru
        </span>
        <span style={{ color: "#181818", fontWeight: 300 }}>✕</span>
      </div>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            padding: "13px 24px",
            borderRadius: 10,
            background: "#000",
            color: "#fff",
            fontSize: 16,
          }}
        >
          Подключить
        </span>
      </div>
    </div>
  );
}

function BrandMock() {
  const colors = [
    "#0FFBC0", "#2ECE8A", "#1F7A4D", "#E63946", "#B3121C", "#F2A93B",
    "#FFC93C", "#FF8A3D", "#F45BA0", "#7C4DFF", "#123A8A", "#181818",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <div style={{ padding: "18px 20px", border: "1px solid #E7E7E7", borderRadius: 10, background: "#FBFBFB" }}>
        <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d6d6d" }}>
          Логотип
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
          <span
            style={{
              width: 52,
              height: 52,
              border: "1px dashed #9a9a9a",
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9a9a9a",
              fontSize: 20,
            }}
          >
            +
          </span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 300, color: "#6d6d6d" }}>
            SVG или PNG, до 2 МБ
          </span>
        </div>
      </div>
      <div style={{ padding: "18px 20px", border: "1px solid #E7E7E7", borderRadius: 10, background: "#FBFBFB" }}>
        <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d6d6d" }}>
          Палитра
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          {colors.map((c) => (
            <span key={c} style={{ width: 28, height: 28, borderRadius: 75, background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Bridge({ section }: { section: Section }) {
  const cards =
    (section.items?.cards as { letter: string; text: string; metric: string }[]) ||
    [];
  return (
    <section id={section.anchor || "bridge"} className="container" style={{ minHeight: "25svh", paddingTop: 25, paddingBottom: 25 }}>
      <h2 className="h2" style={{ fontSize: "clamp(24px,2.6vw,34px)", maxWidth: 760 }}>
        {section.title}
      </h2>
      {section.body ? (
        <p className="lead" style={{ marginTop: 14, maxWidth: 560, fontSize: 19 }}>
          {section.body}
        </p>
      ) : null}
      <div className="bridge-grid">
        {cards.map((c) => (
          <div key={c.letter} className="bridge-card">
            <span className="badge" style={{ width: 24, height: 24, fontSize: 12 }}>
              {c.letter}
            </span>
            <span style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.3, color: "#181818" }}>
              {c.text}
            </span>
            <span
              style={{
                marginTop: "auto",
                paddingTop: 8,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.2,
                color: "#17845A",
              }}
            >
              {c.metric}
            </span>
          </div>
        ))}
      </div>
      {section.cta_label ? (
        <a href={section.cta_href || "#contact"} className="btn" style={{ marginTop: 34 }}>
          {section.cta_label}
        </a>
      ) : null}
    </section>
  );
}

function Faq({ section }: { section: Section }) {
  const items =
    (section.items?.items as { q: string; a: string }[]) || [];
  return (
    <section id={section.anchor || "faq"} className="section container" style={{ flexDirection: "column", alignItems: "stretch", justifyContent: "center" }}>
      <h2 className="h2" style={{ marginBottom: 34 }}>
        {section.title}
      </h2>
      <div style={{ borderTop: "1px solid #000" }}>
        {items.map((item) => (
          <details key={item.q} style={{ padding: "22px 0", borderBottom: "1px solid #000" }}>
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                fontSize: "clamp(18px,2vw,22px)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              {item.q}
              <span style={{ fontWeight: 300 }}>+</span>
            </summary>
            <p style={{ margin: "14px 0 0", maxWidth: 760, fontSize: 17, fontWeight: 300, lineHeight: 1.4, color: "#181818" }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Sections({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "hero":
            return <Hero key={section.id} section={section} />;
          case "intro_pair":
            return <IntroPair key={section.id} section={section} />;
          case "feature":
            return <Feature key={section.id} section={section} />;
          case "bridge":
            return <Bridge key={section.id} section={section} />;
          case "pricing":
            return <PricingSection key={section.id} section={section} />;
          case "contact":
            return <ContactSection key={section.id} section={section} />;
          case "faq":
            return <Faq key={section.id} section={section} />;
          default:
            return null;
        }
      })}
      <style>{`
        .hero {
          padding: 120px 40px 90px;
          max-width: 1140px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }
        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-bottom: 14px;
          position: relative;
          z-index: 2;
        }
        .hero-sub {
          margin: 0;
          max-width: 700px;
          font-size: 20px;
          font-weight: 300;
          line-height: 1.3;
          letter-spacing: -0.01em;
          color: #181818;
          position: relative;
          z-index: 2;
        }
        .hero-media {
          position: relative;
          width: 100%;
          margin-top: 37px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 32px;
        }
        .hero-glow {
          position: absolute;
          z-index: 0;
          left: -10%;
          top: -37.5%;
          width: 120%;
          height: 170%;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.2;
          border-radius: 75px;
          background: radial-gradient(closest-side, #0FFBC0, #2ECE8A 45%, rgba(46,206,138,.35) 75%, transparent 100%);
          animation: drift 8s cubic-bezier(.19,1,.22,1) infinite alternate;
        }
        @keyframes drift {
          from { transform: translate(-8%, 4%) scale(0.95); }
          to { transform: translate(10%, -6%) scale(1.15); }
        }
        .hero-mobile {
          position: relative;
          z-index: 1;
          width: calc(23.6% - 7.55px);
          height: auto;
          display: block;
          margin-top: -10px;
        }
        .hero-desktop {
          position: relative;
          z-index: 1;
          width: calc(76.4% - 24.45px);
          height: auto;
          display: block;
          margin-top: -10px;
        }
        .intro-pair {
          padding-top: 0;
          padding-bottom: 46px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 48px;
        }
        .intro-col {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          text-align: center;
        }
        .intro-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .intro-icons img {
          width: 56px;
          height: 56px;
          object-fit: contain;
          border-radius: 10px;
          display: block;
        }
        .bridge-grid {
          margin-top: 40px;
          display: flex;
          align-items: stretch;
          gap: 40px;
          width: 100%;
        }
        .bridge-card {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 18px;
          border-top: 1px solid #000;
        }
        @media (max-width: 759px) {
          .hero { padding: 66px 20px 56px; }
          .hero-sub { font-size: 16px; }
          .hero-media { flex-direction: column; align-items: center; gap: 24px; margin-top: 32px; }
          .hero-mobile { width: 240px; }
          .hero-desktop { width: 100%; margin-top: 0; }
          .intro-pair { flex-direction: column; gap: 56px; padding: 0 20px 30px; }
          .bridge-grid { flex-direction: column; gap: 24px; margin-top: 28px; }
        }
      `}</style>
    </>
  );
}
