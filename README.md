# Mend Lab — Recovery & Wellness Clinic

A premium, bilingual (English + Arabic with full RTL) marketing and booking
website for **Mend Lab**, a science-driven recovery and wellness clinic in
Cairo, Egypt.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first theme in [`app/globals.css`](app/globals.css))
- **Native i18n** with locale-prefixed routing (`/en`, `/ar`) and automatic
  `dir="rtl"` for Arabic — no i18n library dependency, using the App Router's
  built-in dictionary pattern
- **Motion** (Framer Motion) for subtle scroll reveals
- **Lucide** icons
- Deploy target: **Vercel** (Hobby/free plan friendly — fully static + a light
  routing proxy)

## Project structure

```
app/
  [locale]/            # Locale-scoped routes (root layout lives here)
    layout.tsx         # <html dir>, fonts, Header/Footer, per-locale metadata
    page.tsx           # Home
    services/          # About / Booking / Contact each in their own folder
    about/  booking/  contact/
    not-found.tsx      # Bilingual 404
  globals.css          # Tailwind v4 theme (brand colors, fonts, RTL, motifs)
  sitemap.ts  robots.ts
components/
  ui/                  # Button, Card, Section, Container, form fields, icons…
  layout/              # Header, Footer, Logo, LanguageSwitcher, PageHero
features/
  home/ services/ booking/ contact/ shared/   # Page-level building blocks
i18n/
  config.ts            # locales, direction, names
  dictionaries.ts      # server-only loader
  dictionaries/en.json, ar.json                # all site copy
lib/
  services.ts          # service catalogue + pricing (structural data)
  navigation.ts  utils.ts  submit.ts
types/
proxy.ts               # Locale routing (Next 16 renamed middleware → proxy)
Code.gs                # Google Apps Script placeholder for the booking sheet
```

Translatable copy lives in `i18n/dictionaries/*.json`; non-translatable service
data (ids, prices, imagery) lives in `lib/services.ts`.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev
```

Open <http://localhost:3000> — you'll be redirected to `/en` (or `/ar` based on
your browser's `Accept-Language`).

### Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Description |
| --- | --- | --- |
| `BOOKING_SCRIPT_URL` | for booking/contact forms | Google Apps Script Web App URL that appends submissions to your Google Sheet (server-only) |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public origin (e.g. `https://www.mendlab.eg`) used for `sitemap.xml` / `robots.txt` |

Until `BOOKING_SCRIPT_URL` is set, the forms validate and show a clear
"not connected yet" message instead of silently failing.

> **After editing `.env.local` you must restart the dev server** (`Ctrl+C`, then
> `npm run dev`). Next.js only reads env files at startup.

## Connecting the booking + contact forms to Google Sheets

The site has **no database** — form submissions are appended to a Google Sheet
via a Google Apps Script Web App. There is no payment processing and no auth;
this is a lead-capture form only.

**How it flows:** browser → `/api/submit` (this app's server route) → Apps Script
→ Google Sheet. Posting from our own server (instead of the browser) means there
are no CORS problems and the app gets a **real success/failure response** back,
so errors are actually visible.

1. **Create a Google Sheet** (any name). Copy its ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`.
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete the default code and paste the contents of [`Code.gs`](Code.gs).
   Optionally set `SHEET_ID` (leave blank to use the bound sheet).
4. **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone (this is required — otherwise the server gets an
     HTML login page instead of your script)
   - Authorize when prompted.
5. Copy the **Web App URL** (it ends in `/exec`) and set it as
   `BOOKING_SCRIPT_URL` in `.env.local` (and in Vercel's env settings for
   production). **Restart the dev server** after editing `.env.local`.
6. Test: open **/en/booking**, complete a booking, and confirm a new row appears
   in the **Bookings** tab.

The script auto-creates two tabs — **Bookings** and **Contacts** — and writes a
header row on first use. Bookings and contact messages are distinguished by the
`type` field sent from the site.

**Troubleshooting**

- _"Booking is not connected yet"_ → `BOOKING_SCRIPT_URL` is empty or the dev
  server wasn't restarted after editing `.env.local`.
- _Submission fails / no row appears_ → re-deploy the Apps Script with **Who has
  access: Anyone**, and make sure you copied the `…/exec` URL (not `…/dev`).
- You can sanity-check the URL by opening it in a browser — it should return
  `{"ok":true,"service":"Mend Lab submissions endpoint"}`.

## Adding real images & logo

Everywhere a photo will go, the UI currently renders a branded gradient
placeholder, so the site looks finished without any assets.

- **Photos:** drop files into [`public/images/`](public/images/) using the
  filenames listed in [`public/images/README.md`](public/images/README.md), then
  pass `hasImage` at the relevant `<ImagePlaceholder>` call site to switch to the
  real photo. Service image paths are defined in `lib/services.ts`.
- **Logo:** replace [`public/logo/logo.svg`](public/logo/logo.svg). The header
  currently uses an inline SVG lockup in `components/layout/Logo.tsx` — swap it
  for an `<Image src="/logo/logo.svg" …>` when the final logo is ready.

## Editing content & translations

All copy is in [`i18n/dictionaries/en.json`](i18n/dictionaries/en.json) and
[`ar.json`](i18n/dictionaries/ar.json). Keep the two files structurally
identical. Pricing tiers live in `lib/services.ts`.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project at <https://vercel.com/new>. Framework preset: **Next.js**
   (auto-detected). No build config changes needed.
3. Add the environment variables (`NEXT_PUBLIC_BOOKING_SCRIPT_URL`,
   `NEXT_PUBLIC_SITE_URL`) under **Settings → Environment Variables**.
4. Deploy. `sitemap.xml` and `robots.txt` are generated automatically.

## Accessibility & SEO

- Semantic landmarks, ARIA labels, keyboard-navigable menu and forms
- `prefers-reduced-motion` respected (animations disabled)
- Per-locale `<title>`, meta description, and Open Graph tags; `hreflang`
  alternates in the sitemap; RTL-correct layout for Arabic

---

_Mend Lab provides wellness and recovery services and is not a substitute for
medical advice._
