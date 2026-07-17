/**
 * Booking availability helpers.
 *
 * MendLab runs twelve one-hour slots from 12:00 PM to 12:00 AM, bookable for
 * today plus the next seven days.
 *
 * A slot id is `"<startHour>-<endHour>"` in 24h form — "12-13" … "23-24".
 * This is the Apps Script's `slotId` format (see Code.gs `generateTimeSlots`),
 * and it's what lands in the sheet's TimeSlot column, so don't change it on one
 * side without the other.
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

/** All twelve slot ids, e.g. ["12-13", … "23-24"]. */
export function getSlots(): string[] {
  return SLOT_START_HOURS.map((h) => `${h}-${h + 1}`);
}

/** "12-13" -> 12 */
function slotStartHour(slotId: string): number {
  return Number(slotId.split("-")[0]);
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

/** "12-13" -> "12:00 PM – 1:00 PM" (localized). */
export function formatSlotLabel(slotId: string, locale: string): string {
  const startHour = slotStartHour(slotId);
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
export function isSlotInPast(iso: string, slotId: string): boolean {
  const now = new Date();
  if (iso !== toISODate(now)) return false;
  return slotStartHour(slotId) <= now.getHours();
}
