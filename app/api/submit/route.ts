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
    // `ok` is also accepted so an older script keeps working.
    //
    // A non-JSON body means the script did NOT run — almost always an HTML
    // sign-in or error page, which happens when the Web App isn't deployed with
    // access "Anyone", or the deployment is serving a stale/broken version.
    // This must be a failure: reporting success here would tell a customer they
    // were booked when nothing was written to the sheet.
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(
        "[api/submit] Apps Script returned non-JSON (the script did not run). " +
          "Check the Web App is deployed with access 'Anyone'. First 300 chars:",
        text.slice(0, 300),
      );
      return NextResponse.json(
        { ok: false, reason: "upstream" },
        { status: 502 },
      );
    }

    const reply = data as { success?: unknown; ok?: unknown; error?: unknown };
    const upstreamOk = reply?.success === true || reply?.ok === true;
    const error = typeof reply?.error === "string" ? reply.error : null;

    if (upstreamOk) return NextResponse.json({ ok: true });

    console.error("[api/submit] Apps Script rejected the submission:", error);

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
