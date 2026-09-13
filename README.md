# Handoff: reelshub landing page (Canvas)

## Overview
A single-page Russian-language marketing site for **reelshub** — a content-hub product that lets a brand host its short-form video ("полки" / shelves) on its own domain, embed shelves into an existing site, share links, and drive retargeting. The page runs top to bottom: hero → social/plugin intro → 12 numbered feature and info sections → pricing → contact → FAQ → footer.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Next.js, etc.) using its established patterns, component library, and routing. If no environment exists yet, pick the framework most appropriate for the project and implement the designs there.

`Canvas.dc.html` and `CMS UI.dc.html` are authored in a small in-house template runtime (`support.js`): markup lives inside `<x-dc>`, logic in a `class Component extends DCLogic` script at the bottom, `{{ name }}` holes are filled by `renderVals()`. Read them as annotated markup — do not port the runtime.

## Fidelity
**High-fidelity.** Final colors, type, spacing and copy. Recreate pixel-for-pixel with the codebase's own primitives.

## Layout system
- Content container: `max-width: 1140px` (the admin section is 1160px), `margin: 0 auto`, `padding: 38px 40px`.
- Feature sections alternate text-left / mockup-right via `flex-direction: row-reverse` on odd entries; both columns are `flex: 1 1 0; min-width: 0`, gap `72px`.
- Each section has `min-height: 50svh` and vertical centering.
- Mobile (<760px) is handled by a runtime override system, described below — reimplement it as plain CSS media queries.

### Mobile override mechanism (must be reimplemented as CSS)
Every element that changes on mobile carries `data-m="<css declarations>"`. A script in the logic class (`applyLayout`) appends those declarations to the element's inline style when `innerWidth < 760`, and removes them above that. Elements with `data-m-scale="1440"` (the CMS mockup stage) are instead rendered at 1440px wide and CSS-`scale()`d down to the available width, with a negative `margin-bottom` compensating for the visual height.

**In the target codebase:** convert every `data-m` value into a `@media (max-width: 759px)` rule for that element, and the `data-m-scale` behavior into either a CSS `transform: scale(calc(100vw / 1440))` wrapper or a purpose-built responsive version of the CMS screen. Do not port the JS.

The page wrapper additionally clamps to `max-width: 430px; margin: 0 auto` on mobile.

## Screens / Sections

Ids are the in-page anchors; the numbered badge is the 28×28px green gradient pill shown above each headline.

| id | badge | Headline | Right/paired visual |
|---|---|---|---|
| `#top` | — | Hero: tag pills, H1, subhead, device frames, CTA | `reelshub-frame-desktop-2.png` + `reelshub-frame-mobile-2.png`, animated radial glow behind |
| `#social` / `#plugin` | — | Two intro columns with platform icons | TikTok / YouTube / Instagram icons; Higgsfield / Claude icons (56×56, radius 10) |
| `#domain` | 3 | Домен | — |
| `#brand` | 4 | Бренд | — |
| `#shelves` | 5 | Полки | `shelf-seoul.png` (280px) |
| `#embed` | 6 | «Встраивай полки нативно в свой сайт» — centered column | — |
| `#bridge` | 7 heading (no badge) | «Вот ещё сценарии использования продукта» — four a/b/c/d cards | each card: 24px gradient letter pill, description, and a green metric line pinned to the bottom (`margin-top:auto`) |
| `#admin` | — | CMS admin panel mockup | embeds the full `CMS UI` design at 1440px inside a 650px-tall, `overflow:hidden`, 1px `#E7E7E7` framed card |
| `#share` | 6 | «Делись с подписчиками» | share widget mockup (see below) |
| `#retarget` | 7 | «Настраивай рекламные цели и ретаргетинг» | HTML goals table (see below) |
| `#pricing` | — | Стоимость, monthly/annual toggle, 3 plans | — |
| `#contact` | — | Контакты | — |
| `#faq` | — | Q&A accordion (`<details>`) | — |
| `footer` | — | logo pill, copyright, links | `reelshub-logo-3.png` |

