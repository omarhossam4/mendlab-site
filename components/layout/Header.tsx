"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getNavLinks } from "@/lib/navigation";
import { cn, localeHref } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = getNavLinks(dict);

  function isActive(href: string) {
    const full = localeHref(locale, href);
    if (href === "/") return pathname === full;
    return pathname.startsWith(full);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100 bg-surface/95 text-text-dark backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo locale={locale} variant="dark" />

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={localeHref(locale, link.href)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary-50 text-primary"
                    : "text-text-dark/70 hover:bg-primary-50 hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher
              locale={locale}
              label={dict.nav.switchLanguage}
              tone="dark"
            />
            <Button
              href={localeHref(locale, "/booking")}
              variant="primary"
              size="sm"
            >
              {dict.nav.bookNow}
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-dark transition-colors hover:bg-primary-50 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {open ? (
        <div className="border-t border-primary-100 bg-surface lg:hidden">
          <Container className="py-4">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={localeHref(locale, link.href)}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary-50 text-primary"
                      : "text-text-dark/80 hover:bg-primary-50",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-primary-100 pt-4">
                <LanguageSwitcher
                  locale={locale}
                  label={dict.nav.switchLanguage}
                  tone="dark"
                />
                <Button
                  href={localeHref(locale, "/booking")}
                  variant="primary"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  {dict.nav.bookNow}
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
