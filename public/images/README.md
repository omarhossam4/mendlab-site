# Image assets

**Just drop your photos in this folder using the exact filenames below** — the
site uses them automatically. No code change is needed. Until a file exists (or
if one fails to load), a branded gradient placeholder renders in its place, so
the layout always looks finished.

## Expected files

| Filename | Used on | Suggested size |
| --- | --- | --- |
| `hero-image.jpg` | Home hero | 1000×1250 (4:5 portrait) |
| `mission-image.jpg` | Home mission section | 1200×900 (4:3) |
| `about-clinic.jpg` | About page story | 1200×900 (4:3) |
| `leadership-ahmed-hosny.jpg` | About page leadership | 600×600 (square) |
| `service-dry-cupping.jpg` | Services page | 1200×900 (4:3) |
| `service-wet-cupping.jpg` | Services page | 1200×900 (4:3) |
| `service-flash-cupping.jpg` | Services page | 1200×900 (4:3) |
| `service-recovery-massage.jpg` | Services page | 1200×900 (4:3) |
| `service-dry-needling.jpg` | Services page | 1200×900 (4:3) |
| `service-recovery-sessions.jpg` | Services page | 1200×900 (4:3) |
| `service-cupping-sessions.jpg` | Services page | 1200×900 (4:3) |

## Notes

- Filenames are **case-sensitive** and must match exactly (including `.jpg`).
- If your files are `.png`/`.webp`, either rename them to `.jpg` **or** update
  the paths: hero/mission/about paths live in the page/section files, and the
  per-service image paths live in [`lib/services.ts`](../../lib/services.ts).
- Only have **one** services photo? Name it after any single service; the rest
  keep their branded placeholders until you add more.
- Logo files go in [`public/logo/`](../logo/) — see that folder's README.
