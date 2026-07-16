import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getNavLinks, socialLinks } from "@/lib/navigation";
import { localeHref } from "@/lib/utils";
import { services, getServiceCopy } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const navLinks = getNavLinks(dict);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-primary-dark text-white/80">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo locale={locale} variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {dict.footer.tagline}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <FacebookIcon className="h-4 w-4 text-white" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <InstagramIcon className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {dict.footer.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={localeHref(locale, link.href)}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {dict.footer.servicesTitle}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={localeHref(locale, `/services#${service.slug}`)}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {getServiceCopy(dict, service.id).name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {dict.footer.contactTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-white/70">{dict.contact.info.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a
                  href="tel:+201012345678"
                  dir="ltr"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {dict.contact.info.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a
                  href={`mailto:${dict.contact.info.email}`}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {dict.contact.info.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed text-white/50">
            {dict.footer.disclaimer}
          </p>
          <p className="mt-2 text-xs text-white/60">
            © {year} {dict.meta.siteName}. {dict.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
