"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Swaps the locale segment of the current path, preserving the rest of the URL
 * so the user stays on the same page when switching languages.
 */
export function LanguageSwitcher({
  locale,
  label,
  className,
  tone = "dark",
}: {
  locale: Locale;
  label: string;
  className?: string;
  /** "dark" text for light backgrounds, "light" text for dark backgrounds. */
  tone?: "dark" | "light";
}) {
  const pathname = usePathname();
  const styles =
    tone === "light"
      ? {
          sep: "text-white/30",
          active: "text-white",
          inactive: "text-white/60 hover:text-white",
        }
      : {
          sep: "text-text-dark/25",
          active: "text-primary",
          inactive: "text-text-dark/55 hover:text-primary",
        };

  function pathForLocale(target: Locale) {
    const segments = pathname.split("/");
    // segments[0] is "", segments[1] is the current locale.
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    return segments.join("/") || `/${target}`;
  }

  return (
    <div
      className={cn("flex items-center gap-1 text-sm", className)}
      role="group"
      aria-label={label}
    >
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 ? <span className={cn("px-1", styles.sep)}>/</span> : null}
          <Link
            href={pathForLocale(l)}
            hrefLang={l}
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              "rounded px-1 font-medium transition-colors",
              l === locale ? styles.active : styles.inactive,
            )}
          >
            {localeNames[l]}
          </Link>
        </span>
      ))}
    </div>
  );
}
