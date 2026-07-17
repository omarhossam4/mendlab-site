import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { services } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceDetail } from "@/features/services/ServiceDetail";

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

      <section className="py-10 sm:py-16">
        <Container>
          {services.map((service, i) => (
            <ServiceDetail
              key={service.id}
              service={service}
              dict={dict}
              locale={locale}
              flip={i % 2 === 1}
            />
          ))}
        </Container>
      </section>

      {/* Brand tagline closing the price list, as on the printed sheet */}
      <section className="pb-20">
        <Container>
          <p className="border-t border-primary-100 pt-10 text-center text-xl font-semibold text-primary sm:text-2xl">
            {dict.services.tagline}
          </p>
        </Container>
      </section>
    </>
  );
}
