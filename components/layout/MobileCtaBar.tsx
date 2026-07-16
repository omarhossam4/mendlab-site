"use client";

import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localeHref } from "@/lib/utils";
import { contactDetails } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Persistent bottom booking bar on mobile — keeps the primary conversion action
 * one tap away. Hidden on large screens (header CTA is always visible there) and
 * on the booking page itself (redundant).
 */
export function MobileCtaBar({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  if (pathname.includes("/booking")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-100 bg-surface/95 px-4 py-3 shadow-[0_-4px_20px_-6px_rgb(10_74_85_/0.2)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <a
          href={contactDetails.phoneHref}
          aria-label={dict.contact.info.phoneLabel}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary transition-colors hover:bg-primary-50"
        >
          <Phone className="h-5 w-5" />
        </a>
        <Button
          href={localeHref(locale, "/booking")}
          size="lg"
          className="flex-1"
        >
          {dict.nav.bookNow}
        </Button>
      </div>
    </div>
  );
}
