import Link from "next/link";
import { localeHref } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

/**
 * Brand logo lockup: hexagon mark + wordmark. This is a styled placeholder —
 * drop the real logo into /public/logo/logo.svg and swap the mark for an
 * <Image> when the asset is ready.
 */
export function Logo({
  locale,
  className,
  variant = "dark",
}: {
  locale: Locale;
  className?: string;
  variant?: "dark" | "light";
}) {
  const textColor = variant === "light" ? "text-white" : "text-primary-dark";
  const markColor = variant === "light" ? "#ffffff" : "#0A4A55";

  return (
    <Link
      href={localeHref(locale, "/")}
      className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}
      aria-label="Mend Lab home"
    >
      <svg
        width="34"
        height="38"
        viewBox="0 0 34 38"
        fill="none"
        className="transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <path
          d="M17 1l15.6 9v18L17 37 1.4 28V10L17 1z"
          stroke={markColor}
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M17 10l7.8 4.5v9L17 28l-7.8-4.5v-9L17 10z"
          fill={markColor}
          fillOpacity="0.9"
        />
      </svg>
      <span
        className={`text-xl font-bold leading-none tracking-tight ${textColor}`}
      >
        Mend&nbsp;Lab
      </span>
    </Link>
  );
}
