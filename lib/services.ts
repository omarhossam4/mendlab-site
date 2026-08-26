/**
 * Service catalogue for MendLab — mirrors the official price list.
 *
 * One section ("Massage & Cupping Services") with six priced services.
 * Structural / non-translatable data (ids, slugs, imagery, pricing) lives here.
 * Translatable copy (name, description, "how it works", benefits) lives in the
 * i18n dictionaries under `services.items[id]` so it stays in sync per-locale.
 */

import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Some services require the customer to pick a body area (Upper or Lower)
 * before booking. `areaGroup` names the set of localized labels to use for that
 * choice (see `booking.areas.groups.<areaGroup>` in the dictionaries). A service
 * without `areaGroup` needs no area choice.
 */
export type AreaGroup = "massage" | "cupping";
export const AREA_OPTIONS = ["upper", "lower"] as const;
export type AreaOption = (typeof AREA_OPTIONS)[number];

export interface Service {
  id: string;
  slug: string;
  image: string;
  priceEGP: number;
  areaGroup?: AreaGroup;
}

export const services: Service[] = [
  {
    id: "wet-dry-cupping",
    slug: "wet-dry-cupping",
    image: "/images/service-wet-cupping.jpg",
    priceEGP: 400,
    areaGroup: "cupping",
  },
  {
    id: "full-body-cupping",
    slug: "full-body-cupping",
    image: "/images/service-dry-cupping.jpg",
    priceEGP: 600,
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
    areaGroup: "massage",
  },
  {
    id: "upper-package",
    slug: "upper-package",
    image: "/images/recovery massage new.jpeg",
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

/** A booking deposit is 50% of the (charged) session price. */
export const DEPOSIT_RATE = 0.5;

/** Deposit amount in EGP, rounded to the nearest pound. */
export function depositFor(sessionPriceEGP: number): number {
  return Math.round(sessionPriceEGP * DEPOSIT_RATE);
}

/** Translatable copy for a single service. */
export type ServiceItems = Dictionary["services"]["items"];
export type ServiceCopy = ServiceItems[keyof ServiceItems];

/** Safely read a service's localized copy by its (string) id. */
export function getServiceCopy(dict: Dictionary, id: string): ServiceCopy {
  return dict.services.items[id as keyof ServiceItems];
}
