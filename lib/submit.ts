/**
 * Posts a payload to the Google Apps Script Web App that appends a row to the
 * connected Google Sheet.
 *
 * Apps Script Web Apps do not return CORS headers, so we send a "simple" request
 * (text/plain, no custom headers) and use `no-cors`. The response is opaque —
 * we treat a resolved fetch as success and a thrown error as failure. The Apps
 * Script (see Code.gs) parses `e.postData.contents` as JSON.
 */
export type SubmissionType = "booking" | "contact";

export interface SubmissionResult {
  ok: boolean;
  reason?: "not-configured" | "network";
}

export async function submitToSheet(
  type: SubmissionType,
  data: Record<string, string>,
): Promise<SubmissionResult> {
  const url = process.env.NEXT_PUBLIC_BOOKING_SCRIPT_URL;
  if (!url) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type,
        submittedAt: new Date().toISOString(),
        ...data,
      }),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}
