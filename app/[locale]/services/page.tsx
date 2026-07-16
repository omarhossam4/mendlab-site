import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { services, serviceCategories } from "@/lib/services";
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

      {serviceCategories.map((category) => {
        const inCategory = services.filter((s) => s.category === category);
        return (
          <section key={category} className="py-14 sm:py-20">
            <Container>
              <h2 className="mb-2 text-2xl font-bold text-text-dark sm:text-3xl">
                {dict.services.categories[category]}
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-accent" />
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
    </>
  );
}