### `#bridge` metric lines (exact copy)
- a — Добавляй полки на любые страницы (товары / услуги) основного сайта → **+1,5–7,5% к конверсии в корзину**
- b — Добавь в шапку сайта селектор со ссылкой на контент-хаб → **+6–9% активных пользователей**
- c — Добавляй в ролики ссылку на нужные продукты → **+2–3 минуты к времени на сайте**
- d — Добавь «бесконечную ленту» в своё мобильное приложение или на сайт → **+1–2% корзин с апселлом**

Metric line: Roobert 15px/500, `line-height:1.2`, `letter-spacing:-.01em`, color `#17845A`, `padding-top: 8px`, `margin-top: auto`.
Card: `flex: 1 1 0`, column, gap 12px, `padding-top: 18px`, `border-top: 1px solid #000`.

### `#share` widget mockup
Panel: `aspect-ratio: 4/3`, `padding: 32px`, `border-radius: 10px`, background `#F5F3EF`, contents centered, inner column `max-width: 346px`, gap 12px. On mobile: `aspect-ratio: auto; padding: 26px 18px`.

1. Grey caption, left-aligned, 12px/400 `#9a9a9a`: **«Скопировано в буфер обмена»**
2. Link field: full width, height 40px, `border-radius: 75px`, background `linear-gradient(75deg,#0FFBC0,#2ECE8A)`, `padding: 0 18px`, text 14px `#181818`: **`yourdomain.com/reels/219137`**
3. Button row, 4 equal pills, gap 12px, each `height: 55px`, `border-radius: 75px`:
   - play — background `#E4DDD4`, icon `uploads/Play.png` 16px
   - share — background `linear-gradient(75deg,#0FFBC0,#2ECE8A)`, icon `uploads/Share_iOS_Export.png` 18px
   - chevron right (disabled look) — background `#FDFBF6`, icon 14px at `opacity: .35`
   - chevron left — background `#E4DDD4`, icon 14px

### `#retarget` goals table
White card, 1px `#E7E7E7`, radius 10, `overflow: hidden`. Header row: `padding: 14px 18px`, bottom border `#EFEFEF`, left label "ЦЕЛИ" 12px uppercase `letter-spacing: .08em` `#6d6d6d`, right count "12" 12px `#9a9a9a`.
Rows are `display: grid; grid-template-columns: 1.35fr .55fr 1fr; gap: 14px`. Top-level rows: `padding: 11px 18px`, title 14px/500 `#000`, id + description 12px `#6d6d6d`, every other row background `#FBFBFB`. Nested funnel rows: `padding: 9px 18px 9px 40px`, title 13px/400 `#181818`, id + description 12px `#9a9a9a`. The description column is hidden on mobile (`display: none`).

Rows, in order: Автоцель: отправка формы (ID 557643944) · Автоцель: клик по email (563238012) · Главная → просмотр полки (575246607) · Воронка контент-хаба (575749328, составная цель) with nested Пришёл на хаб / Посмотрел ролик / Перешёл в товар / Добавил в корзину (575749329/331/333/335) · Дошёл до оформления (575749471) · Заявка с полки (580045007).

### CMS admin panel (`CMS UI.dc.html`)
A 1440px-wide editor screen: 66px icon rail (`#F4F4F4`, right border `#E7E7E7`), a navigation column (Коллекции / Ролики / Полки / Авторы / Теги, then ОДИНОЧНЫЕ: Главная, Настройки хаба), and a detail pane with "← Назад", H1 **Новый ролик** 40px/600 with the **ЧЕРНОВИК** status pill inline to its right (`padding: 7px 16px`, radius 75px, background `#F2F2F2`, 12px uppercase, `letter-spacing: .06em`), tab strip (ЧЕРНОВИК active with 2px `#181818` underline / ОПУБЛИКОВАНО `#9a9a9a`), then a two-column form: Название, Описание (+ "макс. 80 символов"), Ссылка, Обложка dropzone (dashed `#C9C9C9`, radius 10, background `#FBFBFB`, gradient + button, caption **«Нажми или перетащи файл сюда»**), Автор, Полка, and an "Добавить блок контента" pill.

