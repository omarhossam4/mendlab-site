# Image assets

Drop real photography here using the filenames below. Until a real file exists,
the UI renders a branded gradient placeholder automatically — no code change is
needed to keep the site looking finished.

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

## Switching a placeholder to a real photo

Placeholders are rendered by `components/ui/ImagePlaceholder.tsx`. Once you add a
real file, pass `hasImage` at the call site to render it via `next/image`:

```tsx
<ImagePlaceholder src="/images/hero-image.jpg" alt="..." hasImage />
```

Service image paths are defined in `lib/services.ts`.
