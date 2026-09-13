# Production deploy — reelshub.pro

## DNS (reg.ru)
| Type | Name | Value |
|------|------|-------|
| A | `@` | VPS IP |
| A | `www` | VPS IP |
| A | `cms` | VPS IP |

## On the server

```bash
sudo apt update && sudo apt install -y git
cd ~
git clone https://github.com/polomodovanastya-ship-it/reelshub-landing.git
cd reelshub-landing

cp .env.prod.example .env.prod
nano .env.prod   # set DB_PASSWORD, DIRECTUS_SECRET, ADMIN_*

mkdir -p directus/uploads directus/extensions

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Bootstrap CMS (once)

When `https://cms.reelshub.pro` opens:

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

## Useful

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f caddy
docker compose -f docker-compose.prod.yml --env-file .env.prod pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Do **not** commit `.env.prod`.
