import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Poppins, Inter, Cairo } from "next/font/google";
import "../globals.css";
import { locales, localeDirection, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);

  return {
    title: {
      default: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    openGraph: {
      title: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      description: dict.meta.description,
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const dir = localeDirection[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${poppins.variable} ${inter.variable} ${cairo.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-text-dark antialiased">
        <Header locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} dict={dict} />
        {/* Spacer so the fixed mobile CTA bar never hides footer content */}
        <div aria-hidden className="h-20 lg:hidden" />
        <MobileCtaBar locale={locale} dict={dict} />
      </body>
    </html>
  );
}
