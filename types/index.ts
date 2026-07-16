import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export type { Locale, Dictionary };

/** Props shared by localized page-section components. */
export interface LocalizedProps {
  locale: Locale;
  dict: Dictionary;
}