## Interactions & Behavior
- **Pricing toggle** — `state.annual`; annual multiplies each base price by 0.8 and rounds. Bases: 11 880 / 29 880 / 82 800 ₽. Format is `ru-RU` grouped with a normal space + " ₽"; the third plan is prefixed "от ". Period label switches between «в месяц» and «в месяц при оплате за год». The active toggle chip is `#181818` bg with `#fff` text; inactive is transparent on `#000`.
- **Hero glow** — two absolutely-positioned blurred radial divs animated with the Web Animations API: random `translate(-55..55%, -38..38%) scale(0.75..1.35)`, duration 1600–4200ms, easing `cubic-bezier(.19,1,.22,1)`, chained on finish. Purely decorative; a CSS keyframe drift is an acceptable substitute.
- **FAQ** — native `<details>/<summary>` with the marker hidden.
- **Buttons** — dark pill CTAs transition `opacity` and `letter-spacing` over `.8s cubic-bezier(.19,1,.22,1)`; hover is `opacity: .75; letter-spacing: .02em`. Links hover to `opacity: .6`. No fills or scale changes on hover.
- **Header** — fixed, transparent, 66px-equivalent bar; nav hidden below 760px and replaced by a 3-line burger button (`display: flex` on mobile, `order: 2`).

## State Management
Only two pieces of state: `annual` (pricing toggle) and the mobile/desktop breakpoint. In a real app the breakpoint becomes CSS; a leads form on `#contact` would be the only place needing data submission.

## Design Tokens
**Color**
- Ink `#000`, body ink `#181818`, muted `#6d6d6d`, light muted `#9a9a9a`, disabled icon `#C9C2B8`
- Surface `#fff`, warm panel `#F5F3EF`, warm pill `#E4DDD4`, warm pale `#FDFBF6`
- Neutral UI: `#F2F2F2`, `#FBFBFB`, `#F4F4F4`; hairlines `#E7E7E7`, `#EFEFEF`, dashed `#C9C9C9`
- Accent gradient `linear-gradient(75deg, #0FFBC0, #2ECE8A)` — badges, share button, link field
- Metric green `#17845A`

**Type** — Roobert (300/400/600/700), fallback `ui-sans-serif, system-ui, sans-serif`. H1 `clamp(30px, 4vw, 54px)`/600, section H2 `clamp(28px, 3.2vw, 44px)`/600, bridge H2 `clamp(24px, 2.6vw, 34px)`/600, lead 20px/300, body 19px/300, small 17px/300, UI 14–16px/400, micro-label 11–12px uppercase `letter-spacing: .08em`. Headlines use `letter-spacing: -.03em`, body `-.01em`; `text-wrap: pretty` throughout.

**Spacing** — section padding 38px 40px (mobile 24px 20px); column gap 72px (mobile 28px, stacked); element gaps 12/14/18px; card `padding-top: 18px`.

**Radius** — 0 for images and rows, 10px for cards/inputs/mockup frames, 75px for all pills and buttons. Nothing in between.

**Motion** — `cubic-bezier(.19,1,.22,1)` at .8s for transform/letter-spacing/opacity; `ease` at .4–.5s for color. No shadows anywhere; separation is by hairline or inversion.

## Assets
All under `assets/` (fonts in `assets/fonts/`, Roobert Light/Regular/SemiBold/Bold `.otf` — **licensed commercial face, the target project must hold a licence**; substitute Inter or Söhne otherwise) and `uploads/` (Play, Share, Chevron Left/Right icons, PNG, supplied by the client). Platform icons (TikTok, YouTube, Instagram, Higgsfield, Claude) are third-party marks — replace with the codebase's own icon assets where possible.

## Files
- `Canvas.dc.html` — the full landing page (markup + logic at the bottom of the file)
- `CMS UI.dc.html` — the admin-panel mockup embedded by `#admin`
- `support.js`, `image-slot.js` — runtime only, do not port
- `assets/`, `uploads/` — images and fonts
- `screenshots/` — desktop reference captures: 01 hero, 02 shelves, 03 bridge (a–d cards + metrics), 04 admin CMS, 05 share widget, 06 retargeting goals table, 07 pricing, 08 FAQ + footer
