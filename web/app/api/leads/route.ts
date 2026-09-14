import { NextResponse } from "next/server";

const DIRECTUS_URL =
  process.env.DIRECTUS_URL ||
  process.env.NEXT_PUBLIC_DIRECTUS_URL ||
  "http://localhost:8055";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function notifyTelegram(contact: string, name?: string | null) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[leads] Telegram env not set — skip notify");
    return;
  }

  const lines = [
    "<b>Новая заявка reelshub</b>",
    `Контакт: ${escapeHtml(contact)}`,
  ];
  if (name?.trim()) lines.push(`Имя: ${escapeHtml(name.trim())}`);

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[leads] Telegram error:", text);
  }
}

export async function POST(req: Request) {
  let body: { contact?: string; name?: string; consent?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  if (!contact || contact.length > 500) {
    return NextResponse.json({ error: "contact required" }, { status: 400 });
  }
  if (!body.consent) {
    return NextResponse.json({ error: "consent required" }, { status: 400 });
  }

  const name =
    typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;

  const res = await fetch(`${DIRECTUS_URL}/items/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact,
      name,
      consent: true,
      status: "new",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[leads] Directus error:", text);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 502 });
  }

  // Lead is saved — notify Telegram without failing the form if TG is down
  try {
    await notifyTelegram(contact, name);
  } catch (e) {
    console.error("[leads] Telegram exception:", e);
  }

  return NextResponse.json({ ok: true });
}
