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
# С VPS лучше внутренний IP контейнера (hairpin NAT на публичный URL часто висит):
DIP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{println}}{{end}}' "$(docker compose -f docker-compose.prod.yml --env-file .env.prod ps -q directus)" | head -1)
set -a && source .env.prod && set +a
export DIRECTUS_URL="http://$DIP:8055"
export DIRECTUS_ADMIN_EMAIL="$ADMIN_EMAIL"
export DIRECTUS_ADMIN_PASSWORD="$ADMIN_PASSWORD"
node scripts/bootstrap.mjs
node scripts/public-permissions.mjs
```

Или с ноутбука: `DIRECTUS_URL=https://cms.reelshub.pro` + те же admin env.

## Telegram (заявки)

1. Создай бота у [@BotFather](https://t.me/BotFather), возьми token.
2. Узнай chat_id (`getUpdates` после сообщения боту).
3. В `.env.prod`:

```bash
TELEGRAM_BOT_TOKEN=…
TELEGRAM_CHAT_ID=…
```

4. Пересобери/перезапусти web:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build web
```

Подробнее — `SETUP.md` § Telegram.

## URLs
- Site: https://reelshub.pro  
- Admin: https://cms.reelshub.pro/admin  
- Mail: как раньше на MX IP  

## Useful

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f caddy
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f web
```

Do **not** commit `.env.prod`.
