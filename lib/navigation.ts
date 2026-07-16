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

/** Social profiles used in the footer and contact page. */
export const socialLinks = {
  instagram:
    "https://www.instagram.com/mendlabeg?igsh=NDc2dHNiNmtkM3Vj&utm_source=qr",
  tiktok: "https://www.tiktok.com/@mendlabeg?_r=1&_t=ZS-984SAF1fMsj",
};

/**
 * Real contact details — single source of truth. These are not translatable
 * (phone numbers, emails and map links are the same in every locale), so they
 * live here rather than in the dictionaries.
 */
export const contactDetails = {
  phoneDisplay: "+20 104 151 2677",
  phoneHref: "tel:+201041512677",
  email: "mendlabeg@gmail.com",
  mapsUrl: "https://maps.app.goo.gl/Sveb77vnntvy9zFj8?g_st=ic",
};
