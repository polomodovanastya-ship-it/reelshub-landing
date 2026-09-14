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

## Telegram (заявки с формы)

При отправке формы `#contact` Next.js сохраняет лид в Directus и шлёт сообщение боту.

### 1. Бот

1. Открой [@BotFather](https://t.me/BotFather) → `/newbot` → получи **token**.
2. Напиши боту любое сообщение (чтобы он мог отвечать тебе) **или** добавь бота в группу/канал как админа.
3. Узнай **chat_id**:
   - личный чат: напиши боту, затем открой  
     `https://api.telegram.org/bot<TOKEN>/getUpdates` — поле `message.chat.id`
   - группа: id обычно отрицательный (например `-100…`)

### 2. Env

**Прод** — в `.env.prod` на VPS:

```bash
TELEGRAM_BOT_TOKEN=123456:AA...
TELEGRAM_CHAT_ID=123456789
```

**Локально** — в `web/.env.local`:

```bash
DIRECTUS_URL=http://localhost:8055
TELEGRAM_BOT_TOKEN=123456:AA...
TELEGRAM_CHAT_ID=123456789
```

Перезапусти `web` (прод: `docker compose … up -d --build web`).

### 3. Проверка

Отправь тестовую заявку на сайте — в Telegram должно прийти сообщение.  
Если токен не задан, лид всё равно сохранится в Directus (`leads`), в логах web будет `Telegram env not set`.

Поля `telegram_*` в `site_settings` — устаревшая заготовка; секреты держи в env.
