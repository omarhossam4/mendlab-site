import { NextResponse } from "next/server";

/**
 * Server-side submission proxy.
 *
 * The browser posts to this same-origin route (no CORS issues), and the server
 * forwards the payload to the Google Apps Script Web App. Because this runs on
 * the server, we can actually READ the Apps Script response and return a real
 * success/failure to the client — unlike a browser `no-cors` request, which is
 * opaque and can't be verified.
 *
 * Configure the destination with either env var (server-only preferred):
 *   BOOKING_SCRIPT_URL=...              (recommended — not exposed to the client)
 *   NEXT_PUBLIC_BOOKING_SCRIPT_URL=...  (also supported for convenience)
 */
export async function POST(request: Request) {
  const scriptUrl =
    process.env.BOOKING_SCRIPT_URL ??
    process.env.NEXT_PUBLIC_BOOKING_SCRIPT_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { ok: false, reason: "not-configured" },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "bad-request" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      // Apps Script can be slow on cold start; give it room.
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, reason: "upstream", status: res.status },
        { status: 502 },
      );
    }

    // Apps Script answers { success: true } / { success: false, error: "..." }.
    // `ok` is also accepted so an older script keeps working. Non-JSON still
    // counts as delivered.
    const text = await res.text();
    let upstreamOk = true;
    let error: string | null = null;
    try {
      const data = JSON.parse(text);
      if (data && typeof data.success === "boolean") upstreamOk = data.success;
      else if (data && typeof data.ok === "boolean") upstreamOk = data.ok;
      if (typeof data?.error === "string") error = data.error;
    } catch {
      /* non-JSON response still counts as delivered */
    }

    if (upstreamOk) return NextResponse.json({ ok: true });

    // The script re-checks the slot under a lock and rejects it if someone won
    // the race — surface that distinctly so the form can say something useful.
    const slotTaken = /just booked|booked by someone else|already booked/i.test(
      error ?? "",
    );
    return NextResponse.json(
      { ok: false, reason: slotTaken ? "slot-taken" : "upstream" },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, reason: "network" },
      { status: 502 },
    );
  }
}
