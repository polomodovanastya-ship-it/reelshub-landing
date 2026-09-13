# Production deploy — reelshub.pro (рядом с Mailcow)

## Два IP на одной VPS

| IP | Роль |
|---|---|
| `72.56.119.41` | Mailcow / MX — **не трогать** |
| `72.56.127.16` | Сайт + Directus (Caddy только на этом IP) |

## DNS (reg.ru)

| Type | Name | Value |
|------|------|-------|
| A | `@` | **72.56.127.16** |
| A | `www` | **72.56.127.16** |
| A | `cms` | **72.56.127.16** |
| MX / A `mail` | … | оставь на **72.56.119.41** |

## На сервере

```bash
# убедись, что оба IP на eth0
ip -4 addr show eth0

cd ~
git clone https://github.com/polomodovanastya-ship-it/reelshub-landing.git
# или: cd reelshub-landing && git pull

cd reelshub-landing
cp .env.prod.example .env.prod
nano .env.prod   # BIND_IP=72.56.127.16 + пароли

mkdir -p directus/uploads directus/extensions

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Проверка, что Caddy слушает только app-IP:

```bash
sudo ss -tlnp | grep -E ':80|:443'
# ожидаемо что-то вроде 72.56.127.16:80 / :443 у caddy
# 72.56.119.41:80 / :443 — у mailcow/nginx
```

## Bootstrap CMS (один раз)

Когда открывается `https://cms.reelshub.pro`:

```bash
export DIRECTUS_URL=https://cms.reelshub.pro
export DIRECTUS_ADMIN_EMAIL='…from .env.prod…'
export DIRECTUS_ADMIN_PASSWORD='…from .env.prod…'
node scripts/bootstrap.mjs
node scripts/public-permissions.mjs
```

## URLs
- Site: https://reelshub.pro  
- Admin: https://cms.reelshub.pro/admin  
- Mail: как раньше на MX IP  

## Useful

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f caddy
```

Do **not** commit `.env.prod`.
