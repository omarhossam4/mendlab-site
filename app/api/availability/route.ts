import { NextResponse } from "next/server";

/**
 * Returns the already-booked slot times for a given date, so the booking form
 * can grey them out.
 *
 * browser -> this route -> Apps Script -> Bookings sheet
 *
 * The Apps Script contract is:
 *   GET <BOOKING_SCRIPT_URL>?date=YYYY-MM-DD
 *   -> { "ok": true, "booked": ["12:00", "15:00"] }
 *
 * PRIVACY: only slot times ever leave this endpoint. Names, phones, emails and
 * notes must never be returned here — the response is public.
 *
 * FAIL-OPEN: any problem (not configured, upstream down, bad payload) resolves
 * to an empty `booked` list so the form still works and never blocks a booking.
 */

export const dynamic = "force-dynamic";

/** Coerce whatever the sheet returns ("12:00:00", "12:00", ISO date) to "HH:MM". */
function normalizeTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

function empty(ok: boolean) {
  return NextResponse.json(
    { ok, booked: [] as string[] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, booked: [] }, { status: 400 });
  }

  const scriptUrl =
    process.env.BOOKING_SCRIPT_URL ?? process.env.NEXT_PUBLIC_BOOKING_SCRIPT_URL;
  if (!scriptUrl) return empty(false);

  try {
    const url = new URL(scriptUrl);
    url.searchParams.set("date", date);

    const res = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return empty(false);

    const data = JSON.parse(await res.text());
    const booked = Array.isArray(data?.booked)
      ? Array.from(
          new Set(
            data.booked
              .map(normalizeTime)
              .filter((t: string | null): t is string => t !== null),
          ),
        )
      : [];

    return NextResponse.json(
      { ok: true, booked },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return empty(false);
  }
}
