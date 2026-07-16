import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getServiceCopy, type Service } from "@/lib/services";
import { cn, formatPrice, localeHref } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { Reveal } from "@/components/ui/Reveal";

/** Full service section: overview, how-it-works, benefits, and price. */
export function ServiceDetail({
  service,
  dict,
  locale,
  flip = false,
}: {
  service: Service;
  dict: Dictionary;
  locale: Locale;
  /** Alternate media/content order for visual rhythm down the page. */
  flip?: boolean;
}) {
  const item = getServiceCopy(dict, service.id);
  const t = dict.services;

  return (
    <Reveal>
      <article
        id={service.slug}
        className="scroll-mt-28 border-t border-primary-100/60 py-14 first:border-t-0"
      >
        <div
          className={cn(
            "grid items-start gap-10 lg:grid-cols-2",
            flip && "lg:[&>*:first-child]:order-2",
          )}
        >
          {/* Media */}
          <ImagePlaceholder
            src={service.image}
            alt={item.name}
            icon={service.icon}
            className="aspect-[4/3] rounded-3xl"
          />

          {/* Copy */}
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
                <h3 className="text-2xl font-bold text-text-dark sm:text-3xl">
                  {item.name}
                </h3>
              </div>
              <span className="rounded-full bg-primary-dark px-4 py-1.5 text-lg font-bold text-white">
                {formatPrice(service.priceEGP, locale)}{" "}
                <span className="text-xs font-medium text-white/70">
                  {dict.common.egp}
                </span>
              </span>
            </div>

            <p className="text-base leading-relaxed text-text-dark/75">
              {item.description}
            </p>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              {/* How it works */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
                  {t.howItWorksLabel}
                </h4>
                <ol className="mt-3 space-y-2.5">
                  {item.howItWorks.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-text-dark/75">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
                  {t.benefitsLabel}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {item.benefits.map((benefit, i) => (
                    <li key={i} className="flex gap-3 text-sm text-text-dark/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-xs text-text-dark/55">{t.priceNote}</p>

            <div className="mt-5">
              <Button href={localeHref(locale, "/booking")} variant="primary">
                {t.bookThis}
              </Button>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
