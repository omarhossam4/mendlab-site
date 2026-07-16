import type { Dictionary } from "@/i18n/dictionaries";

/** Primary navigation items, resolved against a dictionary for labels. */
export function getNavLinks(dict: Dictionary) {
  return [
    { href: "/", label: dict.nav.home },
    { href: "/services", label: dict.nav.services },
    { href: "/about", label: dict.nav.about },
    { href: "/booking", label: dict.nav.booking },
    { href: "/contact", label: dict.nav.contact },
  ];
}

/** Social links used in the footer and contact page. */
export const socialLinks = {
  facebook: "https://facebook.com/MendLab",
  instagram: "https://instagram.com/mendlab.eg",
};
