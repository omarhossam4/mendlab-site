import { NextResponse } from "next/server";

/**
 * Returns the already-booked slot ids for a given date, so the booking form can
 * grey them out.
 *
 * browser -> this route -> Apps Script -> Bookings sheet
 *
 * Apps Script contract (see Code.gs `doGet`):
 *   GET <BOOKING_SCRIPT_URL>?action=getSlots&date=YYYY-MM-DD
 *   -> { success: true, date: "...", slots: [{ id: "12-13", label, available }] }
 *
 * PRIVACY: only slot ids ever leave this endpoint. The upstream response
 * carries no customer data, and we never forward anything but availability.
 *
 * FAIL-OPEN: any problem (not configured, upstream down, bad payload) resolves
 * to an empty `booked` list so the form still works and never blocks a booking.
 */

export const dynamic = "force-dynamic";

interface UpstreamSlot {
  id?: unknown;
  available?: unknown;
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
    url.searchParams.set("action", "getSlots");
    url.searchParams.set("date", date);

    const res = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return empty(false);

    const data = JSON.parse(await res.text());
    if (data?.success === false || !Array.isArray(data?.slots)) return empty(false);

    // Anything explicitly not available counts as booked.
    const booked = (data.slots as UpstreamSlot[])
      .filter((slot) => slot?.available === false && typeof slot.id === "string")
      .map((slot) => slot.id as string);

    return NextResponse.json(
      { ok: true, booked: Array.from(new Set(booked)) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return empty(false);
  }
}
