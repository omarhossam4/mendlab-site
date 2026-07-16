import { ArrowRight } from "lucide-react";
import type { LocalizedProps } from "@/types";
import { services } from "@/lib/services";
import { cn, localeHref } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceCard } from "@/features/shared/ServiceCard";

export function ServicesPreview({ locale, dict }: LocalizedProps) {
  const t = dict.home.servicesPreview;
  const isRtl = locale === "ar";
  // Preview the first six services on the home page.
  const preview = services.slice(0, 6);

  return (
    <Section>
      <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((service, i) => (
          <Reveal key={service.id} delay={(i % 3) * 0.08}>
            <ServiceCard service={service} dict={dict} locale={locale} />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button href={localeHref(locale, "/services")} variant="outline" size="lg">
          {t.cta}
          <ArrowRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
        </Button>
      </div>
    </Section>
  );
}
