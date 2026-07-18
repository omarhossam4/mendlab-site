import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Hero } from "@/features/home/Hero";
import { MissionSection } from "@/features/home/MissionSection";
import { WhySection } from "@/features/home/WhySection";
import { ServicesPreview } from "@/features/home/ServicesPreview";
import { CtaSection } from "@/features/home/CtaSection";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <MissionSection locale={locale} dict={dict} />
      <WhySection locale={locale} dict={dict} />
      <ServicesPreview locale={locale} dict={dict} />
      <CtaSection locale={locale} dict={dict} />
    </>
  );
}
