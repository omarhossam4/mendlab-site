"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { localeHref } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

/**
 * Brand logo lockup.
 *
 * If a real logo file exists it is used automatically:
 *   - `variant="dark"`  (on light backgrounds) → /logo/logo.svg
 *   - `variant="light"` (on dark backgrounds)  → /logo/logo-white.svg
 * If the file is missing, a styled inline hexagon + wordmark renders instead,
 * so the header/footer always look finished. Drop your files in /public/logo.
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
  const [failed, setFailed] = useState(false);
  // Dark variant (light backgrounds) uses the real transparent PNG logo.
  // Light variant (dark footer) uses a white version — drop /logo/logo-white.svg
  // (or .png) to replace the inline white wordmark fallback.
  const src = variant === "light" ? "/logo/logo-white.svg" : "/logo/logo.png";
  const textColor = variant === "light" ? "text-white" : "text-primary-dark";
  const markColor = variant === "light" ? "#ffffff" : "#0A4A55";

  return (
    <Link
      href={localeHref(locale, "/")}
      className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}
      aria-label="Mend Lab home"
    >
      {!failed ? (
        <Image
          src={src}
          alt="Mend Lab"
          width={293}
          height={160}
          priority
          className="h-10 w-auto sm:h-11"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
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
        </>
      )}
    </Link>
  );
}
