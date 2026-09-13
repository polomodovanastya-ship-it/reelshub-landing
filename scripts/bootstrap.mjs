/**
 * Bootstrap Directus schema + seed for reelshub landing v1.
 * Usage: node scripts/bootstrap.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || "admin@reelshub.dev";
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || "admin123456";

async function waitForDirectus(timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${DIRECTUS_URL}/server/health`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Directus did not become healthy in time");
}

async function login() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  const json = await res.json();
  return json.data.access_token;
}

function api(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  return {
    async get(path) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, { headers });
      return { res, json: await res.json().catch(() => ({})) };
    },
    async post(path, body) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      return { res, json: await res.json().catch(() => ({})) };
    },
    async patch(path, body) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      return { res, json: await res.json().catch(() => ({})) };
    },
  };
}

async function ensureCollection(client, collection, meta = {}, fields = []) {
  const { res } = await client.get(`/collections/${collection}`);
  if (res.ok) {
    console.log(`✓ collection ${collection} exists`);
    return;
  }
  const { res: createRes, json } = await client.post("/collections", {
    collection,
    meta: {
      singleton: false,
      icon: "view_agenda",
      ...meta,
    },
    schema: {},
    fields: [
      {
        field: "id",
        type: "uuid",
        meta: { hidden: true, readonly: true, interface: "input", special: ["uuid"] },
        schema: { is_primary_key: true, length: 36, has_auto_increment: false },
      },
      ...fields,
    ],
  });
  if (!createRes.ok) {
    throw new Error(`Failed to create ${collection}: ${JSON.stringify(json)}`);
  }
  console.log(`+ collection ${collection}`);
}

async function ensureField(client, collection, field) {
  const { res } = await client.get(`/fields/${collection}/${field.field}`);
  if (res.ok) return;
  const { res: createRes, json } = await client.post(`/fields/${collection}`, field);
  if (!createRes.ok) {
    throw new Error(
      `Failed to create field ${collection}.${field.field}: ${JSON.stringify(json)}`
    );
  }
  console.log(`  + field ${collection}.${field.field}`);
}

async function ensurePublicAccess(client) {
  // Directus 11: anonymous access via Public policy (role null in /access)
  const { json: policiesJson } = await client.get("/policies?limit=-1");
  const publicPolicy = (policiesJson.data || []).find(
    (p) => p.name === "$t:public_label" || p.name === "Public"
  );
  if (!publicPolicy) {
    console.warn("! Public policy not found");
    return;
  }

  async function ensurePerm(body) {
    const filter = encodeURIComponent(
      JSON.stringify({
        policy: { _eq: publicPolicy.id },
        collection: { _eq: body.collection },
        action: { _eq: body.action },
      })
    );
    const { json: existing } = await client.get(
      `/permissions?filter=${filter}&limit=1`
    );
    if (existing.data?.length) {
      console.log(`✓ public ${body.collection}.${body.action}`);
      return;
    }
    const { res, json } = await client.post("/permissions", {
      policy: publicPolicy.id,
      ...body,
      permissions: {},
    });
    if (!res.ok) {
      console.warn(
        `! public ${body.collection}.${body.action}: ${JSON.stringify(json)}`
      );
      return;
    }
    console.log(`+ public ${body.collection}.${body.action}`);
  }

  await ensurePerm({
    collection: "sections",
    action: "read",
    fields: ["*"],
  });
  await ensurePerm({
    collection: "site_settings",
    action: "read",
    fields: [
      "site_name",
      "nav_links",
      "footer_tagline",
      "footer_links",
      "status",
    ],
  });
  await ensurePerm({
    collection: "leads",
    action: "create",
    fields: ["name", "contact", "message", "consent", "status"],
  });
  await ensurePerm({
    collection: "directus_files",
    action: "read",
    fields: ["*"],
  });
}

async function uploadAsset(token, relativePath, title) {
  const abs = resolve(ROOT, relativePath);
  if (!existsSync(abs)) {
    console.warn(`! missing asset ${relativePath}`);
    return null;
  }
  const buf = readFileSync(abs);
  const name = relativePath.split("/").pop();
  const form = new FormData();
  const blob = new Blob([buf]);
  form.append("title", title || name);
  form.append("file", blob, name);

  const res = await fetch(`${DIRECTUS_URL}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    console.warn(`! upload failed ${relativePath}: ${await res.text()}`);
    return null;
  }
  const json = await res.json();
  return json.data.id;
}

async function seedIfEmpty(client, collection, items) {
  const { json } = await client.get(`/items/${collection}?limit=1`);
  if (json.data?.length) {
    console.log(`✓ ${collection} already seeded`);
    return json.data;
  }
  const { res, json: created } = await client.post(`/items/${collection}`, items);
  if (!res.ok) throw new Error(`Seed ${collection} failed: ${JSON.stringify(created)}`);
  console.log(`+ seeded ${collection} (${items.length} items)`);
  return created.data;
}

async function main() {
  console.log(`Waiting for Directus at ${DIRECTUS_URL}...`);
  await waitForDirectus();
  const token = await login();
  const client = api(token);

  // --- site_settings singleton ---
  await ensureCollection(
    client,
    "site_settings",
    {
      singleton: true,
      icon: "settings",
      note: "Глобальные настройки маркетингового лендинга",
    },
    [
      {
        field: "status",
        type: "string",
        meta: {
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "Draft", value: "draft" },
              { text: "Published", value: "published" },
            ],
          },
          width: "half",
        },
        schema: { default_value: "published" },
      },
      {
        field: "site_name",
        type: "string",
        meta: { interface: "input", width: "half" },
        schema: {},
      },
      {
        field: "nav_links",
        type: "json",
        meta: {
          interface: "list",
          options: {
            fields: [
              { field: "label", name: "Label", type: "string", meta: { interface: "input" } },
              { field: "href", name: "Href", type: "string", meta: { interface: "input" } },
            ],
          },
          note: "Ссылки в шапке",
        },
        schema: {},
      },
      {
        field: "footer_tagline",
        type: "text",
        meta: { interface: "input-multiline" },
        schema: {},
      },
      {
        field: "footer_links",
        type: "json",
        meta: {
          interface: "list",
          options: {
            fields: [
              { field: "label", name: "Label", type: "string", meta: { interface: "input" } },
              { field: "href", name: "Href", type: "string", meta: { interface: "input" } },
            ],
          },
        },
        schema: {},
      },
      {
        field: "telegram_bot_token",
        type: "string",
        meta: {
          interface: "input",
          options: { masked: true },
          note: "Секрет бота (лучше через env в проде)",
          width: "half",
        },
        schema: {},
      },
      {
        field: "telegram_chat_id",
        type: "string",
        meta: {
          interface: "input",
          note: "ID канала / чата для заявок",
          width: "half",
        },
        schema: {},
      },
    ]
  );

  // --- sections (page builder lite) ---
  await ensureCollection(
    client,
    "sections",
    {
      icon: "dashboard_customize",
      note: "Секции лендинга reelshub. Порядок = sort.",
      sort_field: "sort",
      display_template: "{{sort}}. {{type}} — {{title}}",
    },
    [
      {
        field: "status",
        type: "string",
        meta: {
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "Draft", value: "draft" },
              { text: "Published", value: "published" },
            ],
          },
          width: "half",
        },
        schema: { default_value: "published" },
      },
      {
        field: "sort",
        type: "integer",
        meta: { interface: "input", width: "half" },
        schema: {},
      },
      {
        field: "type",
        type: "string",
        meta: {
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "Hero", value: "hero" },
              { text: "Intro pair (social/plugin)", value: "intro_pair" },
              { text: "Feature", value: "feature" },
              { text: "Bridge (scenarios)", value: "bridge" },
              { text: "Pricing", value: "pricing" },
              { text: "Contact", value: "contact" },
              { text: "FAQ", value: "faq" },
            ],
          },
          width: "half",
          required: true,
        },
        schema: {},
      },
      {
        field: "anchor",
        type: "string",
        meta: {
          interface: "input",
          note: "id якоря: top, domain, pricing…",
          width: "half",
        },
        schema: {},
      },
      {
        field: "badge",
        type: "string",
        meta: { interface: "input", width: "half", note: "Номер/буква бейджа" },
        schema: {},
      },
      {
        field: "title",
        type: "text",
        meta: { interface: "input-multiline" },
        schema: {},
      },
      {
        field: "subtitle",
        type: "text",
        meta: { interface: "input-multiline" },
        schema: {},
      },
      {
        field: "body",
        type: "text",
        meta: { interface: "input-multiline" },
        schema: {},
      },
      {
        field: "cta_label",
        type: "string",
        meta: { interface: "input", width: "half" },
        schema: {},
      },
      {
        field: "cta_href",
        type: "string",
        meta: { interface: "input", width: "half" },
        schema: {},
      },
      {
        field: "layout",
        type: "string",
        meta: {
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "Text left / media right", value: "text_left" },
              { text: "Text right / media left", value: "text_right" },
              { text: "Centered", value: "centered" },
            ],
          },
          width: "half",
        },
        schema: { default_value: "text_left" },
      },
      {
        field: "tags",
        type: "json",
        meta: {
          interface: "tags",
          note: "Hero pills: SAAS, CMS…",
        },
        schema: {},
      },
      {
        field: "items",
        type: "json",
        meta: {
          interface: "input-code",
          options: { language: "json" },
          note: "Структурированные данные: intro columns, bridge cards, plans, faq",
        },
        schema: {},
      },
      {
        field: "media_url",
        type: "string",
        meta: {
          interface: "input",
          note: "Путь к картинке (v1: /assets/... с фронта или URL Directus)",
        },
        schema: {},
      },
      {
        field: "media_url_secondary",
        type: "string",
        meta: { interface: "input", note: "Второй медиа-файл (desktop frame и т.п.)" },
        schema: {},
      },
      {
        field: "annual_discount",
        type: "float",
        meta: {
          interface: "input",
          note: "Множитель годовой цены (0.8 = −20%)",
          width: "half",
        },
        schema: { default_value: 0.8 },
      },
    ]
  );

  // --- leads ---
  await ensureCollection(
    client,
    "leads",
    {
      icon: "inbox",
      note: "Заявки с формы #contact",
    },
    [
      {
        field: "status",
        type: "string",
        meta: {
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "New", value: "new" },
              { text: "Sent to TG", value: "sent" },
              { text: "Failed", value: "failed" },
            ],
          },
        },
        schema: { default_value: "new" },
      },
      {
        field: "name",
        type: "string",
        meta: { interface: "input" },
        schema: {},
      },
      {
        field: "contact",
        type: "string",
        meta: { interface: "input", required: true, note: "Telegram или email" },
        schema: {},
      },
      {
        field: "message",
        type: "text",
        meta: { interface: "input-multiline" },
        schema: {},
      },
      {
        field: "consent",
        type: "boolean",
        meta: { interface: "boolean" },
        schema: { default_value: false },
      },
      {
        field: "date_created",
        type: "timestamp",
        meta: { interface: "datetime", special: ["date-created"], readonly: true },
        schema: {},
      },
    ]
  );

  // Public anonymous access (Directus 11 Public policy)
  await ensurePublicAccess(client);

  // Seed settings
  const { json: settingsExisting } = await client.get("/items/site_settings");
  if (!settingsExisting.data || (Array.isArray(settingsExisting.data) && !settingsExisting.data.length) || !settingsExisting.data.site_name) {
    await client.patch("/items/site_settings", {
      status: "published",
      site_name: "reelshub",
      nav_links: [
        { label: "СТОИМОСТЬ", href: "#pricing" },
        { label: "Q&A", href: "#faq" },
        { label: "КОНТАКТЫ", href: "#contact" },
      ],
      footer_tagline: "Контент-хаб для авторов\n© 2026 reelshub",
      footer_links: [
        { label: "СТОИМОСТЬ", href: "#pricing" },
        { label: "Q&A", href: "#faq" },
        { label: "КОНТАКТЫ", href: "#contact" },
      ],
      telegram_chat_id: "",
      telegram_bot_token: "",
    });
    console.log("+ seeded site_settings");
  } else {
    console.log("✓ site_settings already set");
  }

  const sections = [
    {
      status: "published",
      sort: 1,
      type: "hero",
      anchor: "top",
      tags: ["SAAS", "CMS", "NO X"],
      title: "Снимаешь reels ежедневно?",
      subtitle:
        "1 Создай себе контент-хаб или 2 встрой контент в свой сайт",
      body: "Создай себе контент-хаб или встрой контент в свой сайт",
      cta_label: "Попробовать",
      cta_href: "#contact",
      layout: "centered",
      media_url: "/media/reelshub-frame-mobile-2.png",
      media_url_secondary: "/media/reelshub-frame-desktop-2.png",
      items: {
        steps: [
          { badge: "1", text: "Создай себе контент-хаб или" },
          { badge: "2", text: "встрой контент в свой сайт" },
        ],
      },
    },
    {
      status: "published",
      sort: 2,
      type: "intro_pair",
      anchor: "social",
      title: "Интеграции",
      layout: "centered",
      items: {
        columns: [
          {
            id: "social",
            title: "Интеграция с твоими соц. сетями",
            body: "Автоматический импортируй свой контент из лент на сайт",
            icons: [
              "/media/tiktok-icon.png",
              "/media/youtube-icon.png",
              "/media/instagram-icon.jpeg",
            ],
          },
          {
            id: "plugin",
            title: "Плагин для Higgsfield & Claude",
            body: "Добавляй свой текстовый, фото и видео контент, не выходя из reelshub",
            icons: ["/media/higgsfield-icon.png", "/media/claude-icon.webp"],
          },
        ],
      },
    },
    {
      status: "published",
      sort: 3,
      type: "feature",
      anchor: "domain",
      badge: "1",
      title: "Подключи к своему домену в 1 клик",
      body: "Указываешь домен — хаб живёт на нём, без разработчика.",
      cta_label: "Оставить заявку",
      cta_href: "#contact",
      layout: "text_left",
      items: { mock: "domain" },
    },
    {
      status: "published",
      sort: 4,
      type: "feature",
      anchor: "brand",
      badge: "2",
      title: "Добавь лого, поменяй цвета",
      body: "Логотип, палитра и шрифт — хаб выглядит как твой продукт.",
      cta_label: "Оставить заявку",
      cta_href: "#contact",
      layout: "text_right",
      items: { mock: "brand" },
    },
    {
      status: "published",
      sort: 5,
      type: "feature",
      anchor: "shelves",
      badge: "3",
      title: "Создавай «полки» роликов и заливай контент",
      body: "Группируй ролики по темам и раскладывай их по полкам.",
      cta_label: "Оставить заявку",
      cta_href: "#contact",
      layout: "text_left",
      media_url: "/media/shelf-seoul.png",
    },
    {
      status: "published",
      sort: 6,
      type: "feature",
      anchor: "embed",
      badge: "4",
      title: "Встраивай полки нативно в свой сайт",
      body: "Полка живёт внутри твоих страниц — как родной блок, а не iframe.",
      cta_label: "Оставить заявку",
      cta_href: "#contact",
      layout: "centered",
    },
    {
      status: "published",
      sort: 7,
      type: "bridge",
      anchor: "bridge",
      title: "Вот ещё сценарии использования продукта:",
      body: "Пролинковывай ролики в услуги и товары, отзывы. Добавляй бесконечную ленту и не только",
      cta_label: "Оставить заявку",
      cta_href: "#contact",
      items: {
        cards: [
          {
            letter: "a",
            text: "Добавляй полки на любые страницы (товары / услуги) основного сайта",
            metric: "+1,5–7,5% к конверсии в корзину",
          },
          {
            letter: "b",
            text: "Добавь в шапку сайта селектор со ссылкой на контент-хаб",
            metric: "+6–9% активных пользователей",
          },
          {
            letter: "c",
            text: "Добавляй в ролики ссылку на нужные продукты — пусть контент-хаб продаёт",
            metric: "+2–3 минуты к времени на сайте",
          },
          {
            letter: "d",
            text: "Добавь «бесконечную ленту» в своё мобильное приложение или на сайт",
            metric: "+1–2% корзин с апселлом",
          },
        ],
      },
    },
    {
      status: "published",
      sort: 8,
      type: "pricing",
      anchor: "pricing",
      title: "Стоимость",
      annual_discount: 0.8,
      items: {
        plans: [
          {
            name: "Старт",
            price: 11880,
            from: false,
            featured: false,
            features: [
              "1 хаб на общем домене",
              "3 полки до 5 reels каждая",
              "Суб-домен на reelshub",
            ],
          },
          {
            name: "Хаб",
            price: 29880,
            from: false,
            featured: true,
            badge: "ПОПУЛЯРНО",
            features: [
              "1 хаб на своем домене",
              "20 полок до 10 reels каждая",
              "Фото / видео / gif reels",
              "Настройка цветовой схемы",
              "Доступ к API для импорта из соц. сетей",
              "Подключение Я.Метрики",
              "Экспорт токенов в Яндекс.Аудитории",
            ],
          },
          {
            name: "Студия",
            price: 82800,
            from: true,
            featured: false,
            features: [
              "Всё, что в «Хаб», а также:",
              "Несколько хабов на своих доменах",
              "от 30 полок до 10 reels и до безлимита",
              "Фото / видео / gif / опросы reels",
              "Интеграция в мобильное приложение",
              "Бесконечная лента",
              "Встраивание aka TG-кружочков",
              "Модуль «Журнал» для постинга статей",
              "MCP & CLI (интеграция с LLM)",
              "Поддержка 24x7",
            ],
          },
        ],
      },
    },
    {
      status: "published",
      sort: 9,
      type: "contact",
      anchor: "contact",
      title: "Как попробовать?\nОставьте контакты",
      body: "Открываем доступ вручную — напишем в течение дня.",
      cta_label: "Отправить",
      items: {
        contact_label: "Telegram или email",
        contact_placeholder: "@username",
        consent_text: "Я согласен с Политикой обработки персональных данных",
      },
    },
    {
      status: "published",
      sort: 10,
      type: "faq",
      anchor: "faq",
      title: "Q&A",
      items: {
        items: [
          {
            q: "Кому это полезно?",
            a: "Блоггерам, авторам курсов, туристическому бизнесу, клиникам, строительным компаниям, застройщикам — всем, кто снимает много контента, или кто хочет показать пользовательский (UGC) контент.",
          },
          {
            q: "Нужен ли разработчик?",
            a: "Нет. Домен, лого и цвета настраиваются в админ-панели.",
          },
          {
            q: "Откуда берётся контент?",
            a: "Из ваших лент TikTok, YouTube и Instagram — импорт автоматический.",
          },
          {
            q: "Можно встроить хаб в существующий сайт?",
            a: "Да, отдельным блоком или страницей на вашем домене.",
          },
          {
            q: "Кому принадлежит аудитория?",
            a: "Вам: трафик идёт на ваш домен, пиксели и аудитории — ваши.",
          },
          {
            q: "А плеер быстро работает?",
            a: "Видео загружается в среднем от 0.25 до 1.5 секунд — и начинает играть моментально, как у Instagram или YouTube.",
          },
        ],
      },
    },
  ];

  await seedIfEmpty(client, "sections", sections);

  console.log("\nDone.");
  console.log(`Admin:  ${DIRECTUS_URL}/admin`);
  console.log(`Login:  ${EMAIL} / ${PASSWORD}`);
  console.log("Web:    http://localhost:3000 (after npm run dev in web/)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
