import type { NavLink, Section, SiteSettings } from "@/lib/directus";
import {
  DEFAULT_SHELVES_SLIDES,
  type CarouselSlide,
} from "@/lib/shelves-carousel";

export type Locale = "ru" | "en";

export type UiCopy = {
  emptyCmsTitle: string;
  emptyCmsBodyBefore: string;
  emptyCmsBodyAfter: string;
  connect: string;
  logo: string;
  logoHint: string;
  palette: string;
  month: string;
  year: string;
  perMonth: string;
  perMonthAnnual: string;
  from: string;
  choose: string;
  sending: string;
  contactFallback: string;
  consentPrefix: string;
  consentLink: string;
  thanks: string;
  sendError: string;
  currency: "RUB" | "USD";
  numberLocale: string;
  metaTitle: string;
  metaDescription: string;
  langSwitchLabel: string;
  langSwitchHref: string;
};

export const UI: Record<Locale, UiCopy> = {
  ru: {
    emptyCmsTitle: "Directus ещё не готов",
    emptyCmsBodyBefore: "Запустите",
    emptyCmsBodyAfter: "и обновите страницу.",
    connect: "Подключить",
    logo: "Логотип",
    logoHint: "SVG или PNG, до 2 МБ",
    palette: "Палитра",
    month: "Месяц",
    year: "Год",
    perMonth: "в месяц",
    perMonthAnnual: "в месяц при оплате за год",
    from: "от ",
    choose: "Выбрать",
    sending: "Отправка…",
    contactFallback: "Telegram или email",
    consentPrefix: "Я согласен с",
    consentLink: "Политикой обработки персональных данных",
    thanks: "Спасибо! Напишем в течение дня.",
    sendError: "Не удалось отправить. Попробуйте ещё раз.",
    currency: "RUB",
    numberLocale: "ru-RU",
    metaTitle: "reelshub — контент-хаб для авторов",
    metaDescription:
      "Создай контент-хаб или встрой полки reels в свой сайт.",
    langSwitchLabel: "EN",
    langSwitchHref: "/en",
  },
  en: {
    emptyCmsTitle: "Directus is not ready yet",
    emptyCmsBodyBefore: "Run",
    emptyCmsBodyAfter: "and refresh the page.",
    connect: "Connect",
    logo: "Logo",
    logoHint: "SVG or PNG, up to 2 MB",
    palette: "Palette",
    month: "Month",
    year: "Year",
    perMonth: "per month",
    perMonthAnnual: "per month, billed annually",
    from: "from ",
    choose: "Choose",
    sending: "Sending…",
    contactFallback: "Telegram or email",
    consentPrefix: "I agree to the",
    consentLink: "Personal Data Processing Policy",
    thanks: "Thanks! We’ll write back within a day.",
    sendError: "Couldn’t send. Please try again.",
    currency: "RUB",
    numberLocale: "en-US",
    metaTitle: "reelshub — content hub for creators",
    metaDescription:
      "Build a content hub or embed reels shelves into your site.",
    langSwitchLabel: "RU",
    langSwitchHref: "/",
  },
};

const EN_NAV: NavLink[] = [
  { label: "PRICING", href: "#pricing" },
  { label: "Q&A", href: "#faq" },
  { label: "CONTACT", href: "#contact" },
];

const EN_SHELVES_SLIDES: CarouselSlide[] = [
  {
    type: "image",
    src: "081d2997-6503-4c26-8d1b-09d629821792",
    title: "Feel the power of Altai",
    body: "A place where thoughts fall silent and the heart beats with the mountains",
  },
  {
    type: "image",
    src: "2c59e822-faff-4108-8f25-19770cc83349",
  },
  {
    type: "image",
    src: "878f2507-98a8-4f8d-ac83-1afeae98658f",
  },
  {
    type: "video",
    src: "77801abe-caf7-4e5b-9ac8-dbd9c220a02a",
    poster: "081d2997-6503-4c26-8d1b-09d629821792",
  },
];

