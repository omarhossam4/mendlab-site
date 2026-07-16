/**
 * Service catalogue for MendLab — mirrors the official price list.
 *
 * Two categories (Recovery Sessions, Cupping Sessions), each offered for three
 * body areas, giving the six bookable services.
 *
 * Structural / non-translatable data (ids, slugs, imagery, pricing) lives here.
 * Translatable copy (name, description, "how it works", benefits) lives in the
 * i18n dictionaries under `services.items[id]` so it stays in sync per-locale.
 */

import type { Dictionary } from "@/i18n/dictionaries";

export type ServiceCategory = "recovery" | "cupping";

export interface Service {
  id: string;
  slug: string;
  category: ServiceCategory;
  /** Body-area icon key, mapped in ServiceIcon. */
  icon: string;
  image: string;
  priceEGP: number;
}

export const services: Service[] = [
  // Recovery Sessions
  {
    id: "recovery-upper-body",
    slug: "recovery-upper-body",
    category: "recovery",
    icon: "upper",
    image: "/images/service-recovery-massage.jpg",
    priceEGP: 600,
  },
  {
    id: "recovery-lower-body",
    slug: "recovery-lower-body",
    category: "recovery",
    icon: "lower",
    image: "/images/service-dry-needling.jpg",
    priceEGP: 800,
  },
  {
    id: "recovery-whole-body",
    slug: "recovery-whole-body",
    category: "recovery",
    icon: "whole",
    image: "/images/service-recovery-massage.jpg",
    priceEGP: 1200,
  },
  // Cupping Sessions
  {
    id: "cupping-upper-body",
    slug: "cupping-upper-body",
    category: "cupping",
    icon: "upper",
    image: "/images/service-dry-cupping.jpg",
    priceEGP: 600,
  },
  {
    id: "cupping-lower-body",
    slug: "cupping-lower-body",
    category: "cupping",
    icon: "lower",
    image: "/images/service-wet-cupping.jpg",
    priceEGP: 800,
  },
  {
    id: "cupping-whole-body",
    slug: "cupping-whole-body",
    category: "cupping",
    icon: "whole",
    image: "/images/service-flash-cupping.jpg",
    priceEGP: 1200,
  },
];

export const serviceCategories: ServiceCategory[] = ["recovery", "cupping"];

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

/**
 * Fully-qualified name, e.g. "Recovery Session — Upper Body". Used wherever the
 * service appears outside its category heading (booking, footer, previews).
 */
export function getServiceFullName(dict: Dictionary, service: Service): string {
  const category = dict.services.categories[service.category].name;
  return `${category} — ${getServiceCopy(dict, service.id).name}`;
}
