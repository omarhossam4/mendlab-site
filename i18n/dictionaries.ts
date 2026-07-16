import "server-only";
import type { Locale } from "./config";

/**
 * Server-only dictionary loader. Dictionaries are dynamically imported so only
 * the requested locale's JSON is bundled into the server response — no locale
 * data reaches the client bundle.
 */
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
