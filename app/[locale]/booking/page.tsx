import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/layout/PageHero";
import { BookingForm } from "@/features/booking/BookingForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/booking">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.booking.title, description: dict.booking.subtitle };
}

export default async function BookingPage({
  params,
}: PageProps<"/[locale]/booking">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={dict.booking.eyebrow}
        title={dict.booking.title}
        subtitle={dict.booking.subtitle}
      />
      <Section>
        <BookingForm locale={locale} dict={dict} />
      </Section>
    </>
  );
}
