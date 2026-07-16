/**
 * Sends a booking or contact submission to our own server route
 * (`/api/submit`), which forwards it to the Google Apps Script Web App and
 * returns a real success/failure result. Same-origin, so there are no CORS or
 * opaque-response problems in the browser.
 */
export type SubmissionType = "booking" | "contact";

export interface SubmissionResult {
  ok: boolean;
  reason?: "not-configured" | "network" | "upstream" | "bad-request";
}

export async function submitToSheet(
  type: SubmissionType,
  data: Record<string, string>,
): Promise<SubmissionResult> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        submittedAt: new Date().toISOString(),
        ...data,
      }),
    });

    if (res.status === 503) {
      return { ok: false, reason: "not-configured" };
    }

    const result = (await res.json().catch(() => null)) as SubmissionResult | null;
    if (res.ok && result?.ok) {
      return { ok: true };
    }
    return { ok: false, reason: result?.reason ?? "network" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
