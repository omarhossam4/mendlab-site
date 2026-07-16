/**
 * Service catalogue for Mend Lab.
 *
 * Structural / non-translatable data (ids, slugs, imagery, pricing) lives here.
 * Translatable copy (name, description, "how it works", benefits) lives in the
 * i18n dictionaries under `services.items[id]` so it stays in sync per-locale.
 */

import type { Dictionary } from "@/i18n/dictionaries";

export type ServiceCategory = "treatment" | "session";

export interface PriceTier {
  /** Matches a key in dictionary `services.tiers` for the label. */
  id: "upper-body" | "lower-body" | "whole-body";
  priceEGP: number;
}

export interface Service {
  id: string;
  slug: string;
  category: ServiceCategory;
  /** Lucide-style icon name, mapped in the Icon component. */
  icon: string;
  /** Placeholder image path under /public/images — swap for real photos. */
  image: string;
  /** Present for session packages that price by body area. */
  tiers?: PriceTier[];
}

const SESSION_TIERS: PriceTier[] = [
  { id: "upper-body", priceEGP: 600 },
  { id: "lower-body", priceEGP: 800 },
  { id: "whole-body", priceEGP: 1200 },
];

export const services: Service[] = [
  {
    id: "dry-cupping",
    slug: "dry-cupping",
    category: "treatment",
    icon: "circle",
    image: "/images/service-dry-cupping.jpg",
  },
  {
    id: "wet-cupping",
    slug: "wet-cupping",
    category: "treatment",
    icon: "droplet",
    image: "/images/service-wet-cupping.jpg",
  },
  {
    id: "flash-cupping",
    slug: "flash-cupping",
    category: "treatment",
    icon: "zap",
    image: "/images/service-flash-cupping.jpg",
  },
  {
    id: "recovery-massage",
    slug: "recovery-massage",
    category: "treatment",
    icon: "hand",
    image: "/images/service-recovery-massage.jpg",
  },
  {
    id: "dry-needling",
    slug: "dry-needling",
    category: "treatment",
    icon: "needle",
    image: "/images/service-dry-needling.jpg",
  },
  {
    id: "recovery-sessions",
    slug: "recovery-sessions",
    category: "session",
    icon: "activity",
    image: "/images/service-recovery-sessions.jpg",
    tiers: SESSION_TIERS,
  },
  {
    id: "cupping-sessions",
    slug: "cupping-sessions",
    category: "session",
    icon: "layers",
    image: "/images/service-cupping-sessions.jpg",
    tiers: SESSION_TIERS,
  },
];

export const serviceCategories: ServiceCategory[] = ["treatment", "session"];

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
 * Flat list of individually bookable options for the booking form.
 * Session packages expand into one option per price tier.
 */
export interface BookableOption {
  /** Stable value submitted with the booking, e.g. "recovery-sessions:upper-body". */
  value: string;
  serviceId: string;
  tierId?: PriceTier["id"];
  priceEGP?: number;
}

export const bookableOptions: BookableOption[] = services.flatMap((service) => {
  if (service.tiers) {
    return service.tiers.map((tier) => ({
      value: `${service.id}:${tier.id}`,
      serviceId: service.id,
      tierId: tier.id,
      priceEGP: tier.priceEGP,
    }));
  }
  return [{ value: service.id, serviceId: service.id }];
});
