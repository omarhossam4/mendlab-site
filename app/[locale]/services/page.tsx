import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Info, Activity, Heart, Smile, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { services, serviceCategories } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceDetail } from "@/features/services/ServiceDetail";

/** Icons for the four session highlights, in dictionary order. */
const highlightIcons: LucideIcon[] = [Activity, Heart, TrendingUp, Smile];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.services.title,
    description: dict.services.subtitle,
  };
}

export default async function ServicesPage({
  params,
}: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={dict.services.eyebrow}
        title={dict.services.title}
        subtitle={dict.services.subtitle}
      />

      {serviceCategories.map((category) => {
        const inCategory = services.filter((s) => s.category === category);
        const meta = dict.services.categories[category];
        return (
          <section key={category} className="py-14 sm:py-20">
            <Container>
              <h2 className="text-2xl font-bold text-text-dark sm:text-3xl">
                {meta.name}
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-accent" />
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-dark/70">
                {meta.description}
              </p>
              <div className="mt-2">
                {inCategory.map((service, i) => (
                  <ServiceDetail
                    key={service.id}
                    service={service}
                    dict={dict}
                    locale={locale}
                    flip={i % 2 === 1}
                  />
                ))}
              </div>
            </Container>
          </section>
        );
      })}

      {/* Session highlights + note (mirrors the printed price list) */}
      <section className="pb-20">
        <Container>
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dict.services.highlights.map((highlight, i) => {
                const Icon = highlightIcons[i % highlightIcons.length];
                return (
                  <Card key={highlight} className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wide text-text-dark">
                      {highlight}
                    </span>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-primary-100 bg-primary-50/50 p-5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-text-dark/75">
                <span className="font-semibold text-text-dark">
                  {dict.services.noteLabel}:
                </span>{" "}
                {dict.services.note}
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
