# reelshub + Directus (v1)

Маркетинговый лендинг на **Next.js**, контент и админка — **Directus**.

## Быстрый старт

```bash
# 1. CMS
docker compose up -d

# 2. Схема + сиды (секции из README)
node scripts/bootstrap.mjs

# 3. Публичные права (если bootstrap на чистой БД уже сделал — ок; иначе:)
node scripts/public-permissions.mjs

# 4. Фронт
cd web && npm install && npm run dev
```

- Сайт: http://localhost:3000  
- Админка: http://localhost:8055/admin  
- Логин: `admin@reelshub.dev` / `admin123456`

## Что в Directus

| Коллекция | Назначение |
|---|---|
| `site_settings` | название, nav, footer, Telegram chat/token |
| `sections` | блоки лендинга (sort = порядок) |
| `leads` | заявки с `#contact` |

### Типы секций (`sections.type`)

`hero` · `intro_pair` · `feature` · `bridge` · `pricing` · `contact` · `faq`

Поля: `title`, `body`, `badge`, `cta_*`, `layout`, `tags`, `items` (JSON), `media_url*`, `annual_discount`.

v1 намеренно без admin-mock / share / retarget — их можно добавить тем же `feature` + `items`.

## Telegram (заготовка)

В `site_settings` есть `telegram_bot_token` и `telegram_chat_id`.  
Отправка в канал — следующий шаг (Directus Flow или маленький Go/Node webhook на create `leads`).
