# Logo assets

Replace these placeholder files with the real Mend Lab logo. The header and
footer pick them up automatically — no code change needed.

| Filename | Where it shows | Notes |
| --- | --- | --- |
| `logo.svg` | Header (white background) | Use the full-color / dark logo. |
| `logo-white.svg` | Footer (dark teal background) | Use a white / light version. |

- **Formats:** `.svg` is ideal (crisp at any size). `.png` works too — if you use
  PNG, keep the same base name and update the extension in
  `components/layout/Logo.tsx` (the `src` paths).
- **Size:** the logo renders at ~36px tall; supply something ~150×42 or larger.
- If a file is missing, an inline hexagon + "Mend Lab" wordmark renders as a
  fallback, so nothing ever looks broken.