/** English content keyed by section `anchor` (falls back to type). */
const EN_BY_ANCHOR: Record<string, Partial<Section> & { items?: Record<string, unknown> }> = {
  top: {
    title: "Shooting reels every day?",
    subtitle: "1 Build yourself a content hub or 2 embed content into your site",
    body: "Build yourself a content hub or embed content into your site",
    cta_label: "Try it",
    items: {
      steps: [
        { badge: "1", text: "Build yourself a content hub or" },
        { badge: "2", text: "embed content into your site" },
      ],
    },
  },
  social: {
    title: "Integrations",
    items: {
      columns: [
        {
          id: "social",
          title: "Connect your social feeds",
          body: "Automatically import your content from social feeds to your site",
          icons: [
            "/media/tiktok-icon.png",
            "/media/youtube-icon.png",
            "/media/instagram-icon.jpeg",
          ],
        },
        {
          id: "plugin",
          title: "Plugin for Higgsfield & Claude",
          body: "Add text, photo, and video content without leaving reelshub",
          icons: ["/media/higgsfield-icon.png", "/media/claude-icon.webp"],
        },
      ],
    },
  },
  domain: {
    title: "Connect your domain in 1 click",
    body: "Enter a domain — the hub lives on it, no developer needed.",
    cta_label: "Leave a request",
  },
  brand: {
    title: "Add a logo, change the colors",
    body: "Logo, palette, and font — the hub looks like your product.",
    cta_label: "Leave a request",
  },
  shelves: {
    title: "Create reels “shelves” and upload content",
    body: "Group clips by topic and arrange them on shelves.",
    cta_label: "Leave a request",
    items: { carousel: EN_SHELVES_SLIDES },
  },
  embed: {
    title: "Embed shelves natively into your site",
    body: "A shelf lives inside your pages — like a native block, not an iframe.",
    cta_label: "Leave a request",
  },
  bridge: {
    title: "More ways to use the product:",
    body: "Link clips to services, products, and reviews. Add an infinite feed and more",
    cta_label: "Leave a request",
    items: {
      cards: [
        {
          letter: "a",
          text: "Add shelves to any product / service pages on your main site",
          metric: "+1.5–7.5% cart conversion",
        },
        {
          letter: "b",
          text: "Add a header selector with a link to your content hub",
          metric: "+6–9% active users",
        },
        {
          letter: "c",
          text: "Add product links inside clips — let the content hub sell",
          metric: "+2–3 minutes time on site",
        },
        {
          letter: "d",
          text: "Add an “infinite feed” to your mobile app or website",
          metric: "+1–2% carts with upsell",
        },
      ],
    },
  },
  pricing: {
    title: "Pricing",
    items: {
      plans: [
        {
          name: "Start",
          price: 11880,
          from: false,
          featured: false,
          features: [
            "1 hub on a shared domain",
            "3 shelves, up to 5 reels each",
            "Subdomain on reelshub",
          ],
        },
        {
          name: "Hub",
          price: 29880,
          from: false,
          featured: true,
          badge: "POPULAR",
          features: [
            "1 hub on your own domain",
            "20 shelves, up to 10 reels each",
            "Photo / video / gif reels",
            "Color scheme customization",
            "API access for social import",
            "Yandex.Metrica connection",
            "Token export to Yandex.Audience",
          ],
        },
        {
          name: "Studio",
          price: 82800,
          from: true,
          featured: false,
          features: [
            "Everything in Hub, plus:",
            "Multiple hubs on your domains",
            "From 30 shelves × 10 reels up to unlimited",
            "Photo / video / gif / poll reels",
            "Mobile app integration",
            "Infinite feed",
            "Embeds like TG video circles",
            "“Journal” module for article posting",
            "MCP & CLI (LLM integration)",
            "24/7 support",
          ],
        },
      ],
    },
  },
  contact: {
    title: "Want to try it?\nLeave your contacts",
    body: "We open access manually — we’ll write within a day.",
    cta_label: "Send",
    items: {
      contact_label: "Telegram or email",
      contact_placeholder: "@username",
      consent_text: "I agree to the Personal Data Processing Policy",
    },
  },
  faq: {
    title: "Q&A",
    items: {
      items: [
        {
          q: "Who is this for?",
          a: "Bloggers, course creators, travel businesses, clinics, construction companies, developers — anyone who shoots a lot of content, or wants to showcase user-generated (UGC) content.",
        },
        {
          q: "Do I need a developer?",
          a: "No. Domain, logo, and colors are configured in the admin panel.",
        },
        {
          q: "Where does the content come from?",
          a: "From your TikTok, YouTube, and Instagram feeds — import is automatic.",
        },
        {
          q: "Can I embed the hub into an existing site?",
          a: "Yes — as a separate block or page on your domain.",
        },
        {
          q: "Who owns the audience?",
          a: "You do: traffic goes to your domain, pixels and audiences are yours.",
        },
        {
          q: "Is the player fast?",
          a: "Video loads in about 0.25–1.5 seconds on average — and starts playing instantly, like Instagram or YouTube.",
        },
      ],
    },
  },
};

function deepMergeItems(
  base: Record<string, unknown> | null | undefined,
  overlay: Record<string, unknown> | undefined
): Record<string, unknown> | null {
  if (!overlay) return (base as Record<string, unknown>) || null;
  if (!base) return { ...overlay };
  const out: Record<string, unknown> = { ...base, ...overlay };
  // Keep mock / media helpers from CMS when EN overlay omits them
  if (base.mock != null && overlay.mock == null) out.mock = base.mock;
  if (base.carousel != null && overlay.carousel == null) out.carousel = base.carousel;
  return out;
}

export function localizeSection(section: Section, locale: Locale): Section {
  if (locale === "ru") return section;
  const key = section.anchor || section.type;
  const patch = EN_BY_ANCHOR[key];
  if (!patch) return section;
  return {
    ...section,
    title: patch.title ?? section.title,
    subtitle: patch.subtitle ?? section.subtitle,
    body: patch.body ?? section.body,
    cta_label: patch.cta_label ?? section.cta_label,
    items: deepMergeItems(section.items, patch.items),
  };
}

export function localizeSections(sections: Section[], locale: Locale): Section[] {
  return sections.map((s) => localizeSection(s, locale));
}

export function localizeSettings(
  settings: SiteSettings | null,
  locale: Locale
): {
  nav: NavLink[];
  footerLinks: NavLink[];
  tagline: string;
} {
  if (locale === "en") {
    return {
      nav: EN_NAV,
      footerLinks: EN_NAV,
      tagline: "Content hub for creators\n© 2026 reelshub",
    };
  }
  const nav =
    settings?.nav_links?.length
      ? settings.nav_links
      : [
          { label: "СТОИМОСТЬ", href: "#pricing" },
          { label: "Q&A", href: "#faq" },
          { label: "КОНТАКТЫ", href: "#contact" },
        ];
  return {
    nav,
    footerLinks: settings?.footer_links || nav,
    tagline: settings?.footer_tagline || "Контент-хаб для авторов\n© 2026 reelshub",
  };
}

export function shelvesSlidesFor(locale: Locale): CarouselSlide[] {
  return locale === "en" ? EN_SHELVES_SLIDES : DEFAULT_SHELVES_SLIDES;
}

export function formatMoney(n: number, locale: Locale) {
  const ui = UI[locale];
  const formatted = n.toLocaleString(ui.numberLocale).replace(/\u00a0/g, " ");
  return ui.currency === "RUB" ? `${formatted} ₽` : `$${formatted}`;
}
