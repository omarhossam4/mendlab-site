import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { socialLinks, contactDetails } from "@/lib/navigation";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/layout/PageHero";
import { InstagramIcon, TikTokIcon } from "@/components/ui/SocialIcons";
import { ContactForm } from "@/features/contact/ContactForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.contact.title, description: dict.contact.subtitle };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const info = dict.contact.info;

  const details = [
    {
      icon: MapPin,
      label: info.addressLabel,
      value: info.address,
      href: contactDetails.mapsUrl,
      external: true,
    },
    {
      icon: Phone,
      label: info.phoneLabel,
      value: contactDetails.phoneDisplay,
      href: contactDetails.phoneHref,
      ltr: true,
    },
    {
      icon: Mail,
      label: info.emailLabel,
      value: contactDetails.email,
      href: `mailto:${contactDetails.email}`,
      ltr: true,
    },
    { icon: Clock, label: info.hoursLabel, value: info.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow={dict.contact.eyebrow}
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Info + map */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {details.map((d) => (
                <Card key={d.label} className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <d.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-dark/50">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        {...(d.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        dir={d.ltr ? "ltr" : undefined}
                        className="mt-1 block break-words text-sm font-medium text-text-dark transition-colors hover:text-primary"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p
                        className="mt-1 text-sm font-medium text-text-dark"
                        dir={d.ltr ? "ltr" : undefined}
                      >
                        {d.value}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-dark/50">
                {info.socialLabel}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-dark text-white transition-colors hover:bg-primary"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-dark text-white transition-colors hover:bg-primary"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Live embedded map of the clinic */}
            <div className="overflow-hidden rounded-3xl border border-primary-100 shadow-sm">
              <iframe
                src={contactDetails.mapsEmbedUrl}
                title={dict.meta.siteName}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[16/10] w-full border-0"
                allowFullScreen
              />
              <a
                href={contactDetails.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-primary-dark px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary"
              >
                <MapPin className="h-4 w-4" />
                {dict.contact.mapPlaceholder}
              </a>
            </div>
          </div>

          {/* WhatsApp contact */}
          <ContactForm locale={locale} dict={dict} />
        </div>
      </Section>
    </>
  );
}
