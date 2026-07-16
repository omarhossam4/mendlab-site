import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

/**
 * Locale routing proxy (Next.js 16 renamed `middleware` -> `proxy`).
 * Ensures every request is prefixed with a supported locale (/en, /ar).
 * If a visitor hits a path without a locale we pick the best match from their
 * Accept-Language header, falling back to the default locale.
 */
function getPreferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (header) {
    const preferred = header
      .split(",")
      .map((part) => part.split(";")[0].trim().toLowerCase());
    for (const lang of preferred) {
      const base = lang.split("-")[0];
      const match = locales.find((locale) => locale === base);
      if (match) return match;
    }
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on all paths except Next internals, API routes, and files with an extension.
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
