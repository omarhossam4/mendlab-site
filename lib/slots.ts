/**
 * Booking availability helpers.
 *
 * MendLab runs twelve one-hour slots from 12:00 PM to 12:00 AM, bookable for
 * today plus the next seven days.
 *
 * Slot values are always 24h "HH:MM" strings of the slot's START time
 * (e.g. "12:00", "23:00"). That exact format is what gets written to the
 * Google Sheet and what the availability endpoint compares against, so don't
 * change it without updating Code.gs too.
 */

/** Slot start hours: 12, 13 … 23. */
const SLOT_START_HOURS = Array.from({ length: 12 }, (_, i) => i + 12);

/** How many days ahead are bookable (today + next 7). */
export const BOOKABLE_DAYS = 8;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Local (not UTC) ISO date — avoids the off-by-one that toISOString() causes. */
function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** All twelve slot values, e.g. ["12:00", … "23:00"]. */
export function getSlots(): string[] {
  return SLOT_START_HOURS.map((h) => `${pad(h)}:00`);
}

/**
 * Bookable dates as ISO strings, starting today.
 * Must be called on the client — it depends on "now".
 */
export function getBookableDays(count: number = BOOKABLE_DAYS): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return toISODate(d);
  });
}

function intlLocale(locale: string) {
  return locale === "ar" ? "ar-EG" : "en-US";
}

/** "12:00" -> "12:00 PM – 1:00 PM" (localized). */
export function formatSlotLabel(value: string, locale: string): string {
  const startHour = Number(value.split(":")[0]);
  const fmt = (hour: number) =>
    new Intl.DateTimeFormat(intlLocale(locale), {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(2000, 0, 1, hour % 24, 0, 0));

  return `${fmt(startHour)} – ${fmt(startHour + 1)}`;
}

/** Weekday / day / month pieces for a day chip. */
export function formatDayParts(iso: string, locale: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const loc = intlLocale(locale);
  return {
    weekday: new Intl.DateTimeFormat(loc, { weekday: "short" }).format(date),
    day: new Intl.DateTimeFormat(loc, { day: "numeric" }).format(date),
    month: new Intl.DateTimeFormat(loc, { month: "short" }).format(date),
  };
}

/** Full readable date for the booking summary. */
export function formatDayLong(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

/** True if the slot has already started (only ever true for today). */
export function isSlotInPast(iso: string, value: string): boolean {
  const now = new Date();
  if (iso !== toISODate(now)) return false;
  return Number(value.split(":")[0]) <= now.getHours();
}
