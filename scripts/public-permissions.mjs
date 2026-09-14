/**
 * Grant public policy permissions for marketing content + lead create.
 * Directus 11 uses policies; public policy is linked via access with role=null.
 */
const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || "admin@reelshub.dev";
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || "admin123456";

async function main() {
  const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) throw new Error(await loginRes.text());
  const { data } = await loginRes.json();
  const headers = {
    Authorization: `Bearer ${data.access_token}`,
    "Content-Type": "application/json",
  };

  const policiesRes = await fetch(`${DIRECTUS_URL}/policies?limit=-1`, {
    headers,
  });
  const policiesJson = await policiesRes.json();
  const publicPolicy = (policiesJson.data || []).find(
    (p) => p.name === "$t:public_label" || p.name === "Public"
  );
  if (!publicPolicy) throw new Error("Public policy not found");
  console.log("public policy", publicPolicy.id);

  async function ensurePerm({ collection, action, fields }) {
    const filter = encodeURIComponent(
      JSON.stringify({
        policy: { _eq: publicPolicy.id },
        collection: { _eq: collection },
        action: { _eq: action },
      })
    );
    const existing = await fetch(`${DIRECTUS_URL}/permissions?filter=${filter}&limit=1`, {
      headers,
    });
    const exJson = await existing.json();
    if (exJson.data?.length) {
      const perm = exJson.data[0];
      const same =
        JSON.stringify(perm.fields || []) === JSON.stringify(fields);
      if (same) {
        console.log(`✓ ${collection}.${action}`);
        return;
      }
      const res = await fetch(`${DIRECTUS_URL}/permissions/${perm.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ fields }),
      });
      if (!res.ok) throw new Error(await res.text());
      console.log(`↻ ${collection}.${action} fields`);
      return;
    }
    const res = await fetch(`${DIRECTUS_URL}/permissions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        policy: publicPolicy.id,
        collection,
        action,
        fields,
        permissions: {},
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    console.log(`+ ${collection}.${action}`);
  }

  await ensurePerm({ collection: "sections", action: "read", fields: ["*"] });
  await ensurePerm({
    collection: "site_settings",
    action: "read",
    // Never expose telegram_bot_token / telegram_chat_id publicly
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

  const check = await fetch(`${DIRECTUS_URL}/items/sections?sort=sort&limit=3`);
  const checkJson = await check.json();
  console.log(
    "public sections:",
    checkJson.data?.map((s) => `${s.sort}:${s.type}`) || checkJson
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
