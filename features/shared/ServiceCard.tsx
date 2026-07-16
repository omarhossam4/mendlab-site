import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Service } from "@/lib/services";
import { getServiceCopy, getServiceFullName } from "@/lib/services";
import { cn, formatPrice, localeHref } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

/** Compact service card used on the home preview and elsewhere. */
export function ServiceCard({
  service,
  dict,
  locale,
}: {
  service: Service;
  dict: Dictionary;
  locale: Locale;
}) {
  const item = getServiceCopy(dict, service.id);
  const isRtl = locale === "ar";

  return (
    <Card hover className="flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
          <ServiceIcon name={service.icon} className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary">
          {formatPrice(service.priceEGP, locale)}{" "}
          <span className="text-xs font-medium text-text-dark/60">
            {dict.common.egp}
          </span>
        </span>
      </div>
      <h3 className="text-lg font-semibold text-text-dark">
        {getServiceFullName(dict, service)}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-dark/70">
        {item.short}
      </p>
      <Link
        href={localeHref(locale, `/services#${service.slug}`)}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-primary"
      >
        {dict.common.learnMore}
        <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
      </Link>
    </Card>
  );
}
