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
  // Opens the exact pin in Google Maps / the Maps app.
  mapsUrl: "https://maps.app.goo.gl/Sveb77vnntvy9zFj8?g_st=ic",
  // Embeddable map (no API key needed) centred on the clinic — V8 Gym,
  // Sevora Plaza tower, Al Sad Al Aali, Nasr City, Cairo.
  mapsEmbedUrl:
    "https://www.google.com/maps?q=V8%20Gym%2C%20Sevora%20Plaza%2C%20Al%20Sad%20Al%20Aali%2C%20Nasr%20City%2C%20Cairo&z=16&output=embed",
  // WhatsApp chat (wa.me needs the number in international form, no +).
  whatsappNumber: "201041512677",
  whatsappUrl: "https://wa.me/201041512677",
};
