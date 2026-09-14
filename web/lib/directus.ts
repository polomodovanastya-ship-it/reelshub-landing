export type NavLink = { label: string; href: string };

export type SiteSettings = {
  site_name: string;
  nav_links: NavLink[];
  footer_tagline: string;
  footer_links: NavLink[];
};

export type SectionType =
  | "hero"
  | "intro_pair"
  | "feature"
  | "bridge"
  | "pricing"
  | "contact"
  | "faq";

export type Section = {
  id: string;
  status: string;
  sort: number;
  type: SectionType;
  anchor: string | null;
  badge: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  layout: "text_left" | "text_right" | "centered" | null;
  tags: string[] | null;
  items: Record<string, unknown> | null;
  media_url: string | null;
  media_url_secondary: string | null;
  annual_discount: number | null;
};

const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";

export function getDirectusUrl() {
  return DIRECTUS_URL;
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${DIRECTUS_URL}/items/site_settings`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data;
    if (!data) return null;
    // singleton may arrive as object; collection mode as array of one
    return (Array.isArray(data) ? data[0] : data) as SiteSettings;
  } catch {
    return null;
  }
}

export async function fetchSections(): Promise<Section[]> {
  try {
    const params = new URLSearchParams({
      filter: JSON.stringify({ status: { _eq: "published" } }),
      sort: "sort",
      limit: "-1",
    });
    const res = await fetch(`${DIRECTUS_URL}/items/sections?${params}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []) as Section[];
  } catch {
    return [];
  }
}

export async function submitLead(payload: {
  contact: string;
  name?: string;
  consent?: boolean;
}) {
  // Server route saves to Directus and notifies Telegram
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact: payload.contact,
      name: payload.name || null,
      consent: !!payload.consent,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to submit lead");
  }
  const text = await res.text();
  if (!text) return { ok: true };
  try {
    return JSON.parse(text);
  } catch {
    return { ok: true };
  }
}
