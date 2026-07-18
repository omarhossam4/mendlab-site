/**
 * Service catalogue for MendLab — mirrors the official price list.
 *
 * One section ("Massage & Cupping Services") with six priced services.
 * Structural / non-translatable data (ids, slugs, imagery, pricing) lives here.
 * Translatable copy (name, description, "how it works", benefits) lives in the
 * i18n dictionaries under `services.items[id]` so it stays in sync per-locale.
 */

import type { Dictionary } from "@/i18n/dictionaries";

export interface Service {
  id: string;
  slug: string;
  image: string;
  priceEGP: number;
}

export const services: Service[] = [
  {
    id: "wet-dry-cupping",
    slug: "wet-dry-cupping",
    image: "/images/service-wet-cupping.jpg",
    priceEGP: 400,
  },
  {
    id: "back-massage-cupping",
    slug: "back-massage-cupping",
    image: "/images/service-dry-cupping.jpg",
    priceEGP: 500,
  },
  {
    id: "upper-massage",
    slug: "upper-massage",
    image: "/images/upper body massage new.jpeg",
    priceEGP: 550,
  },
  {
    id: "upper-package",
    slug: "upper-package",
    image: "/images/service-flash-cupping.jpg",
    priceEGP: 600,
  },
  {
    id: "full-body-massage",
    slug: "full-body-massage",
    image: "/images/full body massage new.jpeg",
    priceEGP: 700,
  },
  {
    id: "full-body-package",
    slug: "full-body-package",
    image: "/images/Full Body Package.jpg",
    priceEGP: 800,
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** Translatable copy for a single service. */
export type ServiceItems = Dictionary["services"]["items"];
export type ServiceCopy = ServiceItems[keyof ServiceItems];

/** Safely read a service's localized copy by its (string) id. */
export function getServiceCopy(dict: Dictionary, id: string): ServiceCopy {
  return dict.services.items[id as keyof ServiceItems];
}
